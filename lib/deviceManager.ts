import { DeviceManagement, type DeviceInfo, type ActionContext, type DeviceDetails } from '@iobroker/dm-utils';
import { type AdapterInstance, I18n } from '@iobroker/adapter-core';
import type { DeviceRefresh } from '@iobroker/dm-utils/build/types/common';

/**
 * DeviceManager Class
 */
export default class ShellyDeviceManagement extends DeviceManagement {
    private readonly onlineDevices: { [id: string]: true };
    private readonly ready: Promise<void>;
    private readonly states: { [id: string]: ioBroker.State } = {};
    private readonly objects: { [id: string]: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject } =
        {};

    constructor(adapter: AdapterInstance, onlineDevices: { [id: string]: true }) {
        super(adapter);
        this.onlineDevices = onlineDevices;

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
        await this.adapter.subscribeStatesAsync('*');
        await this.adapter.subscribeObjectsAsync('*');
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
     * List all shelly devices
     */
    async listDevices(): Promise<DeviceInfo[]> {
        // Wait that i18n is initialized
        await this.ready;

        const arrDevices: DeviceInfo[] = [];

        for (const deviceId in this.objects) {
            const device = this.objects[deviceId];
            if (device.type !== 'device') {
                continue;
            }
            const shortDeviceId = device._id.split('.')[2];
            // Check for logging
            const res: DeviceInfo = {
                id: device._id,
                name: device.common.name,
                icon: this.getIcon(device._id),
                manufacturer: 'Shelly',
                model:
                    (this.states[`${this.adapter.namespace}.${shortDeviceId}.model`]?.val as string) ||
                    I18n.getTranslatedObject('unknown'),
                status: {
                    battery: this.states[`${this.adapter.namespace}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                        ? (this.states[`${this.adapter.namespace}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                              .val as number)
                        : (this.states[`${this.adapter.namespace}.${shortDeviceId}.sensor.battery`]?.val as number) ||
                          undefined,
                    connection: this.onlineDevices[device._id.substring(this.adapter.namespace.length + 1)]
                        ? 'connected'
                        : 'disconnected',
                    rssi: this.onlineDevices[device._id.substring(this.adapter.namespace.length + 1)]
                        ? (this.states[`${this.adapter.namespace}.${shortDeviceId}.rssi`]?.val as number) || undefined
                        : undefined,
                },
                hasDetails: true,
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

    getDeviceDetails(deviceId: string): DeviceDetails {
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

    getIcon(_deviceId: string): string {
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
    async handleRenameDevice(id: string, context: ActionContext): Promise<{ refresh: boolean }> {
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

    public async destroy(): Promise<void> {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
