'use strict';

const axios = require('axios').default;
const crypto = require('node:crypto');
const BaseClient = require('./base').BaseClient;
const BaseServer = require('./base').BaseServer;
const datapoints = require('../datapoints');

const DEFAULT_HTTP_TIMEOUT = 8 * 1000;
const DEFAULT_HTTP_RETRIES = 1;
const DEFAULT_HTTP_MAX_PARALLEL = 10;
const OFFLINE_FAILURE_THRESHOLD = 3;
const MIN_POLL_INTERVAL_SECONDS = 5;
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
    'Switch.ResetCounters',
    'Cover.Calibrate',
    'EM.ResetCounters',
    'EM1.ResetCounters',
    'EMData.ResetCounters',
    'EM1Data.ResetCounters',
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

function sanitizeLogMessage(value) {
    return String(value)
        .replace(/Authorization:\s*(Basic|Digest)\s+[^\s,]+/gi, 'Authorization: <masked>')
        .replace(/("Authorization"\s*:\s*")([^"]+)(")/gi, '$1<masked>$3')
        .replace(/(password=)[^&\s]+/gi, '$1<masked>')
        .replace(/("password"\s*:\s*")([^"]+)(")/gi, '$1<masked>$3');
}

function redactSensitiveData(value) {
    if (Array.isArray(value)) {
        return value.map(item => redactSensitiveData(item));
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    const redacted = {};
    for (const [key, item] of Object.entries(value)) {
        if (/password|passwd|pass|authorization|auth|token|secret|key/i.test(key)) {
            redacted[key] = '<masked>';
        } else {
            redacted[key] = redactSensitiveData(item);
        }
    }
    return redacted;
}

function stringifySafePayload(value) {
    return JSON.stringify(redactSensitiveData(value));
}

function sanitizeHttpBodyForState(body) {
    const parsed = parseJson(body, undefined);
    return parsed === undefined ? sanitizeLogMessage(body) : stringifySafePayload(parsed);
}

function hasText(value) {
    return typeof value === 'string' && value.length > 0;
}

function getGlobalHttpAuth(config) {
    const username = config.httpDefaultUsername || config.httpusername;
    const password = config.httpDefaultPassword || config.httppassword;

    if (!config.httpAuthEnabled || !hasText(username) || !hasText(password)) {
        return undefined;
    }

    return {
        source: 'global',
        username,
        password,
    };
}

function resolveHttpAuth(deviceConfig = {}, adapterConfig = {}, options = {}) {
    const globalAuth = getGlobalHttpAuth(adapterConfig);
    const customAuth =
        hasText(deviceConfig.username) && hasText(deviceConfig.password)
            ? {
                  source: 'custom',
                  username: deviceConfig.username,
                  password: deviceConfig.password,
              }
            : undefined;

    if (options.forceGlobal) {
        return globalAuth;
    }

    if (deviceConfig.authMode === 'none' || deviceConfig.authEnabled === false) {
        return undefined;
    }

    if (deviceConfig.authMode === 'custom' || deviceConfig.useCustomAuth) {
        return customAuth;
    }

    if (deviceConfig.authMode === 'global' || deviceConfig.authEnabled === true) {
        return globalAuth;
    }

    return customAuth || globalAuth;
}

function applyBasicAuth(requestConfig, auth) {
    if (!auth) {
        return requestConfig;
    }

    return {
        ...requestConfig,
        auth: {
            username: auth.username,
            password: auth.password,
        },
    };
}

function buildHttpRequestConfig(ip, url, timeout, auth) {
    return applyBasicAuth(
        {
            method: 'get',
            responseType: 'text',
            transformResponse: res => res,
            baseURL: `http://${ip}`,
            timeout,
            url,
        },
        auth,
    );
}

function getHttpErrorStatus(err) {
    return err?.response?.status;
}

function getSafeHttpErrorMessage(err) {
    const status = getHttpErrorStatus(err);
    if (status === 401) {
        return 'Authentication failed';
    }
    if (status) {
        return `HTTP ${status}`;
    }
    return sanitizeLogMessage(err?.message || err || 'Unknown HTTP error');
}

function getDigestAuthHeader({ method, url, username, password, wwwAuthenticate, nonceCount }) {
    const authDetails = wwwAuthenticate
        .replace('Digest ', '')
        .split(', ')
        .map(v => {
            const l = v.split('=');
            return { [l[0]]: l[1].replace(/"/g, '') };
        })
        .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    const nc = `00000000${nonceCount}`.slice(-8);
    const cnonce = crypto.randomBytes(24).toString('hex');
    const sha256 = str => crypto.createHash('sha256').update(str).digest('hex');
    const HA1 = sha256(`${username}:${authDetails.realm}:${password}`);
    const HA2 = sha256(`${method}:${url}`);
    const response = sha256(`${HA1}:${authDetails.nonce}:${nc}:${cnonce}:auth:${HA2}`);

    return `Digest username="${username}", realm="${authDetails.realm}", nonce="${authDetails.nonce}", uri="${url}", cnonce="${cnonce}", nc=${nc}, qop=auth, response="${response}", algorithm=SHA-256`;
}

async function performHttpRequest(ip, url, timeout, auth, nonceState = { nonceCount: 0 }) {
    let requestConfig = buildHttpRequestConfig(ip, url, timeout, auth);

    try {
        const response = await axios(requestConfig);
        return response.data;
    } catch (err) {
        if (
            auth &&
            err &&
            err.response?.status === 401 &&
            err.response?.headers?.['www-authenticate']?.startsWith('Digest ')
        ) {
            nonceState.nonceCount++;
            requestConfig = {
                ...requestConfig,
                auth: undefined,
                headers: {
                    Authorization: getDigestAuthHeader({
                        method: 'GET',
                        url,
                        username: auth.username,
                        password: auth.password,
                        wwwAuthenticate: err.response.headers['www-authenticate'],
                        nonceCount: nonceState.nonceCount,
                    }),
                },
            };

            const response = await axios(requestConfig);
            return response.data;
        }

        throw err;
    }
}

async function requestFirstAvailable(requestFn, urls) {
    let lastError;
    for (const url of urls) {
        try {
            return {
                url,
                body: await requestFn(url),
            };
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}

async function testHttpDeviceConnection(adapter, deviceConfig = {}) {
    const ip = deviceConfig.ip;
    const started = Date.now();
    const timeout = Number(adapter.config.httpTimeout) || DEFAULT_HTTP_TIMEOUT;
    const auth = resolveHttpAuth(deviceConfig, adapter.config);
    const nonceState = { nonceCount: 0 };
    const result = {
        reachable: false,
        authOk: auth ? undefined : true,
        generation: undefined,
        statusOk: false,
        configOk: false,
        responseTimeMs: 0,
        error: undefined,
        info: undefined,
        status: undefined,
        config: undefined,
    };

    const request = async url => await performHttpRequest(ip, url, timeout, auth, nonceState);

    try {
        const info = parseJson(await request('/shelly'), {});
        const normalized = normalizeShellyInfo(info, deviceConfig.deviceId);
        if (!normalized) {
            throw new Error('Invalid /shelly response');
        }

        result.reachable = true;
        result.authOk = true;
        result.generation = normalized.gen;
        result.info = redactSensitiveData(info);

        if (normalized.gen >= 2) {
            result.status = redactSensitiveData(parseJson(await request('/rpc/Shelly.GetStatus'), {}));
            result.statusOk = true;
            const configResponse = await requestFirstAvailable(request, [
                '/rpc/Sys.GetConfig',
                '/rpc/Shelly.GetConfig',
            ]);
            result.config = redactSensitiveData(parseJson(configResponse.body, {}));
            result.configOk = true;
        } else {
            result.status = redactSensitiveData(parseJson(await request('/status'), {}));
            result.statusOk = true;
            result.config = redactSensitiveData(parseJson(await request('/settings'), {}));
            result.configOk = true;
        }
    } catch (err) {
        result.authOk = getHttpErrorStatus(err) === 401 ? false : result.authOk;
        result.error = getSafeHttpErrorMessage(err);
    } finally {
        result.responseTimeMs = Date.now() - started;
    }

    return result;
}

function jsonValue(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
}

function parseComponentKey(key) {
    const match = String(key).match(/^([a-zA-Z0-9_]+):(\d+)$/);
    if (!match) {
        return undefined;
    }
    return {
        type: match[1].toLowerCase(),
        id: Number(match[2]),
    };
}

function inferValueType(value) {
    if (typeof value === 'boolean') {
        return 'boolean';
    }
    if (typeof value === 'number') {
        return 'number';
    }
    if (typeof value === 'string') {
        return 'string';
    }
    return 'mixed';
}

function stateDefinition(id, name, value, options = {}) {
    const common = {
        name,
        type: options.type || inferValueType(value),
        role: options.role || 'state',
        read: options.read !== false,
        write: !!options.write,
    };

    if (options.unit) {
        common.unit = options.unit;
    }
    if (options.min !== undefined) {
        common.min = options.min;
    }
    if (options.max !== undefined) {
        common.max = options.max;
    }
    if (options.states) {
        common.states = options.states;
    }

    return {
        id,
        common,
        value,
        command: options.command,
    };
}

function addState(states, id, name, value, options) {
    if (value !== undefined || options?.write) {
        states.push(stateDefinition(id, name, value, options));
    }
}

function analyzeGen2Capabilities(status = {}, config = {}, info = {}) {
    const states = [];
    const componentKeys = Object.keys(status).filter(key => parseComponentKey(key));

    addState(states, 'Info.id', 'Device ID', info.id, { type: 'string', role: 'text' });
    addState(states, 'Info.model', 'Model', info.model || info.app, { type: 'string', role: 'text' });
    addState(states, 'Info.firmware', 'Firmware version', info.ver || info.fw_id, { type: 'string', role: 'text' });
    addState(states, 'Sys.uptime', 'Uptime', status.sys?.uptime, { type: 'number', role: 'value.interval', unit: 's' });
    addState(states, 'Sys.restartRequired', 'Restart required', status.sys?.restart_required, {
        type: 'boolean',
        role: 'indicator',
    });
    addState(states, 'Sys.ramFree', 'Free RAM', status.sys?.ram_free, { type: 'number', role: 'value', unit: 'B' });
    addState(states, 'Sys.fsFree', 'Free filesystem space', status.sys?.fs_free, {
        type: 'number',
        role: 'value',
        unit: 'B',
    });
    addState(states, 'Network.wifiStatus', 'WiFi status', status.wifi?.status, { type: 'string', role: 'text' });
    addState(states, 'Network.ip', 'IP address', status.wifi?.sta_ip || config.wifi?.sta?.ip, {
        type: 'string',
        role: 'text',
    });
    addState(states, 'Network.rssi', 'WiFi RSSI', status.wifi?.rssi, { type: 'number', role: 'value', unit: 'dBm' });
    addState(states, 'Network.cloudConnected', 'Cloud connected', status.cloud?.connected, {
        type: 'boolean',
        role: 'indicator.connected',
    });
    addState(states, 'Network.mqttConnected', 'MQTT connected', status.mqtt?.connected, {
        type: 'boolean',
        role: 'indicator.connected',
    });
    addState(states, 'Config.profile', 'Device profile', config.device?.profile, { type: 'string', role: 'text' });
    addState(states, 'Config.name', 'Device name', config.device?.name, { type: 'string', role: 'text' });

    for (const key of componentKeys) {
        const component = parseComponentKey(key);
        const value = status[key] || {};
        const id = component.id;

        if (component.type === 'switch') {
            addState(states, `Switch${id}.Switch`, 'Switch', value.output, {
                type: 'boolean',
                role: 'switch',
                write: true,
                command: { gen: 2, method: 'Switch.Set', params: stateValue => ({ id, on: !!stateValue }) },
            });
            addState(states, `Switch${id}.Toggle`, 'Toggle', undefined, {
                type: 'boolean',
                role: 'button',
                write: true,
                read: false,
                command: { gen: 2, method: 'Switch.Toggle', params: () => ({ id }) },
            });
            addState(states, `Switch${id}.Power`, 'Power', value.apower, {
                type: 'number',
                role: 'value.power',
                unit: 'W',
            });
            addState(states, `Switch${id}.Voltage`, 'Voltage', value.voltage, {
                type: 'number',
                role: 'value.voltage',
                unit: 'V',
            });
            addState(states, `Switch${id}.Current`, 'Current', value.current, {
                type: 'number',
                role: 'value.current',
                unit: 'A',
            });
            addState(states, `Switch${id}.Energy`, 'Energy', value.aenergy?.total, {
                type: 'number',
                role: 'value.energy',
                unit: 'Wh',
            });
        } else if (component.type === 'input') {
            addState(states, `Input${id}.State`, 'Input state', value.state, { role: 'sensor.switch' });
            addState(states, `Input${id}.Percent`, 'Input percentage', value.percent, {
                type: 'number',
                role: 'value',
                unit: '%',
            });
        } else if (component.type === 'light' || component.type === 'cct') {
            const method = component.type === 'cct' ? 'CCT.Set' : 'Light.Set';
            addState(states, `Light${id}.Switch`, 'Light', value.output, {
                type: 'boolean',
                role: 'switch.light',
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, on: !!stateValue }) },
            });
            addState(states, `Light${id}.Brightness`, 'Brightness', value.brightness, {
                type: 'number',
                role: 'level.brightness',
                unit: '%',
                min: 0,
                max: 100,
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, brightness: Number(stateValue) }) },
            });
            addState(states, `Light${id}.Power`, 'Power', value.apower, {
                type: 'number',
                role: 'value.power',
                unit: 'W',
            });
        } else if (component.type === 'rgb' || component.type === 'rgbw') {
            const method = component.type === 'rgbw' ? 'RGBW.Set' : 'RGB.Set';
            addState(states, `RGBW${id}.Switch`, 'RGB/RGBW light', value.output, {
                type: 'boolean',
                role: 'switch.light',
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, on: !!stateValue }) },
            });
            addState(states, `RGBW${id}.Brightness`, 'Brightness', value.brightness, {
                type: 'number',
                role: 'level.brightness',
                unit: '%',
                min: 0,
                max: 100,
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, brightness: Number(stateValue) }) },
            });
            addState(states, `RGBW${id}.RGB`, 'RGB color', jsonValue(value.rgb), {
                type: 'string',
                role: 'level.color.rgb',
                write: true,
                command: {
                    gen: 2,
                    method,
                    params: stateValue => ({
                        id,
                        rgb: Array.isArray(stateValue) ? stateValue : JSON.parse(stateValue),
                    }),
                },
            });
            addState(states, `RGBW${id}.White`, 'White channel', value.white, {
                type: 'number',
                role: 'level.color.white',
                min: 0,
                max: 255,
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, white: Number(stateValue) }) },
            });
            addState(states, `RGBW${id}.Gain`, 'Gain', value.gain, {
                type: 'number',
                role: 'level.dimmer',
                min: 0,
                max: 100,
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, gain: Number(stateValue) }) },
            });
            addState(states, `RGBW${id}.Effect`, 'Effect', value.effect, {
                type: 'number',
                role: 'level',
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, effect: Number(stateValue) }) },
            });
            addState(states, `RGBW${id}.Transition`, 'Transition', value.transition, {
                type: 'number',
                role: 'level.timer',
                unit: 'ms',
                write: true,
                command: { gen: 2, method, params: stateValue => ({ id, transition: Number(stateValue) }) },
            });
        } else if (component.type === 'cover') {
            addState(states, `Cover${id}.State`, 'Cover state', value.state, { type: 'string', role: 'state' });
            addState(states, `Cover${id}.Position`, 'Cover position', value.current_pos, {
                type: 'number',
                role: 'level.blind',
                unit: '%',
                min: 0,
                max: 100,
                write: true,
                command: {
                    gen: 2,
                    method: 'Cover.GoToPosition',
                    params: stateValue => ({ id, pos: Number(stateValue) }),
                },
            });
            addState(states, `Cover${id}.Open`, 'Open', undefined, {
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
                command: { gen: 2, method: 'Cover.Open', params: () => ({ id }) },
            });
            addState(states, `Cover${id}.Close`, 'Close', undefined, {
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
                command: { gen: 2, method: 'Cover.Close', params: () => ({ id }) },
            });
            addState(states, `Cover${id}.Stop`, 'Stop', undefined, {
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
                command: { gen: 2, method: 'Cover.Stop', params: () => ({ id }) },
            });
            addState(states, `Cover${id}.Power`, 'Power', value.apower, {
                type: 'number',
                role: 'value.power',
                unit: 'W',
            });
        } else if (component.type === 'temperature') {
            addState(states, `Temperature${id}.Celsius`, 'Temperature', value.tC, {
                type: 'number',
                role: 'value.temperature',
                unit: '°C',
            });
            addState(states, `Temperature${id}.Fahrenheit`, 'Temperature', value.tF, {
                type: 'number',
                role: 'value.temperature',
                unit: '°F',
            });
        } else if (component.type === 'humidity') {
            addState(states, `Humidity${id}.Relative`, 'Humidity', value.rh, {
                type: 'number',
                role: 'value.humidity',
                unit: '%',
            });
        } else if (component.type === 'pm1' || component.type === 'em1') {
            addState(states, `Energy${id}.Power`, 'Power', value.apower || value.act_power, {
                type: 'number',
                role: 'value.power',
                unit: 'W',
            });
            addState(states, `Energy${id}.Voltage`, 'Voltage', value.voltage, {
                type: 'number',
                role: 'value.voltage',
                unit: 'V',
            });
            addState(states, `Energy${id}.Current`, 'Current', value.current, {
                type: 'number',
                role: 'value.current',
                unit: 'A',
            });
            addState(states, `Energy${id}.Energy`, 'Energy', value.aenergy?.total, {
                type: 'number',
                role: 'value.energy',
                unit: 'Wh',
            });
        }
    }

    return {
        gen: 2,
        states,
        status,
        config,
        info,
    };
}

function analyzeGen1Capabilities(status = {}, settings = {}, info = {}) {
    const states = [];

    addState(states, 'Info.type', 'Device type', info.type, { type: 'string', role: 'text' });
    addState(states, 'Info.mac', 'MAC address', info.mac, { type: 'string', role: 'text' });
    addState(states, 'Sys.uptime', 'Uptime', status.uptime, { type: 'number', role: 'value.interval', unit: 's' });
    addState(states, 'Network.ip', 'IP address', status.wifi_sta?.ip, { type: 'string', role: 'text' });
    addState(states, 'Network.rssi', 'WiFi RSSI', status.wifi_sta?.rssi, {
        type: 'number',
        role: 'value',
        unit: 'dBm',
    });
    addState(states, 'Cloud.connected', 'Cloud connected', status.cloud?.connected, {
        type: 'boolean',
        role: 'indicator.connected',
    });
    addState(states, 'Config.mode', 'Device mode', settings.mode, { type: 'string', role: 'text' });
    addState(states, 'Config.name', 'Device name', settings.name, { type: 'string', role: 'text' });

    (status.relays || []).forEach((relay, id) => {
        addState(states, `Relay${id}.Switch`, 'Relay', relay.ison, {
            type: 'boolean',
            role: 'switch',
            write: true,
            command: { gen: 1, url: stateValue => `/relay/${id}?turn=${stateValue ? 'on' : 'off'}` },
        });
        addState(states, `Relay${id}.Toggle`, 'Toggle', undefined, {
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            command: { gen: 1, url: () => `/relay/${id}?turn=toggle` },
        });
    });

    (status.meters || []).forEach((meter, id) => {
        addState(states, `Meter${id}.Power`, 'Power', meter.power, { type: 'number', role: 'value.power', unit: 'W' });
        addState(states, `Meter${id}.Energy`, 'Energy', meter.total, {
            type: 'number',
            role: 'value.energy',
            unit: 'Wh',
        });
    });

    (status.inputs || []).forEach((input, id) => {
        addState(states, `Input${id}.State`, 'Input state', input.input ?? input.event, { role: 'sensor.switch' });
    });

    (status.lights || []).forEach((light, id) => {
        const isColor = light.red !== undefined || light.green !== undefined || light.blue !== undefined;
        const prefix = isColor ? `RGBW${id}` : `Light${id}`;
        const endpoint = isColor ? 'color' : 'light';
        addState(states, `${prefix}.Switch`, 'Light', light.ison, {
            type: 'boolean',
            role: 'switch.light',
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?turn=${stateValue ? 'on' : 'off'}` },
        });
        addState(states, `${prefix}.Brightness`, 'Brightness', light.brightness, {
            type: 'number',
            role: 'level.brightness',
            unit: '%',
            min: 0,
            max: 100,
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?brightness=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Red`, 'Red', light.red, {
            type: 'number',
            role: 'level.color.red',
            min: 0,
            max: 255,
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?red=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Green`, 'Green', light.green, {
            type: 'number',
            role: 'level.color.green',
            min: 0,
            max: 255,
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?green=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Blue`, 'Blue', light.blue, {
            type: 'number',
            role: 'level.color.blue',
            min: 0,
            max: 255,
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?blue=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.White`, 'White', light.white, {
            type: 'number',
            role: 'level.color.white',
            min: 0,
            max: 255,
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?white=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Gain`, 'Gain', light.gain, {
            type: 'number',
            role: 'level.dimmer',
            min: 0,
            max: 100,
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?gain=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Effect`, 'Effect', light.effect, {
            type: 'number',
            role: 'level',
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?effect=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Transition`, 'Transition', light.transition, {
            type: 'number',
            role: 'level.timer',
            unit: 'ms',
            write: true,
            command: { gen: 1, url: stateValue => `/${endpoint}/${id}?transition=${Number(stateValue)}` },
        });
        addState(states, `${prefix}.Power`, 'Power', light.power, { type: 'number', role: 'value.power', unit: 'W' });
    });

    (status.rollers || []).forEach((roller, id) => {
        addState(states, `Cover${id}.State`, 'Cover state', roller.state, { type: 'string', role: 'state' });
        addState(states, `Cover${id}.Position`, 'Cover position', roller.current_pos, {
            type: 'number',
            role: 'level.blind',
            unit: '%',
            min: 0,
            max: 100,
            write: true,
            command: { gen: 1, url: stateValue => `/roller/${id}?go=to_pos&roller_pos=${Number(stateValue)}` },
        });
        addState(states, `Cover${id}.Open`, 'Open', undefined, {
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            command: { gen: 1, url: () => `/roller/${id}?go=open` },
        });
        addState(states, `Cover${id}.Close`, 'Close', undefined, {
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            command: { gen: 1, url: () => `/roller/${id}?go=close` },
        });
        addState(states, `Cover${id}.Stop`, 'Stop', undefined, {
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            command: { gen: 1, url: () => `/roller/${id}?go=stop` },
        });
    });

    addState(states, 'Temperature0.Celsius', 'Temperature', status.tmp?.tC || status.temperature, {
        type: 'number',
        role: 'value.temperature',
        unit: '°C',
    });
    addState(states, 'Humidity0.Relative', 'Humidity', status.hum?.value || status.humidity, {
        type: 'number',
        role: 'value.humidity',
        unit: '%',
    });

    return {
        gen: 1,
        states,
        status,
        config: settings,
        info,
    };
}

function analyzeShellyCapabilities({ gen, status, config, settings, info }) {
    return gen >= 2
        ? analyzeGen2Capabilities(status, config, info)
        : analyzeGen1Capabilities(status, settings || config, info);
}

function getGenericStateValue(stateId, capability) {
    const valueMap = new Map(capability.states.map(state => [state.id, state.value]));
    return valueMap.get(stateId);
}

function isAdministrativeUrl(url) {
    if (url.startsWith('/ota') || url.startsWith('/reboot')) {
        return true;
    }

    const rpcMatch = url.match(/^\/rpc\/([^?]+)/);
    if (!rpcMatch) {
        return false;
    }

    return (
        ADMIN_RPC_METHODS.includes(rpcMatch[1]) ||
        rpcMatch[1].startsWith('Debug.') ||
        rpcMatch[1].endsWith('.SetConfig')
    );
}

function isUnsafeProfileCommand(state, protocol) {
    const protocolState = state?.[protocol];
    if (!protocolState) {
        return false;
    }

    if (protocolState.http_cmd && isAdministrativeUrl(protocolState.http_cmd)) {
        return true;
    }

    const commandSource = [
        protocolState.http_cmd || '',
        protocolState.http_cmd_funct ? protocolState.http_cmd_funct.toString() : '',
        protocolState.mqtt_cmd_funct ? protocolState.mqtt_cmd_funct.toString() : '',
    ].join(' ');

    return /(?:SetConfig|ResetCounters|Calibrate|FactoryReset|ResetWiFi|Shelly\.Update|Shelly\.Reboot|Debug\.|Script\.|MQTT\.SetConfig|Cloud\.SetConfig|WiFi\.SetConfig|Eth\.SetConfig)/.test(
        commandSource,
    );
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

function mergeHttpDevices(configuredDevices, discoveredDevices, autoCreate) {
    const devicesByKey = new Map();
    for (const device of [...(autoCreate ? discoveredDevices : []), ...configuredDevices]) {
        const key = device.deviceId || device.ip;
        const existing = devicesByKey.get(key);
        if (!existing || device.source === 'manual') {
            devicesByKey.set(key, device);
        }
    }
    return Array.from(devicesByKey.values());
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
        this.genericPollTimeout = null;
        this.rawPayloads = {};
        this.rawOnly = false;
        this.failureCount = 0;
        this.capability = undefined;
        this.genericStates = {};
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
                const body = await requestFn(url);
                await this.markHttpSuccess();
                return body;
            } catch (err) {
                lastError = err;
                if (attempt < this.retryCount) {
                    this.adapter.log.debug(
                        sanitizeLogMessage(
                            `[HTTP] Retry ${attempt + 1}/${this.retryCount} for ${this.getIP()} ${url}: ${err.message || err}`,
                        ),
                    );
                }
            }
        }
        await this.markHttpFailure(url, lastError);
        throw lastError;
    }

    async markHttpSuccess() {
        this.failureCount = 0;
        if (this.deviceId && !this.isOnline()) {
            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true);
        }
    }

    async markHttpFailure(url, err) {
        this.failureCount++;
        this.adapter.log.debug(
            sanitizeLogMessage(
                `[HTTP] Request failed for ${this.getLogInfo()} ${url}; failure ${this.failureCount}/${OFFLINE_FAILURE_THRESHOLD}: ${err?.message || err}`,
            ),
        );
        if (this.deviceId && this.failureCount >= OFFLINE_FAILURE_THRESHOLD) {
            await this.adapter.deviceStatusUpdate(this.getDeviceId(), false);
        }
    }

    getAuth(options) {
        return resolveHttpAuth(this.config, this.adapter.config, options);
    }

    async performHttpRequest(url, auth) {
        return await performHttpRequest(this.getIP(), url, this.httpTimeout, auth, this);
    }

    async requestHttp(url, options = {}) {
        return await this.performHttpRequest(url, this.getAuth(options));
    }

    async requestRaw(url) {
        return await this.requestHttp(url);
    }

    async requestAsync(url) {
        return await this.requestWithRetry(url, async requestUrl => await this.requestWithInheritedAuth(requestUrl));
    }

    async requestWithInheritedAuth(url) {
        if (isAdministrativeUrl(url) && !this.adapter.config.httpAllowAdmin) {
            throw new Error(`Administrative HTTP function blocked by configuration: ${url}`);
        }

        return await this.requestHttp(url);
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
        this.rawPayloads.info = stringifySafePayload(info);

        return info;
    }

    async readDeviceMode() {
        try {
            if (this.getDeviceGen() === 1) {
                const settings = parseJson(await this.requestWithRetry('/settings'), {});
                this.rawPayloads.settings = stringifySafePayload(settings);
                if (settings && settings.mode) {
                    this.deviceMode = settings.mode;
                }
            } else {
                const configResponse = await requestFirstAvailable(
                    async url => await this.requestWithRetry(url),
                    ['/rpc/Sys.GetConfig', '/rpc/Shelly.GetConfig'],
                );
                const config = parseJson(configResponse.body, {});
                this.rawPayloads.config = stringifySafePayload(config);
                if (config?.device?.profile) {
                    this.deviceMode = config.device.profile;
                }
            }
        } catch (err) {
            this.adapter.log.debug(
                sanitizeLogMessage(`[HTTP] Unable to read mode/config for ${this.getLogInfo()}: ${err.message || err}`),
            );
        }
    }

    async readStatusAndConfig() {
        if (this.getDeviceGen() === 1) {
            const status = parseJson(await this.requestWithRetry('/status'), {});
            const settings = this.rawPayloads.settings
                ? parseJson(this.rawPayloads.settings, {})
                : parseJson(await this.requestWithRetry('/settings'), {});
            this.rawPayloads.status = stringifySafePayload(status);
            this.rawPayloads.settings = stringifySafePayload(settings);
            this.capability = analyzeShellyCapabilities({
                gen: 1,
                status,
                settings,
                info: parseJson(this.rawPayloads.info, {}),
            });
        } else {
            const status = parseJson(await this.requestWithRetry('/rpc/Shelly.GetStatus'), {});
            const config = this.rawPayloads.config
                ? parseJson(this.rawPayloads.config, {})
                : parseJson(
                      (
                          await requestFirstAvailable(
                              async url => await this.requestWithRetry(url),
                              ['/rpc/Sys.GetConfig', '/rpc/Shelly.GetConfig'],
                          )
                      ).body,
                      {},
                  );
            this.rawPayloads.status = stringifySafePayload(status);
            this.rawPayloads.config = stringifySafePayload(config);
            this.capability = analyzeShellyCapabilities({
                gen: this.getDeviceGen(),
                status,
                config,
                info: parseJson(this.rawPayloads.info, {}),
            });
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

    getPollDelayMs() {
        const polltime = this.getPollTime();
        if (!polltime) {
            return 0;
        }
        return Math.max(MIN_POLL_INTERVAL_SECONDS, polltime) * 1000;
    }

    scheduleGenericPolling() {
        const delay = this.getPollDelayMs();
        if (!delay) {
            return;
        }
        this.genericPollTimeout = setTimeout(async () => await this.pollGenericCapabilities(), delay);
    }

    scheduleRawPolling() {
        const delay = this.getPollDelayMs();
        if (!delay) {
            return;
        }
        this.rawPollTimeout = setTimeout(async () => await this.pollRawPayloads(), delay);
    }

    createGenericCapabilityObjects() {
        if (!this.capability) {
            return;
        }

        const deviceId = this.getDeviceId();
        this.objectHelper.setOrUpdateObject(
            deviceId,
            {
                type: 'device',
                common: {
                    name: this.customName || this.getId() || deviceId,
                    desc: `Shelly HTTP capability device (${this.deviceType || 'unknown'})`,
                },
            },
            ['name'],
            undefined,
            undefined,
            false,
        );

        const channels = new Set();
        for (const state of this.capability.states) {
            const channel = state.id.split('.')[0];
            if (!channels.has(channel)) {
                channels.add(channel);
                this.objectHelper.setOrUpdateObject(
                    `${deviceId}.${channel}`,
                    {
                        type: 'channel',
                        common: {
                            name: channel,
                        },
                    },
                    ['name'],
                    undefined,
                    undefined,
                    false,
                );
            }
        }

        this.genericStates = {};
        for (const state of this.capability.states) {
            const fullStateId = `${deviceId}.${state.id}`;
            this.genericStates[state.id] = state;
            this.objectHelper.setOrUpdateObject(
                fullStateId,
                {
                    type: 'state',
                    common: state.common,
                },
                ['name'],
                state.value,
                state.command ? async value => await this.executeGenericCommand(state, value) : undefined,
                false,
            );
            this.stateValueCache[fullStateId] = state.value;
        }

        this.objectHelper.processObjectQueue(() => {});
    }

    async createObjects() {
        await super.createObjects();

        if (this.adapter.config.httpAllowAdmin) {
            return;
        }

        for (const [stateId, state] of Object.entries(this.device || {})) {
            if (isUnsafeProfileCommand(state, this.type)) {
                state.common.write = false;
                const fullStateId = `${this.getDeviceId()}.${stateId}`;
                await this.adapter.extendObjectAsync?.(fullStateId, { common: { write: false } });
                if (!this.adapter.extendObjectAsync) {
                    await new Promise(resolve =>
                        this.adapter.extendObject(fullStateId, { common: { write: false } }, resolve),
                    );
                }
            }
        }
    }

    async executeGenericCommand(state, value) {
        if (!state.command) {
            return;
        }

        if (state.command.gen >= 2) {
            const params =
                typeof state.command.params === 'function' ? state.command.params(value) : state.command.params;
            await this.executeRpc(state.command.method, params);
        } else {
            const url = typeof state.command.url === 'function' ? state.command.url(value) : state.command.url;
            await this.requestWithRetry(url);
        }

        const fullStateId = `${this.getDeviceId()}.${state.id}`;
        delete this.stateValueCache[fullStateId];
    }

    async pollRawPayloads() {
        if (!this.isOnline() || !this.getIP()) {
            this.scheduleRawPolling();
            return;
        }

        const endpoints = this.getDeviceGen() >= 2 ? RAW_POLL_ENDPOINTS_GEN2 : RAW_POLL_ENDPOINTS_GEN1;
        for (const endpoint of endpoints) {
            try {
                const body = sanitizeHttpBodyForState(await this.requestWithRetry(endpoint.url));
                const stateId =
                    endpoint.id === 'config' || endpoint.id === 'settings'
                        ? `${this.getDeviceId()}.raw.settings`
                        : `${this.getDeviceId()}.raw.${endpoint.id}`;

                if (body !== undefined && this.stateValueCache[stateId] !== body) {
                    this.stateValueCache[stateId] = body;
                    await this.adapter.setState(stateId, { val: body, ack: true });
                }
            } catch (err) {
                this.adapter.log.debug(
                    sanitizeLogMessage(
                        `[HTTP] Raw poll failed for ${this.getLogInfo()} ${endpoint.url}: ${err.message || err}`,
                    ),
                );
            }
        }

        this.scheduleRawPolling();
    }

    async pollGenericCapabilities() {
        if (!this.getIP()) {
            this.scheduleGenericPolling();
            return;
        }

        try {
            await this.readStatusAndConfig();
            if (!this.capability) {
                return;
            }

            for (const state of this.capability.states) {
                if (state.common.read === false) {
                    continue;
                }

                const fullStateId = `${this.getDeviceId()}.${state.id}`;
                const value = getGenericStateValue(state.id, this.capability);
                if (
                    value !== undefined &&
                    (!Object.prototype.hasOwnProperty.call(this.stateValueCache, fullStateId) ||
                        this.stateValueCache[fullStateId] !== value ||
                        this.adapter.config.updateUnchangedObjects)
                ) {
                    this.stateValueCache[fullStateId] = value;
                    await this.adapter.setState(fullStateId, { val: value, ack: true });
                }
            }
        } catch (err) {
            this.adapter.log.debug(
                sanitizeLogMessage(
                    `[HTTP] Generic capability poll failed for ${this.getLogInfo()}: ${err.message || err}`,
                ),
            );
        } finally {
            this.scheduleGenericPolling();
        }
    }

    async discover() {
        const info = await this.readDeviceInfo();
        await this.readDeviceMode();
        await this.readStatusAndConfig();

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
                if (this.adapter.config.httpSaveRawJson) {
                    this.createRawObjects();
                    await this.pollRawPayloads();
                }
                this.createGenericCapabilityObjects();
                await this.pollGenericCapabilities();
            }
        } catch (err) {
            this.adapter.log.error(
                sanitizeLogMessage(`[HTTP] Unable to initialize ${this.getIP()}: ${err.message || err}`),
            );
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
        if (this.genericPollTimeout) {
            clearTimeout(this.genericPollTimeout);
            this.genericPollTimeout = null;
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

    async performProbeRequest(ip, url, auth) {
        const requestConfig = buildHttpRequestConfig(ip, url, this.getTimeout(), auth);
        const response = await axios(requestConfig);
        return response.data;
    }

    async probeGet(ip, url) {
        const globalAuth = resolveHttpAuth({}, this.adapter.config, { forceGlobal: true });

        try {
            return await this.performProbeRequest(ip, url, undefined);
        } catch (err) {
            if (!globalAuth) {
                throw err;
            }

            this.adapter.log.debug(
                sanitizeLogMessage(
                    `[HTTP] Discovery retry with global authentication for ${ip} ${url}: ${err.message || err}`,
                ),
            );
            return await this.performProbeRequest(ip, url, globalAuth);
        }
    }

    async probeGetWithRetry(ip, url) {
        const retries = Number(this.adapter.config.httpRetries) || DEFAULT_HTTP_RETRIES;
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await this.probeGet(ip, url);
            } catch (err) {
                lastError = err;
                if (attempt < retries) {
                    this.adapter.log.debug(
                        sanitizeLogMessage(
                            `[HTTP] Discovery retry ${attempt + 1}/${retries} for ${ip} ${url}: ${err.message || err}`,
                        ),
                    );
                }
            }
        }
        throw lastError;
    }

    async probeAnalysis(ip, normalized, info) {
        try {
            if (normalized.gen >= 2) {
                const [statusBody, configResponse] = await Promise.all([
                    this.probeGetWithRetry(ip, '/rpc/Shelly.GetStatus'),
                    requestFirstAvailable(
                        async url => await this.probeGetWithRetry(ip, url),
                        ['/rpc/Sys.GetConfig', '/rpc/Shelly.GetConfig'],
                    ),
                ]);
                return analyzeShellyCapabilities({
                    gen: normalized.gen,
                    status: parseJson(statusBody, {}),
                    config: parseJson(configResponse.body, {}),
                    info,
                });
            }

            const [statusBody, settingsBody] = await Promise.all([
                this.probeGetWithRetry(ip, '/status'),
                this.probeGetWithRetry(ip, '/settings'),
            ]);
            return analyzeShellyCapabilities({
                gen: 1,
                status: parseJson(statusBody, {}),
                settings: parseJson(settingsBody, {}),
                info,
            });
        } catch (err) {
            this.adapter.log.debug(
                sanitizeLogMessage(`[HTTP] Capability probe failed for ${ip}: ${err.message || err}`),
            );
            return undefined;
        }
    }

    async probeIp(ip) {
        try {
            const info = parseJson(await this.probeGetWithRetry(ip, '/shelly'), undefined);
            const normalized = normalizeShellyInfo(info);

            if (!normalized) {
                return undefined;
            }

            const capability = await this.probeAnalysis(ip, normalized, info);
            return {
                ip,
                deviceId: normalized.deviceId,
                name: normalized.deviceId,
                source: 'http-discovery',
                enabled: true,
                capabilityCount: capability?.states?.length || 0,
            };
        } catch (err) {
            this.adapter.log.silly(
                sanitizeLogMessage(`[HTTP] Discovery probe failed for ${ip}: ${err.message || err}`),
            );
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
        const configuredDevices = this.getConfiguredDevices();
        const discoveredDevices = await this.scanNetworkRanges();
        const autoCreate = this.adapter.config.httpAutoCreate !== false;
        if (!autoCreate && discoveredDevices.length) {
            this.adapter.log.info(
                `[HTTP] Discovery found ${discoveredDevices.length} device(s), but automatic creation is disabled`,
            );
        }

        const devices = mergeHttpDevices(configuredDevices, discoveredDevices, autoCreate);

        if (devices.length === 0) {
            this.adapter.log.warn('[HTTP] No HTTP polling devices configured or discovered');
            return;
        }

        for (const device of devices) {
            if (this.clients[device.ip]) {
                continue;
            }
            const client = new HTTPPollingClient(this.adapter, this.objectHelper, this.eventEmitter, device);
            this.clients[device.ip] = client;
            client.start();
        }
    }

    getConfiguredDevices() {
        return Array.isArray(this.adapter.config.httpDevices)
            ? this.adapter.config.httpDevices
                  .filter(device => device && device.ip && device.enabled !== false)
                  .map(device => ({ ...device, source: 'manual' }))
            : [];
    }

    getConfiguredDevice(ip) {
        return this.getConfiguredDevices().find(device => device.ip === ip);
    }

    async refreshDeviceByIp(ip) {
        if (!ip) {
            throw new Error('Missing device IP address');
        }

        if (this.clients[ip]) {
            this.clients[ip].destroy();
            delete this.clients[ip];
        }

        let device = this.getConfiguredDevice(ip);
        if (!device) {
            const discovered = await this.probeIp(ip);
            if (!discovered) {
                throw new Error('Device could not be detected via HTTP');
            }
            device = discovered;
        }

        const client = new HTTPPollingClient(this.adapter, this.objectHelper, this.eventEmitter, device);
        this.clients[ip] = client;
        await client.start();
        return device;
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
    HTTPPollingClient,
    HTTPPollingServer,
    _private: {
        analyzeShellyCapabilities,
        appendRpcParams,
        expandHttpNetworkRanges,
        getGenericStateValue,
        isAdministrativeUrl,
        isUnsafeProfileCommand,
        mergeHttpDevices,
        normalizeShellyInfo,
        resolveHttpAuth,
        runWithConcurrency,
        sanitizeLogMessage,
        sanitizeHttpBodyForState,
        testHttpDeviceConnection,
    },
};
