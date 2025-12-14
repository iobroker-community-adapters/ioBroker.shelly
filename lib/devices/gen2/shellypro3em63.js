'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 3 EM / shellypro3em63
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro3EM
 */
const shellypro3em63 = {
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
                triphase: 'triphase ',
                monophase: 'monophase',
            },
        },
    },
};

shellyHelperGen2.addEM(shellypro3em63, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMData(shellypro3em63, 0, ['a', 'b', 'c']);

shellyHelperGen2.addEM1(shellypro3em63, 0, false);
shellyHelperGen2.addEM1(shellypro3em63, 1, false);
shellyHelperGen2.addEM1(shellypro3em63, 2, false);
shellyHelperGen2.addEM1Data(shellypro3em63, 0);
shellyHelperGen2.addEM1Data(shellypro3em63, 1);
shellyHelperGen2.addEM1Data(shellypro3em63, 2);

shellyHelperGen2.addEMTemperatureSensor(shellypro3em63);
shellyHelperGen2.addProOutputAddon(shellypro3em63);

module.exports = {
    shellypro3em63,
};
