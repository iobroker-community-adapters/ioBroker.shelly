'use strict';

const shellyHelper = require('../../shelly-helper');

const shelly1l = {
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
    'Relay0.Event1': {
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
    'Relay0.EventCount1': {
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
    'Relay0.Input1': {
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
    'Relay0.Event2': {
        coap: {
            coap_publish: '2202'  // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
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
    'Relay0.EventCount2': {
        coap: {
            coap_publish: '2203' // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
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
    'Relay0.Input2': {
        coap: {
            coap_publish: '2201', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/1',
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
    'Relay0.Longpush1': {
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
    'Relay0.Longpush2': {
        coap: {
            coap_publish: '2202', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value == 'L' ? true : false; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/1',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false
        }
    },
    'Relay0.Longpushtime': {
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
            min: 1,
            max: 5000,
            read: true,
            write: true
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
    'Relay0.Button1Type': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn1_type : undefined; },
            http_cmd_funct: (value) => { return { btn1_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn1_type : undefined; },
            http_cmd_funct: (value) => { return { btn1_type: value }; }
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
    'Relay0.Button1Reverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn1_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn1_reverse: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn1_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn1_reverse: value }; }
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
    'Relay0.Button2Type': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn2_type : undefined; },
            http_cmd_funct: (value) => { return { btn2_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn2_type : undefined; },
            http_cmd_funct: (value) => { return { btn2_type: value }; }
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
    'Relay0.Button2Reverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn2_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn2_reverse: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn2_reverse : undefined; },
            http_cmd_funct: (value) => { return { btn2_reverse: value }; }
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
            name: 'Over Temperature',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false
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
    'ext.temperatureF1': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/0',
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
            unit: '°F'
        }
    },
    'ext.temperatureF2': {
        coap: {
            coap_publish: '3202', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/1',
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
            unit: '°F'
        }
    },
    'ext.temperatureF3': {
        coap: {
            coap_publish: '3302', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/2',
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
            unit: '°F'
        }
    },
    'ext.humidity1': {
        coap: {
            coap_publish: '3103', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/0',
            mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9.]/g, ''); }
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%'
        }
    },
    'ext.humidity2': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? shellyHelper.getExtHum(JSON.parse(value), '1') : undefined; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/1',
            mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9.]/g, ''); }
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%'
        }
    },
    'ext.humidity3': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? shellyHelper.getExtHum(JSON.parse(value), '2') : undefined; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/2',
            mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9.]/g, ''); }
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%'
        }
    },
    'factoryResetFromSwitch': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).factory_reset_from_switch : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { factory_reset_from_switch: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).factory_reset_from_switch : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { factory_reset_from_switch: value }; }
        },
        common: {
            name: 'Factory reset from switch',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        }
    }
};

module.exports = {
    shelly1l: shelly1l
};
