import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';

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
