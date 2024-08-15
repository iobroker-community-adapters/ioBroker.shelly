import * as utils from '@iobroker/adapter-core';
import { Client as AedesClient } from 'aedes';
import { EventEmitter } from 'node:events';
import { BaseClient } from './base';

//const INIT_SRC = 'iobroker-init';

type RpcResponse = {
    result: object;
    error: object;
};

export class MQTTClient extends BaseClient {
    private client: AedesClient;
    private msgId: number;
    private mqttTopicPrefix: string | undefined;
    private onboardingCompleted: boolean;

    private rpcSrc: string;
    private rpcOpenMessages: { [key: number]: (response: RpcResponse) => void };

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter, client: AedesClient) {
        super('mqtt', adapter, eventEmitter);

        this.client = client;
        this.msgId = 1;
        this.onboardingCompleted = false;

        this.rpcSrc = `iobroker.${adapter.namespace}`;
        this.rpcOpenMessages = [];
    }

    public onboarding(): void {
        // TODO: Create all objects

        this.publishRpcMsg({ method: 'Shelly.GetDeviceInfo' }).then((result) => {
            this.adapter.log.warn(`Shelly device info: ${JSON.stringify(result)}`);

            this.onboardingCompleted = true;
        });

        this.publishRpcMsg({ method: 'Shelly.GetComponents' }).then((result) => {
            this.adapter.log.warn(`Shelly components: ${JSON.stringify(result)}`);

            this.onboardingCompleted = true;
        });
        /*
        this.publishRpcMsg({ method: 'Sys.SetConfig', params: { config: { device: { name: 'test2' } } } }).then((payload) => {
            this.adapter.log.info(`Name changed to ${JSON.stringify(payload)}`);
        });
        */
    }

    public onMessagePublish(topic: string, payload: string): void {
        if (topic.endsWith('/online') && !this.mqttTopicPrefix && !this.onboardingCompleted) {
            this.mqttTopicPrefix = topic.substring(0, topic.lastIndexOf('/online'));
            this.adapter.log.info(`Saved topic prefix for ${this.client.id}: ${this.mqttTopicPrefix}`);

            this.onboarding();
        } else if (topic === `${this.rpcSrc}/rpc`) {
            // Handle rpc answers
            try {
                const payloadObj = JSON.parse(payload);
                if (payloadObj.dst === this.rpcSrc) {
                    if (payloadObj.id && Object.prototype.hasOwnProperty.call(this.rpcOpenMessages, payloadObj.id)) {
                        this.rpcOpenMessages[payloadObj.id]({ result: payloadObj.result, error: payloadObj.error }); // Resolve promise
                        delete this.rpcOpenMessages[payloadObj.id];
                    }
                }
            } catch (err) {
                this.adapter.log.error(err);
            }
        }
    }

    private getNextMsgId(): number {
        return this.msgId++ & 0xffff;
    }

    private async publishRpcMsg(payload: object): Promise<object> {
        return new Promise((resolve, reject) => {
            const msgId = this.getNextMsgId();
            const topic = `${this.mqttTopicPrefix}/rpc`;

            const payloadObj = {
                id: msgId,
                src: this.rpcSrc,
                ...payload,
            };

            const timeout = this.adapter.setTimeout(() => {
                this.adapter.log.warn(`[publishRpcMsg ${msgId}] Command timeout`);

                delete this.rpcOpenMessages[msgId];
                reject(`timeout for ${topic}`);
            }, 2000);

            this.publishMsg(topic, payloadObj.id, JSON.stringify(payloadObj))
                .then(() => {
                    this.adapter.clearTimeout(timeout);
                    this.rpcOpenMessages[msgId] = (response: RpcResponse) => {
                        if (response.error) {
                            reject(response.error);
                        } else {
                            resolve(response.result);
                        }
                    };
                })
                .catch(reject);
        });
    }

    private async publishMsg(topic: string, msgId: number, payload: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const qos = this.adapter.config.qos ?? 0;

            try {
                this.adapter.log.debug(`[MQTT] Send state to ${this.client.id} with QoS ${qos}: ${topic} = ${payload} (${msgId})`);
                this.client.publish({ cmd: 'publish', topic, payload, qos: 0, messageId: msgId, dup: false, retain: false }, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msgId);
                    }
                });
            } catch (err) {
                this.adapter.log.error(`[MQTT] Unable to publish message to ${this.client.id} - received error "${err}": ${topic} = ${payload}`);
                reject(err);
            }
        });
    }
}
