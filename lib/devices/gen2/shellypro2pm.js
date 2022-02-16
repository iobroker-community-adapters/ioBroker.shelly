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
    'Sys.profile': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).device.profile : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Shelly.SetProfile', params: {name: value}}); }
        },
        common: {
            'name': 'Mode / Profile',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'switch': 'relay',
                'cover': 'shutter'
            }
        }
    }
};

shellyHelper.addSwitchToGen2Device(shellypro2pm, 0);
shellyHelper.addSwitchToGen2Device(shellypro2pm, 1);

shellyHelper.addInputToGen2Device(shellypro2pm, 0);
shellyHelper.addInputToGen2Device(shellypro2pm, 1);

shellyHelper.addCoverToGen2Device(shellypro2pm, 0);

module.exports = {
    shellypro2pm: shellypro2pm
};
