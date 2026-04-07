import { type AdapterInstance } from '@iobroker/adapter-core';
import { DeviceManagement, type ActionContext, type DeviceDetails, type DeviceLoadContext, type DeviceRefresh, type InstanceDetails } from '@iobroker/dm-utils';
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
    private getBleDeviceDetails;
    private classifyBleDevice;
    private getDeviceGroup;
    private buildCustomInfo;
    private buildControls;
    getIcon(deviceId: string): string;
    /**
     *
     * @param id ID to rename
     * @param context context sendet from Backend
     */
    handleRenameDevice(id: string, context: ActionContext): Promise<{
        refresh: DeviceRefresh;
    }>;
    handleFirmwareUpdate(id: string, context: ActionContext): Promise<{
        refresh: DeviceRefresh;
    }>;
    private mdnsScan;
    private buildMdnsQuery;
    private parseDnsName;
    handleDiscoverDevices(context: ActionContext): Promise<{
        refresh: boolean;
    }>;
    /**
     * Extract device type prefix from mDNS name, e.g. "ShellyPlusI4-841FE8F9D9E8" → "shellyplusi4-"
     *
     * @param name
     */
    private getDevicePrefix;
    /**
     * Compute the MQTT ID from device mDNS name and custom name.
     * Returns empty string if no custom name is provided.
     */
    private computeMqttId;
    private provisionDevices;
    private provisionSingleDevice;
    private provisionGen1;
    private provisionGen2;
    private getLocalIp;
    /**
     * Fetch the device name from the device. Try without auth first, then with configured password.
     * Returns empty string if the name cannot be read.
     *
     * @param ip
     * @param httpPass
     */
    private fetchDeviceName;
    private detectDeviceGen;
    private httpGet;
    private httpPost;
    /**
     * Scan for new Shelly devices and return names/IPs of unknown ones.
     */
    scanForNewDevices(): Promise<{
        name: string;
        ip: string;
    }[]>;
    destroy(): Promise<void>;
}
