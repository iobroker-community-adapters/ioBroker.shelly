import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';

export class BaseClient {
    protected type: string;

    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    protected httpIoBrokerStateTimeout: ioBroker.Timeout | undefined;
    protected msgId: number;

    constructor(type: string, adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        this.type = type; // mqtt or coap

        this.adapter = adapter;
        this.eventEmitter = eventEmitter;

        this.httpIoBrokerStateTimeout = null;

        this.msgId = 1;

        // Handle firmware updates
        // this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());

        // Handle script download
        //this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }
}

export class BaseServer {
    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        this.adapter = adapter;
        this.eventEmitter = eventEmitter;
    }

    destroy(): void {
        this.adapter.log.debug(`[BaseServer] Destroying`);
    }
}
