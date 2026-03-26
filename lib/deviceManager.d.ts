import { DeviceManagement, type DeviceLoadContext, type ActionContext, type DeviceDetails } from '@iobroker/dm-utils';
import { type AdapterInstance } from '@iobroker/adapter-core';
import type { DeviceRefresh } from '@iobroker/dm-utils/build/types/base';
/**
 * DeviceManager Class
 */
export default class ShellyDeviceManagement extends DeviceManagement {
    private readonly ready;
    private readonly states;
    private readonly objects;
    constructor(adapter: AdapterInstance);
    private init;
    onStateChange(id: string, state: ioBroker.State | null): void;
    onObjectChange(id: string, obj: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject | null): void;
    /**
     * Load all shelly devices
     *
     * @param context
     */
    loadDevices(context: DeviceLoadContext<string>): Promise<void>;
    getDeviceDetails(deviceId: string): DeviceDetails<string> | null;
    getIcon(deviceId: string): string;
    /**
     *
     * @param id ID to rename
     * @param context context sendet from Backend
     */
    handleRenameDevice(id: string, context: ActionContext): Promise<{
        refresh: DeviceRefresh;
    }>;
    handleFirmwareUpdate(id: string): Promise<{
        refresh: DeviceRefresh;
    }>;
    destroy(): Promise<void>;
}
