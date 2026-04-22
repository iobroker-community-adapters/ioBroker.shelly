export interface ShellyAdapterConfig {
    protocol: 'mqtt' | 'coap';
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
}
