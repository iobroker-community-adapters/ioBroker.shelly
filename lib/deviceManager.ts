import {
    DeviceManagement,
    type DeviceInfo,
    type DeviceLoadContext,
    type ActionContext,
    type DeviceDetails,
} from '@iobroker/dm-utils';
import { type AdapterInstance, I18n } from '@iobroker/adapter-core';
// It must be exported to index in dm-utils
import type { DeviceRefresh } from '@iobroker/dm-utils/build/types/base';
import type { ConfigItemAny } from '@iobroker/dm-utils/build/types/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const datapoints = require('./datapoints');

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
                const shortDeviceId = device._id.split('.')[2];
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
            const shortDeviceId = device._id.split('.')[2];

            const ns = this.adapter.namespace;
            const isOnline = !!this.states[`${ns}.${shortDeviceId}.online`]?.val;
            const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val as string | undefined;
            const firmwareUpdate = this.states[`${ns}.${shortDeviceId}.firmware`]?.val as boolean | undefined;

            const battery = this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                ? (this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`].val as number)
                : (this.states[`${ns}.${shortDeviceId}.sensor.battery`]?.val as number) || undefined;

            const rssi = isOnline
                ? (this.states[`${ns}.${shortDeviceId}.rssi`]?.val as number) || undefined
                : undefined;

            const res: DeviceInfo<string> = {
                id: device._id,
                identifier: hostname || undefined,
                name: device.common.name,
                icon: this.getIcon(device._id),
                color: isOnline ? undefined : '#fff',
                backgroundColor: isOnline ? undefined : '#f44336',
                manufacturer: 'Shelly',
                model: shortDeviceId.startsWith('ble.')
                    ? 'Bluetooth'
                    : (this.states[`${ns}.${shortDeviceId}.model`]?.val as string) ||
                      I18n.getTranslatedObject('unknown'),
                status: {
                    connection: isOnline ? 'connected' : 'disconnected',
                    rssi,
                    battery,
                    warning: firmwareUpdate ? I18n.getTranslatedObject('Firmware update available') : undefined,
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
                    ...(isOnline && firmwareUpdate
                        ? [
                              {
                                  id: 'firmware-update',
                                  icon: 'update' as const,
                                  description: I18n.getTranslatedObject('Update firmware'),
                                  handler: async (deviceId: string): Promise<{ refresh: DeviceRefresh }> =>
                                      await this.handleFirmwareUpdate(deviceId),
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

        const shortDeviceId = device._id.split('.')[2];
        const ns = this.adapter.namespace;

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
        const data: Record<string, any> = {};

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
                type: 'text',
                label: I18n.getTranslatedObject('Device ID'),
                readOnly: true,
            };
            data.id = id;
        }

        if (model) {
            items.model = {
                type: 'text',
                label: I18n.getTranslatedObject('Model'),
                readOnly: true,
            };
            data.model = model;
        }

        if (type) {
            items.deviceType = {
                type: 'text',
                label: I18n.getTranslatedObject('Type'),
                readOnly: true,
            };
            data.deviceType = type;
        }

        if (gen) {
            items.gen = {
                type: 'number',
                label: I18n.getTranslatedObject('Generation'),
                readOnly: true,
            };
            data.gen = gen;
        }

        if (hostname) {
            items.hostname = {
                type: 'text',
                label: I18n.getTranslatedObject('IP address'),
                readOnly: true,
            };
            data.hostname = hostname;
        }

        if (version) {
            items.version = {
                type: 'text',
                label: I18n.getTranslatedObject('Firmware version'),
                readOnly: true,
            };
            data.version = version;
        }

        if (firmware !== undefined) {
            items.firmware = {
                type: 'text',
                label: I18n.getTranslatedObject('Firmware update available'),
                readOnly: true,
            };
            data.firmware = firmware ? '✓' : '✗';
        }

        if (protocol) {
            items.protocol = {
                type: 'text',
                label: I18n.getTranslatedObject('Protocol'),
                readOnly: true,
            };
            data.protocol = protocol;
        }

        if (rssi !== undefined) {
            items.rssi = {
                type: 'number',
                label: I18n.getTranslatedObject('RSSI'),
                unit: 'dBm',
                readOnly: true,
            };
            data.rssi = rssi;
        }

        if (uptime !== undefined) {
            items.uptime = {
                type: 'text',
                label: I18n.getTranslatedObject('Uptime'),
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

    async handleFirmwareUpdate(id: string): Promise<{ refresh: DeviceRefresh }> {
        const shortDeviceId = id.split('.')[2];
        const stateId = `${this.adapter.namespace}.${shortDeviceId}.firmwareupdate`;

        try {
            await this.adapter.setStateAsync(stateId, true, false);
            this.adapter.log.info(`[DeviceManager] Firmware update triggered for ${shortDeviceId}`);
        } catch (err) {
            this.adapter.log.error(`[DeviceManager] Error triggering firmware update for ${shortDeviceId}: ${err}`);
        }

        return { refresh: 'device' as DeviceRefresh };
    }

    public async destroy(): Promise<void> {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
