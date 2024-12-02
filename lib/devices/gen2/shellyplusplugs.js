'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus Plug S / shellyplusplugs
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusPlugS
 */
const shellyplusplugs = {
    'PLUGS_UI.Mode': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).leds.mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: value,
                                /*
                                colors: {
                                    power: {
                                        brightness: 100,
                                    },
                                    'switch:0': {
                                        on: {
                                            rgb: [0,100,0],
                                            brightness: 100,
                                        },
                                        off: {
                                            rgb: [100,0,0],
                                            brightness: 100,
                                        },
                                    },
                                },
                                */
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            def: 'off',
            states: {
                power: 'power',
                switch: 'switch',
                off: 'off',
            },
        },
    },
    'PLUGS_UI.PowerBrightness': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.colors?.power?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'power',
                                colors: {
                                    power: {
                                        brightness: value,
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness (Mode: power)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'PLUGS_UI.SwitchOnBrightness': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.on?.brightness : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        on: {
                                            brightness: value,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness On (Mode: switch)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'PLUGS_UI.SwitchOnColor': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.on?.rgb.join(',') : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        on: {
                                            rgb: value.split(',').map(Number),
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: {
                en: 'Color',
                de: 'Farbe',
                ru: 'Цвет',
                pt: 'Cor',
                nl: 'Kleur',
                fr: 'Couleur',
                it: 'Colore',
                es: 'Color',
                pl: 'Kolor',
                'zh-cn': '颜色',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'PLUGS_UI.SwitchOffBrightness': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.off?.brightness : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        off: {
                                            brightness: value,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness Off (Mode: switch)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'PLUGS_UI.SwitchOffColor': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.off?.rgb.join(',') : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        off: {
                                            rgb: value.split(',').map(Number),
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: {
                en: 'Color',
                de: 'Farbe',
                ru: 'Цвет',
                pt: 'Cor',
                nl: 'Kleur',
                fr: 'Couleur',
                it: 'Colore',
                es: 'Color',
                pl: 'Kolor',
                'zh-cn': '颜色',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'PLUGS_UI.NightModeEnabled': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.night_mode?.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                night_mode: {
                                    enable: value,
                                    brightness: 100,
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Night Mode Enabled',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    },
    'PLUGS_UI.NightModeBrightness': {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.night_mode?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                night_mode: {
                                    brightness: value,
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness (Mode: night)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
};

shellyHelperGen2.addSwitch(shellyplusplugs, 0, true);

module.exports = {
    shellyplusplugs,
};
