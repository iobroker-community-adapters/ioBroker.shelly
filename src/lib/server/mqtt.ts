'use strict';

import * as utils from '@iobroker/adapter-core';
import Aedes from 'aedes';
import * as net from 'node:net';
import { MQTTClient } from '../client/mqtt';
import { Manager } from '../manager';
import { BaseServer } from './base';

export class MQTTServer extends BaseServer {
    private aedes: Aedes | undefined;
    private server: net.Server | undefined;
    private clients: { [key: string]: MQTTClient };

    public constructor(adapter: utils.AdapterInstance, manager: Manager) {
        super(adapter, manager);

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
                this.adapter.log.debug(`[MQTT] Client with id "${client.id}" connected to aedes broker`);

                if (!Object.prototype.hasOwnProperty.call(this.clients, client.id)) {
                    this.clients[client.id] = new MQTTClient(this.adapter, this.manager, client);
                } else {
                    this.adapter.log.error(`[MQTT] Client with id "${client.id}" already connected/registered in broker`);
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
                this.adapter.log.silly(`[MQTT Server] Received message of client with id "${client.id}" ${packet.topic}: ${packet.payload.toString()}`);
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
