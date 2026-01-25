'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Flood Gen 4 / shellyfloodg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly
 */
const shellyfloodg4 = {
    'Sys.deviceMode': {
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).device.profile : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Shelly.SetProfile',
                    params: { name: value },
                });
            },
        },
        common: {
            name: 'Mode / Profile',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                switch: 'relay',
                cover: 'shutter',
            },
        },
    },
};

shellyHelperGen2.addDevicePower(shellyfloodg4, 0, false);
shellyHelperGen2.addFlood(shellyfloodg4, 0);

module.exports = {
    shellyfloodg4: shellyfloodg4,
};
