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
    }
}
