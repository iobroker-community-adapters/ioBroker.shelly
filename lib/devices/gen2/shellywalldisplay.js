'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Wall Display / shellywalldisplay
 */
const shellywalldisplay = {
    'UI.screensaverEnabled': {
        mqtt: {
            http_publish: '/rpc/UI.GetConfig',
            http_publish_funct: value => value ? JSON.parse(value).screen_saver.enable : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'UI.SetConfig', params: { config: { screen_saver: { enable: value } } } }); },
        },
        common: {
            name: {
                en: 'Screensaver',
                de: 'Bildschirmschoner',
                ru: 'Скриншот',
                pt: 'Screensaver',
                nl: 'Schermbeveiliging',
                fr: 'Économiseur d\'écran',
                it: 'Screensaver',
                es: 'Screensaver',
                pl: 'Wygaszacz ekranu',
                uk: 'Скріншоти',
                'zh-cn': '屏幕保护',
            },
            type: 'boolean',
            role: 'value',
            read: true,
            write: true,
        },
    },
};

shellyHelperGen2.addSwitchToGen2Device(shellywalldisplay, 0, false);
shellyHelperGen2.addInputToGen2Device(shellywalldisplay, 0);
shellyHelperGen2.addHumiditySensorToGen2Device(shellywalldisplay, 0);
shellyHelperGen2.addTemperatureSensorToGen2Device(shellywalldisplay, 0);
shellyHelperGen2.addIlluminanceSensorToGen2Device(shellywalldisplay, 0);

module.exports = {
    shellywalldisplay,
};
