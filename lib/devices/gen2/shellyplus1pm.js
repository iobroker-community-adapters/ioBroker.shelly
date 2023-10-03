'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 PM / shellyplus1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1PM
 */
const shellyplus1pm = {
    'Sys.deviceMode': {
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => value ? JSON.parse(value).device.profile : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Shelly.SetProfile', params: { name: value } }); },
        },
        common: {
            name: 'Mode / Profile',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'switch': 'relay',
                'cover': 'shutter',
            },
        },
    },
};

shellyHelperGen2.addSwitchToGen2Device(shellyplus1pm, 0, true);

shellyHelperGen2.addInputToGen2Device(shellyplus1pm, 0);

shellyHelperGen2.addPlusAddon(shellyplus1pm);

module.exports = {
    shellyplus1pm,
};
