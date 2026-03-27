import { DeviceManagement, type DeviceLoadContext, type ActionContext, type DeviceDetails, type InstanceDetails, type DeviceRefresh } from '@iobroker/dm-utils';
import { type AdapterInstance } from '@iobroker/adapter-core';
/**
 * DeviceManager Class
 */
export default class ShellyDeviceManagement extends DeviceManagement {
    private readonly ready;
    private readonly states;
    private readonly objects;
    constructor(adapter: AdapterInstance);
    private init;
    protected getInstanceInfo(): InstanceDetails;
    onStateChange(id: string, state: ioBroker.State | null): void;
    onObjectChange(id: string, obj: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject | null): void;
    /**
     * Load all shelly devices
     *
     * @param context
     */
    loadDevices(context: DeviceLoadContext<string>): Promise<void>;
    getDeviceDetails(deviceId: string): DeviceDetails<string> | null;
    private classifyBleDevice;
    private getDeviceGroup;
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
    private mdnsScan;
    private buildMdnsQuery;
    private parseDnsName;
    handleDiscoverDevices(context: ActionContext): Promise<{
        refresh: boolean;
    }>;
    destroy(): Promise<void>;
}
