/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Pro 2 PM / shellypro2pm
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro2PM
 */
const shellypro2pm = {
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
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined; },
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
    'Relay0.Power': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'apower')
                ) {
                    return valueObj.params['switch:0'].apower;
                }
                return undefined;
            }
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'Relay0.Energy': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'aenergy')
                ) {
                    return valueObj.params['switch:0'].aenergy.total;
                }
                return undefined;
            }
        },
        common: {
            'name': 'Energy',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'Wh'
        }
    },
    'Relay1.Switch': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:1') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:1'], 'output')
                ) {
                    return valueObj.params['switch:1'].output;
                }
                return undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 1, src: 'iobroker', method: 'Switch.Set', params: {id: 1, on: value}}); }
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
    'Relay1.ChannelName': {
        mqtt: {
            http_publish: '/rpc/Switch.GetConfig?id=1',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: 1, config: {name: value}}}); }
        },
        common: {
            'name': 'Channel Name',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'Relay1.source': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:1') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:1'], 'source')
                ) {
                    return valueObj.params['switch:1'].source;
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
    'Relay1.Input': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/status/input:1',
            mqtt_publish_funct: (value) => { return JSON.parse(value).state; },
        },
        common: {
            'name': 'Input / Detach',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false,
            'states': {
                0: 'Input',
                1: 'Detach'
            }
        }
    },
    'Relay1.Power': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:1') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:1'], 'apower')
                ) {
                    return valueObj.params['switch:1'].apower;
                }
                return undefined;
            }
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'Relay1.Energy': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (
                    Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
                    valueObj.method === 'NotifyStatus' &&
                    Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:1') &&
                    Object.prototype.hasOwnProperty.call(valueObj.params['switch:1'], 'aenergy')
                ) {
                    return valueObj.params['switch:1'].aenergy.total;
                }
                return undefined;
            }
        },
        common: {
            'name': 'Energy',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'Wh'
        }
    }
};

module.exports = {
    shellypro2pm: shellypro2pm
};
