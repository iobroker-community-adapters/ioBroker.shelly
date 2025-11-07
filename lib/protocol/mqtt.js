'use strict';

const utils = require('../lib/mqttDeviceUtils');
const BaseClient = require('./base').BaseClient;
const BaseServer = require('./base').BaseServer;
const datapoints = require('../datapoints');

const mqtt = require('mqtt-connection');
const net = require('net');

const adapterVersion = require('../../package.json').version;
const INIT_SRC = 'iobroker-init';

/**
 * checks if  function is an asynchron function
 *
 * @param funct - function
 */
function isAsync(funct) {
    if (funct && funct.constructor) {
        return funct.constructor.name == 'AsyncFunction';
    }
    return undefined;
}

class MQTTClient extends BaseClient {
    // ... existing methods as before

    // NEU: Shelly generation über Utility bestimmen!
    getDeviceGen() {
        return utils.detectShellyGenerationByClientId(this.getId());
    }

    async setMqttPrefixHttp() {
        if (this.mqttprefix) {
            return this.mqttprefix;
        }
        const gen = this.getDeviceGen();
        this.adapter.log.debug(
            `[MQTT] Started mqttprefix fallback via HTTP or RPC for client ${this.getId()} (Gen ${gen})`,
        );

        if (gen === 1) {
            try {
                const body = await this.requestAsync('/settings');
                if (body) {
                    const settings = JSON.parse(body);
                    this.mqttprefix = settings.mqtt.id;
                    this.adapter.log.debug(
                        `[MQTT] Requested mqttprefix for client ${this.getId()} (Gen 1): ${this.mqttprefix}`,
                    );
                    return this.mqttprefix;
                }
            } catch (err) {
                if (err && err.response && err.response.status == 401) {
                    this.adapter.log.error(
                        `[MQTT] Wrong http username or http password! Please enter the user credential from restricted login for client ${this.getId()}`,
                    );
                } else {
                    this.adapter.log.error(
                        `[MQTT] Error in function setMqttPrefixHttp (Gen 1) for client ${this.getId()}: ${err}`,
                    );
                }
            }
        } else if (gen >= 2) {
            try {
                const body = await this.requestAsync('/rpc/Mqtt.GetConfig');
                if (body) {
                    const settings = JSON.parse(body);
                    this.mqttprefix = settings.topic_prefix;
                    this.adapter.log.debug(
                        `[MQTT] Requested mqttprefix for client ${this.getId()} (Gen 2+): ${this.mqttprefix}`,
                    );
                    return this.mqttprefix;
                }
            } catch (err) {
                this.adapter.log.error(
                    `[MQTT] Error in function setMqttPrefixHttp (Gen 2+) for client ${this.getId()}: ${err}`,
                );
            }
        }

        return undefined;
    }

    // Der Rest des Codes bleibt wie gehabt: Alle Stellen, die die Generation abfragen, nutzen jetzt robust this.getDeviceGen().
    // Falls du an anderen Stellen eigene Generationserkennung hattest, bitte ebenfalls auf this.getDeviceGen() umstellen!
    // ... restliche Methoden der Klasse MQTTClient ...
}

// Die Klasse MQTTServer bleibt wie gehabt.
class MQTTServer extends BaseServer {
    // ... unverändert ...
}

module.exports = {
    MQTTServer,
};
