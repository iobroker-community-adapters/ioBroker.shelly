// Ambient type stubs for the two runtime dependencies that ship without TypeScript declarations.
//
// This file is intentionally a *script* (no top-level `import`/`export`), so its `declare module`
// blocks register as ambient module declarations. (In a module file they would be treated as
// augmentations of an existing module and would not satisfy the bare `import ... from '...'`.)
//
// Only the surface this adapter actually uses is declared — enough to drop the `any`s (and the
// `@ts-expect-error` import directives) at every call site. Node's stream type is referenced with
// an inline `import('node:stream')` so this file stays a script.

declare module 'shelly-iot' {
    /** One CoIoT status tuple as delivered by a Gen1 device: `[flags, sensorId, value]`. */
    export type CoapTuple = [number, number, ioBroker.StateValue];

    /** A CoIoT status payload pushed by a Gen1 device (`G` holds the list of sensor tuples). */
    export interface CoapStatusPayload {
        G: CoapTuple[];
        [key: string]: unknown;
    }

    /** The shelly-iot CoAP/CoIoT listener for Gen1 devices. Only the used surface is typed. */
    export default class Shelly {
        constructor(options?: Record<string, unknown>);
        /** Start listening for CoIoT packets on the network. */
        listen(callback?: () => void): void;
        /** Fetch the device description for a known device id. */
        getDeviceDescription(
            deviceId: string,
            callback: (err: unknown, deviceId: string, description: unknown, ip: string) => void,
        ): void;
        on(event: 'error', listener: (err: unknown) => void): void;
        on(event: 'disconnect', listener: () => void): void;
        on(event: 'update-device-status', listener: (deviceId: string, status: CoapStatusPayload) => void): void;
        on(event: 'device-connection-status', listener: (deviceId: string, connected: boolean) => void): void;
        removeListener(
            event: 'update-device-status',
            listener: (deviceId: string, status: CoapStatusPayload) => void,
        ): void;
        removeListener(
            event: 'device-connection-status',
            listener: (deviceId: string, connected: boolean) => void,
        ): void;
    }
}

declare module 'mqtt-connection' {
    /** A decoded MQTT control packet — only the fields this adapter reads or sets are declared. */
    export interface MqttPacket {
        cmd?: string;
        clientId?: string;
        messageId?: number;
        username?: string;
        password?: Buffer | string;
        topic?: string;
        payload?: Buffer | string;
        qos?: number;
        dup?: boolean;
        retain?: boolean;
        returnCode?: number;
        granted?: number[];
        subscriptions?: { topic: string; qos: number }[];
        will?: MqttPacket;
    }

    /** Argument type emitted for each {@link Connection} event this adapter listens to. */
    interface MqttConnectionEvents {
        connect: MqttPacket;
        publish: MqttPacket;
        subscribe: MqttPacket;
        unsubscribe: MqttPacket;
        puback: MqttPacket;
        pubrec: MqttPacket;
        pubrel: MqttPacket;
        pubcomp: MqttPacket;
        pingreq: MqttPacket;
        disconnect: MqttPacket;
        close: unknown;
        timeout: unknown;
        error: Error;
    }

    /** A parser/serializer wrapped around a duplex stream that emits decoded MQTT packets. */
    export interface Connection {
        connack(packet: MqttPacket): void;
        publish(packet: MqttPacket): void;
        puback(packet: MqttPacket): void;
        pubrec(packet: MqttPacket): void;
        pubrel(packet: MqttPacket): void;
        pubcomp(packet: MqttPacket): void;
        suback(packet: MqttPacket): void;
        unsuback(packet: MqttPacket): void;
        pingresp(): void;
        destroy(): void;
        removeAllListeners(event?: string): this;
        on<E extends keyof MqttConnectionEvents>(event: E, listener: (arg: MqttConnectionEvents[E]) => void): this;
    }

    /** Wrap a duplex stream (the TCP socket) into an MQTT {@link Connection}. */
    export default function connection(stream: import('node:stream').Duplex, options?: Record<string, unknown>): Connection;
}
