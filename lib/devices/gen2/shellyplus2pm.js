/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 2 PM / shellyplus2pm
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus2PM
 */
const shellyplus2pm = {
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
    },
    'mode': {
        mqtt: {

        },
        common: {
            'name': 'Mode',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'relay': 'relay',
                'cover': 'shutter'
            }
        }
    },
};

shellyHelper.addSwitchToGen2Device(shellyplus2pm, 0);
shellyHelper.addSwitchToGen2Device(shellyplus2pm, 1);
shellyHelper.addInputToGen2Device(shellyplus2pm, 0);
shellyHelper.addInputToGen2Device(shellyplus2pm, 1);

module.exports = {
    shellyplus2pm: shellyplus2pm
};
