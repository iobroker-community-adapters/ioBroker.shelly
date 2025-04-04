'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Switch PM 1 / SHSW-PM / shelly1pm
 * CoAP:
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Sensors"}],"sen":[{"I":111,"T":"P","D":"Power","R":"0/3500","L":0},{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":113,"T":"T","D":"Temperature C","R":"-40/300","L":0},{"I":114,"T":"T","D":"Temperature F","R":"-40/300","L":0},{"I":115,"T":"S","D":"Overtemp","R":"0/1","L":0},{"I":118,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0},{"I":211,"T":"S","D":"Energy counter 0 [W-min]","L":0},{"I":212,"T":"S","D":"Energy counter 1 [W-min]","L":0},{"I":213,"T":"S","D":"Energy counter 2 [W-min]","L":0},{"I":214,"T":"S","D":"Energy counter total [W-min]","L":0}]}
 *
 * CoAP Version >= 1.8
 *  Shelly 1PM SHSW-PM with-dht22:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1PM SHSW-PM no-addon:      {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1PM SHSW-PM with-ds1820:   {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1PM SHSW-PM with-lp-input: {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 */
const shelly1pm = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: value => value == 1,
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => {
                return value === true
                    ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }
                    : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') };
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: value => value === 'on',
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
            mqtt_cmd_funct: value => (value === true ? 'on' : 'off'),
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
                'zh-cn': '目 录',
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
    'Relay0.ChannelName': {
        coap: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ name: value }),
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
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Relay0.Event': {
        coap: {
            coap_publish: '2102', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event : undefined),
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                S: '1xShort',
                L: 'Long',
            },
        },
    },
    'Relay0.EventCount': {
        coap: {
            coap_publish: '2103', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event_cnt : undefined),
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: "Compte de l'événement",
                it: 'Conteggio eventi',
                es: 'Conteo de eventos',
                pl: 'Event',
                'zh-cn': '活动',
            },
            type: 'number',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Relay0.longpush': {
        coap: {
            coap_publish: '2102',
            coap_publish_funct: value => value == 'L',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/0',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Relay0.longpushtime': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_time: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_time: value }),
        },
        common: {
            name: 'Longpush Time',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 1,
            max: 5000,
            read: true,
            write: true,
        },
    },
    'Relay0.Input': {
        coap: {
            coap_publish: '2101',
            coap_publish_funct: value => {
                return value === 1 || value === 2;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/0',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: {
                en: 'Input mode',
                de: 'Eingangsmodus',
                ru: 'Входной режим',
                pt: 'Modo de entrada',
                nl: 'Input modus',
                fr: "Mode d ' entrée",
                it: 'Modalità di ingresso',
                es: 'Modo de entrada',
                pl: 'Tryb gry',
                'zh-cn': '投入模式',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'Relay0.source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].source : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].source : undefined),
        },
        common: {
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
                es: 'Fuente del último comando',
                pl: 'Źródło ostatniego dowództwa',
                'zh-cn': '最后一次指挥的来源',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    'Relay0.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_off : undefined),
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ auto_off: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_off : undefined),
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ auto_off: value }),
        },
        common: {
            name: 'Auto Timer Off',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    },
    'Relay0.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_on : undefined),
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ auto_on: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_on : undefined),
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ auto_on: value }),
        },
        common: {
            name: 'Auto Timer On',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    },
    'Relay0.Power': {
        coap: {
            coap_publish: '4101',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/power',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Relay0.Energy': {
        coap: {
            coap_publish: '4103',
            coap_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/energy',
            mqtt_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        common: {
            name: 'Energy',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Relay0.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                momentary: 'momentary',
                toggle: 'toggle',
                edge: 'edge',
                detached: 'detached',
                action: 'action',
                cycle: 'cycle',
                momentary_on_release: 'momentary_on_release',
            },
        },
    },
    'Relay0.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        common: {
            name: 'Button Type',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'normal',
                1: 'inverted',
            },
        },
    },
    'Relay0.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => shellyHelper.getSetDuration(self, 'Relay0.Timer'),
        },
        mqtt: {
            no_display: true,
        },
        common: {
            name: {
                en: 'Duration',
                de: 'Dauer',
                ru: 'Продолжительность',
                pt: 'Duração',
                nl: 'Vertaling:',
                fr: 'Durée',
                it: 'Durata',
                es: 'Duración',
                pl: 'Duracja',
                'zh-cn': '期间',
            },
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    },
    'Relay0.overpowerValue': {
        coap: {
            coap_publish: '6109',
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
            def: 0,
        },
    },
    temperatureC: {
        coap: {
            coap_publish: '3104',
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
                'zh-cn': '模范',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    temperatureF: {
        coap: {
            coap_publish: '3105',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/temperature',
            mqtt_publish_funct: value => shellyHelper.celsiusToFahrenheit(value),
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
                'zh-cn': '模范',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    overtemperature: {
        coap: {
            coap_publish: '6101',
            coap_publish_funct: value => value == 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/overtemperature',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Over Temperature',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    maxPower: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).max_power : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ max_power: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).max_power : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ max_power: value }),
        },
        common: {
            name: 'max. Power',
            type: 'number',
            role: 'state',
            unit: 'W',
            read: true,
            write: true,
        },
    },
    overpower: {
        coap: {
            coap_publish: '6102',
            coap_publish_funct: value => value == 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/overpower',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Overpower',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'ext.temperatureC1': {
        coap: {
            coap_publish: '3101',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/0',
            mqtt_publish_funct: value => parseFloat(value),
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
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'ext.temperatureC2': {
        coap: {
            coap_publish: '3201',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/1',
            mqtt_publish_funct: value => parseFloat(value),
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
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'ext.temperatureC3': {
        coap: {
            coap_publish: '3301',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/2',
            mqtt_publish_funct: value => parseFloat(value),
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
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'ext.temperatureF1': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/0',
            mqtt_publish_funct: value => parseFloat(value),
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
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    'ext.temperatureF2': {
        coap: {
            coap_publish: '3202',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/1',
            mqtt_publish_funct: value => parseFloat(value),
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
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    'ext.temperatureF3': {
        coap: {
            coap_publish: '3302',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/2',
            mqtt_publish_funct: value => parseFloat(value),
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
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    'ext.temperatureOffsetC1': {
        coap: {
            http_publish: '/settings/ext_temperature/0',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tC : undefined),
            http_cmd: '/settings/ext_temperature/0',
            http_cmd_funct: value => ({ offset_tC: value }),
        },
        mqtt: {
            http_publish: '/settings/ext_temperature/0',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tC : undefined),
            http_cmd: '/settings/ext_temperature/0',
            http_cmd_funct: value => ({ offset_tC: value }),
        },
        common: {
            name: {
                en: 'External sensor temperature offset',
                de: 'Externer Sensor Temperaturversatz',
                ru: 'Внешний датчик температуры компенсации',
                pt: 'Compensação da temperatura do sensor externo',
                nl: 'Externe sensortemperatuur',
                fr: 'Régulateur de température du capteur externe',
                it: 'Interruttore di temperatura del sensore esterno',
                es: 'Offset de temperatura del sensor externo',
                pl: 'Sensor temperature offset',
                'zh-cn': '外部因素',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
        },
    },
    'ext.temperatureOffsetF1': {
        coap: {
            http_publish: '/settings/ext_temperature/0',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tF : undefined),
            http_cmd: '/settings/ext_temperature/0',
            http_cmd_funct: value => ({ offset_tF: value }),
        },
        mqtt: {
            http_publish: '/settings/ext_temperature/0',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tF : undefined),
            http_cmd: '/settings/ext_temperature/0',
            http_cmd_funct: value => ({ offset_tF: value }),
        },
        common: {
            name: {
                en: 'External sensor temperature offset',
                de: 'Externer Sensor Temperaturversatz',
                ru: 'Внешний датчик температуры компенсации',
                pt: 'Compensação da temperatura do sensor externo',
                nl: 'Externe sensortemperatuur',
                fr: 'Régulateur de température du capteur externe',
                it: 'Interruttore di temperatura del sensore esterno',
                es: 'Offset de temperatura del sensor externo',
                pl: 'Sensor temperature offset',
                'zh-cn': '外部因素',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°F',
        },
    },
    'ext.temperatureOffsetC2': {
        coap: {
            http_publish: '/settings/ext_temperature/1',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tC : undefined),
            http_cmd: '/settings/ext_temperature/1',
            http_cmd_funct: value => ({ offset_tC: value }),
        },
        mqtt: {
            http_publish: '/settings/ext_temperature/1',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tC : undefined),
            http_cmd: '/settings/ext_temperature/1',
            http_cmd_funct: value => ({ offset_tC: value }),
        },
        common: {
            name: {
                en: 'External sensor temperature offset',
                de: 'Externer Sensor Temperaturversatz',
                ru: 'Внешний датчик температуры компенсации',
                pt: 'Compensação da temperatura do sensor externo',
                nl: 'Externe sensortemperatuur',
                fr: 'Régulateur de température du capteur externe',
                it: 'Interruttore di temperatura del sensore esterno',
                es: 'Offset de temperatura del sensor externo',
                pl: 'Sensor temperature offset',
                'zh-cn': '外部因素',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
        },
    },
    'ext.temperatureOffsetF2': {
        coap: {
            http_publish: '/settings/ext_temperature/1',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tF : undefined),
            http_cmd: '/settings/ext_temperature/1',
            http_cmd_funct: value => ({ offset_tF: value }),
        },
        mqtt: {
            http_publish: '/settings/ext_temperature/1',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tF : undefined),
            http_cmd: '/settings/ext_temperature/1',
            http_cmd_funct: value => ({ offset_tF: value }),
        },
        common: {
            name: {
                en: 'External sensor temperature offset',
                de: 'Externer Sensor Temperaturversatz',
                ru: 'Внешний датчик температуры компенсации',
                pt: 'Compensação da temperatura do sensor externo',
                nl: 'Externe sensortemperatuur',
                fr: 'Régulateur de température du capteur externe',
                it: 'Interruttore di temperatura del sensore esterno',
                es: 'Offset de temperatura del sensor externo',
                pl: 'Sensor temperature offset',
                'zh-cn': '外部因素',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°F',
        },
    },
    'ext.temperatureOffsetC3': {
        coap: {
            http_publish: '/settings/ext_temperature/2',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tC : undefined),
            http_cmd: '/settings/ext_temperature/2',
            http_cmd_funct: value => ({ offset_tC: value }),
        },
        mqtt: {
            http_publish: '/settings/ext_temperature/2',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tC : undefined),
            http_cmd: '/settings/ext_temperature/2',
            http_cmd_funct: value => ({ offset_tC: value }),
        },
        common: {
            name: {
                en: 'External sensor temperature offset',
                de: 'Externer Sensor Temperaturversatz',
                ru: 'Внешний датчик температуры компенсации',
                pt: 'Compensação da temperatura do sensor externo',
                nl: 'Externe sensortemperatuur',
                fr: 'Régulateur de température du capteur externe',
                it: 'Interruttore di temperatura del sensore esterno',
                es: 'Offset de temperatura del sensor externo',
                pl: 'Sensor temperature offset',
                'zh-cn': '外部因素',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
        },
    },
    'ext.temperatureOffsetF3': {
        coap: {
            http_publish: '/settings/ext_temperature/2',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tF : undefined),
            http_cmd: '/settings/ext_temperature/2',
            http_cmd_funct: value => ({ offset_tF: value }),
        },
        mqtt: {
            http_publish: '/settings/ext_temperature/2',
            http_publish_funct: value => (value ? JSON.parse(value)?.offset_tF : undefined),
            http_cmd: '/settings/ext_temperature/2',
            http_cmd_funct: value => ({ offset_tF: value }),
        },
        common: {
            name: {
                en: 'External sensor temperature offset',
                de: 'Externer Sensor Temperaturversatz',
                ru: 'Внешний датчик температуры компенсации',
                pt: 'Compensação da temperatura do sensor externo',
                nl: 'Externe sensortemperatuur',
                fr: 'Régulateur de température du capteur externe',
                it: 'Interruttore di temperatura del sensore esterno',
                es: 'Offset de temperatura del sensor externo',
                pl: 'Sensor temperature offset',
                'zh-cn': '外部因素',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°F',
        },
    },
    'ext.humidity1': {
        coap: {
            coap_publish: '3103',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/0',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'ext.humidity2': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtHum(JSON.parse(value), '1') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/1',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'ext.humidity3': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtHum(JSON.parse(value), '2') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_humidity/2',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: 'External Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'ext.switch1': {
        coap: {
            coap_publish: '3117',
            coap_publish_funct: value => value == 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_switch/0',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: false,
            def: false,
        },
    },
    factoryResetFromSwitch: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).factory_reset_from_switch : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ factory_reset_from_switch: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).factory_reset_from_switch : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ factory_reset_from_switch: value }),
        },
        common: {
            name: {
                en: 'Factory reset by switch',
                de: 'Werkseinstellungen durch Schalter',
                ru: 'Сброс завода с помощью переключателя',
                pt: 'Restauração de fábrica por interruptor',
                nl: 'Factorie reset',
                fr: 'Réinitialisation en usine par interrupteur',
                it: 'Ripristino della fabbrica tramite interruttore',
                es: 'Ajuste de fábrica por interruptor',
                pl: 'Powstań zakładowa',
                'zh-cn': '转换引起的因素',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
};

module.exports = {
    shelly1pm,
};
