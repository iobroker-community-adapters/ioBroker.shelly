import * as utils from '@iobroker/adapter-core';
import { Client as AedesClient } from 'aedes';
import { EventEmitter } from 'node:events';
import { NextgenDevice } from '../device/nextgen';
import { BaseClient } from './base';

//const INIT_SRC = 'iobroker-init';

export namespace Rpc {
    export type Request = {
        jsonrpc?: '2.0';
        id?: number | string;
        src?: string;
        method: string;
        params?: object;
    };

    export type ResponseResult = object;

    export type ResponseError = {
        code: number;
        message: string;
    };

    export type Response = {
        id: number | string;
        src: string;
        dst: string;
        result: ResponseResult;
        error: ResponseError;
    };

    export namespace Sys {
        type Config = {
            device: {
                name: string;
                eco_mode?: boolean;
                mac?: string;
                fw_id?: string;
                profile?: string;
                discoverable?: boolean;
                addon_type?: string | null;
                sys_btn_toggle?: boolean;
            };
        };

        export type SetConfigRequest = Request & {
            method: 'Sys.SetConfig';
            params?: {
                config?: Config;
            };
        };

        export type SetConfigResult = ResponseResult & {
            id: string;
            mac: string;
            model: string;
            gen: number;
            fw_id: string;
            ver: string;
            app: string;
            profile: string;
            auth_en: boolean;
            auth_domain: string | null;
            discoverable: boolean;
            key: string;
            batch: string;
            fw_sbits: string;
        };
    }

    export namespace Shelly {
        export type DeviceInfoRequest = Request & {
            method: 'Shelly.GetDeviceInfo';
            params?: {
                ident?: boolean;
            };
        };

        export type DeviceInfoResult = ResponseResult & {
            id: string;
            mac: string;
            model: string;
            gen: number;
            fw_id: string;
            ver: string;
            app: string;
            profile: string;
            auth_en: boolean;
            auth_domain: string | null;
            discoverable: boolean;
            key: string;
            batch: string;
            fw_sbits: string;
        };
    }
}

export class MQTTClient extends BaseClient {
    private client: AedesClient;
    private msgId: number;
    private mqttTopicPrefix: string | undefined;
    private onboardingCompleted: boolean;

    private rpcSrc: string;
    private rpcOpenMessages: { [key: number]: (response: Rpc.Response) => void };

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter, client: AedesClient) {
        super('mqtt', adapter, eventEmitter);

        this.client = client;
        this.msgId = 1;
        this.onboardingCompleted = false;

        this.rpcSrc = `iobroker.${adapter.namespace}`;
        this.rpcOpenMessages = [];
    }

    public onboarding(): void {
        this.publishRpcMsg({ method: 'Shelly.GetDeviceInfo' }).then((result) => {
            this.adapter.log.warn(`Shelly device info: ${JSON.stringify(result)}`);

            if (result.gen >= 2) {
                new NextgenDevice(this.adapter, this.eventEmitter, this);
            }

            this.onboardingCompleted = true;
        });
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
                        this.rpcOpenMessages[payloadObj.id](payloadObj); // Resolve promise
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

    public async publishRpcMsg(request: Rpc.Sys.SetConfigRequest): Promise<Rpc.Sys.SetConfigResult>;
    public async publishRpcMsg(request: Rpc.Shelly.DeviceInfoRequest): Promise<Rpc.Shelly.DeviceInfoResult>;
    public async publishRpcMsg(request: Rpc.Request): Promise<Rpc.ResponseResult> {
        return new Promise((resolve, reject) => {
            if (!this.mqttTopicPrefix) {
                reject(`MQTT topic prefix is not defined`);
            }

            const msgId = this.getNextMsgId();
            const topic = `${this.mqttTopicPrefix}/rpc`;

            const payload = {
                id: msgId,
                src: this.rpcSrc,
                ...request,
            };

            const timeout = this.adapter.setTimeout(() => {
                this.adapter.log.warn(`[publishRpcMsg ${msgId}] Command timeout`);

                delete this.rpcOpenMessages[msgId];
                reject(`timeout for ${topic}`);
            }, 2000);

            this.publishMsg(topic, msgId, JSON.stringify(payload))
                .then(() => {
                    this.adapter.clearTimeout(timeout);
                    this.rpcOpenMessages[msgId] = (response: Rpc.Response) => {
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
