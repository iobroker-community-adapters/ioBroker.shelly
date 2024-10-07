'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 2 PM Gen 3 / shelly2pmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly2PMG3
 */
const shelly2pmg3 = {
    'Sys.deviceMode': {
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => value ? JSON.parse(value).device.profile : undefined,
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
                'switch': 'relay',
                'cover': 'shutter',
            },
        },
    },
};

// Add Switches (like Shelly Pro 2 PM)
shellyHelperGen2.addSwitch(shelly2pmg3, 0, true);
shellyHelperGen2.addSwitch(shelly2pmg3, 1, true);

// Add Inputs (like Shelly Pro 2 PM)
shellyHelperGen2.addInput(shelly2pmg3, 0);
shellyHelperGen2.addInput(shelly2pmg3, 1);

// Add cover functionality (optional)
shellyHelperGen2.addCover(shelly2pmg3, 0);

module.exports = {
    shelly2pmg3: shelly2pmg3,
};
