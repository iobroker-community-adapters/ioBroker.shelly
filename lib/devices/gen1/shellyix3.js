'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly IX3 / SHIX3-1 / shellyix3
 * CoAP:
  *
 * CoAP Version >= 1.8
 *  Shelly i3 SHIX3-1:    {"blk":[{"I":1,"D":"input_0"},{"I":2,"D":"input_1"},{"I":3,"D":"input_2"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS/SL/LS",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS/SL/LS",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":2301,"T":"S","D":"input","R":"0/1","L":3},{"I":2302,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS/SL/LS",""],"L":3},{"I":2303,"T":"EVC","D":"inputEventCnt","R":"U16","L":3}]}
 */
const shellyix3 = {
    'longpushDurationMsMin': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value)?.longpush_duration_ms?.min : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_duration_ms_min: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value)?.longpush_duration_ms?.min : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_duration_ms_min: value }),
        },
        common: {
            name: 'Longpush min. duration',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 100,
            max: 3000,
            read: true,
            write: true,
        },
    },
    'longpushDurationMsMax': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value)?.longpush_duration_ms?.max : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_duration_ms_max: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value)?.longpush_duration_ms?.max : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_duration_ms_max: value }),
        },
        common: {
            name: 'Longpush max. duration',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 800,
            max: 3200,
            read: true,
            write: true,
        },
    },
    'multipushTimeBetweenPushesMsMax': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value)?.multipush_time_between_pushes_ms?.max : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ multipush_time_between_pushes_ms_max: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value)?.multipush_time_between_pushes_ms?.max : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ multipush_time_between_pushes_ms_max: value }),
        },
        common: {
            name: 'Max time between sequential pushes',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 1,
            max: 1000,
            read: true,
            write: true,
        },
    },
    'Relay0.ChannelName': {
        coap: {
            http_publish: '/settings/input/0',
            http_publish_funct: async (value, self) => value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/input/0',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/input/0',
            http_publish_funct: async (value, self) => value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/input/0',
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
    'Relay0.Input': {
        coap: {
            coap_publish: '2101',
            coap_publish_funct: value => value == 1,
            http_cmd: '/input/0',
            http_cmd_funct: value => ({ input: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/0',
            mqtt_publish_funct: value => value == 1,
            http_cmd: '/input/0',
            http_cmd_funct: value => ({ input: value }),
        },
        common: {
            name: 'Input On / Off',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Relay0.Event': {
        coap: {
            coap_publish: '2102',  // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => value ? JSON.parse(value).event : undefined,
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'SS': '2xShort',
                'SSS': '3xShort',
                'SL': 'Short Long',
                'LS': 'Long Short',
                'L': 'Long',
            },
        },
    },
    'Relay0.EventCount': {
        coap: {
            coap_publish: '2103',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => value ? JSON.parse(value).event_cnt : undefined,
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: 'Compte de l\'événement',
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
    'Relay0.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[0].btn_type : undefined,
            http_cmd: '/settings/input/0',
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[0].btn_type : undefined,
            http_cmd: '/settings/input/0',
            http_cmd_funct: value => ({ btn_type: value }),
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
            },
        },
    },
    'Relay0.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[0].btn_reverse : undefined,
            http_cmd: '/settings/input/0',
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[0].btn_reverse : undefined,
            http_cmd: '/settings/input/0',
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
    'Relay1.ChannelName': {
        coap: {
            http_publish: '/settings/input/1',
            http_publish_funct: async (value, self) => value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/input/1',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/input/1',
            http_publish_funct: async (value, self) => value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/input/1',
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
    'Relay1.Input': {
        coap: {
            coap_publish: '2201',
            coap_publish_funct: value => value == 1,
            http_cmd: '/input/1',
            http_cmd_funct: value => ({ input: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/1',
            mqtt_publish_funct: value => value == 1,
            http_cmd: '/input/1',
            http_cmd_funct: value => ({ input: value }),
        },
        common: {
            name: 'Input On / Off',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'Off',
                1: 'On',
            },
        },
    },
    'Relay1.Event': {
        coap: {
            coap_publish: '2202',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
            mqtt_publish_funct: value => value ? JSON.parse(value).event : undefined,
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'SS': '2xShort',
                'SSS': '3xShort',
                'SL': 'Short Long',
                'LS': 'Long Short',
                'L': 'Long',
            },
        },
    },
    'Relay1.EventCount': {
        coap: {
            coap_publish: '2203',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
            mqtt_publish_funct: value => value ? JSON.parse(value).event_cnt : undefined,
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: 'Compte de l\'événement',
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
    'Relay1.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[1].btn_type : undefined,
            http_cmd: '/settings/input/1',
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[1].btn_type : undefined,
            http_cmd: '/settings/input/1',
            http_cmd_funct: value => ({ btn_type: value }),
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
            },
        },
    },
    'Relay1.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[1].btn_reverse : undefined,
            http_cmd: '/settings/input/1',
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[1].btn_reverse : undefined,
            http_cmd: '/settings/input/1',
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
    'Relay2.ChannelName': {
        coap: {
            http_publish: '/settings/input/2',
            http_publish_funct: async (value, self) => value ? await shellyHelper.setChannelName(self, 'Relay2', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/input/2',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/input/2',
            http_publish_funct: async (value, self) => value ? await shellyHelper.setChannelName(self, 'Relay2', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/input/2',
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
    'Relay2.Input': {
        coap: {
            coap_publish: '2301',
            coap_publish_funct: value => value == 1,
            http_cmd: '/input/2',
            http_cmd_funct: value => ({ input: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/2',
            mqtt_publish_funct: value => value == 1,
            http_cmd: '/input/2',
            http_cmd_funct: value => ({ input: value }),
        },
        common: {
            name: 'Input On / Off',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'Off',
                1: 'On',
            },
        },
    },
    'Relay2.Event': {
        coap: {
            coap_publish: '2302',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/2',
            mqtt_publish_funct: value => value ? JSON.parse(value).event : undefined,
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'SS': '2xShort',
                'SSS': '3xShort',
                'SL': 'Short Long',
                'LS': 'Long Short',
                'L': 'Long',
            },
        },
    },
    'Relay2.EventCount': {
        coap: {
            coap_publish: '2303',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/2',
            mqtt_publish_funct: value => value ? JSON.parse(value).event_cnt : undefined,
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: 'Compte de l\'événement',
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
    'Relay2.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[2].btn_type : undefined,
            http_cmd: '/settings/input/2',
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[2].btn_type : undefined,
            http_cmd: '/settings/input/2',
            http_cmd_funct: value => ({ btn_type: value }),
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
            },
        },
    },
    'Relay2.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[2].btn_reverse : undefined,
            http_cmd: '/settings/input/2',
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).inputs[2].btn_reverse : undefined,
            http_cmd: '/settings/input/2',
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
};

module.exports = {
    shellyix3,
};
