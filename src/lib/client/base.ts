import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';

export class BaseClient {
    protected type: string;

    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    constructor(type: string, adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        this.type = type;

        this.adapter = adapter;
        this.eventEmitter = eventEmitter;

        // Handle firmware updates
        // this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());

        // Handle script download
        //this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }
}
