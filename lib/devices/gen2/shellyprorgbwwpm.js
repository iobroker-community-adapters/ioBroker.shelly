'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro RGBWW PM / shellyprorgbwwpm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProRGBWWPM
 */
const shellyprorgbwwpm = {
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
                light: '4xLight',
                rgb: 'RGB',
                rgbw: 'RGBW',
            },
        },
    },
    'PRORGBWWPM.HighFrequency': {
        mqtt: {
            http_publish: '/rpc/ProRGBWWPM.GetStatus',
            http_publish_funct: value => (value ? JSON.parse(value).hf_mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'ProRGBWWPM.SetConfig',
                    params: { hf_mode: value },
                });
            },
        },
        common: {
            name: {
                en: 'High Frequency',
                de: 'Hochfrequenz',
                ru: 'Высокая частота',
                pt: 'Alta frequência',
                nl: 'Hoge frequentie',
                fr: 'Haute fréquence',
                it: 'Alta frequenza',
                es: 'Alta frecuencia',
                pl: 'Wysoka częstotliwość',
                'zh-cn': '高频率',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
            states: {
                true: 'HF on',
                false: 'HF off',
            },
        },
    },
};

shellyHelperGen2.addLight(shellyprorgbwwpm, 0, true);
shellyHelperGen2.addLight(shellyprorgbwwpm, 1, true);
shellyHelperGen2.addLight(shellyprorgbwwpm, 2, true);
shellyHelperGen2.addLight(shellyprorgbwwpm, 3, true);
shellyHelperGen2.addLight(shellyprorgbwwpm, 4, true);

shellyHelperGen2.addRGB(shellyprorgbwwpm, 0);
//shellyHelperGen2.addRGBW(shellyplusrgbwpm, 0);

shellyHelperGen2.addInput(shellyprorgbwwpm, 0);
shellyHelperGen2.addInput(shellyprorgbwwpm, 1);
shellyHelperGen2.addInput(shellyprorgbwwpm, 2);
shellyHelperGen2.addInput(shellyprorgbwwpm, 3);
shellyHelperGen2.addInput(shellyprorgbwwpm, 3);

module.exports = {
    shellyprorgbwwpm,
};
