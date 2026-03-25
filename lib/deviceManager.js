"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dm_utils_1 = require("@iobroker/dm-utils");
const adapter_core_1 = require("@iobroker/adapter-core");
/**
 * DeviceManager Class
 */
class ShellyDeviceManagement extends dm_utils_1.DeviceManagement {
    onlineDevices;
    ready;
    states = {};
    objects = {};
    constructor(adapter, onlineDevices) {
        super(adapter);
        this.onlineDevices = onlineDevices;
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
        await this.adapter.subscribeStatesAsync('*');
        await this.adapter.subscribeObjectsAsync('*');
    }
    onStateChange(id, state) {
        if (state) {
            this.states[id] = state;
        }
        else {
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
     * List all shelly devices
     */
    async listDevices() {
        // Wait that i18n is initialized
        await this.ready;
        const arrDevices = [];
        for (const deviceId in this.objects) {
            const device = this.objects[deviceId];
            if (device.type !== 'device') {
                continue;
            }
            const shortDeviceId = device._id.split('.')[2];
            // Check for logging
            const res = {
                id: device._id,
                name: device.common.name,
                icon: this.getIcon(device._id),
                manufacturer: 'Shelly',
                model: this.states[`${this.adapter.namespace}.${shortDeviceId}.model`]?.val ||
                    adapter_core_1.I18n.getTranslatedObject('unknown'),
                status: {
                    battery: this.states[`${this.adapter.namespace}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                        ? this.states[`${this.adapter.namespace}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                            .val
                        : this.states[`${this.adapter.namespace}.${shortDeviceId}.sensor.battery`]?.val ||
                            undefined,
                    connection: this.onlineDevices[device._id.substring(this.adapter.namespace.length + 1)]
                        ? 'connected'
                        : 'disconnected',
                    rssi: this.onlineDevices[device._id.substring(this.adapter.namespace.length + 1)]
                        ? this.states[`${this.adapter.namespace}.${shortDeviceId}.rssi`]?.val || undefined
                        : undefined,
                },
                hasDetails: true,
                actions: [
                    {
                        id: 'rename',
                        icon: 'edit',
                        description: adapter_core_1.I18n.getTranslatedObject('Rename this device'),
                        handler: async (deviceId, context) => await this.handleRenameDevice(deviceId, context),
                    },
                ],
            };
            /*if (res.status.connection === 'connected') {
                res.actions.push({
                    id: 'config',
                    icon: 'settings',
                    description: I18n.getTranslatedObject('Config this device'),
                    handler: undefined, //async (_id, context) => await this.handleRenameDevice(_id, context),
                });
                res.actions.push({
                    id: 'Info',
                    icon: 'lines',
                    description: I18n.getTranslatedObject('Info of this device'),
                    handler: undefined, //async (_id, context) => await this.handleRenameDevice(_id, context),
                });
            }*/
            arrDevices.push(res);
        }
        return arrDevices;
    }
    getDeviceDetails(deviceId) {
        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items: {
                    _test: {
                        type: 'text',
                        label: 'Test',
                        readOnly: true,
                        default: 'This is a test',
                    },
                },
            },
        };
    }
    getIcon(_deviceId) {
        // if (deviceValue.indicators) {
        //     if (deviceValue.indicators.isThermostat) {
        //         return 'thermostat';
        //     } else if (deviceValue.indicators.isDoor) {
        //         return 'door';
        //     } else if (deviceValue.indicators.isWindow) {
        //         return 'window';
        //     }
        // }
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
            return { refresh: false };
        }
        const obj = {
            common: {
                name: result.newName,
            },
        };
        const res = await this.adapter.extendForeignObjectAsync(id, obj);
        if (res === null) {
            this.adapter.log.warn(`Can not rename device ${id}: ${JSON.stringify(res)}`);
            return { refresh: false };
        }
        return { refresh: true };
    }
    async destroy() {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
exports.default = ShellyDeviceManagement;
//# sourceMappingURL=deviceManager.js.map