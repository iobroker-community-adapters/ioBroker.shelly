import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelper from '../../shelly-helper';

/**
 * Shelly Dimmer / SHDM-1 / shellydimmer
 * CoAP:
 *  {"3332":"SHDM-1#D47EBD#1"} / {"blk":[{"I":0,"D":"Dimmer"}],"sen":[{"I":111,"T":"S","D":"Brightness","R":"0/100","L":0},{"I":121,"T":"S","D":"State","R":"0/1","L":0},{"I":131,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0},{"I":141,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0},{"I":211,"T":"S","D":"Energy counter 0 [W-min]","L":0},{"I":212,"T":"S","D":"Energy counter 1 [W-min]","L":0},{"I":213,"T":"S","D":"Energy counter 2 [W-min]","L":0},{"I":214,"T":"S","D":"Energy counter total [W-min]","L":0},{"I":311,"T":"T","D":"Temperature C","R":"-40/300","L":0},{"I":312,"T":"T","D":"Temperature F","R":"-40/300","L":0},{"I":313,"T":"S","D":"Overtemp","R":"0/1","L":0}]}
 *
 * CoAP Version >= 1.8
 *  Shelly Dimmer SHDM-1:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"input_0"},{"I":3,"D":"input_1"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5101,"T":"S","D":"brightness","R":"1/100","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":2},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":2201,"T":"S","D":"input","R":"0/1","L":3},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":3},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":3},{"I":4101,"T":"P","D":"power","U":"W","R":["0/230","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6104,"T":"A","D":"loadError","R":"0/1","L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":4},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":4},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":4},{"I":9101,"T":"S","D":"mode","R":"color/white","L":4}]}
 */
const shellydimmer: DeviceDefinition = {
    'Sys.deviceMode': {
        coap: {
            init_funct: self => self.getDeviceMode(),
            coap_publish: '9101',
        },
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).mode : undefined),
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                color: 'color',
                white: 'white',
            },
        },
    },
    'lights.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: value => value == 1,
            http_cmd: '/light/0',
            http_cmd_funct: value => {
                return value === true ? { turn: 'on' } : { turn: 'off' };
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).ison === true : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/command',
            mqtt_cmd_funct: value => (value === true ? 'on' : 'off'),
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
    'lights.MinBrightness': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).min_brightness : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).min_brightness : undefined),
        },
        common: {
            name: 'Minimum Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'lights.Source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => {
                return value ? JSON.parse(value).lights[0].source : undefined;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/source',
            mqtt_publish_funct: value => {
                return JSON.parse(value).lights[0].source;
            },
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'lights.ChannelName': {
        coap: {
            http_publish: '/settings/light/0',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'lights', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/light/0',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'lights', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'lights.brightness': {
        coap: {
            coap_publish: '5101',
            http_cmd: '/light/0',
            http_cmd_funct: value => ({ brightness: Math.round(value) }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).brightness : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/set',
            mqtt_cmd_funct: value => {
                return value >= 0 ? JSON.stringify({ brightness: Math.round(value) }) : undefined;
            },
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 1,
            max: 100,
            unit: '%',
        },
    },
    'lights.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_off : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ auto_off: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_off : undefined),
            http_cmd: '/settings/light/0',
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
    'lights.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_on : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ auto_on: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_on : undefined),
            http_cmd: '/settings/light/0',
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
    'lights.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].btn_type : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].btn_type : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ btn_type: value }),
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                one_button: 'one_button',
                dual_button: 'dual_button',
                toggle: 'toggle',
                edge: 'edge',
                detached: 'detached',
                action: 'action',
            },
        },
    },
    'lights.Power': {
        coap: {
            coap_publish: '4101',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/power',
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
    'lights.Energy': {
        coap: {
            coap_publish: '4103',
            coap_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => {
                return value ? Math.round((JSON.parse(value).meters[0].total / 60) * 100) / 100 : undefined;
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
    'lights.Event1': {
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
    'lights.EventCount1': {
        coap: {
            coap_publish: '2103', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event_cnt : undefined),
        },
        common: {
            name: 'Event count',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'lights.Input1': {
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
            name: 'Input mode',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'lights.longpush1': {
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
            def: false,
        },
    },
    'lights.Event2': {
        coap: {
            coap_publish: '2202', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
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
    'lights.EventCount2': {
        coap: {
            coap_publish: '2203', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event_cnt : undefined),
        },
        common: {
            name: 'Event count',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'lights.Input2': {
        coap: {
            coap_publish: '2201',
            coap_publish_funct: value => {
                return value === 1 || value === 2;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/1',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Input mode',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'lights.longpush2': {
        coap: {
            coap_publish: '2202',
            coap_publish_funct: value => value == 'L',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/1',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'lights.Transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).transition : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).transition : undefined),
        },
        common: {
            name: 'Fade Rate',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            unit: 'ms',
            min: 0,
            max: 5000,
        },
    },
    'lights.FadeRate': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).fade_rate : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).fade_rate : undefined),
        },
        common: {
            name: 'Transitions Time',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
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
            name: 'Temperature',
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
            mqtt_publish: 'shellies/<mqttprefix>/temperature_f',
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    overtemperature: {
        coap: {
            coap_publish: '6106',
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
            name: 'Factory reset by switch',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
};

export { shellydimmer };
