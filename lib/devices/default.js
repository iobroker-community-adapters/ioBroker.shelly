'use strict';

const shellyHelper = require('../shelly-helper');
const utils = require('../lib/mqttDeviceUtils');

/**
 * Default, used for all Shelly devices Gen 1
 * https://shelly-api-docs.shelly.cloud/gen1/
 */
const defaultsgen1 = {
    gen: {
        coap: { init_funct: self => self.getDeviceGen() },
        mqtt: { init_funct: self => self.getDeviceGen() },
        common: {
            name: { en: 'Device generation', /* ...weitere Sprachen... */ },
            type: 'number',
            role: 'state',
            read: true, write: false,
            states: { 1: 'Generation 1', 2: 'Generation 2', 3: 'Generation 3', 4: 'Generation 4' },
        },
    },
    // ...andere entries...
    'Mqtt.topicPrefix': {
        coap: { no_display: true },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value)?.mqtt?.id : undefined;
                if (result && self.getMqttPrefix() && result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(
                        `[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`
                    );
                }
                return result;
            },
        },
        common: {
            name: { en: 'Topic prefix', /* ...weitere Sprachen... */ },
            type: 'string',
            role: 'state',
            read: true, write: false,
        },
    },
    'Mqtt.clientId': {
        coap: { no_display: true },
        mqtt: {
            init_funct: self => self.getId(),
            http_publish: '/settings',
            http_publish_funct: (value, self) => self.getId(),
        },
        common: {
            name: { en: 'Client ID', /* ...weitere Sprachen... */ },
            type: 'string',
            role: 'state',
            read: true, write: false,
        },
    },
    // ...der Rest bleibt wie gehabt (alle anderen States für Gen1 wie bisher)...
};

/**
 * Default, used for all Shelly devices Gen 2+
 * https://shelly-api-docs.shelly.cloud/gen2/
 */
const defaultsgen2 = {
    gen: {
        mqtt: { init_funct: self => self.getDeviceGen() },
        common: {
            name: { en: 'Device generation', /* ...weitere Sprachen... */ },
            type: 'number',
            role: 'state',
            read: true, write: false,
            states: { 1: 'Generation 1', 2: 'Generation 2', 3: 'Generation 3', 4: 'Generation 4' },
        },
    },
    // ...andere entries...
    'Mqtt.topicPrefix': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).topic_prefix : undefined;
                if (result && self.getMqttPrefix() && result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(
                        `[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`
                    );
                }
                return result;
            },
        },
        common: {
            name: { en: 'Topic prefix', /* ...weitere Sprachen... */ },
            type: 'string',
            role: 'state',
            read: true, write: false,
        },
    },
    'Mqtt.clientId': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).client_id : undefined),
        },
        common: {
            name: { en: 'Client ID', /* ...weitere Sprachen... */ },
            type: 'string',
            role: 'state',
            read: true, write: false,
        },
    },
    // ...der Rest bleibt wie gehabt (alle anderen States für Gen2+/Gen3 wie bisher, alle Endpunkte auf RPC)...
};

const defaultsgen3 = Object.assign({}, defaultsgen2);
const defaultsgen4 = Object.assign({}, defaultsgen2);

module.exports = {
    defaultsgen1,
    defaultsgen2,
    defaultsgen3,
    defaultsgen4,
};
