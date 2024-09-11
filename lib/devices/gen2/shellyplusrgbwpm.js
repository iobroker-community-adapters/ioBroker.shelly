'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus RGBW PM / shellyplusrgbwpm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusRGBWPM
 */
const shellyplusi4 = {
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
                'light': '4xLight',
                'rgb': 'RGB',
                'rgbw': 'RGBW',
            },
        },
    },
      'PLUSRGBWPM.HighFrequency': {
        mqtt: {
            http_publish: '/rpc/PlusRGBWPM.GetStatus',
            http_publish_funct: value => value ? JSON.parse(value).hf_mode : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'PlusRGBWPM.SetConfig', params: { hf_mode: value }}); },
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
              'zh-cn': '高频率'
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
            states: {
                'true': 'HF on',
                'false': 'HF off',
            },
        },
    },
};


shellyHelperGen2.addLight(shellyplusrgbwpm, 0);
shellyHelperGen2.addLight(shellyplusrgbwpm, 1);
shellyHelperGen2.addLight(shellyplusrgbwpm, 2);
shellyHelperGen2.addLight(shellyplusrgbwpm, 3);

shellyHelperGen2.addRGB(shellyplusrgbwpm, 0);
shellyHelperGen2.addRGBW(shellyplusrgbwpm, 0);

shellyHelperGen2.addInput(shellyplusrgbwpm, 0);
shellyHelperGen2.addInput(shellyplusrgbwpm, 1);
shellyHelperGen2.addInput(shellyplusrgbwpm, 2);
shellyHelperGen2.addInput(shellyplusrgbwpm, 3);

shellyHelperGen2.addPlusAddon(shellyplusrgbwpm);

module.exports = {
    shellyplusrgbwpm,
};
