export interface ShellyAdapterConfig {
    /** `both` retains its historic meaning: MQTT and CoAP. HTTP is an exclusive polling mode. */
    protocol: 'mqtt' | 'coap' | 'both' | 'http';
    httpusername: string;
    httppassword: string;
    polltime: number | string;
    autoupdate: boolean;
    updateUnchangedObjects: boolean;
    logDebugMessages: boolean;
    saveHttpResponses: boolean;
    bind: string;
    port: number | string;
    mqttusername: string;
    mqttpassword: string;
    qos: 0 | 1 | 2;
    coapbind: string;
    blacklist: {
        [id: string]: string;
    }[];
    scanInterval: number | string;
    httpAuthEnabled?: boolean;
    httpDefaultUsername?: string;
    httpDefaultPassword?: string;
    httpDiscoveryEnabled?: boolean;
    httpAutoCreate?: boolean;
    httpTimeout?: number | string;
    httpRetries?: number | string;
    httpMaxParallel?: number | string;
    httpNetworks?: ({ range?: string; ip?: string; enabled?: boolean } | string)[];
    httpDevices?: {
        ip: string;
        deviceId?: string;
        name?: string;
        enabled?: boolean;
        authMode?: 'global' | 'none';
    }[];
    httpDebugDiscovery?: boolean;
}

// The ambient stubs for the two untyped runtime dependencies (shelly-iot, mqtt-connection) live
// in the script-style declaration file `external-modules.d.ts`. Ambient `declare module` blocks
// must sit in a non-module .d.ts to take effect, which this file is not (it has top-level exports).
