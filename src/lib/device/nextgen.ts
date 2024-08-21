import * as utils from '@iobroker/adapter-core';
import { MQTTClient } from '../client/mqtt';
import { BaseDevice } from './base';

export class NextgenDevice extends BaseDevice {
    private mqttClient: MQTTClient;

    constructor(adapter: utils.AdapterInstance, mqttClient: MQTTClient) {
        super(adapter);

        this.mqttClient = mqttClient;

        // Handle script download
        //this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }

    public async init(deviceId: string, gen: number): Promise<void> {
        await super.init(deviceId, gen);
    }

    public setName(name: string): void {
        this.mqttClient.publishRpcMsg({ method: 'Sys.SetConfig', params: { config: { device: { name } } } });
    }

    public onMessagePublish(topic: string, payload: string): void {
        // yes
    }
}
