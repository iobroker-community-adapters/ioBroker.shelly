import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';

export abstract class BaseDevice {
    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        this.adapter = adapter;
        this.eventEmitter = eventEmitter;

        // Handle firmware updates
        // this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());
    }

    public async init(deviceId: string, gen: number): Promise<void> {
        await this.adapter.extendObject(deviceId, {
            type: 'device',
            common: {
                name: `Device ${deviceId}`,
                desc: `Gen ${gen}`,
                statusStates: {
                    onlineId: `${this.adapter.namespace}.${deviceId}.online`,
                },
            },
            native: {},
        });
    }

    public abstract setName(name: string): void;

    public abstract onMessagePublish(topic: string, payload: string): void;
}
