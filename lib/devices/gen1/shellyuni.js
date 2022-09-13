'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly UNI / SHUNI-1 / shellyuni
 * CoAP:
  *
 * CoAP Version >= 1.8
 *  Shelly UNI SHUNI-1:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":3,"D":"adc_0"},{"I":4,"D":"sensor_0"},{"I":5,"D":"sensor_1"},{"I":6,"D":"sensor_2"},{"I":7,"D":"sensor_3"},{"I":8,"D":"sensor_4"},{"I":9,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":9},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":1201,"T":"S","D":"output","R":"0/1","L":2},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":3118,"T":"V","D":"adc","U":"V","R":["0/30","-1"],"L":3},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":5},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":6},{"I":3401,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":7},{"I":3501,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":8},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":4}]}
 */
const shellyuni = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101', // Coap >= FW 1.8
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; }
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
    'Relay0.Event': {
        coap: {
            coap_publish: '2102'  // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'L': 'Long'
            }
        }
    },
    'Relay0.EventCount': {
        coap: {
            coap_publish: '2103' // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; }
        },
        common: {
            name: 'Event Counter',
            type: 'number',
            role: 'state',
            read: true,
            write: false
        }
    },
    'Relay0.longpush': {
        coap: {
            coap_publish: '2102', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value == 'L' ? true : false; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/0',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false
        }
    },
    'Relay0.longpushtime': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { longpush_time: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { longpush_time: value }; }
        },
        common: {
            name: 'Longpush Time',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 800,
            max: 5000,
            read: true,
            write: true
        }
    },
    'Relay0.Input': {
        coap: {
            coap_publish: '2101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/0',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
        },
        common: {
            name: 'Input / Detach',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false
        }
    },
    'Relay0.source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].source : undefined; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].source : undefined; },
        },
        common: {
            name: 'source of last command',
            type: 'string',
            role: 'state',
            read: true,
            write: false
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
    'Relay0.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action',
                'cycle': 'cycle',
                'momentary_on_release': 'momentary_on_release'
            }
        }
    },
    'Relay0.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn_reverse: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn_reverse: value }; }
        },
        common: {
            name: 'Button Type',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'normal',
                1: 'inverted'
            }
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
    'Relay1.Switch': {
        coap: {
            coap_publish: '1201', // Coap >= FW 1.8
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: '/relay/1',
            http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay1.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay1.Timer') }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/1',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/relay/1/command',
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
    'Relay1.ChannelName': {
        coap: {
            http_publish: '/settings/relay/1',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/1',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings/relay/1',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/1',
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
    'Relay1.Event': {
        coap: {
            coap_publish: '2202', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'L': 'Long'
            }
        }
    },
    'Relay1.EventCount': {
        coap: {
            coap_publish: '2203' // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; }
        },
        common: {
            name: 'Event Counter',
            type: 'number',
            role: 'state',
            read: true,
            write: false
        }
    },
    'Relay1.longpush': {
        coap: {
            coap_publish: '2202', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value == 'L' ? true : false; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/0',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false
        }
    },
    'Relay1.longpushtime': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { longpush_time: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { longpush_time: value }; }
        },
        common: {
            name: 'Longpush Time',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 800,
            max: 5000,
            read: true,
            write: true
        }
    },
    'Relay1.Input': {
        coap: {
            coap_publish: '2201', // Coap >= FW 1.8
            coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/1',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
        },
        common: {
            name: 'Input / Detach',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            states: {
                0: 'Input',
                1: 'Detach'
            }
            //def: false
        }
    },
    'Relay1.source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].source : undefined; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].source : undefined; },
        },
        common: {
            name: 'source of last command',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },
    'Relay1.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
            http_cmd: '/settings/relay/1',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
            http_cmd: '/settings/relay/1',
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
    'Relay1.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
            http_cmd: '/settings/relay/1',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
            http_cmd: '/settings/relay/1',
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
    'Relay1.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action',
                'cycle': 'cycle',
                'momentary_on_release': 'momentary_on_release'
            }
        }
    },
    'Relay1.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn_reverse: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn_reverse: value }; }
        },
        common: {
            name: 'Button Type',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'normal',
                1: 'inverted'
            }
        }
    },
    'Relay1.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay1.Timer'); }
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
    'ADC.Power': {
        coap: {
            coap_publish: '3118' // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/adc/0',
            mqtt_publish_funct: (value) => { return value ? parseFloat(value) : undefined; }
        },
        common: {
            name: 'Power Measurement',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            min: 0,
            max: 30,
            unit: 'V'
        }
    },
    'ADC.Range': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).adcs[0].range : undefined; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).adcs[0].range : undefined; },
        },
        common: {
            name: 'Power Range',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            min: 0,
            max: 30,
            unit: 'V'
        }
    },
    'ext.temperatureC1': {
        coap: {
            coap_publish: '3101', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/0',
            mqtt_publish_funct: (value) => { return parseFloat(value); },
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C'
        }
    },
    'ext.temperatureC2': {
        coap: {
            coap_publish: '3201', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/1',
            mqtt_publish_funct: (value) => { return parseFloat(value); },
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C'
        }
    },
    'ext.temperatureC3': {
        coap: {
            coap_publish: '3301', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/2',
            mqtt_publish_funct: (value) => { return parseFloat(value); },
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C'
        }
    },
    'ext.temperatureC4': {
        coap: {
            coap_publish: '3401', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/3',
            mqtt_publish_funct: (value) => { return parseFloat(value); },
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C'
        }
    },
    'ext.temperatureC5': {
        coap: {
            coap_publish: '3501', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/4',
            mqtt_publish_funct: (value) => { return parseFloat(value); },
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器'
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C'
        }
    },
    'ext.humidity': {
        coap: {
            coap_publish: '3103', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/0',
            mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9.]/g, ''); },
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            unit: '%'
        }
    },
};

module.exports = {
    shellyuni: shellyuni
};
