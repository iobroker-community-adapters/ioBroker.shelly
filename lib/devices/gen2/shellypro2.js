/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Pro 2 / shellypro2
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro2
 */
const shellypro2 = {
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

shellyHelper.addSwitchToGen2Device(shellypro2, 0);
shellyHelper.addSwitchToGen2Device(shellypro2, 1);

shellyHelper.addInputToGen2Device(shellypro2, 0);
shellyHelper.addInputToGen2Device(shellypro2, 1);

module.exports = {
    shellypro2: shellypro2
};
