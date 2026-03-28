"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dm_utils_1 = require("@iobroker/dm-utils");
const adapter_core_1 = require("@iobroker/adapter-core");
// It must be exported to index in dm-utils
const dgram = __importStar(require("node:dgram"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const datapoints = require('./datapoints');
/** Map device class to group key */
const deviceGroupMap = {
    // Relays & Switches
    shelly1: 'relay',
    shelly1pm: 'relay',
    shelly1l: 'relay',
    shellyswitch: 'relay',
    shellyswitch25: 'relay',
    shelly4pro: 'relay',
    shellyplus1: 'relay',
    shellyplus1pm: 'relay',
    shellyplus2pm: 'relay',
    shellypro1: 'relay',
    shellypro1pm: 'relay',
    shellypro2: 'relay',
    shellypro2pm: 'relay',
    shellypro3: 'relay',
    shellypro4pm: 'relay',
    shelly1mini: 'relay',
    shelly1pmmini: 'relay',
    shelly1minig3: 'relay',
    shelly1pmminig3: 'relay',
    shelly1pmg3: 'relay',
    shelly1g3: 'relay',
    shelly1lg3: 'relay',
    shelly2lg3: 'relay',
    shelly2pmg3: 'relay',
    shelly1g4: 'relay',
    shelly1pmg4: 'relay',
    shelly1minig4: 'relay',
    shelly1pmminig4: 'relay',
    shelly2pmg4: 'relay',
    // Dimmers
    shellydimmer: 'dimmer',
    shellydimmer2: 'dimmer',
    shellyplus010v: 'dimmer',
    shellypro0110pm: 'dimmer',
    shellyprodm1pm: 'dimmer',
    shellyprodm2pm: 'dimmer',
    shelly0110dimg3: 'dimmer',
    shellyddimmerg3: 'dimmer',
    shellydimmerg3: 'dimmer',
    shellydimmerg4: 'dimmer',
    // Plugs
    shellyplug: 'plug',
    'shellyplug-s': 'plug',
    shellyplusplugs: 'plug',
    shellyplugmg3: 'plug',
    shellyplugpmg3: 'plug',
    shellyplugsg3: 'plug',
    shellyazplug: 'plug',
    // Lights
    shellybulb: 'light',
    ShellyBulbDuo: 'light',
    ShellyVintage: 'light',
    shellycolorbulb: 'light',
    shellyrgbw2: 'light',
    shelly2led: 'light',
    shellyplusrgbwpm: 'light',
    shellyprorgbwwpm: 'light',
    shellypstripg4: 'light',
    // Energy Meters
    shellyem: 'meter',
    shellyem3: 'meter',
    shellypro3em: 'meter',
    shellypro3em400: 'meter',
    shellypro3em63: 'meter',
    shellyproem50: 'meter',
    shellypmmini: 'meter',
    shellypmminig3: 'meter',
    shelly3em63g3: 'meter',
    shellyemg3: 'meter',
    shellyemminig4: 'meter',
    // Sensors
    shellyht: 'sensor',
    shellysense: 'sensor',
    shellyplusht: 'sensor',
    shellyhtg3: 'sensor',
    shellypill: 'sensor',
    shellydw: 'sensor',
    shellydw2: 'sensor',
    shellymotionsensor: 'sensor',
    shellymotion2: 'sensor',
    shellyoutdoorsg3: 'sensor',
    shellysmoke: 'sensor',
    shellyplussmoke: 'sensor',
    shellyflood: 'sensor',
    shellyfloodg4: 'sensor',
    shellygas: 'sensor',
    // Shutters & Covers
    shellypro2cover: 'cover',
    shellyshutter: 'cover',
    // Buttons & Inputs
    shellybutton1: 'input',
    shellyplusi4: 'input',
    shellyix3: 'input',
    shellyi4g3: 'input',
    // Climate
    shellytrv: 'climate',
    // Gateways
    shellyblugw: 'gateway',
    shellyblugwg3: 'gateway',
    shellyuni: 'gateway',
    shellyplusuni: 'gateway',
    ShellyWallDisplay: 'gateway',
    // Powered by Shelly
    irrigation: 'other',
    ogemray25a: 'other',
    st1820: 'other',
    watervalve: 'other',
};
/** Group metadata: display name key (for i18n) and representative icon */
const groupMeta = {
    relay: { nameKey: 'Relays & Switches', icon: 'adapter/shelly/icons/shellyplus1.png' },
    dimmer: { nameKey: 'Dimmers', icon: 'adapter/shelly/icons/shellydimmerg3.png' },
    plug: { nameKey: 'Plugs', icon: 'adapter/shelly/icons/shellyplusplugs.png' },
    light: { nameKey: 'Lights', icon: 'adapter/shelly/icons/shellybulbduo.png' },
    meter: { nameKey: 'Energy Meters', icon: 'adapter/shelly/icons/shellyem3.png' },
    sensor: { nameKey: 'Sensors', icon: 'adapter/shelly/icons/shellyhtg3.png' },
    cover: { nameKey: 'Shutters & Covers', icon: 'adapter/shelly/icons/shellyshutter.png' },
    input: { nameKey: 'Buttons & Inputs', icon: 'adapter/shelly/icons/shellyplusi4.png' },
    climate: { nameKey: 'Climate', icon: 'adapter/shelly/icons/shellytrv.png' },
    gateway: { nameKey: 'Gateways', icon: 'adapter/shelly/icons/shellyblugw.png' },
    ble: { nameKey: 'BLE Devices', icon: 'adapter/shelly/icons/ble.svg' },
    other: { nameKey: 'Other', icon: 'adapter/shelly/icons/shellyplus1.png' },
};
/**
 * DeviceManager Class
 */
class ShellyDeviceManagement extends dm_utils_1.DeviceManagement {
    ready;
    states = {};
    objects = {};
    constructor(adapter) {
        super(adapter);
        // Initialize i18n
        this.ready = adapter_core_1.I18n.init(__dirname, adapter)
            .catch(error => this.adapter.log.error(`Cannot initialize i18n: ${error}`))
            .then(() => this.init());
    }
    async init() {
        const devices = await this.adapter.getDevicesAsync();
        const stateObjects = await this.adapter.getStatesOfAsync();
        const states = await this.adapter.getStatesAsync('*');
        for (const device of devices) {
            this.objects[device._id] = device;
        }
        for (const state of stateObjects) {
            this.objects[state._id] = state;
        }
        for (const id in states) {
            this.states[id] = states[id];
        }
        // Set icon on existing devices if not yet set or still using old base64 SVG icon
        for (const device of devices) {
            if (!device.common.icon || String(device.common.icon).startsWith('data:')) {
                const shortDeviceId = device._id.substring(this.adapter.namespace.length + 1);
                const deviceClass = this.states[`${this.adapter.namespace}.${shortDeviceId}.class`]?.val;
                if (deviceClass) {
                    const iconName = datapoints.getDeviceIcon(deviceClass);
                    await this.adapter.extendObjectAsync(device._id, { common: { icon: `icons/${iconName}.png` } });
                    device.common.icon = `icons/${iconName}.png`;
                }
            }
        }
        await this.adapter.subscribeStatesAsync('*');
        await this.adapter.subscribeObjectsAsync('*');
    }
    getInstanceInfo() {
        return {
            apiVersion: 'v3',
            actions: [
                {
                    id: 'discover',
                    icon: 'search',
                    title: adapter_core_1.I18n.getTranslatedObject('Discover devices'),
                    description: adapter_core_1.I18n.getTranslatedObject('Scan network for Shelly devices via mDNS'),
                    handler: async (context) => await this.handleDiscoverDevices(context),
                },
            ],
        };
    }
    onStateChange(id, state) {
        if (state) {
            if (!this.states[id]) {
                // trigger DM update
                this.states[id] = state;
            }
            else if (this.states[id].val !== state.val) {
                // trigger DM update
                this.states[id] = state;
            }
        }
        else if (this.states[id]) {
            // trigger DM update
            delete this.states[id];
        }
    }
    onObjectChange(id, obj) {
        if (obj) {
            this.objects[id] = obj;
        }
        else {
            delete this.objects[id];
        }
    }
    /**
     * Load all shelly devices
     *
     * @param context
     */
    async loadDevices(context) {
        // Wait that i18n is initialized
        await this.ready;
        for (const deviceId in this.objects) {
            const device = this.objects[deviceId];
            if (device.type !== 'device') {
                continue;
            }
            const shortDeviceId = device._id.substring(this.adapter.namespace.length + 1);
            const ns = this.adapter.namespace;
            const isBle = shortDeviceId.startsWith('ble.');
            const isOnline = isBle || !!this.states[`${ns}.${shortDeviceId}.online`]?.val;
            const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val;
            const firmwareUpdate = this.states[`${ns}.${shortDeviceId}.firmware`]?.val;
            const battery = this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                ? this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`].val
                : this.states[`${ns}.${shortDeviceId}.sensor.battery`]?.val ||
                    this.states[`${ns}.${shortDeviceId}.battery`]?.val ||
                    undefined;
            const rssi = isOnline
                ? this.states[`${ns}.${shortDeviceId}.rssi`]?.val || undefined
                : undefined;
            const bleInfo = isBle ? this.classifyBleDevice(shortDeviceId) : undefined;
            const deviceClass = this.states[`${ns}.${shortDeviceId}.class`]?.val;
            const group = this.getDeviceGroup(deviceClass, isBle);
            const res = {
                id: device._id,
                identifier: hostname || undefined,
                name: device.common.name,
                icon: isBle ? `adapter/shelly/icons/${bleInfo.icon}.png` : this.getIcon(device._id),
                color: !isBle && !isOnline ? '#fff' : undefined,
                backgroundColor: !isBle && !isOnline ? '#f44336' : undefined,
                group,
                model: isBle
                    ? bleInfo.model
                    : this.states[`${ns}.${shortDeviceId}.model`]?.val ||
                        adapter_core_1.I18n.getTranslatedObject('unknown'),
                status: {
                    connection: isBle ? undefined : isOnline ? 'connected' : 'disconnected',
                    rssi,
                    battery,
                    warning: firmwareUpdate ? adapter_core_1.I18n.getTranslatedObject('Firmware update available') : undefined,
                },
                customInfo: {
                    id: device._id,
                    schema: {
                        type: 'panel',
                        items: {
                            _test: {
                                type: 'state',
                                oid: 'javascript.0.licht',
                                foreign: true,
                                control: 'switch',
                                trueTextStyle: { color: 'green' },
                                falseTextStyle: { color: 'red' },
                                label: 'Demo',
                                trueText: 'ON',
                                falseText: 'OFF',
                            },
                        },
                    },
                },
                hasDetails: true,
                actions: [
                    {
                        id: 'rename',
                        icon: 'edit',
                        description: adapter_core_1.I18n.getTranslatedObject('Rename this device'),
                        handler: async (deviceId, context) => await this.handleRenameDevice(deviceId, context),
                    },
                    ...(this.states[`${this.adapter.namespace}.${shortDeviceId}.hostname`]?.val
                        ? [
                            {
                                id: 'web',
                                icon: 'web',
                                description: adapter_core_1.I18n.getTranslatedObject('Open device interface'),
                                url: `http://${this.states[`${this.adapter.namespace}.${shortDeviceId}.hostname`]?.val}`,
                            },
                        ]
                        : []),
                    ...(isOnline && firmwareUpdate
                        ? [
                            {
                                id: 'firmware-update',
                                icon: 'update',
                                description: adapter_core_1.I18n.getTranslatedObject('Update firmware'),
                                handler: async (deviceId) => await this.handleFirmwareUpdate(deviceId),
                            },
                        ]
                        : []),
                ],
            };
            context.addDevice(res);
        }
    }
    getDeviceDetails(deviceId) {
        const device = this.objects[deviceId];
        if (device?.type !== 'device') {
            return null;
        }
        const shortDeviceId = device._id.substring(this.adapter.namespace.length + 1);
        const ns = this.adapter.namespace;
        const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val;
        const version = this.states[`${ns}.${shortDeviceId}.version`]?.val;
        const model = this.states[`${ns}.${shortDeviceId}.model`]?.val;
        const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val;
        const id = this.states[`${ns}.${shortDeviceId}.id`]?.val;
        const type = this.states[`${ns}.${shortDeviceId}.type`]?.val;
        const rssi = this.states[`${ns}.${shortDeviceId}.rssi`]?.val;
        const uptime = this.states[`${ns}.${shortDeviceId}.uptime`]?.val;
        const firmware = this.states[`${ns}.${shortDeviceId}.firmware`]?.val;
        const protocol = this.states[`${ns}.${shortDeviceId}.protocol`]?.val;
        const items = {};
        if (hostname) {
            items._deviceLink = {
                // @ts-expect-error staticLink is OK
                type: 'staticLink',
                href: `http://${hostname}`,
                label: adapter_core_1.I18n.getTranslatedObject('Open device web interface'),
                button: true,
                icon: 'web',
                newLine: true,
            };
        }
        if (id) {
            items.id = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Device ID'),
                data: id,
                copyToClipboard: true,
            };
        }
        if (model) {
            items.model = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Model'),
                data: model,
            };
        }
        if (type) {
            items.deviceType = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Type'),
                data: type,
            };
        }
        if (gen) {
            items.gen = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Generation'),
                data: gen,
            };
        }
        if (hostname) {
            items.hostname = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('IP address'),
                data: hostname,
                copyToClipboard: true,
            };
        }
        if (version) {
            items.version = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Firmware version'),
                data: version,
            };
        }
        if (firmware !== undefined) {
            items.firmware = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Firmware update available'),
                data: firmware ? '✓' : '✗',
            };
        }
        if (protocol) {
            items.protocol = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Protocol'),
                data: protocol,
            };
        }
        if (rssi !== undefined) {
            items.rssi = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('RSSI'),
                data: rssi,
                unit: 'dBm',
            };
        }
        if (uptime !== undefined) {
            items.uptime = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Uptime'),
                data: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
            };
        }
        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items,
            },
        };
    }
    classifyBleDevice(shortDeviceId) {
        const prefix = `${this.adapter.namespace}.${shortDeviceId}.`;
        const stateNames = new Set();
        for (const id in this.states) {
            if (id.startsWith(prefix)) {
                stateNames.add(id.substring(prefix.length));
            }
        }
        // Also check objects for states that may not have a value yet
        for (const id in this.objects) {
            if (id.startsWith(prefix) && this.objects[id].type === 'state') {
                stateNames.add(id.substring(prefix.length));
            }
        }
        if (stateNames.has('precipitation') || stateNames.has('gust_speed') || stateNames.has('rain_status')) {
            return { model: 'BLU Outdoor Weather Station', icon: 'ble-ht' };
        }
        if (stateNames.has('motion')) {
            return { model: 'BLU Motion Sensor', icon: 'ble-motion' };
        }
        if (stateNames.has('window') || stateNames.has('rotation')) {
            return { model: 'BLU Door/Window Sensor', icon: 'ble-door-window' };
        }
        if (stateNames.has('humidity') && stateNames.has('temperature')) {
            return { model: 'BLU H&T Sensor', icon: 'ble-ht' };
        }
        if (stateNames.has('button_4')) {
            return { model: 'BLU Button Tough 4', icon: 'ble-button4' };
        }
        if (stateNames.has('button_1')) {
            return { model: 'BLU Button 1', icon: 'ble-button1' };
        }
        return { model: 'Bluetooth', icon: 'ble-button1' };
    }
    getDeviceGroup(deviceClass, isBle) {
        const groupKey = isBle ? 'ble' : deviceGroupMap[deviceClass || ''] || 'other';
        const meta = groupMeta[groupKey] || groupMeta.other;
        return {
            key: groupKey,
            name: adapter_core_1.I18n.getTranslatedObject(meta.nameKey),
            icon: meta.icon,
        };
    }
    getIcon(deviceId) {
        const device = this.objects[deviceId];
        if (device && 'icon' in device.common && device.common.icon) {
            const icon = String(device.common.icon);
            if (icon.startsWith('data:')) {
                // Old base64 SVG icon - skip, will be migrated on next restart
                return 'node';
            }
            return `adapter/shelly/${icon}`;
        }
        return 'node';
    }
    /**
     *
     * @param id ID to rename
     * @param context context sendet from Backend
     */
    async handleRenameDevice(id, context) {
        const result = await context.showForm({
            type: 'panel',
            items: {
                newName: {
                    type: 'text',
                    trim: false,
                    placeholder: '',
                },
            },
        }, {
            data: {
                newName: '',
            },
            title: adapter_core_1.I18n.getTranslatedObject('Enter new name'),
        });
        if (result?.newName === undefined || result?.newName === '') {
            return { refresh: 'none' };
        }
        const obj = {
            common: {
                name: result.newName,
            },
        };
        const res = await this.adapter.extendForeignObjectAsync(id, obj);
        if (res === null) {
            this.adapter.log.warn(`Can not rename device ${id}: ${JSON.stringify(res)}`);
            return { refresh: 'none' };
        }
        return { refresh: 'device' };
    }
    async handleFirmwareUpdate(id) {
        const shortDeviceId = id.substring(this.adapter.namespace.length + 1);
        const stateId = `${this.adapter.namespace}.${shortDeviceId}.firmwareupdate`;
        try {
            await this.adapter.setStateAsync(stateId, true, false);
            this.adapter.log.info(`[DeviceManager] Firmware update triggered for ${shortDeviceId}`);
        }
        catch (err) {
            this.adapter.log.error(`[DeviceManager] Error triggering firmware update for ${shortDeviceId}: ${err}`);
        }
        return { refresh: 'device' };
    }
    mdnsScan(timeout) {
        return new Promise(resolve => {
            const MDNS_ADDRESS = '224.0.0.251';
            const MDNS_PORT = 5353;
            const devices = new Map();
            let socket;
            try {
                socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            }
            catch {
                resolve([]);
                return;
            }
            const cleanup = () => {
                try {
                    socket.close();
                }
                catch {
                    // ignore
                }
                resolve([...devices.values()]);
            };
            socket.on('error', () => cleanup());
            socket.on('message', (msg) => {
                if (msg.length < 12) {
                    return;
                }
                // Parse all records for A records with "shelly" in the name
                const qdCount = msg.readUInt16BE(4);
                const anCount = msg.readUInt16BE(6);
                const nsCount = msg.readUInt16BE(8);
                const arCount = msg.readUInt16BE(10);
                let offset = 12;
                // Skip questions
                for (let i = 0; i < qdCount && offset < msg.length; i++) {
                    while (offset < msg.length && msg[offset] !== 0 && (msg[offset] & 0xc0) !== 0xc0) {
                        offset += msg[offset] + 1;
                    }
                    if (offset < msg.length && (msg[offset] & 0xc0) === 0xc0) {
                        offset += 2;
                    }
                    else {
                        offset += 1;
                    }
                    offset += 4;
                }
                const totalRecords = anCount + nsCount + arCount;
                for (let i = 0; i < totalRecords && offset < msg.length; i++) {
                    const nameResult = this.parseDnsName(msg, offset);
                    offset = nameResult.nextOffset;
                    if (offset + 10 > msg.length) {
                        break;
                    }
                    const rType = msg.readUInt16BE(offset);
                    offset += 8; // skip type(2) + class(2) + ttl(4)
                    const rdLength = msg.readUInt16BE(offset);
                    offset += 2;
                    // A record (type=1) with 4 bytes
                    if (rType === 1 && rdLength === 4 && nameResult.name.toLowerCase().includes('shelly')) {
                        const ip = `${msg[offset]}.${msg[offset + 1]}.${msg[offset + 2]}.${msg[offset + 3]}`;
                        const deviceName = nameResult.name.replace('.local', '');
                        devices.set(deviceName, { name: deviceName, ip });
                    }
                    offset += rdLength;
                }
            });
            socket.bind(MDNS_PORT, () => {
                try {
                    socket.addMembership(MDNS_ADDRESS);
                    socket.setMulticastTTL(255);
                }
                catch {
                    cleanup();
                    return;
                }
                // Build mDNS query for _http._tcp.local (PTR type=12)
                const query = this.buildMdnsQuery('_http._tcp.local');
                socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS);
                // Re-send after 2s
                setTimeout(() => {
                    try {
                        socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS);
                    }
                    catch {
                        // ignore
                    }
                }, 2000);
                setTimeout(cleanup, timeout);
            });
        });
    }
    buildMdnsQuery(name) {
        const parts = name.split('.');
        const bufParts = [];
        for (const part of parts) {
            const len = Buffer.alloc(1);
            len.writeUInt8(part.length);
            bufParts.push(len, Buffer.from(part));
        }
        bufParts.push(Buffer.alloc(1)); // null terminator
        const header = Buffer.alloc(12);
        header.writeUInt16BE(1, 4); // 1 question
        const qFooter = Buffer.alloc(4);
        qFooter.writeUInt16BE(12, 0); // PTR
        qFooter.writeUInt16BE(1, 2); // IN
        return Buffer.concat([header, ...bufParts, qFooter]);
    }
    parseDnsName(buf, offset) {
        const parts = [];
        let pos = offset;
        let jumped = false;
        let savedPos = 0;
        while (pos < buf.length) {
            const len = buf[pos];
            if (len === 0) {
                pos++;
                break;
            }
            if ((len & 0xc0) === 0xc0) {
                if (!jumped) {
                    savedPos = pos + 2;
                }
                pos = ((len & 0x3f) << 8) | buf[pos + 1];
                jumped = true;
                continue;
            }
            pos++;
            if (pos + len > buf.length) {
                break;
            }
            parts.push(buf.subarray(pos, pos + len).toString());
            pos += len;
        }
        return { name: parts.join('.'), nextOffset: jumped ? savedPos : pos };
    }
    async handleDiscoverDevices(context) {
        const progress = await context.openProgress('Searching for Shelly devices...', { indeterminate: true });
        try {
            const found = await this.mdnsScan(5000);
            await progress.close();
            if (found.length === 0) {
                await context.showMessage(adapter_core_1.I18n.getTranslatedObject('No new Shelly devices found'));
                return { refresh: false };
            }
            // Filter out devices already known
            const knownIps = new Set();
            for (const stateId in this.states) {
                if (stateId.endsWith('.hostname')) {
                    const ip = this.states[stateId]?.val;
                    if (typeof ip === 'string' && ip) {
                        knownIps.add(ip);
                    }
                }
            }
            const newDevices = found.filter(d => !knownIps.has(d.ip));
            const existingDevices = found.filter(d => knownIps.has(d.ip));
            const lines = [];
            if (newDevices.length > 0) {
                lines.push(`New (${newDevices.length}):`);
                for (const dev of newDevices) {
                    lines.push(`  ${dev.name} — ${dev.ip}`);
                }
            }
            if (existingDevices.length > 0) {
                if (lines.length > 0) {
                    lines.push('');
                }
                lines.push(`Known (${existingDevices.length}):`);
                for (const dev of existingDevices) {
                    lines.push(`  ${dev.name} — ${dev.ip}`);
                }
            }
            if (newDevices.length === 0 && existingDevices.length > 0) {
                await context.showMessage(adapter_core_1.I18n.getTranslatedObject('All %s found devices are already known', existingDevices.length.toString()));
            }
            else {
                await context.showMessage(lines.join('\n'));
            }
        }
        catch (err) {
            await progress.close();
            this.adapter.log.error(`[DeviceManager] Discovery error: ${err}`);
            await context.showMessage(`Error: ${err}`);
        }
        return { refresh: false };
    }
    async destroy() {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
exports.default = ShellyDeviceManagement;
//# sourceMappingURL=deviceManager.js.map