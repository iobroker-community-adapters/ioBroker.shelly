import { DeviceManagement, type DeviceInfo, type ActionContext, type DeviceDetails } from '@iobroker/dm-utils';
import { type AdapterInstance } from '@iobroker/adapter-core';
/**
 * DeviceManager Class
 */
export default class ShellyDeviceManagement extends DeviceManagement {
    private readonly onlineDevices;
    private readonly ready;
    private readonly states;
    private readonly objects;
    constructor(adapter: AdapterInstance, onlineDevices: {
        [id: string]: true;
    });
    private init;
    onStateChange(id: string, state: ioBroker.State | null): void;
    onObjectChange(id: string, obj: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject | null): void;
    /**
     * List all shelly devices
     */
    listDevices(): Promise<DeviceInfo[]>;
    getDeviceDetails(deviceId: string): DeviceDetails;
    getIcon(_deviceId: string): string;
    /**
     *
     * @param id ID to rename
     * @param context context sendet from Backend
     */
    handleRenameDevice(id: string, context: ActionContext): Promise<{
        refresh: boolean;
    }>;
    destroy(): Promise<void>;
}
