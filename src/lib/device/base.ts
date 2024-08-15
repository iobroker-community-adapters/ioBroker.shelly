import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';

export class BaseDevice {
    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        this.adapter = adapter;
        this.eventEmitter = eventEmitter;

        // Handle firmware updates
        // this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());
    }
}
