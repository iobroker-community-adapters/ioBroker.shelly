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

shellyHelper.addSwitchToGen2Device(shellypro2pm, 0);
shellyHelper.addSwitchToGen2Device(shellypro2pm, 1);

module.exports = {
    shellypro2pm: shellypro2pm
};
