import * as utils from '@iobroker/adapter-core';
import { Manager } from '../manager';

export abstract class BaseClient {
    protected adapter: utils.AdapterInstance;
    protected manager: Manager;

    constructor(adapter: utils.AdapterInstance, manager: Manager) {
        this.adapter = adapter;
        this.manager = manager;
    }
}
