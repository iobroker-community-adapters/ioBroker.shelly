'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 2 PM / shellyplus2pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus2PM
 */
const shellyplus2pm = {
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

shellyHelper.addSwitchToGen2Device(shellyplus2pm, 0, true);
shellyHelper.addSwitchToGen2Device(shellyplus2pm, 1, true);

shellyHelper.addInputToGen2Device(shellyplus2pm, 0);
shellyHelper.addInputToGen2Device(shellyplus2pm, 1);

shellyHelper.addCoverToGen2Device(shellyplus2pm, 0);

module.exports = {
    shellyplus2pm: shellyplus2pm
};
