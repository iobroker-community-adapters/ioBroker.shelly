'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 3EM / shelly3emg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly3EMG3
 */
const shelly3em63g3 = {
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

shellyHelperGen2.addEM(shelly3em63g3, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMData(shelly3em63g3, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMTemperatureSensor(shelly3em63g3);

shellyHelperGen2.addEM1(shelly3em63g3, 0, false);
shellyHelperGen2.addEM1(shelly3em63g3, 1, false);
shellyHelperGen2.addEM1(shelly3em63g3, 2, false);
shellyHelperGen2.addEM1Data(shelly3em63g3, 0);
shellyHelperGen2.addEM1Data(shelly3em63g3, 1);
shellyHelperGen2.addEM1Data(shelly3em63g3, 2);

module.exports = { 
    shelly3em63g3,
};
