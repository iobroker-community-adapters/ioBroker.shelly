/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 1 / shellyplus1
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1
 */
const shellyplus1 = {
    'Relay0.Switch': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'output')
                ) {
                    return valueObj.params['switch:0'].output;
                }
                return undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 1, src: 'iobroker', method: 'Switch.Set', params: {id: 0, on: value}}); }
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    },
    'Relay0.ChannelName': {
        mqtt: {
            http_publish: '/rpc/Switch.GetConfig?id=0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0.ChannelName', JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: 0, config: {name: value}}}); }
        },
        common: {
            'name': 'Channel Name',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'Relay0.source': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'source')
                ) {
                    return valueObj.params['switch:0'].source;
                }
                return undefined;
            }
        },
        common: {
            'name': 'source of last command',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'Relay0.Input': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/status/input:0',
            mqtt_publish_funct: (value) => { return JSON.parse(value).state; }
        },
        common: {
            'name': 'Input / Detach',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'temperatureC': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'temperature')
                ) {
                    return valueObj.params['switch:0'].temperature.tC;
                }
                return undefined;
            }
        },
        common: {
            'name': 'Temperature °C',
            'type': 'number',
            'role': 'value.temperature',
            'read': true,
            'write': false,
            'unit': '°C'
        }
    },
    'temperatureF': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'temperature')
                ) {
                    return valueObj.params['switch:0'].temperature.tF;
                }
                return undefined;
            }
        },
        common: {
            'name': 'Temperature °F',
            'type': 'number',
            'role': 'value.temperature',
            'read': true,
            'write': false,
            'unit': '°F'
        }
    }
};

module.exports = {
    shellyplus1: shellyplus1
};
