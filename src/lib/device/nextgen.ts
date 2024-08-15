import * as utils from '@iobroker/adapter-core';
import { EventEmitter } from 'node:events';
import { MQTTClient } from '../client/mqtt';
import { BaseDevice } from './base';

export class NextgenDevice extends BaseDevice {
    private mqttClient: MQTTClient;

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter, mqttClient: MQTTClient) {
        super(adapter, eventEmitter);

        this.mqttClient = mqttClient;

        // Handle script download
        //this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }

    public init(): void {
        /*
        this.mqttClient.publishRpcMsg({ method: 'Shelly.GetComponents' }).then((result) => {
            this.adapter.log.warn(`Shelly components: ${JSON.stringify(result)}`);
        });
        */
    }

    public setName(name: string): void {
        this.mqttClient.publishRpcMsg({ method: 'Sys.SetConfig', params: { config: { device: { name } } } });
    }
}
