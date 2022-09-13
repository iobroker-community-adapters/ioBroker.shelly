'use strict';

const shellyHelperGen2 = require(__dirname + '/../gen2-helper');

/**
 * Shelly Pro 2 PM / shellypro2pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro2PM
 */
const shellypro2pm = {
    'Sys.deviceMode': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).device.profile : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Shelly.SetProfile', params: { name: value }}); }
        },
        common: {
            name: 'Mode / Profile',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'switch': 'relay',
                'cover': 'shutter'
            }
        }
    }
};

shellyHelperGen2.addSwitchToGen2Device(shellypro2pm, 0, true);
shellyHelperGen2.addSwitchToGen2Device(shellypro2pm, 1, true);

shellyHelperGen2.addInputToGen2Device(shellypro2pm, 0);
shellyHelperGen2.addInputToGen2Device(shellypro2pm, 1);

shellyHelperGen2.addCoverToGen2Device(shellypro2pm, 0);

module.exports = {
    shellypro2pm: shellypro2pm
};
