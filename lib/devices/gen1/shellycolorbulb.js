'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Color Bulb  / SHCB-1 / shellycolorbulb
 * CoAP:
 *  color: {"blk":[{"I":0,"D":"RGBW"}],"sen":[{"I":111,"T":"S","D":"Red","R":"0/255","L":0},{"I":121,"T":"S","D":"Green","R":"0/255","L":0},{"I":131,"T":"S","D":"Blue","R":"0/255","L":0},{"I":141,"T":"S","D":"White","R":"0/255","L":0},{"I":151,"T":"S","D":"Gain","R":"0/100","L":0},{"I":161,"T":"S","D":"Temp","R":"3000/6500","L":0},{"I":171,"T":"S","D":"Brightness","R":"0/100","L":0},{"I":181,"T":"S","D":"VSwitch","R":"0/1","L":0}]}
 *  white: {"blk":[{"I":0,"D":"RGBW"}],"sen":[{"I":111,"T":"S","D":"Red","R":"0/255","L":0},{"I":121,"T":"S","D":"Green","R":"0/255","L":0},{"I":131,"T":"S","D":"Blue","R":"0/255","L":0},{"I":141,"T":"S","D":"White","R":"0/255","L":0},{"I":151,"T":"S","D":"Gain","R":"0/100","L":0},{"I":161,"T":"S","D":"Temp","R":"3000/6500","L":0},{"I":171,"T":"S","D":"Brightness","R":"0/100","L":0},{"I":181,"T":"S","D":"VSwitch","R":"0/1","L":0}]}
 *
 * CoAP Version >= 1.8
 *  Shelly Bulb SHBLB-1 color-mode:   {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5105,"T":"S","D":"red","R":"0/255","L":1},{"I":5106,"T":"S","D":"green","R":"0/255","L":1},{"I":5107,"T":"S","D":"blue","R":"0/255","L":1},{"I":5108,"T":"S","D":"white","R":"0/255","L":1},{"I":5102,"T":"S","D":"gain","R":"0/100","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":5103,"T":"S","D":"colorTemp","U":"K","R":"3000/6500","L":1},{"I":9101,"T":"S","D":"mode","R":"color/white","L":1}]}
 *  Shelly Bulb SHBLB-1 white-mode:	  {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5105,"T":"S","D":"red","R":"0/255","L":1},{"I":5106,"T":"S","D":"green","R":"0/255","L":1},{"I":5107,"T":"S","D":"blue","R":"0/255","L":1},{"I":5108,"T":"S","D":"white","R":"0/255","L":1},{"I":5102,"T":"S","D":"gain","R":"0/100","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":5103,"T":"S","D":"colorTemp","U":"K","R":"3000/6500","L":1},{"I":9101,"T":"S","D":"mode","R":"color/white","L":1}]}
 */
const shellycolorbulb = {
    'Sys.deviceMode': {
        coap: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).mode : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ mode: value }),
        },
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).mode : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ mode: value }),
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
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
            http_cmd: '/color/0',
            http_cmd_funct: value => {
                return value === true ? { turn: 'on' } : { turn: 'off' };
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0',
            mqtt_publish_funct: value => value === 'on',
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/command',
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
    'lights.red': {
        coap: {
            coap_publish: '5105', //CoAP >= FW 1.8
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ red: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).red : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
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
            coap_publish: '5106', //CoAP >= FW 1.8
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ green: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).green : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
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
            coap_publish: '5107',
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ blue: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).blue : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
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
            coap_publish: '5108',
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ white: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).white : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
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
            coap_publish: '5102',
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ gain: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).gain : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
        },
        common: {
            name: 'Gain',
            type: 'number',
            role: 'level.color.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
        },
    },
    'lights.temp': {
        coap: {
            coap_publish: '5103',
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ temp: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).temp : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'level.color.temperature',
            read: true,
            write: true,
            unit: 'K',
        },
    },
    'lights.brightness': {
        coap: {
            coap_publish: '5101',
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ brightness: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).brightness : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'lights.effect': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: value => (value ? JSON.parse(value).effect : undefined),
            http_cmd: '/color/0',
            http_cmd_funct: value => ({ effect: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).effect : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectColor(self)),
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
    'lights.rgbw': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: async (value, self) => {
                return (await shellyHelper.getRGBW(self)) || undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: value => shellyHelper.getColorsFromRGBW(value),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: async (value, self) => {
                return (await shellyHelper.getRGBW(self)) || undefined;
            },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: value => JSON.stringify(shellyHelper.getColorsFromRGBW(value)),
        },
        common: {
            name: 'Color RGBW',
            type: 'string',
            role: 'level.color.rgbw',
            read: true,
            write: true,
        },
    },
    'lights.hue': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: async (value, self) => {
                return (await shellyHelper.getHsvFromRgb(self)).hue || undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value, self) => shellyHelper.getColorsFromHue(self),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: async (value, self) => {
                return (await shellyHelper.getHsvFromRgb(self)).hue || undefined;
            },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getColorsFromHue(self)),
        },
        common: {
            name: 'Hue',
            type: 'number',
            role: 'level.color.hue',
            min: 0,
            max: 360,
            read: true,
            write: true,
        },
    },
    'lights.saturation': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: async (value, self) => {
                return (await shellyHelper.getHsvFromRgb(self)).saturation || undefined;
            },
            http_cmd: '/color/0',
            http_cmd_funct: (value, self) => shellyHelper.getColorsFromHue(self),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: async (value, self) => {
                return (await shellyHelper.getHsvFromRgb(self)).saturation || undefined;
            },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getColorsFromHue(self)),
        },
        common: {
            name: 'Saturation',
            type: 'number',
            role: 'level.color.saturation',
            min: 0,
            max: 100,
            read: true,
            write: true,
        },
    },
    'lights.transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].transition : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ transition: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].transition : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ transition: value }),
        },
        common: {
            name: 'Transitions Time',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            unit: 'ms',
            min: 0,
            max: 5000,
        },
    },
    'metering.power': {
        coap: {
            coap_publish: '4101',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).meters[0].power : undefined),
        },
        common: {
            name: 'Actual consumed power in Watt',
            type: 'number',
            role: 'value',
            unit: 'W',
            read: true,
            write: false,
        },
    },
    'metering.energy': {
        coap: {
            coap_publish: '4103',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).meters[0].energy : undefined),
        },
        common: {
            name: 'Total energy consumed in Watt-minute',
            type: 'number',
            role: 'value.power.consumption',
            unit: 'Wmin',
            read: true,
            write: false,
        },
    },
    'metering.energy2': {
        coap: {
            coap_publish: '4103',
            coap_publish_funct: value => {
                return value * 0.000017;
            },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => {
                return value ? JSON.parse(value).meters[0].energy * 0.0000017 : undefined;
            },
        },
        common: {
            name: 'Total energy consumed in kWh',
            type: 'number',
            role: 'value.power.consumption',
            unit: 'kWh',
            read: true,
            write: false,
        },
    },
};

module.exports = {
    shellycolorbulb,
};
