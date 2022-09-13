'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plug S / SHPLG-S, SHPLG2-1 / shellyplug-s
 * CoAP
 *  {"blk":[{"I":0,"D":"Relay0"}],"sen":[{"I":111,"T":"P","D":"Power","R":"0/2500","L":0},{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":113,"T":"T","D":"Temperature C","R":"-40/300","L":0},{"I":114,"T":"T","D":"Temperature F","R":"-40/300","L":0},{"I":115,"T":"S","D":"Overtemp","R":"0/1","L":0},{"I":211,"T":"S","D":"Energy counter 0 [W-min]","L":0},{"I":212,"T":"S","D":"Energy counter 1 [W-min]","L":0},{"I":213,"T":"S","D":"Energy counter 2 [W-min]","L":0},{"I":214,"T":"S","D":"Energy counter total [W-min]","L":0}]}
  *
 * CoAP Version >= 1.8
 *  Shelly Plug S SHPLG-S:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/2500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":2},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":2},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":2}]}
 */
const shellyplugs = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101', // Coap >= FW 1.8
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
            mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
        },
        common: {
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Vertaling:',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Switch',
                'zh-cn': '目 录'
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false
        }
    },
    'Relay0.ChannelName': {
        coap: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        common: {
            name: {
                en: 'Channel name',
                de: 'Kanalname',
                ru: 'Имя канала',
                pt: 'Nome do canal',
                nl: 'Kanaalnaam',
                fr: 'Nom du canal',
                it: 'Nome del canale',
                es: 'Nombre del canal',
                pl: 'Channel imię',
                'zh-cn': '姓名'
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true
        }
    },
    'Relay0.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        common: {
            name: 'Auto Timer Off',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true
        }
    },
    'Relay0.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        common: {
            name: 'Auto Timer On',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true
        }
    },
    'Relay0.Power': {
        coap: {
            coap_publish: '4101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/power',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W'
        }
    },
    'Relay0.Energy': {
        coap: {
            coap_publish: '4103', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/energy',
            mqtt_publish_funct: (value) => { return Math.round((value / 60) * 100) / 100; }
        },
        common: {
            name: 'Energy',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh'
        }
    },
    'Relay0.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay0.Timer'); }
        },
        mqtt: {
            no_display: true
        },
        common: {
            name: 'Duration',
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's'
        }
    },
    'Relay0.overpowerValue': {
        coap: {
            coap_publish: '6109', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/overpower_value',
        },
        common: {
            name: 'overpower Value',
            type: 'number',
            role: 'state',
            unit: 'W',
            read: true,
            write: false,
            def: 0
        }
    },
    'temperatureC': {
        coap: {
            coap_publish: '3104', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/temperature',
        },
        common: {
            name: {
                en: 'Temperature',
                de: 'Temperatur',
                ru: 'Температура',
                pt: 'Temperatura',
                nl: 'Temperatuur',
                fr: 'Température',
                it: 'Temperatura',
                es: 'Temperatura',
                pl: 'Temperatura',
                'zh-cn': '模范'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C'
        }
    },
    'temperatureF': {
        coap: {
            coap_publish: '3105', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/temperature',
            mqtt_publish_funct: (value) => { return shellyHelper.celsiusToFahrenheit(value); },
        },
        common: {
            name: {
                en: 'Temperature',
                de: 'Temperatur',
                ru: 'Температура',
                pt: 'Temperatura',
                nl: 'Temperatuur',
                fr: 'Température',
                it: 'Temperatura',
                es: 'Temperatura',
                pl: 'Temperatura',
                'zh-cn': '模范'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F'
        }
    },
    'overtemperature': {
        coap: {
            coap_publish: '6101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value == 1 ? true : false; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/overtemperature',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
        },
        common: {
            name: 'Temperature',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false
        }
    },
    'led_wifi_disable': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).led_status_disable : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { led_status_disable: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).led_status_disable : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { led_status_disable: value }; }
        },
        common: {
            name: 'Wi-Fi status light',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        }
    },
    'led_power_disable': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).led_power_disable : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { led_power_disable: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).led_power_disable : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { led_power_disable: value }; }
        },
        common: {
            name: 'Power status light',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        }
    },
};


module.exports = {
    shellyplugs: shellyplugs
};
