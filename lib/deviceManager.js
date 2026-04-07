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
const adapter_core_1 = require("@iobroker/adapter-core");
const dm_utils_1 = require("@iobroker/dm-utils");
const crypto = __importStar(require("node:crypto"));
const dgram = __importStar(require("node:dgram"));
const http = __importStar(require("node:http"));
const os = __importStar(require("node:os"));
class HttpAuthError extends Error {
    constructor() {
        super('Device is password-protected');
        this.name = 'HttpAuthError';
    }
}
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
        const protocol = this.adapter.config.protocol || 'coap';
        const actions = protocol === 'coap'
            ? []
            : [
                {
                    id: 'discover',
                    icon: 'search',
                    title: adapter_core_1.I18n.getTranslatedObject('Discover devices'),
                    description: adapter_core_1.I18n.getTranslatedObject('Scan network for Shelly devices via mDNS'),
                    handler: async (context) => await this.handleDiscoverDevices(context),
                },
            ];
        return {
            apiVersion: 'v3',
            actions,
            smallCards: true,
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
                        this.states[`${ns}.${shortDeviceId}.type`]?.val ||
                        adapter_core_1.I18n.getTranslatedObject('unknown'),
                status: {
                    connection: isBle ? undefined : isOnline ? 'connected' : 'disconnected',
                    rssi,
                    battery,
                    warning: firmwareUpdate ? adapter_core_1.I18n.getTranslatedObject('Firmware update available') : undefined,
                },
                hasDetails: true,
                customInfo: this.buildCustomInfo(device._id, shortDeviceId, isBle),
                controls: await this.buildControls(shortDeviceId, isBle),
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
                                handler: async (deviceId, context) => await this.handleFirmwareUpdate(deviceId, context),
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
        const isBle = shortDeviceId.startsWith('ble.');
        if (isBle) {
            return this.getBleDeviceDetails(deviceId, shortDeviceId);
        }
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
                addColon: true,
                copyToClipboard: true,
            };
        }
        if (model) {
            items.model = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Model'),
                data: model,
                addColon: true,
            };
        }
        if (type) {
            items.deviceType = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Type'),
                data: type,
                addColon: true,
            };
        }
        if (gen) {
            items.gen = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Generation'),
                data: gen,
                addColon: true,
            };
        }
        if (hostname) {
            items.hostname = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('IP address'),
                data: hostname,
                addColon: true,
                copyToClipboard: true,
            };
        }
        if (version) {
            items.version = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Firmware version'),
                data: version,
                addColon: true,
            };
        }
        if (firmware !== undefined) {
            items.firmware = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Firmware update available'),
                data: firmware ? '✓' : '✗',
                addColon: true,
            };
        }
        if (protocol) {
            items.protocol = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Protocol'),
                data: protocol,
                addColon: true,
            };
        }
        if (rssi !== undefined) {
            items.rssi = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('RSSI'),
                data: rssi,
                unit: 'dBm',
                addColon: true,
            };
        }
        if (uptime !== undefined) {
            items.uptime = {
                type: 'staticInfo',
                label: adapter_core_1.I18n.getTranslatedObject('Uptime'),
                data: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                addColon: true,
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
    getBleDeviceDetails(deviceId, shortDeviceId) {
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const items = {};
        // Collect all states for this BLE device and show them as staticInfo
        const stateEntries = [];
        for (const id in this.objects) {
            if (!id.startsWith(prefix) || this.objects[id].type !== 'state') {
                continue;
            }
            stateEntries.push({
                name: id.substring(prefix.length),
                obj: this.objects[id],
            });
        }
        stateEntries.sort((a, b) => a.name.localeCompare(b.name));
        for (const entry of stateEntries) {
            const state = this.states[`${prefix}${entry.name}`];
            const common = entry.obj.common;
            const val = state?.val;
            if (val === undefined || val === null || entry.name === 'ReceivedBy' || entry.name === 'pid') {
                continue;
            }
            // Format the label from state name (e.g. "temperature" -> "Temperature")
            const label = entry.name.charAt(0).toUpperCase() + entry.name.slice(1).replace(/_/g, ' ');
            // Format value: use common.states mapping if available, otherwise format by type
            let displayVal;
            const states = common.states;
            if (states && String(val) in states) {
                displayVal = states[String(val)] !== undefined ? `${states[String(val)]}(${String(val)})` : String(val);
            }
            else if (typeof val === 'number') {
                displayVal = common.unit
                    ? `${Math.round(val * 100) / 100} ${common.unit}`
                    : Math.round(val * 100) / 100;
            }
            else if (typeof val === 'boolean') {
                displayVal = val ? '✓' : '✗';
            }
            else {
                displayVal = String(val);
            }
            items[entry.name] = {
                type: 'staticInfo',
                label,
                data: displayVal,
                addColon: true,
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
    buildCustomInfo(deviceId, shortDeviceId, isBle) {
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const items = {};
        if (isBle) {
            // BLE devices use direct state names
            if (this.states[`${prefix}temperature`] !== undefined) {
                items.temperature = {
                    type: 'state',
                    oid: `${shortDeviceId}.temperature`,
                    control: 'text',
                    unit: '°C',
                    digits: 2,
                    label: adapter_core_1.I18n.getTranslatedObject('Temperature'),
                    size: 12,
                    style: {
                        opacity: 0.7,
                    },
                };
            }
            if (this.states[`${prefix}humidity`] !== undefined) {
                items.humidity = {
                    type: 'state',
                    oid: `${shortDeviceId}.humidity`,
                    control: 'text',
                    unit: '%',
                    digits: 1,
                    label: adapter_core_1.I18n.getTranslatedObject('Humidity'),
                    size: 12,
                    style: { opacity: 0.7 },
                };
            }
            if (this.states[`${prefix}illuminance`] !== undefined) {
                items.illuminance = {
                    type: 'state',
                    oid: `${shortDeviceId}.illuminance`,
                    control: 'text',
                    unit: 'lux',
                    digits: 0,
                    label: adapter_core_1.I18n.getTranslatedObject('Illuminance'),
                    size: 12,
                    style: { opacity: 0.7 },
                };
            }
            // BLE boolean/alarm sensor states
            const bleBoolSensors = [
                {
                    stateId: 'motion',
                    key: 'motion',
                    label: 'Motion',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'green',
                },
                {
                    stateId: 'door',
                    key: 'door',
                    label: 'Door',
                    trueText: 'Open',
                    falseText: 'Closed',
                    trueColor: 'orange',
                },
                {
                    stateId: 'window',
                    key: 'window',
                    label: 'Window',
                    trueText: 'Open',
                    falseText: 'Closed',
                    trueColor: 'orange',
                },
                {
                    stateId: 'smoke',
                    key: 'smoke',
                    label: 'Smoke',
                    trueText: 'Alarm',
                    falseText: 'OK',
                    trueColor: 'red',
                },
                {
                    stateId: 'vibration',
                    key: 'vibration',
                    label: 'Vibration',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'orange',
                },
            ];
            for (const sensor of bleBoolSensors) {
                if (this.states[`${prefix}${sensor.stateId}`] !== undefined) {
                    items[sensor.key] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${sensor.stateId}`,
                        readOnly: true,
                        options: [
                            { label: adapter_core_1.I18n.getTranslatedObject(sensor.falseText), value: 0 },
                            { label: adapter_core_1.I18n.getTranslatedObject(sensor.trueText), value: 1, color: sensor.trueColor },
                        ],
                        trueText: adapter_core_1.I18n.getTranslatedObject(sensor.trueText),
                        falseText: adapter_core_1.I18n.getTranslatedObject(sensor.falseText),
                        trueTextStyle: { color: sensor.trueColor },
                        blinkOnUpdate: true,
                        label: adapter_core_1.I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
            }
            // BLE numeric sensors
            if (this.states[`${prefix}rotation`] !== undefined) {
                items.rotation = {
                    type: 'state',
                    oid: `${shortDeviceId}.rotation`,
                    control: 'text',
                    unit: '°',
                    label: adapter_core_1.I18n.getTranslatedObject('Tilt'),
                    size: 12,
                    style: { opacity: 0.7 },
                };
            }
        }
        else {
            // Gen1 sensor paths
            // Gen1 numeric sensors
            const gen1NumericSensors = [
                { stateId: 'tmp.temperatureC', key: 'temperature', label: 'Temperature', unit: '°C', digits: 2 },
                {
                    stateId: 'sensor.temperatureC',
                    key: 'sensorTemperature',
                    label: 'Temperature',
                    unit: '°C',
                    digits: 2,
                },
                { stateId: 'hum.value', key: 'humidity', label: 'Humidity', unit: '%', digits: 1 },
                { stateId: 'sensor.humidity', key: 'sensorHumidity', label: 'Humidity', unit: '%', digits: 1 },
                { stateId: 'sensor.lux', key: 'lux', label: 'Illuminance', unit: 'lux', digits: 0 },
                { stateId: 'sensor.tilt', key: 'tilt', label: 'Tilt', unit: '°', digits: 0 },
                { stateId: 'tmp.valvePosition', key: 'valve', label: 'Valve position', unit: '%', digits: 0 },
            ];
            for (const sensor of gen1NumericSensors) {
                if (this.states[`${prefix}${sensor.stateId}`] !== undefined) {
                    items[sensor.key] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${sensor.stateId}`,
                        control: 'text',
                        unit: sensor.unit,
                        digits: sensor.digits,
                        label: adapter_core_1.I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
            }
            // Gen1 boolean sensors (true/false values - use trueText/falseText)
            const gen1BoolSensors = [
                {
                    stateId: 'sensor.motion',
                    key: 'motion',
                    label: 'Motion',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'green',
                },
                {
                    stateId: 'sensor.door',
                    key: 'door',
                    label: 'Door',
                    trueText: 'Open',
                    falseText: 'Closed',
                    trueColor: 'orange',
                },
                {
                    stateId: 'sensor.vibration',
                    key: 'vibration',
                    label: 'Vibration',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'orange',
                },
                {
                    stateId: 'sensor.flood',
                    key: 'flood',
                    label: 'Flood',
                    trueText: 'Alarm',
                    falseText: 'OK',
                    trueColor: 'red',
                },
                {
                    stateId: 'smoke.value',
                    key: 'smoke',
                    label: 'Smoke',
                    trueText: 'Alarm',
                    falseText: 'OK',
                    trueColor: 'red',
                },
            ];
            for (const sensor of gen1BoolSensors) {
                if (this.states[`${prefix}${sensor.stateId}`] !== undefined) {
                    items[sensor.key] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${sensor.stateId}`,
                        options: [
                            { label: adapter_core_1.I18n.getTranslatedObject(sensor.falseText), value: 0 },
                            { label: adapter_core_1.I18n.getTranslatedObject(sensor.trueText), value: 1, color: sensor.trueColor },
                        ],
                        trueText: adapter_core_1.I18n.getTranslatedObject(sensor.trueText),
                        falseText: adapter_core_1.I18n.getTranslatedObject(sensor.falseText),
                        trueTextStyle: { color: sensor.trueColor },
                        blinkOnUpdate: true,
                        label: adapter_core_1.I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
            }
            // Gen2+: scan for Temperature{id}.Celsius, Humidity{id}.Relative, Illuminance{id}.Lux
            for (const stateId of Object.keys(this.states)) {
                if (!stateId.startsWith(prefix)) {
                    continue;
                }
                const suffix = stateId.substring(prefix.length);
                const tempMatch = suffix.match(/^(Temperature\d+)\.Celsius$/);
                if (tempMatch) {
                    items[`temp_${tempMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '°C',
                        digits: 2,
                        label: adapter_core_1.I18n.getTranslatedObject('Temperature'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
                const humMatch = suffix.match(/^(Humidity\d+)\.Relative$/);
                if (humMatch) {
                    items[`hum_${humMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '%',
                        digits: 1,
                        label: adapter_core_1.I18n.getTranslatedObject('Humidity'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
                const luxMatch = suffix.match(/^(Illuminance\d+)\.Lux$/);
                if (luxMatch) {
                    items[`lux_${luxMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: 'lux',
                        digits: 0,
                        label: adapter_core_1.I18n.getTranslatedObject('Illuminance'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
                // Flood alarm
                const floodMatch = suffix.match(/^(Flood\d+)\.alarm$/);
                if (floodMatch) {
                    items[`flood_${floodMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        readOnly: true,
                        options: [
                            { label: adapter_core_1.I18n.getTranslatedObject('OK'), value: 0 },
                            { label: adapter_core_1.I18n.getTranslatedObject('Alarm'), value: 1, color: 'red' },
                        ],
                        trueText: adapter_core_1.I18n.getTranslatedObject('OK'),
                        falseText: adapter_core_1.I18n.getTranslatedObject('Alarm'),
                        trueTextStyle: { color: 'red' },
                        blinkOnUpdate: true,
                        label: adapter_core_1.I18n.getTranslatedObject('Flood'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
                // Cover position
                const coverMatch = suffix.match(/^(Cover\d+)\.Position$/);
                if (coverMatch) {
                    items[`cover_${coverMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '%',
                        label: adapter_core_1.I18n.getTranslatedObject('Cover position'),
                        size: 12,
                        style: {
                            opacity: 0.7,
                        },
                    };
                }
            }
        }
        if (Object.keys(items).length === 0) {
            return undefined;
        }
        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items,
            },
        };
    }
    async buildControls(shortDeviceId, isBle) {
        if (isBle) {
            return [];
        }
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const controls = [];
        let labelForFirstControl;
        // Check device mode to filter controls for multi-mode devices
        const deviceMode = this.states[`${ns}.${shortDeviceId}.Sys.deviceMode`]?.val;
        // Map device mode to allowed channel prefixes
        const allowedChannels = {
            rgb: ['RGB'],
            rgbw: ['RGBW'],
            light: ['Light'],
            color: ['lights'],
            white: ['white'],
            switch: ['Relay'],
            relay: ['Relay'],
            cover: ['Cover'],
            roller: ['Relay'], // Gen1 roller mode still uses Relay channels
        };
        const allowed = deviceMode ? allowedChannels[deviceMode] : undefined;
        const ownStates = [];
        const usedStates = [];
        // Collect all switch states for this device
        const keys = Object.keys(this.objects);
        for (const stateId of keys) {
            if (!stateId.startsWith(prefix)) {
                continue;
            }
            const obj = this.objects[stateId];
            if (obj?.type !== 'state') {
                continue;
            }
            ownStates.push(obj._id);
            const common = obj.common;
            if (!common ||
                common.role !== 'switch' ||
                common.type !== 'boolean' ||
                common.write === false ||
                common.read === false ||
                usedStates.includes(stateId)) {
                continue;
            }
            const suffix = stateId.substring(prefix.length);
            // Match Relay{id}.Switch, Light{id}.Switch, RGB{id}.Switch, RGBW{id}.Switch
            const match = suffix.match(/^(Relay|Light|RGB|RGBW|lights|white)(\d*)\.Switch$/);
            if (!match) {
                continue;
            }
            const channelType = match[1];
            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }
            const channelIdx = match[2];
            // Build a label like "Relay 0", "Light 1", etc.
            let label;
            if (channelType === 'lights') {
                label = 'Light';
            }
            else if (channelType === 'white') {
                label = `White ${channelIdx}`;
            }
            else {
                label = channelIdx ? `${channelType} ${channelIdx}` : channelType;
            }
            const control = {
                id: suffix.replace('.', '_'),
                type: 'switch',
                stateId: `${shortDeviceId}.${suffix}`,
                state: (await this.adapter.getForeignStateAsync(obj._id)) ||
                    { val: null, ts: Date.now(), ack: true },
                handler: async (_deviceId, _actionId, state) => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true };
                },
            };
            usedStates.push(obj._id);
            if (!controls.length) {
                // If control has no label, it will be shown directly on
                labelForFirstControl = label;
                controls.push(control);
                continue;
            }
            else if (controls.length === 1 && labelForFirstControl) {
                controls[0].label = labelForFirstControl;
            }
            control.label = label;
            controls.push(control);
        }
        // Collect slider states (brightness, cover position)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common;
            if (common?.type !== 'number' ||
                common?.write === false ||
                (common.max === undefined && common.unit !== '%') ||
                usedStates.includes(stateId)) {
                continue;
            }
            const role = common.role || '';
            if (!role.startsWith('level.') && role !== 'level') {
                continue;
            }
            const suffix = stateId.substring(prefix.length);
            // Match brightness: Light{id}.Brightness, RGB{id}.Brightness, RGBW{id}.Brightness, lights.brightness, white{id}.brightness
            // Match cover: Cover{id}.Position
            const match = suffix.match(/^(Light|RGB|RGBW|lights|white|Cover|Number)(\d*)\.(Brightness|brightness|Position|Value)$/);
            if (!match) {
                continue;
            }
            const channelType = match[1];
            const channelIdx = match[2];
            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }
            let label;
            if (channelType === 'Cover') {
                label = channelIdx ? `Cover ${channelIdx}` : 'Cover';
            }
            else if (channelType === 'lights') {
                label = 'Brightness';
            }
            else if (channelType === 'white') {
                label = `White ${channelIdx}`;
            }
            else {
                label = channelIdx ? `${channelType} ${channelIdx}` : channelType;
            }
            usedStates.push(obj._id);
            const control = {
                id: suffix.replace('.', '_'),
                type: 'slider',
                stateId: `${shortDeviceId}.${suffix}`,
                min: common.min ?? 0,
                max: common.max ?? 100,
                unit: common.unit || (common.max ?? 100) === 100 ? '%' : undefined,
                label,
                state: (await this.adapter.getForeignStateAsync(obj._id)) ||
                    { val: null, ts: Date.now(), ack: true },
                handler: async (_deviceId, _actionId, state) => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true };
                },
            };
            controls.push(control);
        }
        // Collect color controls (hex color states)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common;
            if (common?.type !== 'string' || !common?.write || usedStates.includes(stateId)) {
                continue;
            }
            const suffix = stateId.substring(prefix.length);
            // Match Gen2+: RGB{id}.Color, RGBW{id}.Color; Gen1: lights.rgbw
            const match = suffix.match(/^(RGB|RGBW)(\d*)\.Color$/) || suffix.match(/^(lights)\.(rgbw)$/);
            if (!match) {
                continue;
            }
            const channelType = match[1];
            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }
            const control = {
                id: suffix.replace('.', '_'),
                type: 'color',
                stateId: `${shortDeviceId}.${suffix}`,
                label: adapter_core_1.I18n.getTranslatedObject('Color'),
                state: (await this.adapter.getForeignStateAsync(obj._id)) ||
                    { val: null, ts: Date.now(), ack: true },
                handler: async (_deviceId, _actionId, state) => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true };
                },
            };
            controls.push(control);
        }
        let group = {
            id: 'group_settings',
            type: 'group',
            label: adapter_core_1.I18n.getTranslatedObject('Settings'),
        };
        // Collect writable number states without common.max (not sliders)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common;
            if (common?.write === false ||
                (common.type !== 'number' && common.type !== 'string') ||
                usedStates.includes(stateId)) {
                continue;
            }
            const suffix = stateId.substring(prefix.length);
            // Skip states already handled above
            if (controls.some(c => c.id === suffix.replace('.', '_'))) {
                continue;
            }
            // Extract channel type for device mode filtering
            const channelMatch = suffix.match(/^(Relay|Light|RGB|RGBW|lights|white|Cover)(\d*)\./);
            if (channelMatch) {
                const channelType = channelMatch[1];
                if (allowed && !allowed.includes(channelType)) {
                    continue;
                }
            }
            // Build label from state name: "Relay0.transition" → "Relay 0 transition"
            const label = suffix.replace(/(\d+)/, ' $1 ').replace(/\./g, ' ').trim();
            let options;
            if (common.states) {
                if (Array.isArray(common.states)) {
                    options = [];
                    common.states.forEach((state) => options.push({ value: state, label: state }));
                }
                else {
                    options = [];
                    Object.keys(common.states).forEach(key => options.push({
                        value: key,
                        label: String(common.states[key]),
                    }));
                }
            }
            usedStates.push(obj._id);
            const control = {
                group: 'group_settings',
                id: suffix.replace('.', '_'),
                type: options ? 'select' : common.type === 'number' ? 'number' : 'text',
                stateId: `${shortDeviceId}.${suffix}`,
                min: common.min,
                max: common.max,
                unit: common.unit,
                options,
                label,
                state: (await this.adapter.getForeignStateAsync(obj._id)) ||
                    { val: null, ts: Date.now(), ack: true },
                handler: async (_deviceId, _actionId, state) => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true };
                },
            };
            if (group) {
                controls.push(group);
                group = null;
            }
            controls.push(control);
        }
        // Collect buttons
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common;
            if (common?.write === false || common.type !== 'boolean' || usedStates.includes(stateId)) {
                continue;
            }
            const suffix = stateId.substring(prefix.length);
            // Skip states already handled above
            if (controls.some(c => c.id === suffix.replace('.', '_'))) {
                continue;
            }
            // Extract channel type for device mode filtering
            const channelMatch = suffix.match(/^(Relay|Light|RGB|RGBW|lights|white|Cover)(\d*)\./);
            if (channelMatch) {
                const channelType = channelMatch[1];
                if (allowed && !allowed.includes(channelType)) {
                    continue;
                }
            }
            // Build label from state name: "Relay0.transition" → "Relay 0 transition"
            const label = suffix.replace(/(\d+)/, ' $1 ').replace(/\./g, ' ').trim();
            usedStates.push(obj._id);
            const control = {
                group: 'group_settings',
                id: suffix.replace('.', '_'),
                type: 'button',
                stateId: `${shortDeviceId}.${suffix}`,
                label,
                variant: 'outlined',
                handler: async (_deviceId, _actionId, state) => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true };
                },
            };
            if (group) {
                controls.push(group);
                group = null;
            }
            controls.push(control);
        }
        // Sort by ID for consistent order
        // controls.sort((a, b) => a.id.localeCompare(b.id));
        return controls;
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
    async handleFirmwareUpdate(id, context) {
        const shortDeviceId = id.substring(this.adapter.namespace.length + 1);
        const ns = this.adapter.namespace;
        const stateId = `${ns}.${shortDeviceId}.firmwareupdate`;
        const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val;
        const hasProgress = gen !== undefined && gen >= 2;
        const progress = await context.openProgress('Updating firmware...', {
            indeterminate: !hasProgress,
            value: hasProgress ? 0 : undefined,
            label: adapter_core_1.I18n.getTranslatedObject('Starting update...'),
        });
        try {
            await this.adapter.setStateAsync(stateId, true, false);
            this.adapter.log.info(`[DeviceManager] Firmware update triggered for ${shortDeviceId}`);
            const progressStateId = `${ns}.${shortDeviceId}.firmwareupdateProgress`;
            const firmwareStateId = `${ns}.${shortDeviceId}.firmware`;
            const TIMEOUT = 5 * 60 * 1000; // 5 minutes
            await new Promise(resolve => {
                const startTime = Date.now();
                const checkInterval = setInterval(async () => {
                    // Timeout
                    if (Date.now() - startTime > TIMEOUT) {
                        clearInterval(checkInterval);
                        resolve();
                        return;
                    }
                    // Check progress for Gen2+
                    if (hasProgress) {
                        const progressState = this.states[progressStateId];
                        if (progressState?.val !== undefined && progressState?.val !== null) {
                            const pct = Number(progressState.val);
                            await progress.update({
                                value: pct,
                                label: `${pct}%`,
                            });
                        }
                    }
                    // Check if firmware update flag cleared (update complete)
                    const firmwareState = this.states[firmwareStateId];
                    if (firmwareState?.val === false) {
                        clearInterval(checkInterval);
                        await progress.update({
                            value: 100,
                            label: adapter_core_1.I18n.getTranslatedObject('Firmware update complete'),
                        });
                        resolve();
                    }
                    // Check if device went offline and came back (Gen1 reboot after update)
                    if (!hasProgress) {
                        const online = this.states[`${ns}.${shortDeviceId}.online`];
                        if (online?.val === false) {
                            await progress.update({
                                label: adapter_core_1.I18n.getTranslatedObject('Device is rebooting...'),
                            });
                        }
                    }
                }, 2000);
            });
        }
        catch (err) {
            this.adapter.log.error(`[DeviceManager] Error during firmware update for ${shortDeviceId}: ${err}`);
        }
        await progress.close();
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
        const progress = await context.openProgress(adapter_core_1.I18n.getTranslatedObject('Searching for Shelly devices...'), {
            indeterminate: true,
        });
        try {
            const found = await this.mdnsScan(5000);
            await progress.close();
            if (!found.length) {
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
            if (!newDevices.length && existingDevices.length) {
                await context.showMessage(adapter_core_1.I18n.getTranslatedObject('All %s found devices are already known', existingDevices.length.toString()));
            }
            else {
                // Build a form with checkbox + name input per new device
                const items = {};
                const data = {};
                const anyChecked = [];
                if (newDevices.length > 0) {
                    // Fetch real device names from devices
                    const deviceNames = await Promise.all(newDevices.map(dev => this.fetchDeviceName(dev.ip, this.adapter.config.httppassword || '')));
                    items._newHeader = {
                        type: 'header',
                        text: `New devices (${newDevices.length})`,
                        size: 4,
                    };
                    if (newDevices.length > 1) {
                        items.selectAll = {
                            newLine: true,
                            type: 'checkbox',
                            label: adapter_core_1.I18n.getTranslatedObject('Select all'),
                            xs: 12,
                        };
                    }
                    data.selectAll = false;
                    for (let i = 0; i < newDevices.length; i++) {
                        items[`add_${i}`] = {
                            newLine: true,
                            type: 'checkbox',
                            label: `${newDevices[i].name} — ${newDevices[i].ip}`,
                            xs: 12,
                            md: 6,
                            onChange: {
                                alsoDependsOn: ['selectAll'],
                                calculateFunc: 'data.selectAll',
                                ignoreOwnChanges: true,
                            },
                        };
                        data[`add_${i}`] = false;
                        items[`name_${i}`] = {
                            type: 'text',
                            label: adapter_core_1.I18n.getTranslatedObject('Device name'),
                            hidden: `!data.add_${i}`,
                            validator: `!data.add_${i} || !!data.name_${i}`,
                            validatorNoSaveOnError: true,
                            validatorErrorText: 'Name must be filled',
                            xs: 12,
                            md: 6,
                        };
                        data[`name_${i}`] = deviceNames[i] || newDevices[i].name;
                        anyChecked.push(`!data["add_${i}"]`);
                    }
                }
                if (existingDevices.length > 0) {
                    items._knownHeader = {
                        type: 'header',
                        text: `Known devices (${existingDevices.length})`,
                        size: 4,
                    };
                    for (let i = 0; i < existingDevices.length; i++) {
                        items[`known_${i}`] = {
                            type: 'staticInfo',
                            label: existingDevices[i].name,
                            data: existingDevices[i].ip,
                            addColon: true,
                        };
                    }
                }
                const options = {
                    data,
                    title: adapter_core_1.I18n.getTranslatedObject('Configure selected devices'),
                };
                if (anyChecked.length) {
                    options.applyDisabledRule = anyChecked.join(' && ');
                }
                else {
                    options.ignoreApplyDisabled = true;
                }
                const result = await context.showForm({ type: 'panel', items }, options);
                if (result) {
                    const selected = [];
                    for (let i = 0; i < newDevices.length; i++) {
                        if (result[`add_${i}`]) {
                            selected.push({
                                ...newDevices[i],
                                customName: result[`name_${i}`] || '',
                            });
                        }
                    }
                    if (selected.length > 0) {
                        await this.provisionDevices(selected, context);
                    }
                }
            }
        }
        catch (err) {
            await progress.close();
            this.adapter.log.error(`[DeviceManager] Discovery error: ${err}`);
            await context.showMessage(`Error: ${err}`);
        }
        return { refresh: false };
    }
    /**
     * Extract device type prefix from mDNS name, e.g. "ShellyPlusI4-841FE8F9D9E8" → "shellyplusi4-"
     *
     * @param name
     */
    getDevicePrefix(name) {
        const idx = name.lastIndexOf('-');
        if (idx > 0) {
            return name.substring(0, idx + 1).toLowerCase();
        }
        return name.toLowerCase();
    }
    /**
     * Compute the MQTT ID from device mDNS name and custom name.
     * Returns empty string if no custom name is provided.
     *
     * @param deviceName mDNS device name (e.g. "ShellyPlus1-44179394D4D4")
     * @param customName User-provided custom name
     */
    computeMqttId(deviceName, customName) {
        const devicePrefix = this.getDevicePrefix(deviceName);
        let suffix = customName ? customName.toLowerCase() : '';
        if (suffix.startsWith(devicePrefix)) {
            suffix = suffix.substring(devicePrefix.length);
        }
        suffix = suffix
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
        return suffix ? `${devicePrefix}${suffix}` : '';
    }
    async provisionDevices(devices, context) {
        const mqttPort = this.adapter.config.port || 1882;
        const mqttUser = this.adapter.config.mqttusername || '';
        const mqttPass = this.adapter.config.mqttpassword || '';
        const httpPass = this.adapter.config.httppassword || '';
        const localIp = this.getLocalIp(devices[0].ip);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!localIp) {
            await context.showMessage(adapter_core_1.I18n.getTranslatedObject('Could not determine local IP address'));
            return;
        }
        const mqttServer = `${localIp}:${mqttPort}`;
        // Collect existing device IDs to detect MQTT ID conflicts
        const usedMqttIds = new Set();
        for (const id in this.objects) {
            if (this.objects[id].type === 'device') {
                usedMqttIds.add(id.substring(this.adapter.namespace.length + 1));
            }
        }
        // Pre-compute MQTT IDs and check for conflicts before provisioning
        const mqttIds = [];
        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            const mqttId = this.computeMqttId(dev.name, dev.customName.trim());
            if (mqttId) {
                if (usedMqttIds.has(mqttId)) {
                    await context.showMessage(`MQTT ID "${mqttId}" is already used by another device. Please choose a different name for "${dev.customName.trim()}".`);
                    return;
                }
                usedMqttIds.add(mqttId);
            }
            mqttIds.push(mqttId || undefined);
        }
        let progress = await context.openProgress('Configuring devices...', { value: 0 });
        const results = [];
        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            await progress.update({
                value: Math.round(((i + 1) / devices.length) * 100),
                label: dev.name,
            });
            try {
                await this.provisionSingleDevice(dev, mqttServer, mqttUser, mqttPass, httpPass, timeZone, mqttIds[i]);
                results.push(`✓ ${dev.name}${dev.customName.trim() ? ` → ${dev.customName.trim()}` : ''}`);
                this.adapter.log.info(`[DeviceManager] Provisioned ${dev.name} (${dev.ip})`);
            }
            catch (err) {
                if (err instanceof HttpAuthError) {
                    // Try with configured password first
                    if (httpPass) {
                        this.adapter.log.info(`[DeviceManager] ${dev.ip}: 401 - retrying with configured password`);
                        try {
                            await this.provisionSingleDevice(dev, mqttServer, mqttUser, mqttPass, httpPass, timeZone, mqttIds[i], httpPass);
                            results.push(`✓ ${dev.name}${dev.customName.trim() ? ` → ${dev.customName.trim()}` : ''}`);
                            this.adapter.log.info(`[DeviceManager] Provisioned ${dev.name} (${dev.ip}) with configured password`);
                            continue;
                        }
                        catch (cfgErr) {
                            if (!(cfgErr instanceof HttpAuthError)) {
                                const msg = cfgErr instanceof Error ? cfgErr.message : String(cfgErr);
                                results.push(`✗ ${dev.name}: ${msg}`);
                                this.adapter.log.error(`[DeviceManager] Failed to provision ${dev.name} (${dev.ip}): ${msg}`);
                                continue;
                            }
                            // Configured password also failed, ask user
                            this.adapter.log.info(`[DeviceManager] ${dev.ip}: Configured password failed, asking user`);
                        }
                    }
                    // Ask user for password
                    await progress.close();
                    const formResult = await context.showForm({
                        type: 'panel',
                        items: {
                            _info: {
                                type: 'staticInfo',
                                label: dev.name,
                                data: adapter_core_1.I18n.getTranslatedObject('Device is password-protected'),
                                addColon: true,
                            },
                            devicePassword: {
                                type: 'text',
                                label: adapter_core_1.I18n.getTranslatedObject('Enter device password'),
                            },
                        },
                    }, { data: { devicePassword: '' }, title: dev.name });
                    if (formResult?.devicePassword) {
                        const devPass = formResult.devicePassword;
                        progress = await context.openProgress('Configuring devices...', {
                            value: Math.round(((i + 1) / devices.length) * 100),
                        });
                        try {
                            await this.provisionSingleDevice(dev, mqttServer, mqttUser, mqttPass, httpPass, timeZone, mqttIds[i], devPass);
                            results.push(`✓ ${dev.name}${dev.customName.trim() ? ` → ${dev.customName.trim()}` : ''}`);
                            this.adapter.log.info(`[DeviceManager] Provisioned ${dev.name} (${dev.ip}) with password`);
                        }
                        catch (retryErr) {
                            const msg = retryErr instanceof Error ? retryErr.message : String(retryErr);
                            results.push(`✗ ${dev.name}: ${msg}`);
                            this.adapter.log.error(`[DeviceManager] Failed to provision ${dev.name} (${dev.ip}): ${msg}`);
                        }
                    }
                    else {
                        results.push(`✗ ${dev.name}: Skipped (no password provided)`);
                        progress = await context.openProgress('Configuring devices...', {
                            value: Math.round(((i + 1) / devices.length) * 100),
                        });
                    }
                }
                else {
                    const msg = err instanceof Error ? err.message : String(err);
                    results.push(`✗ ${dev.name}: ${msg}`);
                    this.adapter.log.error(`[DeviceManager] Failed to provision ${dev.name} (${dev.ip}): ${msg}`);
                }
            }
        }
        await progress.close();
        // Show results
        const items = {};
        for (let i = 0; i < results.length; i++) {
            items[`result_${i}`] = {
                type: 'staticInfo',
                label: results[i],
                data: '',
            };
        }
        await context.showForm({ type: 'panel', items }, { title: adapter_core_1.I18n.getTranslatedObject('Configuration results'), buttons: ['apply'], ignoreApplyDisabled: true });
    }
    async provisionSingleDevice(dev, mqttServer, mqttUser, mqttPass, httpPass, timeZone, mqttId, devicePassword) {
        const auth = devicePassword ? { user: 'admin', pass: devicePassword } : undefined;
        const { gen, id: deviceId } = await this.detectDeviceGen(dev.ip, auth);
        const customName = dev.customName.trim();
        // Gen1 devices must not be provisioned to MQTT — it disconnects them from Shelly Cloud and App
        if (gen < 2) {
            throw new Error('Gen1 devices cannot be provisioned via MQTT. Enabling MQTT on Gen1 devices disconnects them from Shelly Cloud and the Shelly App. Use CoAP protocol instead.');
        }
        // Step 1: Configure MQTT, device name, timezone (no auth change yet)
        let needsRestart;
        if (gen >= 2) {
            needsRestart = await this.provisionGen2(dev.ip, mqttServer, mqttUser, mqttPass, timeZone, customName, mqttId, auth);
        }
        else {
            needsRestart = await this.provisionGen1(dev.ip, mqttServer, mqttUser, mqttPass, httpPass, timeZone, customName, mqttId, auth);
        }
        // Step 2: Reboot if needed (before setting auth, so old/no auth still works)
        if (needsRestart) {
            try {
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Rebooting device...`);
                let rebootResult;
                if (gen >= 2) {
                    rebootResult = await this.httpGet(`http://${dev.ip}/rpc/Shelly.Reboot`, auth);
                }
                else {
                    rebootResult = await this.httpGet(`http://${dev.ip}/reboot`, auth);
                }
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Reboot response: ${rebootResult || 'OK'}`);
            }
            catch (err) {
                // Device may disconnect immediately during reboot
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Reboot sent (${err instanceof Error ? err.message : err})`);
            }
            // Wait for device to come back up before setting auth
            if (httpPass && gen >= 2) {
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Waiting for device to restart...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
        // Step 3: Set auth password last (after reboot, so reboot doesn't need the new password)
        if (httpPass && gen >= 2) {
            this.adapter.log.info(`[DeviceManager] ${dev.ip}: Setting auth (deviceId=${deviceId})`);
            const ha1 = crypto.createHash('sha256').update(`admin:${deviceId}:${httpPass}`).digest('hex');
            const authResult = await this.httpPost(`http://${dev.ip}/rpc/Shelly.SetAuth`, JSON.stringify({ user: 'admin', realm: deviceId, ha1 }), auth);
            this.adapter.log.debug(`[DeviceManager] ${dev.ip}: Shelly.SetAuth response: ${authResult}`);
        }
    }
    async provisionGen1(ip, mqttServer, mqttUser, mqttPass, httpPass, timeZone, deviceName, mqttId, auth) {
        const params = {
            mqtt_enable: 'true',
            mqtt_server: mqttServer,
            mqtt_user: mqttUser,
            mqtt_pass: mqttPass,
            timezone: timeZone,
        };
        if (deviceName) {
            params.name = deviceName;
        }
        if (mqttId) {
            params.mqtt_id = mqttId;
        }
        if (httpPass) {
            params.login_enabled = 'true';
        }
        const url = `http://${ip}/settings?${new URLSearchParams(params).toString()}`;
        this.adapter.log.info(`[DeviceManager] ${ip}: Setting Gen1 config (server=${mqttServer}, name=${deviceName || 'unchanged'}, tz=${timeZone})`);
        const result = await this.httpGet(url, auth);
        this.adapter.log.debug(`[DeviceManager] ${ip}: Gen1 /settings response: ${result.substring(0, 200)}`);
        // Gen1 always needs reboot after MQTT config change
        return true;
    }
    async provisionGen2(ip, mqttServer, mqttUser, mqttPass, timeZone, deviceName, mqttId, auth) {
        let restartRequired = false;
        // Configure MQTT
        this.adapter.log.info(`[DeviceManager] ${ip}: Setting MQTT config (server=${mqttServer}, prefix=${mqttId || 'default'})`);
        const mqttConfig = {
            enable: true,
            server: mqttServer,
            user: mqttUser,
            pass: mqttPass,
            rpc_ntf: true,
            status_ntf: true,
        };
        if (mqttId) {
            mqttConfig.topic_prefix = mqttId;
            mqttConfig.client_id = mqttId;
        }
        const mqttResult = await this.httpPost(`http://${ip}/rpc/Mqtt.SetConfig`, JSON.stringify({ config: mqttConfig }), auth);
        this.adapter.log.debug(`[DeviceManager] ${ip}: Mqtt.SetConfig response: ${mqttResult}`);
        if (JSON.parse(mqttResult).restart_required) {
            restartRequired = true;
        }
        // Configure device name and timezone
        this.adapter.log.info(`[DeviceManager] ${ip}: Setting Sys config (tz=${timeZone}, name=${deviceName || 'unchanged'})`);
        const sysConfig = {
            location: { tz: timeZone },
        };
        if (deviceName) {
            sysConfig.device = { name: deviceName };
        }
        const sysResult = await this.httpPost(`http://${ip}/rpc/Sys.SetConfig`, JSON.stringify({ config: sysConfig }), auth);
        this.adapter.log.debug(`[DeviceManager] ${ip}: Sys.SetConfig response: ${sysResult}`);
        if (JSON.parse(sysResult).restart_required) {
            restartRequired = true;
        }
        this.adapter.log.info(`[DeviceManager] ${ip}: Provisioning complete (restart_required=${restartRequired})`);
        return restartRequired;
    }
    getLocalIp(targetIp) {
        const targetSubnet = targetIp.split('.').slice(0, 3).join('.');
        const interfaces = os.networkInterfaces();
        // First try: find interface on same subnet
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith(`${targetSubnet}.`)) {
                    return iface.address;
                }
            }
        }
        // Fallback: any non-internal IPv4
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return undefined;
    }
    /**
     * Fetch the device name from the device. Try without auth first, then with configured password.
     * Returns empty string if the name cannot be read.
     *
     * @param ip
     * @param httpPass
     */
    async fetchDeviceName(ip, httpPass) {
        // /shelly is always public (no auth required) and returns name on Gen2+
        try {
            const data = await this.httpGet(`http://${ip}/shelly`);
            const json = JSON.parse(data);
            if (json.name) {
                return json.name;
            }
        }
        catch {
            // ignore
        }
        // Gen1 fallback: /settings requires auth
        const trySettings = async (auth) => {
            try {
                const data = await this.httpGet(`http://${ip}/settings`, auth);
                const json = JSON.parse(data);
                return json?.name || '';
            }
            catch {
                return '';
            }
        };
        const name = await trySettings();
        if (name) {
            return name;
        }
        // Try Gen1 with configured password
        if (httpPass) {
            return trySettings({ user: 'admin', pass: httpPass });
        }
        return '';
    }
    async detectDeviceGen(ip, auth) {
        this.adapter.log.debug(`[DeviceManager] ${ip}: Detecting device generation...`);
        const data = await this.httpGet(`http://${ip}/shelly`, auth);
        const json = JSON.parse(data);
        const gen = json.gen || 1;
        const id = json.id || json.mac || '';
        this.adapter.log.info(`[DeviceManager] ${ip}: Detected Gen${gen}, id=${id}`);
        return { gen, id };
    }
    httpGet(url, auth) {
        return new Promise((resolve, reject) => {
            const parsed = new URL(url);
            const headers = { Connection: 'close' };
            if (auth) {
                headers.Authorization = `Basic ${Buffer.from(`${auth.user}:${auth.pass}`).toString('base64')}`;
            }
            const req = http.get({
                hostname: parsed.hostname,
                port: parsed.port || 80,
                path: `${parsed.pathname}${parsed.search}`,
                timeout: 10000,
                headers,
            }, res => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk.toString();
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    }
                    else if (res.statusCode === 401) {
                        reject(new HttpAuthError());
                    }
                    else {
                        reject(new Error(`HTTP GET ${parsed.pathname} → ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on('error', err => reject(new Error(`HTTP GET ${parsed.pathname} → ${err.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`HTTP GET ${parsed.pathname} → Timeout`));
            });
        });
    }
    httpPost(url, body, auth) {
        return new Promise((resolve, reject) => {
            const parsed = new URL(url);
            const headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                Connection: 'close',
            };
            if (auth) {
                headers.Authorization = `Basic ${Buffer.from(`${auth.user}:${auth.pass}`).toString('base64')}`;
            }
            const req = http.request({
                hostname: parsed.hostname,
                port: parsed.port || 80,
                path: parsed.pathname,
                method: 'POST',
                timeout: 10000,
                headers,
            }, res => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk.toString();
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    }
                    else if (res.statusCode === 401) {
                        reject(new HttpAuthError());
                    }
                    else {
                        reject(new Error(`HTTP POST ${parsed.pathname} → ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on('error', err => reject(new Error(`HTTP POST ${parsed.pathname} → ${err.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`HTTP POST ${parsed.pathname} → Timeout`));
            });
            req.write(body);
            req.end();
        });
    }
    /**
     * Scan for new Shelly devices and return names/IPs of unknown ones.
     */
    async scanForNewDevices() {
        await this.ready;
        const found = await this.mdnsScan(5000);
        const knownIps = new Set();
        for (const stateId in this.states) {
            if (stateId.endsWith('.hostname')) {
                const ip = this.states[stateId]?.val;
                if (typeof ip === 'string' && ip) {
                    knownIps.add(ip);
                }
            }
        }
        return found.filter(d => !knownIps.has(d.ip));
    }
    async destroy() {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
exports.default = ShellyDeviceManagement;
//# sourceMappingURL=deviceManager.js.map