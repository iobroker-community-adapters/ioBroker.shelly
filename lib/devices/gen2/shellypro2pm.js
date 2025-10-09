'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 2 PM / shellypro2pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro2PM
 */
const shellypro2pm = {
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

shellyHelperGen2.addSwitch(shellypro2pm, 0, true);
shellyHelperGen2.addSwitch(shellypro2pm, 1, true);

shellyHelperGen2.addInput(shellypro2pm, 0);
shellyHelperGen2.addInput(shellypro2pm, 1);

shellyHelperGen2.addCover(shellypro2pm, true);

module.exports = {
    shellypro2pm,
};
