"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dm_utils_1 = require("@iobroker/dm-utils");
const adapter_core_1 = require("@iobroker/adapter-core");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const datapoints = require('./datapoints');
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
                const shortDeviceId = device._id.split('.')[2];
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
            const shortDeviceId = device._id.split('.')[2];
            const ns = this.adapter.namespace;
            const isOnline = !!this.states[`${ns}.${shortDeviceId}.online`]?.val;
            const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val;
            const firmwareUpdate = this.states[`${ns}.${shortDeviceId}.firmware`]?.val;
            const battery = this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                ? this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`].val
                : this.states[`${ns}.${shortDeviceId}.sensor.battery`]?.val || undefined;
            const rssi = isOnline
                ? this.states[`${ns}.${shortDeviceId}.rssi`]?.val || undefined
                : undefined;
            const res = {
                id: device._id,
                identifier: hostname || undefined,
                name: device.common.name,
                icon: this.getIcon(device._id),
                color: isOnline ? undefined : '#fff',
                backgroundColor: isOnline ? undefined : '#f44336',
                manufacturer: 'Shelly',
                model: shortDeviceId.startsWith('ble.')
                    ? 'Bluetooth'
                    : this.states[`${ns}.${shortDeviceId}.model`]?.val ||
                        adapter_core_1.I18n.getTranslatedObject('unknown'),
                status: {
                    connection: isOnline ? 'connected' : 'disconnected',
                    rssi,
                    battery,
                    warning: firmwareUpdate ? adapter_core_1.I18n.getTranslatedObject('Firmware update available') : undefined,
                },
                hasDetails: true,
                actions: [
                    {
                        id: 'rename',
                        icon: 'edit',
                        description: adapter_core_1.I18n.getTranslatedObject('Rename this device'),
                        handler: async (deviceId, context) => await this.handleRenameDevice(deviceId, context),
                    },
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
        const shortDeviceId = device._id.split('.')[2];
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
        const data = {};
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
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Device ID'),
                readOnly: true,
            };
            data.id = id;
        }
        if (model) {
            items.model = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Model'),
                readOnly: true,
            };
            data.model = model;
        }
        if (type) {
            items.deviceType = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Type'),
                readOnly: true,
            };
            data.deviceType = type;
        }
        if (gen) {
            items.gen = {
                type: 'number',
                label: adapter_core_1.I18n.getTranslatedObject('Generation'),
                readOnly: true,
            };
            data.gen = gen;
        }
        if (hostname) {
            items.hostname = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('IP address'),
                readOnly: true,
            };
            data.hostname = hostname;
        }
        if (version) {
            items.version = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Firmware version'),
                readOnly: true,
            };
            data.version = version;
        }
        if (firmware !== undefined) {
            items.firmware = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Firmware update available'),
                readOnly: true,
            };
            data.firmware = firmware ? '✓' : '✗';
        }
        if (protocol) {
            items.protocol = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Protocol'),
                readOnly: true,
            };
            data.protocol = protocol;
        }
        if (rssi !== undefined) {
            items.rssi = {
                type: 'number',
                label: adapter_core_1.I18n.getTranslatedObject('RSSI'),
                unit: 'dBm',
                readOnly: true,
            };
            data.rssi = rssi;
        }
        if (uptime !== undefined) {
            items.uptime = {
                type: 'text',
                label: adapter_core_1.I18n.getTranslatedObject('Uptime'),
                readOnly: true,
            };
            data.uptime = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
        }
        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items,
            },
            data,
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
        const shortDeviceId = id.split('.')[2];
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
    async destroy() {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
exports.default = ShellyDeviceManagement;
//# sourceMappingURL=deviceManager.js.map