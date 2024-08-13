'use strict';

import * as utils from '@iobroker/adapter-core';
import Aedes, { Client as AedesClient } from 'aedes';
import { EventEmitter } from 'node:events';
import * as net from 'node:net';
import { BaseClient, BaseServer } from './base';

//const INIT_SRC = 'iobroker-init';

export class MQTTClient extends BaseClient {
    private client: AedesClient;
    private mqttTopicPrefix: string | undefined;

    private rpcSrc: string;
    private rpcOpenMessages: { [key: number]: (payload: object) => void };

    constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter, client: AedesClient) {
        super('mqtt', adapter, eventEmitter);

        this.client = client;
        this.rpcSrc = `iobroker.${adapter.namespace}`;
        this.rpcOpenMessages = [];
    }

    public onboarding(): void {
        this.publishRpcMsg({ method: 'Shelly.GetComponents' }).then((payload) => {
            this.adapter.log.warn(`Shelly Components ${JSON.stringify(payload)}`);
        });
        /*
        this.publishRpcMsg({ method: 'Sys.SetConfig', params: { config: { device: { name: 'test2' } } } }).then((payload) => {
            this.adapter.log.info(`Name changed to ${JSON.stringify(payload)}`);
        });
        */
    }

    public onMessagePublish(topic: string, payload: string): void {
        if (topic.endsWith('/online') && !this.mqttTopicPrefix) {
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
                    this.rpcOpenMessages[msgId] = resolve;
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

export class MQTTServer extends BaseServer {
    private aedes: Aedes | undefined;
    private server: net.Server | undefined;
    private clients: { [key: string]: MQTTClient };

    public constructor(adapter: utils.AdapterInstance, eventEmitter: EventEmitter) {
        super(adapter, eventEmitter);

        this.aedes = new Aedes({
            id: `iobroker.${this.adapter.namespace}`,
            authenticate: (client, username, password, callback) => {
                if (client?.id) {
                    if (username === adapter.config.mqttusername && password?.toString() === adapter.config.mqttpassword) {
                        return callback(null, true);
                    }

                    this.adapter.log.error(`[MQTT] Wrong MQTT authentification of client "${client.id}"`);
                    return callback({ name: 'Error', message: 'Authentication Failed! Please enter valid credentials.', returnCode: 1 }, false);
                }

                return callback({ name: 'Error', message: 'Authentication Failed! Client ID is missing.', returnCode: 1 }, false);
            },
        });

        this.server = net.createServer(this.aedes.handle);

        this.clients = {};
    }

    public listen(): void {
        this.aedes!.on('clientReady', (client) => {
            if (client?.id) {
                this.adapter.log.debug(`CLIENT_CONNECTED : MQTT Client "${client ? client.id : client}" connected to aedes broker`);

                try {
                    if (!Object.prototype.hasOwnProperty.call(this.clients, client.id)) {
                        this.clients[client.id] = new MQTTClient(this.adapter, this.eventEmitter, client);
                    } else {
                        this.adapter.log.error(`[MQTT] Client with id "${client.id}" already connected/registered in broker`);
                    }
                } catch (err) {
                    if (err.message == 'DEVICE_UNKNOWN') {
                        this.adapter.log.error(`[MQTT] (Shelly?) device unknown, configuration for client with id "${client.id}" does not exist!`);
                        this.adapter.log.error(`[MQTT] DO NOT CHANGE THE CLIENT-ID OF YOUR SHELLY DEVICES (see adapter documentation for details)`);
                    }
                }
            }
        });

        this.aedes!.on('clientError', (client, error) => {
            this.adapter.log.error(`[MQTT Server] Client error: ${client.id} ${error}`);
        });

        this.aedes!.on('connectionError', (client, error) => {
            this.adapter.log.error(`[MQTT Server] Connection error: ${client.id} ${error}`);
        });

        this.aedes!.on('keepaliveTimeout', (client) => {
            this.adapter.log.error(`[MQTT Server] Keepalive timeout: ${client.id}`);
        });

        this.aedes!.on('publish', (packet, client) => {
            if (client?.id && Object.prototype.hasOwnProperty.call(this.clients, client.id)) {
                this.adapter.log.debug(`[MQTT Server] Received message of client with id "${client.id}" ${packet.topic}: ${packet.payload.toString()}`);
                this.clients[client.id].onMessagePublish(packet.topic, packet.payload.toString());
            }
        });

        // emitted when a client disconnects from the broker
        this.aedes!.on('clientDisconnect', (client) => {
            this.adapter.log.debug(`CLIENT_DISCONNECTED : MQTT Client "${client ? client.id : client}" disconnected`);
            if (client?.id && Object.prototype.hasOwnProperty.call(this.clients, client.id)) {
                //this.clients[client.id].destroy();
                delete this.clients[client.id];
            }
        });

        this.server!.on('close', () => {
            this.adapter.log.debug(`[MQTT Server] Closing`);
        });

        this.server!.on('error', (error) => {
            this.adapter.log.debug(`[MQTT Server] Error: ${error}`);
        });

        this.server!.listen(this.adapter.config.port, this.adapter.config.bind, () => {
            this.adapter.log.debug(`[MQTT Server] Started listener on ${this.adapter.config.bind}:${this.adapter.config.port}`);
        });
    }

    public destroy(): void {
        super.destroy();
        this.adapter.log.debug(`[MQTT Server] Destroying`);

        //for (const i in this.clients) {
        //    this.clients[i].destroy();
        //}

        this.server?.close();
    }
}
