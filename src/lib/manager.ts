import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';
import { BaseDevice } from './device/base';

export class Manager {
    protected adapter: utils.AdapterInstance;
    protected eventEmitter: EventEmitter;

    private devices: { [key: string]: BaseDevice };

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        this.adapter = adapter;
        this.eventEmitter = eventEmitter;

        this.devices = {};

        // Handle firmware updates
        // this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());
    }

    public addDevice(deviceId: string, device: BaseDevice): boolean {
        if (!this.devices.hasOwnProperty(deviceId)) {
            this.devices[deviceId] = device;
            return true;
        }

        return false;
    }

    isOnline(deviceId: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.devices, deviceId);
    }
}
