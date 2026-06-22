export interface ShellyAdapterConfig {
    protocol: 'mqtt' | 'coap' | 'both';
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
}

// Ambient stubs for runtime dependencies that ship without TypeScript declarations.
// These let the adapter `import`/`require` them under strict type checking; the modules
// themselves remain untyped (`any`), which is acceptable for these low-level helpers.
declare module 'shelly-iot';
declare module 'mqtt-connection';
