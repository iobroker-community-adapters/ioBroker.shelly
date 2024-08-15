import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';
import { BaseDevice } from './base';

export class NextgenDevice extends BaseDevice {
    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        super(adapter, eventEmitter);

        this.adapter = adapter;
        this.eventEmitter = eventEmitter;

        // Handle script download
        //this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }
}
