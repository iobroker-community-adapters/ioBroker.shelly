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

shellyHelper.addSwitchToGen2Device(shellypro2pm, 0, true);
shellyHelper.addSwitchToGen2Device(shellypro2pm, 1, true);

shellyHelper.addInputToGen2Device(shellypro2pm, 0);
shellyHelper.addInputToGen2Device(shellypro2pm, 1);

shellyHelper.addCoverToGen2Device(shellypro2pm, 0);

module.exports = {
    shellypro2pm: shellypro2pm
};
