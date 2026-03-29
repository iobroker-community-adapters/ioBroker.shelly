import {
    DeviceManagement,
    type DeviceInfo,
    type DeviceLoadContext,
    type ActionContext,
    type DeviceDetails,
    type InstanceDetails,
    type ConfigItemAny,
    type DeviceRefresh,
    type ConfigItemState,
    type DeviceControl,
} from '@iobroker/dm-utils';
import { type AdapterInstance, I18n } from '@iobroker/adapter-core';
// It must be exported to index in dm-utils
import * as dgram from 'node:dgram';
import type { ControlState } from '@iobroker/dm-utils/build/types/base';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const datapoints = require('./datapoints');

/** Map device class to group key */
const deviceGroupMap: Record<string, string> = {
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
const groupMeta: Record<string, { nameKey: string; icon: string }> = {
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
export default class ShellyDeviceManagement extends DeviceManagement {
    private readonly ready: Promise<void>;
    private readonly states: { [id: string]: ioBroker.State } = {};
    private readonly objects: { [id: string]: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject } =
        {};

    constructor(adapter: AdapterInstance) {
        super(adapter);

        // Initialize i18n
        this.ready = I18n.init(__dirname, adapter)
            .catch(error => this.adapter.log.error(`Cannot initialize i18n: ${error}`))
            .then(() => this.init());
    }

    private async init(): Promise<void> {
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
                const deviceClass = this.states[`${this.adapter.namespace}.${shortDeviceId}.class`]?.val as
                    | string
                    | undefined;
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

    protected getInstanceInfo(): InstanceDetails {
        return {
            apiVersion: 'v3',
            actions: [
                {
                    id: 'discover',
                    icon: 'search',
                    title: I18n.getTranslatedObject('Discover devices'),
                    description: I18n.getTranslatedObject('Scan network for Shelly devices via mDNS'),
                    handler: async (context: ActionContext): Promise<{ refresh: boolean }> =>
                        await this.handleDiscoverDevices(context),
                },
            ],
            smallCards: true,
        };
    }

    public onStateChange(id: string, state: ioBroker.State | null): void {
        if (state) {
            if (!this.states[id]) {
                // trigger DM update
                this.states[id] = state;
            } else if (this.states[id].val !== state.val) {
                // trigger DM update
                this.states[id] = state;
            }
        } else if (this.states[id]) {
            // trigger DM update
            delete this.states[id];
        }
    }

    public onObjectChange(
        id: string,
        obj: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject | null,
    ): void {
        if (obj) {
            this.objects[id] = obj;
        } else {
            delete this.objects[id];
        }
    }

    /**
     * Load all shelly devices
     *
     * @param context
     */
    async loadDevices(context: DeviceLoadContext<string>): Promise<void> {
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
            const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val as string | undefined;
            const firmwareUpdate = this.states[`${ns}.${shortDeviceId}.firmware`]?.val as boolean | undefined;

            const battery = this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                ? (this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`].val as number)
                : (this.states[`${ns}.${shortDeviceId}.sensor.battery`]?.val as number) ||
                  (this.states[`${ns}.${shortDeviceId}.battery`]?.val as number) ||
                  undefined;

            const rssi = isOnline
                ? (this.states[`${ns}.${shortDeviceId}.rssi`]?.val as number) || undefined
                : undefined;

            const bleInfo = isBle ? this.classifyBleDevice(shortDeviceId) : undefined;

            const deviceClass = this.states[`${ns}.${shortDeviceId}.class`]?.val as string | undefined;
            const group = this.getDeviceGroup(deviceClass, isBle);

            const res: DeviceInfo<string> = {
                id: device._id,
                identifier: hostname || undefined,
                name: device.common.name,
                icon: isBle ? `adapter/shelly/icons/${bleInfo!.icon}.png` : this.getIcon(device._id),
                color: !isBle && !isOnline ? '#fff' : undefined,
                backgroundColor: !isBle && !isOnline ? '#f44336' : undefined,
                group,
                model: isBle
                    ? bleInfo!.model
                    : (this.states[`${ns}.${shortDeviceId}.model`]?.val as string) ||
                      (this.states[`${ns}.${shortDeviceId}.type`]?.val as string) ||
                      I18n.getTranslatedObject('unknown'),
                status: {
                    connection: isBle ? undefined : isOnline ? 'connected' : 'disconnected',
                    rssi,
                    battery,
                    warning: firmwareUpdate ? I18n.getTranslatedObject('Firmware update available') : undefined,
                },
                hasDetails: true,
                customInfo: this.buildCustomInfo(device._id, shortDeviceId, isBle),
                controls: await this.buildControls(shortDeviceId, isBle),
                actions: [
                    {
                        id: 'rename',
                        icon: 'edit',
                        description: I18n.getTranslatedObject('Rename this device'),
                        handler: async (
                            deviceId: string,
                            context: ActionContext,
                        ): Promise<{
                            refresh: DeviceRefresh;
                        }> => await this.handleRenameDevice(deviceId, context),
                    },
                    ...(this.states[`${this.adapter.namespace}.${shortDeviceId}.hostname`]?.val
                        ? [
                              {
                                  id: 'web',
                                  icon: 'web',
                                  description: I18n.getTranslatedObject('Open device interface'),
                                  url: `http://${
                                      this.states[`${this.adapter.namespace}.${shortDeviceId}.hostname`]?.val as string
                                  }`,
                              },
                          ]
                        : []),
                    ...(isOnline && firmwareUpdate
                        ? [
                              {
                                  id: 'firmware-update',
                                  icon: 'update' as const,
                                  description: I18n.getTranslatedObject('Update firmware'),
                                  handler: async (
                                      deviceId: string,
                                      context: ActionContext,
                                  ): Promise<{ refresh: DeviceRefresh }> =>
                                      await this.handleFirmwareUpdate(deviceId, context),
                              },
                          ]
                        : []),
                ],
            };

            context.addDevice(res);
        }
    }

    getDeviceDetails(deviceId: string): DeviceDetails<string> | null {
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

        const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val as string | undefined;
        const version = this.states[`${ns}.${shortDeviceId}.version`]?.val as string | undefined;
        const model = this.states[`${ns}.${shortDeviceId}.model`]?.val as string | undefined;
        const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val as number | undefined;
        const id = this.states[`${ns}.${shortDeviceId}.id`]?.val as string | undefined;
        const type = this.states[`${ns}.${shortDeviceId}.type`]?.val as string | undefined;
        const rssi = this.states[`${ns}.${shortDeviceId}.rssi`]?.val as number | undefined;
        const uptime = this.states[`${ns}.${shortDeviceId}.uptime`]?.val as number | undefined;
        const firmware = this.states[`${ns}.${shortDeviceId}.firmware`]?.val as boolean | undefined;
        const protocol = this.states[`${ns}.${shortDeviceId}.protocol`]?.val as string | undefined;

        const items: Record<string, ConfigItemAny> = {};

        if (hostname) {
            items._deviceLink = {
                // @ts-expect-error staticLink is OK
                type: 'staticLink',
                href: `http://${hostname}`,
                label: I18n.getTranslatedObject('Open device web interface'),
                button: true,
                icon: 'web',
                newLine: true,
            };
        }

        if (id) {
            items.id = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Device ID'),
                data: id,
                addColon: true,
                copyToClipboard: true,
            };
        }

        if (model) {
            items.model = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Model'),
                data: model,
                addColon: true,
            };
        }

        if (type) {
            items.deviceType = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Type'),
                data: type,
                addColon: true,
            };
        }

        if (gen) {
            items.gen = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Generation'),
                data: gen,
                addColon: true,
            };
        }

        if (hostname) {
            items.hostname = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('IP address'),
                data: hostname,
                addColon: true,
                copyToClipboard: true,
            };
        }

        if (version) {
            items.version = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Firmware version'),
                data: version,
                addColon: true,
            };
        }

        if (firmware !== undefined) {
            items.firmware = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Firmware update available'),
                data: firmware ? '✓' : '✗',
                addColon: true,
            };
        }

        if (protocol) {
            items.protocol = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Protocol'),
                data: protocol,
                addColon: true,
            };
        }

        if (rssi !== undefined) {
            items.rssi = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('RSSI'),
                data: rssi,
                unit: 'dBm',
                addColon: true,
            };
        }

        if (uptime !== undefined) {
            items.uptime = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Uptime'),
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

    private getBleDeviceDetails(deviceId: string, shortDeviceId: string): DeviceDetails<string> {
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const items: Record<string, ConfigItemAny> = {};

        // Collect all states for this BLE device and show them as staticInfo
        const stateEntries: { name: string; obj: ioBroker.StateObject }[] = [];

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
            let displayVal: string | number | boolean;
            const states = common.states as Record<string, string> | undefined;
            if (states && String(val) in states) {
                displayVal = states[String(val)] !== undefined ? `${states[String(val)]}(${String(val)})` : String(val);
            } else if (typeof val === 'number') {
                displayVal = common.unit
                    ? `${Math.round(val * 100) / 100} ${common.unit}`
                    : Math.round(val * 100) / 100;
            } else if (typeof val === 'boolean') {
                displayVal = val ? '✓' : '✗';
            } else {
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

    private classifyBleDevice(shortDeviceId: string): { model: string; icon: string } {
        const prefix = `${this.adapter.namespace}.${shortDeviceId}.`;
        const stateNames = new Set<string>();

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

    private getDeviceGroup(
        deviceClass: string | undefined,
        isBle: boolean,
    ): { key: string; name: ioBroker.StringOrTranslated; icon?: string } {
        const groupKey = isBle ? 'ble' : deviceGroupMap[deviceClass || ''] || 'other';
        const meta = groupMeta[groupKey] || groupMeta.other;

        return {
            key: groupKey,
            name: I18n.getTranslatedObject(meta.nameKey),
            icon: meta.icon,
        };
    }

    private buildCustomInfo(
        deviceId: string,
        shortDeviceId: string,
        isBle: boolean,
    ): DeviceDetails<string> | undefined {
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const items: Record<string, ConfigItemAny> = {};

        if (isBle) {
            // BLE devices use direct state names
            if (this.states[`${prefix}temperature`] !== undefined) {
                items.temperature = {
                    type: 'state',
                    oid: `${shortDeviceId}.temperature`,
                    control: 'text',
                    unit: '°C',
                    digits: 2,
                    label: I18n.getTranslatedObject('Temperature'),
                    size: 12,
                    style: {
                        opacity: 0.7,
                    },
                } as ConfigItemState;
            }
            if (this.states[`${prefix}humidity`] !== undefined) {
                items.humidity = {
                    type: 'state',
                    oid: `${shortDeviceId}.humidity`,
                    control: 'text',
                    unit: '%',
                    digits: 1,
                    label: I18n.getTranslatedObject('Humidity'),
                    size: 12,
                    style: { opacity: 0.7 },
                } as ConfigItemState;
            }
            if (this.states[`${prefix}illuminance`] !== undefined) {
                items.illuminance = {
                    type: 'state',
                    oid: `${shortDeviceId}.illuminance`,
                    control: 'text',
                    unit: 'lux',
                    digits: 0,
                    label: I18n.getTranslatedObject('Illuminance'),
                    size: 12,
                    style: { opacity: 0.7 },
                } as ConfigItemState;
            }
            // BLE boolean/alarm sensor states
            const bleBoolSensors: {
                stateId: string;
                key: string;
                label: string;
                trueText: string;
                falseText: string;
                trueColor: string;
            }[] = [
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
                            { label: I18n.getTranslatedObject(sensor.falseText), value: 0 },
                            { label: I18n.getTranslatedObject(sensor.trueText), value: 1, color: sensor.trueColor },
                        ],
                        trueText: I18n.getTranslatedObject(sensor.trueText),
                        falseText: I18n.getTranslatedObject(sensor.falseText),
                        trueTextStyle: { color: sensor.trueColor },
                        blinkOnUpdate: true,
                        label: I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    } as ConfigItemState;
                }
            }

            // BLE numeric sensors
            if (this.states[`${prefix}rotation`] !== undefined) {
                items.rotation = {
                    type: 'state',
                    oid: `${shortDeviceId}.rotation`,
                    control: 'text',
                    unit: '°',
                    label: I18n.getTranslatedObject('Tilt'),
                    size: 12,
                    style: { opacity: 0.7 },
                } as ConfigItemState;
            }
        } else {
            // Gen1 sensor paths
            // Gen1 numeric sensors
            const gen1NumericSensors: { stateId: string; key: string; label: string; unit: string; digits?: number }[] =
                [
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
                        label: I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    } as ConfigItemState;
                }
            }

            // Gen1 boolean sensors (true/false values - use trueText/falseText)
            const gen1BoolSensors: {
                stateId: string;
                key: string;
                label: string;
                trueText: string;
                falseText: string;
                trueColor: string;
            }[] = [
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
                            { label: I18n.getTranslatedObject(sensor.falseText), value: 0 },
                            { label: I18n.getTranslatedObject(sensor.trueText), value: 1, color: sensor.trueColor },
                        ],
                        trueText: I18n.getTranslatedObject(sensor.trueText),
                        falseText: I18n.getTranslatedObject(sensor.falseText),
                        trueTextStyle: { color: sensor.trueColor },
                        blinkOnUpdate: true,
                        label: I18n.getTranslatedObject(sensor.label),
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
                        label: I18n.getTranslatedObject('Temperature'),
                        size: 12,
                        style: { opacity: 0.7 },
                    } as ConfigItemState;
                }

                const humMatch = suffix.match(/^(Humidity\d+)\.Relative$/);
                if (humMatch) {
                    items[`hum_${humMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '%',
                        digits: 1,
                        label: I18n.getTranslatedObject('Humidity'),
                        size: 12,
                        style: { opacity: 0.7 },
                    } as ConfigItemState;
                }

                const luxMatch = suffix.match(/^(Illuminance\d+)\.Lux$/);
                if (luxMatch) {
                    items[`lux_${luxMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: 'lux',
                        digits: 0,
                        label: I18n.getTranslatedObject('Illuminance'),
                        size: 12,
                        style: { opacity: 0.7 },
                    } as ConfigItemState;
                }

                // Flood alarm
                const floodMatch = suffix.match(/^(Flood\d+)\.alarm$/);
                if (floodMatch) {
                    items[`flood_${floodMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        readOnly: true,
                        options: [
                            { label: I18n.getTranslatedObject('OK'), value: 0 },
                            { label: I18n.getTranslatedObject('Alarm'), value: 1, color: 'red' },
                        ],
                        trueText: I18n.getTranslatedObject('OK'),
                        falseText: I18n.getTranslatedObject('Alarm'),
                        trueTextStyle: { color: 'red' },
                        blinkOnUpdate: true,
                        label: I18n.getTranslatedObject('Flood'),
                        size: 12,
                        style: { opacity: 0.7 },
                    } as ConfigItemState;
                }

                // Cover position
                const coverMatch = suffix.match(/^(Cover\d+)\.Position$/);
                if (coverMatch) {
                    items[`cover_${coverMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '%',
                        label: I18n.getTranslatedObject('Cover position'),
                        size: 12,
                        style: {
                            opacity: 0.7,
                        },
                    } as ConfigItemState;
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

    private async buildControls(shortDeviceId: string, isBle: boolean): Promise<DeviceControl<string>[]> {
        if (isBle) {
            return [];
        }

        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const controls: DeviceControl<string>[] = [];
        let labelForFirstControl: ioBroker.StringOrTranslated | undefined;

        // Check device mode to filter controls for multi-mode devices
        const deviceMode = this.states[`${ns}.${shortDeviceId}.Sys.deviceMode`]?.val as string | undefined;

        // Map device mode to allowed channel prefixes
        const allowedChannels: Record<string, string[]> = {
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

        const ownStates: string[] = [];
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
            if (common?.role !== 'switch' || common?.type !== 'boolean' || !common?.write) {
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
            let label: string;
            if (channelType === 'lights') {
                label = 'Light';
            } else if (channelType === 'white') {
                label = `White ${channelIdx}`;
            } else {
                label = channelIdx ? `${channelType} ${channelIdx}` : channelType;
            }

            const control: DeviceControl<string> = {
                id: suffix.replace('.', '_'),
                type: 'switch',
                stateId: `${shortDeviceId}.${suffix}`,
                state:
                    (await this.adapter.getForeignStateAsync(obj._id)) ||
                    ({ val: null, ts: Date.now(), ack: true } as ioBroker.State),
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };
            if (!controls.length) {
                // If control has no label, it will be shown directly on
                labelForFirstControl = label;
                controls.push(control);
                continue;
            } else if (controls.length === 1 && labelForFirstControl) {
                controls[0].label = labelForFirstControl;
            }
            control.label = label;
            controls.push(control);
        }

        // Collect slider states (brightness, cover position)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common as ioBroker.StateCommon;
            if (common?.type !== 'number' || !common?.write) {
                continue;
            }

            const role = common.role || '';
            if (!role.startsWith('level.') && role !== 'level') {
                continue;
            }

            const suffix = stateId.substring(prefix.length);

            // Match brightness: Light{id}.Brightness, RGB{id}.Brightness, RGBW{id}.Brightness, lights.brightness, white{id}.brightness
            // Match cover: Cover{id}.Position
            const match = suffix.match(
                /^(Light|RGB|RGBW|lights|white|Cover|Number)(\d*)\.(Brightness|brightness|Position|Value)$/,
            );
            if (!match) {
                continue;
            }

            const channelType = match[1];
            const channelIdx = match[2];
            const prop = match[3];

            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }

            let label: string;
            if (channelType === 'Cover') {
                label = channelIdx ? `Cover ${channelIdx}` : 'Cover';
            } else if (channelType === 'lights') {
                label = 'Brightness';
            } else if (channelType === 'white') {
                label = `White ${channelIdx}`;
            } else {
                label = channelIdx ? `${channelType} ${channelIdx}` : channelType;
            }

            const control: DeviceControl<string> = {
                id: suffix.replace('.', '_'),
                type: 'slider',
                stateId: `${shortDeviceId}.${suffix}`,
                min: common.min ?? 0,
                max: common.max ?? 100,
                unit: prop === 'Position' ? '%' : '%',
                label,
                state:
                    (await this.adapter.getForeignStateAsync(obj._id)) ||
                    ({ val: null, ts: Date.now(), ack: true } as ioBroker.State),
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };

            controls.push(control);
        }

        // Sort by ID for consistent order
        controls.sort((a, b) => a.id.localeCompare(b.id));

        return controls;
    }

    getIcon(deviceId: string): string {
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
    async handleRenameDevice(id: string, context: ActionContext): Promise<{ refresh: DeviceRefresh }> {
        const result = await context.showForm(
            {
                type: 'panel',
                items: {
                    newName: {
                        type: 'text',
                        trim: false,
                        placeholder: '',
                    },
                },
            },
            {
                data: {
                    newName: '',
                },
                title: I18n.getTranslatedObject('Enter new name'),
            },
        );
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
        return { refresh: 'device' as DeviceRefresh };
    }

    async handleFirmwareUpdate(id: string, context: ActionContext): Promise<{ refresh: DeviceRefresh }> {
        const shortDeviceId = id.substring(this.adapter.namespace.length + 1);
        const ns = this.adapter.namespace;
        const stateId = `${ns}.${shortDeviceId}.firmwareupdate`;

        const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val as number | undefined;
        const hasProgress = gen !== undefined && gen >= 2;

        const progress = await context.openProgress('Updating firmware...', {
            indeterminate: !hasProgress,
            value: hasProgress ? 0 : undefined,
            label: I18n.getTranslatedObject('Starting update...'),
        });

        try {
            await this.adapter.setStateAsync(stateId, true, false);
            this.adapter.log.info(`[DeviceManager] Firmware update triggered for ${shortDeviceId}`);

            const progressStateId = `${ns}.${shortDeviceId}.firmwareupdateProgress`;
            const firmwareStateId = `${ns}.${shortDeviceId}.firmware`;
            const TIMEOUT = 5 * 60 * 1000; // 5 minutes

            await new Promise<void>(resolve => {
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
                            label: I18n.getTranslatedObject('Firmware update complete'),
                        });
                        resolve();
                    }

                    // Check if device went offline and came back (Gen1 reboot after update)
                    if (!hasProgress) {
                        const online = this.states[`${ns}.${shortDeviceId}.online`];
                        if (online?.val === false) {
                            await progress.update({
                                label: I18n.getTranslatedObject('Device is rebooting...'),
                            });
                        }
                    }
                }, 2000);
            });
        } catch (err) {
            this.adapter.log.error(`[DeviceManager] Error during firmware update for ${shortDeviceId}: ${err}`);
        }

        await progress.close();
        return { refresh: 'device' as DeviceRefresh };
    }

    private mdnsScan(timeout: number): Promise<{ name: string; ip: string }[]> {
        return new Promise(resolve => {
            const MDNS_ADDRESS = '224.0.0.251';
            const MDNS_PORT = 5353;
            const devices = new Map<string, { name: string; ip: string }>();

            let socket: dgram.Socket;
            try {
                socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            } catch {
                resolve([]);
                return;
            }

            const cleanup = (): void => {
                try {
                    socket.close();
                } catch {
                    // ignore
                }
                resolve([...devices.values()]);
            };

            socket.on('error', () => cleanup());

            socket.on('message', (msg: Buffer) => {
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
                    } else {
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
                } catch {
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
                    } catch {
                        // ignore
                    }
                }, 2000);

                setTimeout(cleanup, timeout);
            });
        });
    }

    private buildMdnsQuery(name: string): Buffer {
        const parts = name.split('.');
        const bufParts: Buffer[] = [];
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

    private parseDnsName(buf: Buffer, offset: number): { name: string; nextOffset: number } {
        const parts: string[] = [];
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

    async handleDiscoverDevices(context: ActionContext): Promise<{ refresh: boolean }> {
        const progress = await context.openProgress('Searching for Shelly devices...', { indeterminate: true });

        try {
            const found = await this.mdnsScan(5000);
            await progress.close();

            if (found.length === 0) {
                await context.showMessage(I18n.getTranslatedObject('No new Shelly devices found'));
                return { refresh: false };
            }

            // Filter out devices already known
            const knownIps = new Set<string>();
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

            const lines: string[] = [];
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
                await context.showMessage(
                    I18n.getTranslatedObject(
                        'All %s found devices are already known',
                        existingDevices.length.toString(),
                    ),
                );
            } else {
                await context.showMessage(lines.join('\n'));
            }
        } catch (err) {
            await progress.close();
            this.adapter.log.error(`[DeviceManager] Discovery error: ${err}`);
            await context.showMessage(`Error: ${err}`);
        }

        return { refresh: false };
    }

    public async destroy(): Promise<void> {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
