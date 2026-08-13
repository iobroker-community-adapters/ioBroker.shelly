import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { createHash, randomBytes } from 'node:crypto';
import type { EventEmitter } from 'node:events';

import * as datapoints from '../datapoints';
import type { ShellyAdapter } from '../../main';
import type ObjectHelper from '../objectHelper';
import { BaseClient, BaseServer } from './base';

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_PARALLEL = 10;
const DEFAULT_MAX_HOSTS = 1024;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const OFFLINE_FAILURE_THRESHOLD = 3;

export interface HttpCredentials {
    username: string;
    password: string;
}

export interface HttpDeviceConfig {
    ip: string;
    deviceId?: string;
    name?: string;
    enabled?: boolean;
    username?: string;
    password?: string;
    authMode?: 'default' | 'global' | 'custom' | 'none';
    source?: 'manual' | 'http-discovery' | 'ioBroker-registry';
}

export interface DiscoveredHttpDevice extends HttpDeviceConfig {
    deviceId: string;
    model: string;
    generation: number;
    source: 'http-discovery';
}

interface ShellyInfo {
    id?: string;
    type?: string;
    mac?: string;
    gen?: number;
}

interface NormalizedShellyInfo {
    deviceId: string;
    deviceType: string;
    serialId: string;
    generation: number;
    profile: 'mqtt' | 'coap';
}

interface DigestChallenge {
    realm: string;
    nonce: string;
    qop?: string;
    algorithm?: string;
    opaque?: string;
    stale?: string;
}

interface RequestOptions {
    method?: 'GET' | 'POST';
    data?: unknown;
    credentials?: HttpCredentials;
    nonceCount?: number;
}

function asError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

function parseJsonObject(body: string): Record<string, unknown> | undefined {
    try {
        const parsed: unknown = JSON.parse(body);
        return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : undefined;
    } catch {
        return undefined;
    }
}

function normalizeMac(value: unknown): string {
    return String(value ?? '')
        .replace(/[^a-fA-F0-9]/g, '')
        .toUpperCase();
}

export function isValidIpv4(value: string): boolean {
    const parts = value.split('.');
    return (
        parts.length === 4 &&
        parts.every(part => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255)
    );
}

function ipToInt(ip: string): number | undefined {
    if (!isValidIpv4(ip)) {
        return undefined;
    }
    return ip.split('.').reduce((result, part) => ((result << 8) | Number(part)) >>> 0, 0);
}

function intToIp(value: number): string {
    return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

export function expandHttpNetworkRanges(ranges: unknown, maxHosts = DEFAULT_MAX_HOSTS): string[] {
    if (!Array.isArray(ranges)) {
        return [];
    }
    const result = new Set<string>();
    const add = (ip: string): void => {
        if (result.size >= maxHosts) {
            throw new Error(`HTTP discovery exceeds the configured safety limit of ${maxHosts} hosts`);
        }
        result.add(ip);
    };

    for (const item of ranges) {
        if (item && typeof item === 'object' && 'enabled' in item && item.enabled === false) {
            continue;
        }
        const raw =
            typeof item === 'string'
                ? item
                : item && typeof item === 'object' && ('range' in item || 'ip' in item)
                  ? String(('range' in item ? item.range : item.ip) ?? '')
                  : '';
        const range = raw.trim().replace(/\s/g, '');
        if (!range) {
            continue;
        }
        if (isValidIpv4(range)) {
            add(range);
            continue;
        }
        if (range.includes('/')) {
            const [baseText, prefixText] = range.split('/');
            const base = ipToInt(baseText);
            const prefix = Number(prefixText);
            if (base === undefined || !Number.isInteger(prefix) || prefix < 24 || prefix > 32) {
                throw new Error(`Invalid HTTP discovery CIDR: ${range}. Only /24 through /32 are allowed`);
            }
            const count = 2 ** (32 - prefix);
            const mask = prefix === 32 ? 0xffffffff : (0xffffffff << (32 - prefix)) >>> 0;
            const network = (base & mask) >>> 0;
            const first = prefix === 32 ? network : network + 1;
            const last = prefix >= 31 ? network + count - 1 : network + count - 2;
            for (let current = first; current <= last; current++) {
                add(intToIp(current >>> 0));
            }
            continue;
        }
        if (range.includes('-')) {
            const [startText, endText] = range.split('-');
            const start = ipToInt(startText);
            const shortEnd = /^\d{1,3}$/.test(endText)
                ? `${startText.split('.').slice(0, 3).join('.')}.${endText}`
                : endText;
            const end = ipToInt(shortEnd);
            if (start === undefined || end === undefined || end < start) {
                throw new Error(`Invalid HTTP discovery range: ${range}`);
            }
            for (let current = start; current <= end; current++) {
                add(intToIp(current >>> 0));
            }
            continue;
        }
        throw new Error(`Invalid HTTP discovery host or range: ${range}`);
    }
    return [...result];
}

export async function runWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    worker: (item: T) => Promise<R>,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    const runners = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await worker(items[index]);
        }
    });
    await Promise.all(runners);
    return results;
}

export function normalizeShellyInfo(info: ShellyInfo, configuredDeviceId?: string): NormalizedShellyInfo | undefined {
    const generation = Number(info.gen ?? (info.id?.toLowerCase().startsWith('shelly') ? 2 : 1));
    const mac = normalizeMac(info.mac);
    if (generation >= 2) {
        const id = String(info.id ?? configuredDeviceId ?? '').toLowerCase();
        const deviceType = id.split('-')[0];
        const serialId = mac || normalizeMac(id.split('-').pop());
        if (!deviceType || !serialId) {
            return undefined;
        }
        return { deviceId: configuredDeviceId || id, deviceType, serialId, generation, profile: 'mqtt' };
    }
    if (!info.type || !mac) {
        return undefined;
    }
    return {
        deviceId: configuredDeviceId || `${info.type}#${mac}#1`,
        deviceType: info.type,
        serialId: mac,
        generation: 1,
        profile: 'coap',
    };
}

export function parseDigestChallenge(header: string): DigestChallenge | undefined {
    if (!/^Digest\s/i.test(header)) {
        return undefined;
    }
    const values: Record<string, string> = {};
    for (const match of header.slice(7).matchAll(/([a-zA-Z0-9_-]+)=(?:"([^"]*)"|([^,\s]+))/g)) {
        values[match[1].toLowerCase()] = match[2] ?? match[3];
    }
    if (!values.realm || !values.nonce) {
        return undefined;
    }
    return {
        realm: values.realm,
        nonce: values.nonce,
        qop: values.qop,
        algorithm: values.algorithm,
        opaque: values.opaque,
        stale: values.stale,
    };
}

export function digestAuthorization(
    method: string,
    uri: string,
    credentials: HttpCredentials,
    challenge: DigestChallenge,
    nonceCount: number,
): string {
    const algorithm = (challenge.algorithm || 'MD5').toUpperCase();
    const hashName = algorithm.startsWith('SHA-256') ? 'sha256' : algorithm.startsWith('MD5') ? 'md5' : undefined;
    if (!hashName) {
        throw new Error(`Unsupported HTTP Digest algorithm: ${algorithm}`);
    }
    const hash = (value: string): string => createHash(hashName).update(value).digest('hex');
    const cnonce = randomBytes(16).toString('hex');
    const nc = nonceCount.toString(16).padStart(8, '0');
    let ha1 = hash(`${credentials.username}:${challenge.realm}:${credentials.password}`);
    if (algorithm.endsWith('-SESS')) {
        ha1 = hash(`${ha1}:${challenge.nonce}:${cnonce}`);
    }
    const ha2 = hash(`${method}:${uri}`);
    const qop = challenge.qop
        ?.split(',')
        .map(value => value.trim())
        .find(value => value === 'auth');
    const response = qop
        ? hash(`${ha1}:${challenge.nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
        : hash(`${ha1}:${challenge.nonce}:${ha2}`);
    const fields = [
        `username="${credentials.username}"`,
        `realm="${challenge.realm}"`,
        `nonce="${challenge.nonce}"`,
        `uri="${uri}"`,
        `response="${response}"`,
        `algorithm=${algorithm}`,
    ];
    if (qop) {
        fields.push(`qop=${qop}`, `nc=${nc}`, `cnonce="${cnonce}"`);
    }
    if (challenge.opaque) {
        fields.push(`opaque="${challenge.opaque}"`);
    }
    return `Digest ${fields.join(', ')}`;
}

export async function requestShelly(
    ip: string,
    path: string,
    timeoutMs: number,
    options: RequestOptions = {},
): Promise<string> {
    if (!isValidIpv4(ip) || !path.startsWith('/') || path.startsWith('//')) {
        throw new Error('HTTP requests require a validated IPv4 address and an absolute device path');
    }
    const method = options.method ?? 'GET';
    const config: AxiosRequestConfig = {
        baseURL: `http://${ip}`,
        url: path,
        method,
        data: options.data,
        timeout: Math.max(250, timeoutMs),
        responseType: 'text',
        transformResponse: body => body,
        maxRedirects: 0,
        maxContentLength: MAX_RESPONSE_BYTES,
        maxBodyLength: MAX_RESPONSE_BYTES,
        validateStatus: status => status >= 200 && status < 300,
    };
    try {
        const response = await axios(config);
        return String(response.data);
    } catch (error) {
        const axiosError = error as AxiosError<string>;
        const challengeHeader = axiosError.response?.headers['www-authenticate'];
        if (axiosError.response?.status !== 401 || !options.credentials || typeof challengeHeader !== 'string') {
            throw asError(error);
        }
        const digest = parseDigestChallenge(challengeHeader);
        if (digest) {
            const authorization = digestAuthorization(method, path, options.credentials, digest, options.nonceCount ?? 1);
            const response = await axios({ ...config, headers: { Authorization: authorization } });
            return String(response.data);
        }
        if (/^Basic\s/i.test(challengeHeader)) {
            const response = await axios({ ...config, auth: options.credentials });
            return String(response.data);
        }
        throw asError(error);
    }
}

function configuredCredentials(adapter: ShellyAdapter, device: HttpDeviceConfig): HttpCredentials | undefined {
    if (device.authMode === 'none') {
        return undefined;
    }
    if (!device.authMode && adapter.config.httpAuthEnabled === false) {
        return undefined;
    }
    const custom = device.authMode === 'custom' || Boolean(device.username && device.password);
    const username = custom ? device.username : adapter.config.httpDefaultUsername || adapter.config.httpusername;
    const password = custom ? device.password : adapter.config.httpDefaultPassword || adapter.config.httppassword;
    return username && password ? { username, password } : undefined;
}

export class HTTPPollingClient extends BaseClient {
    private readonly deviceConfig: HttpDeviceConfig;
    private readonly credentials: HttpCredentials | undefined;
    private readonly retries: number;
    private failures = 0;
    private requestRunning = false;
    private stopped = false;

    constructor(adapter: ShellyAdapter, objectHelper: ObjectHelper, eventEmitter: EventEmitter, device: HttpDeviceConfig) {
        super('coap', adapter, objectHelper, eventEmitter);
        this.transport = 'http';
        this.deviceConfig = device;
        this.credentials = configuredCredentials(adapter, device);
        this.ip = device.ip;
        this.deviceId = device.deviceId;
        this.httpTimeout = Number(adapter.config.httpTimeout) || DEFAULT_TIMEOUT_MS;
        this.retries = Math.max(0, Math.min(3, Number(adapter.config.httpRetries) || 0));
    }

    override getId(): string | undefined {
        if (!this.id) {
            const deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
            this.id = deviceClass ? `${deviceClass}-${this.getSerialId()}` : this.deviceId;
        }
        return this.id;
    }

    override getSerialId(): string {
        if (!this.serialId && this.deviceId) {
            this.serialId = this.deviceId.includes('#')
                ? this.deviceId.split('#')[1]
                : normalizeMac(this.deviceId.split('-').pop());
        }
        return this.serialId ?? '';
    }

    override getDeviceClass(): string {
        if (!this.deviceClass) {
            this.deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
        }
        return this.deviceClass ?? '';
    }

    override getDeviceType(): string | undefined {
        if (!this.deviceType && this.deviceId) {
            this.deviceType = this.deviceId.split(this.deviceId.includes('#') ? '#' : '-')[0];
        }
        return this.deviceType;
    }

    override isOnline(): boolean {
        return !this.stopped && this.failures < OFFLINE_FAILURE_THRESHOLD;
    }

    override async requestAsync(path: string): Promise<string> {
        if (this.stopped) {
            throw new Error('HTTP client is stopped');
        }
        const rpcMethod = /^\/rpc\/([^?]+)/.exec(path)?.[1];
        const safeRpc =
            !rpcMethod ||
            /\.(?:GetStatus|GetConfig)$/.test(rpcMethod) ||
            /^(?:Switch|Light|RGB|RGBW|CCT)\.(?:Set|Toggle)$/.test(rpcMethod) ||
            /^Cover\.(?:Open|Close|Stop|GoToPosition)$/.test(rpcMethod);
        const safeGen1 = /^\/(?:shelly|status|settings)(?:\?|$)/.test(path) || /^\/(?:relay|light|color|white|roller)\/\d+(?:\?|$)/.test(path);
        if ((!rpcMethod && !safeGen1) || !safeRpc) {
            throw new Error(`HTTP endpoint is not permitted in polling mode: ${path.split('?')[0]}`);
        }
        let lastError: Error | undefined;
        for (let attempt = 0; attempt <= this.retries; attempt++) {
            try {
                const wasOffline = this.failures >= OFFLINE_FAILURE_THRESHOLD;
                const response = await requestShelly(this.ip!, path, this.httpTimeout, {
                    credentials: this.credentials,
                    nonceCount: this.nonceCount++,
                });
                this.failures = 0;
                if (wasOffline && this.deviceId) {
                    await this.adapter.deviceStatusUpdate(this.deviceId, true);
                }
                return response;
            } catch (error) {
                lastError = asError(error);
            }
        }
        this.failures++;
        if (this.failures >= OFFLINE_FAILURE_THRESHOLD && this.deviceId) {
            await this.adapter.deviceStatusUpdate(this.deviceId, false);
        }
        throw lastError ?? new Error('HTTP request failed');
    }

    override async publishStateValue(_cmd: string, value: unknown): Promise<void> {
        if (this.getDeviceGen() < 2) {
            return;
        }
        const payload = typeof value === 'string' ? parseJsonObject(value) : value;
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid Shelly RPC command payload');
        }
        const rpc = payload as Record<string, unknown>;
        if (typeof rpc.method !== 'string') {
            throw new Error('Shelly RPC command has no method');
        }
        if (
            !/^(?:Switch|Light|RGB|RGBW|CCT)\.(?:Set|Toggle)$/.test(rpc.method) &&
            !/^Cover\.(?:Open|Close|Stop|GoToPosition)$/.test(rpc.method)
        ) {
            throw new Error(`RPC method is not permitted in HTTP polling mode: ${rpc.method}`);
        }
        const params = rpc.params && typeof rpc.params === 'object' ? (rpc.params as Record<string, unknown>) : {};
        const query = new URLSearchParams();
        for (const [key, item] of Object.entries(params)) {
            query.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
        }
        await this.requestAsync(`/rpc/${rpc.method}${query.size ? `?${query}` : ''}`);
    }

    private async identify(): Promise<void> {
        const body = await this.requestAsync('/shelly');
        const info = parseJsonObject(body) as ShellyInfo | undefined;
        const normalized = info && normalizeShellyInfo(info, this.deviceConfig.deviceId);
        if (!normalized) {
            throw new Error(`Invalid Shelly identity response from ${this.ip}`);
        }
        this.deviceId = normalized.deviceId;
        this.deviceType = normalized.deviceType;
        this.serialId = normalized.serialId;
        this.deviceGen = normalized.generation;
        this.type = normalized.profile;
        this.deviceClass = datapoints.getDeviceClassByType(normalized.deviceType);
        try {
            const configPath = normalized.generation === 1 ? '/settings' : '/rpc/Sys.GetConfig';
            const config = parseJsonObject(await this.requestAsync(configPath));
            const device = config?.device;
            const profile =
                normalized.generation === 1
                    ? config?.mode
                    : device && typeof device === 'object'
                      ? (device as Record<string, unknown>).profile
                      : undefined;
            if (typeof profile === 'string') {
                this.deviceMode = profile;
            }
        } catch (error) {
            if (this.adapter.config.httpDebugDiscovery) {
                this.adapter.log.debug(`[HTTP] Could not read device profile for ${this.ip}: ${asError(error).message}`);
            }
        }
    }

    /**
     * Gen2+ definitions primarily describe pushed MQTT status topics. For HTTP transport the same
     * payload transformer can consume the corresponding Component.GetStatus RPC response.
     */
    private addRpcStatusPollingEndpoints(): void {
        if (this.getDeviceGen() < 2) {
            return;
        }
        const rpcNames: Record<string, string> = {
            cct: 'CCT',
            em: 'EM',
            em1: 'EM1',
            light: 'Light',
            pm1: 'PM1',
            rgb: 'RGB',
            rgbw: 'RGBW',
            switch: 'Switch',
            cover: 'Cover',
            input: 'Input',
        };
        for (const [stateId, state] of Object.entries(this.device)) {
            const topic = state.mqtt?.mqtt_publish;
            const match = topic && /\/status\/([a-z0-9]+):(\d+)$/i.exec(topic);
            if (!match || !state.mqtt?.mqtt_publish_funct) {
                continue;
            }
            const component = rpcNames[match[1].toLowerCase()];
            if (!component) {
                continue;
            }
            const endpoint = `/rpc/${component}.GetStatus?id=${match[2]}`;
            (this.http[endpoint] ??= []).push(stateId);
        }
    }

    async start(): Promise<void> {
        await this.identify();
        if (!this.deviceExists()) {
            throw new Error(`Unsupported Shelly device type ${this.deviceType ?? '<unknown>'}`);
        }
        await this.initDeviceModeFromState();
        await this.createObjects();
        this.addRpcStatusPollingEndpoints();
        await this.setIP(this.ip, 'HTTP polling');
        await this.adapter.deviceStatusUpdate(this.deviceId, true);
        if (!this.requestRunning) {
            this.requestRunning = true;
            try {
                await this.httpIoBrokerState();
            } finally {
                this.requestRunning = false;
            }
        }
    }

    override destroy(): void {
        this.stopped = true;
        super.destroy();
    }
}

function mergeDevices(...lists: HttpDeviceConfig[][]): HttpDeviceConfig[] {
    const result = new Map<string, HttpDeviceConfig>();
    for (const device of lists.flat()) {
        const key = device.deviceId || device.ip;
        const previous = result.get(key);
        if (!previous || device.source === 'manual') {
            result.set(key, { ...previous, ...device });
        }
    }
    return [...result.values()];
}

export class HTTPPollingServer extends BaseServer {
    private readonly clients = new Map<string, HTTPPollingClient>();
    private stopped = false;

    private get configuredDevices(): HttpDeviceConfig[] {
        return Array.isArray(this.adapter.config.httpDevices)
            ? this.adapter.config.httpDevices
                  .filter((device): device is HttpDeviceConfig =>
                      Boolean(device && typeof device.ip === 'string' && device.enabled !== false && isValidIpv4(device.ip)),
                  )
                  .map(device => ({ ...device, source: 'manual' }))
            : [];
    }

    private async registryDevices(): Promise<HttpDeviceConfig[]> {
        const devices = await this.adapter.getDevicesAsync();
        const result: HttpDeviceConfig[] = [];
        for (const object of devices) {
            const deviceId = object._id.replace(`${this.adapter.namespace}.`, '');
            const hostname = await this.adapter.getStateAsync(`${deviceId}.hostname`);
            const ip = typeof hostname?.val === 'string' ? hostname.val : undefined;
            if (!ip || !isValidIpv4(ip)) {
                continue;
            }
            result.push({ ip, deviceId, name: String(object.common.name ?? deviceId), source: 'ioBroker-registry' });
        }
        return result;
    }

    async probeIp(ip: string): Promise<DiscoveredHttpDevice | undefined> {
        if (!isValidIpv4(ip) || this.stopped) {
            return undefined;
        }
        try {
            const credentials = configuredCredentials(this.adapter, { ip });
            const body = await requestShelly(ip, '/shelly', Number(this.adapter.config.httpTimeout) || DEFAULT_TIMEOUT_MS, {
                credentials,
            });
            const info = parseJsonObject(body) as ShellyInfo | undefined;
            const normalized = info && normalizeShellyInfo(info);
            if (!normalized) {
                return undefined;
            }
            return {
                ip,
                deviceId: normalized.deviceId,
                model: normalized.deviceType,
                generation: normalized.generation,
                source: 'http-discovery',
            };
        } catch (error) {
            if (this.adapter.config.httpDebugDiscovery) {
                this.adapter.log.debug(`[HTTP] Discovery probe failed for ${ip}: ${asError(error).message}`);
            }
            return undefined;
        }
    }

    async discover(): Promise<DiscoveredHttpDevice[]> {
        if (!this.adapter.config.httpDiscoveryEnabled || this.stopped) {
            return [];
        }
        const ips = expandHttpNetworkRanges(this.adapter.config.httpNetworks);
        const limit = Math.max(1, Math.min(50, Number(this.adapter.config.httpMaxParallel) || DEFAULT_MAX_PARALLEL));
        const results = await runWithConcurrency(ips, limit, ip => this.probeIp(ip));
        return results.filter((device): device is DiscoveredHttpDevice => device !== undefined);
    }

    private async startDevice(device: HttpDeviceConfig): Promise<void> {
        if (this.stopped || this.clients.has(device.ip)) {
            return;
        }
        const client = new HTTPPollingClient(this.adapter, this.objectHelper, this.eventEmitter, device);
        this.clients.set(device.ip, client);
        try {
            await client.start();
        } catch (error) {
            this.clients.delete(device.ip);
            client.destroy();
            this.adapter.log.warn(`[HTTP] Cannot start ${device.ip}: ${asError(error).message}`);
        }
    }

    async listen(): Promise<void> {
        const known = mergeDevices(this.configuredDevices, await this.registryDevices());
        await runWithConcurrency(known, DEFAULT_MAX_PARALLEL, device => this.startDevice(device));
        const discovered = await this.discover();
        if (this.adapter.config.httpAutoCreate !== false) {
            await runWithConcurrency(discovered, DEFAULT_MAX_PARALLEL, device => this.startDevice(device));
        }
        this.adapter.log.info(
            `[HTTP] Polling ready: known=${known.length}, discovered=${discovered.length}, active=${this.clients.size}`,
        );
    }

    async rediscover(): Promise<number> {
        const devices = await this.discover();
        if (this.adapter.config.httpAutoCreate !== false) {
            await runWithConcurrency(devices, DEFAULT_MAX_PARALLEL, device => this.startDevice(device));
        }
        return devices.length;
    }

    async reloadKnownDevices(): Promise<number> {
        const known = mergeDevices(this.configuredDevices, await this.registryDevices());
        await runWithConcurrency(known, DEFAULT_MAX_PARALLEL, device => this.startDevice(device));
        return known.length;
    }

    override destroy(): void {
        this.stopped = true;
        for (const client of this.clients.values()) {
            client.destroy();
        }
        this.clients.clear();
        super.destroy();
    }
}
