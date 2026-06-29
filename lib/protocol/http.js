'use strict';

const axios = require('axios').default;
const BaseClient = require('./base').BaseClient;
const BaseServer = require('./base').BaseServer;
const datapoints = require('../datapoints');

const DEFAULT_HTTP_TIMEOUT = 8 * 1000;
const DEFAULT_HTTP_RETRIES = 1;
const DEFAULT_HTTP_MAX_PARALLEL = 10;
const RAW_POLL_ENDPOINTS_GEN1 = [
    { id: 'info', url: '/shelly' },
    { id: 'settings', url: '/settings' },
    { id: 'status', url: '/status' },
];
const RAW_POLL_ENDPOINTS_GEN2 = [
    { id: 'info', url: '/rpc/Shelly.GetDeviceInfo?ident=true' },
    { id: 'config', url: '/rpc/Sys.GetConfig' },
    { id: 'status', url: '/rpc/Shelly.GetStatus' },
];
const ADMIN_RPC_METHODS = [
    'Shelly.Reboot',
    'Shelly.Update',
    'Shelly.FactoryReset',
    'Shelly.ResetWiFiConfig',
    'Shelly.PutUserCA',
    'Sys.SetConfig',
    'WiFi.SetConfig',
    'Eth.SetConfig',
    'Cloud.SetConfig',
    'MQTT.SetConfig',
    'Script.Create',
    'Script.Delete',
    'Script.PutCode',
    'Script.Start',
    'Script.Stop',
    'Script.SetConfig',
];

function parseJson(body, fallback) {
    try {
        return JSON.parse(body);
    } catch {
        return fallback;
    }
}

function normalizeMac(mac) {
    return String(mac || '')
        .replace(/[^a-fA-F0-9]/g, '')
        .toUpperCase();
}

function ipToInt(ip) {
    const parts = String(ip)
        .trim()
        .split('.')
        .map(part => Number(part));

    if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) {
        return undefined;
    }

    return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function intToIp(value) {
    return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

function expandCidr(range) {
    const [baseIp, prefixText] = range.split('/');
    const base = ipToInt(baseIp);
    const prefix = Number(prefixText);

    if (base === undefined || !Number.isInteger(prefix) || prefix < 24 || prefix > 32) {
        return [];
    }

    const hostCount = 2 ** (32 - prefix);
    const mask = prefix === 32 ? 0xffffffff : (0xffffffff << (32 - prefix)) >>> 0;
    const network = base & mask;
    const first = prefix === 32 ? network : network + 1;
    const last = prefix >= 31 ? network + hostCount - 1 : network + hostCount - 2;
    const ips = [];

    for (let current = first; current <= last; current++) {
        ips.push(intToIp(current >>> 0));
    }

    return ips;
}

function expandDashRange(range) {
    const [startText, endText] = range.split('-').map(part => part.trim());
    const start = ipToInt(startText);
    let end = ipToInt(endText);

    if (start === undefined) {
        return [];
    }

    if (end === undefined && /^\d{1,3}$/.test(endText)) {
        const prefix = startText.split('.').slice(0, 3).join('.');
        end = ipToInt(`${prefix}.${endText}`);
    }

    if (end === undefined || end < start) {
        return [];
    }

    const ips = [];
    for (let current = start; current <= end; current++) {
        ips.push(intToIp(current >>> 0));
    }
    return ips;
}

function expandHttpNetworkRanges(ranges) {
    const result = new Set();
    for (const entry of Array.isArray(ranges) ? ranges : []) {
        if (!entry || entry.enabled === false) {
            continue;
        }

        const range = String(entry.range || entry.ip || entry)
            .trim()
            .replace(/\s/g, '');

        if (!range) {
            continue;
        }

        if (range.includes('/')) {
            expandCidr(range).forEach(ip => result.add(ip));
        } else if (range.includes('-')) {
            expandDashRange(range).forEach(ip => result.add(ip));
        } else if (ipToInt(range) !== undefined) {
            result.add(range);
        }
    }

    return Array.from(result);
}

function normalizeShellyInfo(info, configuredDeviceId) {
    if (!info || typeof info !== 'object') {
        return undefined;
    }

    const gen = Number(info.gen || (info.id && String(info.id).toLowerCase().startsWith('shelly') ? 2 : 1));
    const mac = normalizeMac(info.mac);

    if (gen >= 2) {
        const id = String(info.id || configuredDeviceId || '').toLowerCase();
        const deviceType = id.includes('-') ? id.split('-')[0] : id;
        const serialId = mac || normalizeMac(id.split('-').pop());

        if (!deviceType || !serialId) {
            return undefined;
        }

        return {
            gen,
            deviceType,
            serialId,
            deviceId: configuredDeviceId || id,
            protocolProfile: 'mqtt',
        };
    }

    if (!info.type || !mac) {
        return undefined;
    }

    return {
        gen: 1,
        deviceType: info.type,
        serialId: mac,
        deviceId: configuredDeviceId || `${info.type}#${mac}#1`,
        protocolProfile: 'coap',
    };
}

function appendRpcParams(url, params) {
    const rpcUrl = new URL(`http://127.0.0.1${url}`);
    for (const [key, value] of Object.entries(params || {})) {
        rpcUrl.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    return `${rpcUrl.pathname}${rpcUrl.search}`;
}

function isAdministrativeUrl(url) {
    if (url.startsWith('/ota') || url.startsWith('/reboot')) {
        return true;
    }

    const rpcMatch = url.match(/^\/rpc\/([^?]+)/);
    if (!rpcMatch) {
        return false;
    }

    return ADMIN_RPC_METHODS.includes(rpcMatch[1]);
}

async function runWithConcurrency(items, limit, worker) {
    const queue = [...items];
    const results = [];
    const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
        while (queue.length) {
            const item = queue.shift();
            results.push(await worker(item));
        }
    });

    await Promise.all(workers);
    return results;
}

class HTTPPollingClient extends BaseClient {
    constructor(adapter, objectHelper, eventEmitter, config) {
        super('coap', adapter, objectHelper, eventEmitter);

        this.config = config || {};
        this.ip = this.config.ip;
        this.customName = this.config.name;
        this.httpTimeout = Number(adapter.config.httpTimeout) || DEFAULT_HTTP_TIMEOUT;
        this.retryCount = Number(adapter.config.httpRetries) || DEFAULT_HTTP_RETRIES;
        this.rawPollTimeout = null;
        this.rawPayloads = {};
        this.rawOnly = false;
    }

    getId() {
        if (!this.id) {
            const deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
            const serialId = this.getSerialId();
            if (deviceClass && serialId) {
                this.id = `${deviceClass}-${serialId}`;
            } else if (this.deviceId) {
                this.id = this.deviceId.replace(/[^a-zA-Z0-9-_.]/g, '_');
            }
        }
        return this.id;
    }

    getSerialId() {
        if (!this.serialId && this.deviceId) {
            this.serialId = this.deviceId.includes('#')
                ? this.deviceId.split('#')[1]
                : normalizeMac(this.deviceId.split('-').pop());
        }
        return this.serialId;
    }

    getDeviceClass() {
        if (!this.deviceClass) {
            this.deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
        }
        return this.deviceClass;
    }

    getDeviceType() {
        if (!this.deviceType && this.deviceId) {
            this.deviceType = this.deviceId.includes('#') ? this.deviceId.split('#')[0] : this.deviceId.split('-')[0];
        }
        return this.deviceType;
    }

    async requestWithRetry(url, requestFn = async requestUrl => await this.requestWithInheritedAuth(requestUrl)) {
        let lastError;
        for (let attempt = 0; attempt <= this.retryCount; attempt++) {
            try {
                return await requestFn(url);
            } catch (err) {
                lastError = err;
                if (attempt < this.retryCount) {
                    this.adapter.log.debug(
                        `[HTTP] Retry ${attempt + 1}/${this.retryCount} for ${this.getIP()} ${url}: ${err}`,
                    );
                }
            }
        }
        throw lastError;
    }

    async requestRaw(url) {
        const requestConfig = {
            method: 'get',
            responseType: 'text',
            transformResponse: res => res,
            baseURL: `http://${this.getIP()}`,
            timeout: this.httpTimeout,
            url,
        };

        if (this.adapter.config.httpusername && this.adapter.config.httppassword) {
            requestConfig.auth = {
                username: this.adapter.config.httpusername,
                password: this.adapter.config.httppassword,
            };
        }

        const response = await axios(requestConfig);
        return response.data;
    }

    async requestAsync(url) {
        return await this.requestWithRetry(url, async requestUrl => await this.requestWithInheritedAuth(requestUrl));
    }

    async requestWithInheritedAuth(url) {
        if (isAdministrativeUrl(url) && !this.adapter.config.httpAllowAdmin) {
            throw new Error(`Administrative HTTP function blocked by configuration: ${url}`);
        }

        return await super.requestAsync(url);
    }

    async executeRpc(method, params) {
        if (!method) {
            return;
        }

        const url = appendRpcParams(`/rpc/${method}`, params || {});
        this.adapter.log.debug(`[HTTP] Executing RPC ${method} for ${this.getLogInfo()} via ${url}`);
        return await this.requestWithRetry(url);
    }

    async publishStateValue(cmd, value) {
        if (this.getDeviceGen() < 2) {
            this.adapter.log.debug(`[HTTP] Ignoring MQTT command on Gen1 device ${this.getLogInfo()}: ${cmd}`);
            return;
        }

        const payload = typeof value === 'string' ? parseJson(value, undefined) : value;
        if (payload && payload.method) {
            await this.executeRpc(payload.method, payload.params);
            return;
        }

        this.adapter.log.warn(`[HTTP] Unable to translate command for ${this.getLogInfo()} to RPC: ${cmd}`);
    }

    async readDeviceInfo() {
        const body = await this.requestWithRetry('/shelly', async requestUrl => await this.requestRaw(requestUrl));
        const info = parseJson(body, undefined);
        const normalized = normalizeShellyInfo(info, this.config.deviceId);

        if (!normalized) {
            throw new Error(`Invalid /shelly response from ${this.getIP()}: ${body}`);
        }

        this.deviceType = normalized.deviceType;
        this.serialId = normalized.serialId;
        this.deviceId = normalized.deviceId;
        this.deviceGen = normalized.gen;
        this.type = normalized.protocolProfile;
        this.deviceClass = datapoints.getDeviceClassByType(this.deviceType);
        this.rawPayloads.info = JSON.stringify(info);

        return info;
    }

    async readDeviceMode() {
        try {
            if (this.getDeviceGen() === 1) {
                const settings = parseJson(await this.requestWithRetry('/settings'), {});
                this.rawPayloads.settings = JSON.stringify(settings);
                if (settings && settings.mode) {
                    this.deviceMode = settings.mode;
                }
            } else {
                const config = parseJson(await this.requestWithRetry('/rpc/Sys.GetConfig'), {});
                this.rawPayloads.config = JSON.stringify(config);
                if (config?.device?.profile) {
                    this.deviceMode = config.device.profile;
                }
            }
        } catch (err) {
            this.adapter.log.debug(`[HTTP] Unable to read mode/config for ${this.getLogInfo()}: ${err}`);
        }
    }

    createRawObjects() {
        const deviceId = this.getDeviceId();
        const rawStates = {
            hostname: {
                name: 'IP address',
                type: 'string',
                role: 'text',
                value: this.getIP(),
            },
            gen: {
                name: 'Shelly generation',
                type: 'number',
                role: 'value',
                value: this.getDeviceGen(),
            },
            'raw.info': {
                name: 'Raw device information',
                type: 'string',
                role: 'json',
                value: this.rawPayloads.info,
            },
            'raw.settings': {
                name: 'Raw settings/configuration',
                type: 'string',
                role: 'json',
                value: this.rawPayloads.settings || this.rawPayloads.config,
            },
            'raw.status': {
                name: 'Raw status',
                type: 'string',
                role: 'json',
                value: this.rawPayloads.status,
            },
        };

        this.objectHelper.setOrUpdateObject(
            deviceId,
            {
                type: 'device',
                common: {
                    name: this.customName || this.getId() || deviceId,
                    desc: `Shelly HTTP polling device (${this.deviceType || 'unknown'})`,
                },
            },
            ['name'],
            undefined,
            undefined,
            false,
        );
        this.objectHelper.setOrUpdateObject(
            `${deviceId}.raw`,
            {
                type: 'channel',
                common: {
                    name: 'Raw HTTP payloads',
                },
            },
            ['name'],
            undefined,
            undefined,
            false,
        );

        for (const [stateId, state] of Object.entries(rawStates)) {
            this.objectHelper.setOrUpdateObject(
                `${deviceId}.${stateId}`,
                {
                    type: 'state',
                    common: {
                        name: state.name,
                        type: state.type,
                        role: state.role,
                        read: true,
                        write: false,
                    },
                },
                ['name'],
                state.value,
                undefined,
                false,
            );
        }

        this.objectHelper.processObjectQueue(() => {});
    }

    async pollRawPayloads() {
        if (!this.isOnline() || !this.getIP()) {
            this.rawPollTimeout = setTimeout(async () => await this.pollRawPayloads(), this.getPollTime() * 1000);
            return;
        }

        const endpoints = this.getDeviceGen() >= 2 ? RAW_POLL_ENDPOINTS_GEN2 : RAW_POLL_ENDPOINTS_GEN1;
        for (const endpoint of endpoints) {
            try {
                const body = await this.requestWithRetry(endpoint.url);
                const stateId =
                    endpoint.id === 'config' || endpoint.id === 'settings'
                        ? `${this.getDeviceId()}.raw.settings`
                        : `${this.getDeviceId()}.raw.${endpoint.id}`;

                if (body !== undefined && this.stateValueCache[stateId] !== body) {
                    this.stateValueCache[stateId] = body;
                    await this.adapter.setState(stateId, { val: body, ack: true });
                }
            } catch (err) {
                this.adapter.log.debug(`[HTTP] Raw poll failed for ${this.getLogInfo()} ${endpoint.url}: ${err}`);
            }
        }

        this.rawPollTimeout = setTimeout(async () => await this.pollRawPayloads(), this.getPollTime() * 1000);
    }

    async discover() {
        const info = await this.readDeviceInfo();
        await this.readDeviceMode();

        this.adapter.log.info(
            `[HTTP] Device ${this.getLogInfo()} discovered as Gen${this.getDeviceGen()} using ${this.type} profile`,
        );

        return info;
    }

    async start() {
        try {
            await this.discover();

            if (!this.deviceExists()) {
                this.rawOnly = true;
                this.adapter.log.warn(
                    `[HTTP] Device type "${this.getDeviceType()}" at ${this.getIP()} is not known. Creating generic raw states only.`,
                );
            }

            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true);

            if (!this.rawOnly) {
                await this.initDeviceModeFromState();
                await this.deleteOldStates();
                await this.createObjects();
                await this.setIP(this.getIP(), 'HTTP polling');
                if (this.adapter.config.httpSaveRawJson) {
                    this.createRawObjects();
                    await this.pollRawPayloads();
                }
                await this.httpIoBrokerState();
            } else {
                this.createRawObjects();
                await this.pollRawPayloads();
            }
        } catch (err) {
            this.adapter.log.error(`[HTTP] Unable to initialize ${this.getIP()}: ${err}`);
            if (this.deviceId) {
                await this.adapter.deviceStatusUpdate(this.getDeviceId(), false);
            }
        }
    }

    destroy() {
        if (this.rawPollTimeout) {
            clearTimeout(this.rawPollTimeout);
            this.rawPollTimeout = null;
        }
        super.destroy();
    }
}

class HTTPPollingServer extends BaseServer {
    constructor(adapter, objectHelper, eventEmitter) {
        super(adapter, objectHelper, eventEmitter);
        this.clients = {};
    }

    getTimeout() {
        return Number(this.adapter.config.httpTimeout) || DEFAULT_HTTP_TIMEOUT;
    }

    getMaxParallel() {
        return Math.max(1, Number(this.adapter.config.httpMaxParallel) || DEFAULT_HTTP_MAX_PARALLEL);
    }

    async probeIp(ip) {
        try {
            const response = await axios({
                method: 'get',
                responseType: 'text',
                transformResponse: res => res,
                baseURL: `http://${ip}`,
                timeout: this.getTimeout(),
                url: '/shelly',
            });
            const info = parseJson(response.data, undefined);
            const normalized = normalizeShellyInfo(info);

            if (!normalized) {
                return undefined;
            }

            return {
                ip,
                deviceId: normalized.deviceId,
                name: normalized.deviceId,
                source: 'http-discovery',
                enabled: true,
            };
        } catch (err) {
            this.adapter.log.silly(`[HTTP] Discovery probe failed for ${ip}: ${err.message || err}`);
            return undefined;
        }
    }

    async scanNetworkRanges() {
        if (!this.adapter.config.httpDiscoveryEnabled) {
            return [];
        }

        const ips = expandHttpNetworkRanges(this.adapter.config.httpNetworks);
        if (!ips.length) {
            this.adapter.log.warn('[HTTP] Discovery is enabled but no HTTP network ranges are configured');
            return [];
        }

        this.adapter.log.info(`[HTTP] Scanning ${ips.length} IP addresses for Shelly devices`);
        const results = await runWithConcurrency(ips, this.getMaxParallel(), async ip => await this.probeIp(ip));
        return results.filter(Boolean);
    }

    async listen() {
        const configuredDevices = Array.isArray(this.adapter.config.httpDevices)
            ? this.adapter.config.httpDevices
                  .filter(device => device && device.ip && device.enabled !== false)
                  .map(device => ({ ...device, source: 'manual' }))
            : [];
        const discoveredDevices = await this.scanNetworkRanges();
        const devicesByIp = new Map();

        const autoCreate = this.adapter.config.httpAutoCreate !== false;
        if (!autoCreate && discoveredDevices.length) {
            this.adapter.log.info(
                `[HTTP] Discovery found ${discoveredDevices.length} device(s), but automatic creation is disabled`,
            );
        }

        for (const device of [...(autoCreate ? discoveredDevices : []), ...configuredDevices]) {
            devicesByIp.set(device.ip, device);
        }

        if (devicesByIp.size === 0) {
            this.adapter.log.warn('[HTTP] No HTTP polling devices configured or discovered');
            return;
        }

        for (const device of devicesByIp.values()) {
            if (this.clients[device.ip]) {
                continue;
            }
            const client = new HTTPPollingClient(this.adapter, this.objectHelper, this.eventEmitter, device);
            this.clients[device.ip] = client;
            client.start();
        }
    }

    destroy() {
        super.destroy();
        for (const ip in this.clients) {
            this.clients[ip].destroy();
            delete this.clients[ip];
        }
    }
}

module.exports = {
    HTTPPollingServer,
    _private: {
        appendRpcParams,
        expandHttpNetworkRanges,
        isAdministrativeUrl,
        normalizeShellyInfo,
    },
};
