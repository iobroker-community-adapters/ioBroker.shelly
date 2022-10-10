'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly LED / SH2LED / shelly2led
 * CoAP:
 *
 * CoAP Version >= 1.8
 *  Shelly 2LED SH2LED-1:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"light_1"},{"I":3,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":3},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":1201,"T":"S","D":"output","R":"0/1","L":2},{"I":5201,"T":"S","D":"brightness","R":"0/100","L":2}]}
 */
const shelly2led = {
    'Sys.deviceMode': {
        coap: {
            init_funct: (self) => { return self.getDeviceMode(); },
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { mode: value }; },
        },
        mqtt: {
            init_funct: (self) => { return self.getDeviceMode(); },
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { mode: value }; },
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'color': 'color',
                'white': 'white',
            },
        },
    },
    'lights.Switch': {
        coap: {
            coap_publish: '1101', // Coap >= FW 1.8
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/command',
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
                'zh-cn': '目 录',
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
    'lights.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_off: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_off: value }; },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_on: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_on: value }; },
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
    'lights.red': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).red : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { red: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Red',
            type: 'number',
            role: 'level.color.red',
            read: true,
            write: true,
            min: 0,
            max: 255,
        },
    },
    'lights.green': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).green : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { green: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Green',
            type: 'number',
            role: 'level.color.green',
            read: true,
            write: true,
            min: 0,
            max: 255,
        },
    },
    'lights.blue': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).blue : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { blue: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).blue : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Blue',
            type: 'number',
            role: 'level.color.blue',
            read: true,
            write: true,
            min: 0,
            max: 255,
        },
    },
    'lights.white': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).white : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { white: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'White',
            type: 'number',
            role: 'level.color.white',
            read: true,
            write: true,
            min: 0,
            max: 255,
        },
    },
    'lights.gain': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).gain : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { gain: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).gain : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Gain',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
        },
    },
    'lights.temp': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).temp : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { temp: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).temp : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
        },
    },
    'lights.brightness': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: (value) => {
                return value ? JSON.parse(value).brightness : undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { brightness: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
        },
    },
    'lights.effect': {
        coap: {
            http_publish: '/settings/light/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { effect: value }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); },
        },
        common: {
            name: 'Effect',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            min: 0,
            max: 100,
            states: {
                0: 'Off',
                1: 'Meteor Shower',
                2: 'Gradual Change',
                3: 'Breath',
                4: 'Flash',
                5: 'On/Off Gradual',
                6: 'Red/Green Change',
            },
        },
    },
};

module.exports = {
    shelly2led: shelly2led,
};
