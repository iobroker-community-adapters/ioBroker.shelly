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
            role: 'switch.enable',
            read: true,
            write: true,
        },
    },
    'UI.screensaverLock': {
        mqtt: {
            http_publish: '/rpc/UI.GetConfig',
            http_publish_funct: value => value ? JSON.parse(value).lock_type : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'UI.SetConfig', params: { config: { lock_type: value } } }); },
        },
        common: {
            name: {
                en: 'Lock screen',
                de: 'Bildschirm sperren',
                ru: 'Экран блокировки',
                pt: 'Tela de bloqueio',
                nl: 'Scherm vergrendelen',
                fr: 'Verrouillage de l\'écran',
                it: 'Schermo di blocco',
                es: 'Pantalla de bloqueo',
                pl: 'Ekran blokady',
                uk: 'Lock екран',
                'zh-cn': '锁定屏幕',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                none: 'none',
                home: 'home',
                sett: 'settings',
                full: 'full',
            },
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
