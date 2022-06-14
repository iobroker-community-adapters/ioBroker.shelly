'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly RGBW2 / SHRGBW2 / shellyrgbw2
 * CoAP:
 *  white : {"blk":[{"I":0,"D":"RGBW2"}],"sen":[{"I":118,"T":"S","D":"Input","R":"0/1","L":0},{"I":111,"T":"S","D":"Brightness_0","R":"0/100","L":0},{"I":121,"T":"S","D":"Brightness_1","R":"0/100","L":0},{"I":131,"T":"S","D":"Brightness_2","R":"0/100","L":0},{"I":141,"T":"S","D":"Brightness_3","R":"0/100","L":0},{"I":151,"T":"S","D":"VSwitch_0","R":"0/1","L":0},{"I":161,"T":"S","D":"VSwitch_1","R":"0/1","L":0},{"I":171,"T":"S","D":"VSwitch_2","R":"0/1","L":0},{"I":181,"T":"S","D":"VSwitch_3","R":"0/1","L":0},{"I":211,"T":"P","D":"Power_0","R":"0/288","L":0},{"I":221,"T":"P","D":"Power_1","R":"0/288","L":0},{"I":231,"T":"P","D":"Power_2","R":"0/288","L":0},{"I":241,"T":"P","D":"Power_3","R":"0/288","L":0}]}
 *  color : {"blk":[{"I":0,"D":"RGBW2"}],"sen":[{"I":118,"T":"S","D":"Input","R":"0/1","L":0},{"I":111,"T":"S","D":"Red","R":"0/255","L":0},{"I":121,"T":"S","D":"Green","R":"0/255","L":0},{"I":131,"T":"S","D":"Blue","R":"0/255","L":0},{"I":141,"T":"S","D":"White","R":"0/255","L":0},{"I":151,"T":"S","D":"Gain","R":"0/100","L":0},{"I":161,"T":"S","D":"VSwitch","R":"0/1","L":0},{"I":211,"T":"P","D":"Power","R":"0/288","L":0}]}
 *
 * CoAP Version >= 1.8
 *  Shelly RGBW2-white SHRGBW2-white:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"light_1"},{"I":3,"D":"light_2"},{"I":4,"D":"light_3"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":1201,"T":"S","D":"output","R":"0/1","L":2},{"I":5201,"T":"S","D":"brightness","R":"0/100","L":2},{"I":1301,"T":"S","D":"output","R":"0/1","L":3},{"I":5301,"T":"S","D":"brightness","R":"0/100","L":3},{"I":1401,"T":"S","D":"output","R":"0/1","L":4},{"I":5401,"T":"S","D":"brightness","R":"0/100","L":4},{"I":4101,"T":"P","D":"power","U":"W","R":["0/288","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":4201,"T":"P","D":"power","U":"W","R":["0/288","-1"],"L":2},{"I":4203,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":2},{"I":4301,"T":"P","D":"power","U":"W","R":["0/288","-1"],"L":3},{"I":4303,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":3},{"I":4401,"T":"P","D":"power","U":"W","R":["0/288","-1"],"L":4},{"I":4403,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":4},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":5},{"I":2101,"T":"S","D":"input","R":"0/1","L":5},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":5},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":5},{"I":9101,"T":"S","D":"mode","R":"color/white","L":5}]}
 *  Shelly RGBW2-color SHRGBW2-color:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5105,"T":"S","D":"red","R":"0/255","L":1},{"I":5106,"T":"S","D":"green","R":"0/255","L":1},{"I":5107,"T":"S","D":"blue","R":"0/255","L":1},{"I":5108,"T":"S","D":"white","R":"0/255","L":1},{"I":5102,"T":"S","D":"gain","R":"0/100","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/288","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":2},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":9101,"T":"S","D":"mode","R":"color/white","L":2}]}
 */
const shellyrgbw2 = {
    'lights.Switch': {
        coap: {
            coap_publish: '1101', // CoAP >= FW 1.8
            coap_publish_funct: async (value) => { return value == 1 ? true : false; },
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
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    },
    'lights.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
            http_cmd: '/settings/color/0',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
            http_cmd: '/settings/color/0',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        common: {
            'name': 'Auto Timer Off',
            'type': 'number',
            'role': 'level.timer',
            'def': 0,
            'unit': 's',
            'read': true,
            'write': true
        }
    },
    'lights.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
            http_cmd: '/settings/color/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
            http_cmd: '/settings/color/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        common: {
            'name': 'Auto Timer On',
            'type': 'number',
            'role': 'level.timer',
            'def': 0,
            'unit': 's',
            'read': true,
            'write': true
        }
    },
    'lights.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/color/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/color/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            'name': 'Button Type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action'
            }
        }
    },
    'lights.Transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/color/0',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/color/0',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        common: {
            'name': 'Transition Time',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': true,
            'min': 0,
            'max': 5000,
            'unit': 'ms'
        }
    },
    'lights.red': {
        coap: {
            coap_publish: '5105', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { red: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
        },
        common: {
            'name': 'Red',
            'type': 'number',
            'role': 'level.color.red',
            'read': true,
            'write': true,
            'min': 0,
            'max': 255
        }
    },
    'lights.green': {
        coap: {
            coap_publish: '5106', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { green: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
        },
        common: {
            'name': 'Green',
            'type': 'number',
            'role': 'level.color.green',
            'read': true,
            'write': true,
            'min': 0,
            'max': 255
        }
    },
    'lights.blue': {
        coap: {
            coap_publish: '5107', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { blue: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).blue : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
        },
        common: {
            'name': 'Blue',
            'type': 'number',
            'role': 'level.color.blue',
            'read': true,
            'write': true,
            'min': 0,
            'max': 255
        }
    },
    'lights.white': {
        coap: {
            coap_publish: '5108', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { white: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
        },
        common: {
            'name': 'White',
            'type': 'number',
            'role': 'level.color.white',
            'read': true,
            'write': true,
            'min': 0,
            'max': 255
        }
    },
    'lights.gain': {
        coap: {
            coap_publish: '5102', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { gain: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).gain : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
        },
        common: {
            'name': 'Gain',
            'type': 'number',
            'role': 'level.brightness',
            'read': true,
            'write': true,
            'min': 0,
            'max': 100
        }
    },
    'lights.effect': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].effect : undefined; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return { effect: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
        },
        common: {
            'name': 'Effect',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': true,
            'min': 0,
            'max': 100,
            'states': {
                0: 'Off',
                1: 'Meteor Shower',
                2: 'Gradual Change',
                3: 'Flash'
            }
        }
    },
    'lights.rgbw': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: async (value, self) => { return await shellyHelper.getRGBW(self) || undefined; },
            http_cmd: '/color/0',
            http_cmd_funct: async (value) => { return shellyHelper.getColorsFromRGBW(value); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: async (value, self) => { return await shellyHelper.getRGBW(self) || undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value) => { return JSON.stringify(shellyHelper.getColorsFromRGBW(value)); }
        },
        common: {
            'name': 'Color RGBW',
            'type': 'string',
            'role': 'level.color.rgb',
            'read': false,
            'write': true
        }
    },
    'lights.hue': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).hue || undefined; },
            http_cmd: '/color/0',
            http_cmd_funct: async (value, self) => { return await shellyHelper.getColorsFromHue(self); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).hue || undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getColorsFromHue(self)); }
        },
        common: {
            'name': 'Hue',
            'type': 'number',
            'role': 'level.color.hue',
            'min': 0,
            'max': 360,
            'read': false,
            'write': true
        }
    },
    'lights.saturation': {
        coap: {
            http_publish: '/color/0',
            http_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).saturation || undefined; },
            http_cmd: '/color/0',
            http_cmd_funct: async (value, self) => { return await shellyHelper.getColorsFromHue(self); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0/status',
            mqtt_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).saturation || undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getColorsFromHue(self)); }
        },
        common: {
            'name': 'Saturation',
            'type': 'number',
            'role': 'level.color.saturation',
            'min': 0,
            'max': 100,
            'read': false,
            'write': true
        }
    },
    'white0.Switch': {
        coap: {
            coap_publish: '1101', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value === 1 ? true : false; },
            http_cmd: '/white/0',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/0/status',
            mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/0/set',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    },
    'lights.power': {
        coap: {
            coap_publish: '4101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).total_power : undefined; },
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'white0.power': {
        coap: {
            no_display: true
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).power : undefined; },
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'white0.brightness': {
        coap: {
            coap_publish: '5101', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value; },
            http_cmd: '/white/0',
            http_cmd_funct: (value) => { return { brightness: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/0/set',
            mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
        },
        common: {
            'name': 'Brightness',
            'type': 'number',
            'role': 'level.brightness',
            'read': true,
            'write': true,
            'min': 0,
            'max': 100
        }
    },
    'white0.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/white/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/white/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            'name': 'Button Type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action'
            }
        }
    },
    'white0.Transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/0',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/0',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        common: {
            'name': 'Transition Time',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': true,
            'unit': 'ms'
        }
    },
    'white1.power': {
        coap: {
            no_display: true
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/1/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).power : undefined; },
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'white1.Switch': {
        coap: {
            coap_publish: '1201', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value === 1 ? true : false; },
            http_cmd: '/white/1',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/1/status',
            mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/1/set',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    },
    'white1.brightness': {
        coap: {
            coap_publish: '5201', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value; },
            http_cmd: '/white/1',
            http_cmd_funct: (value) => { return { brightness: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/1/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/1/set',
            mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
        },
        common: {
            'name': 'Brightness',
            'type': 'number',
            'role': 'level.brightness',
            'read': true,
            'write': true,
            'min': 0,
            'max': 100
        }
    },
    'white1.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/white/1',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/white/1',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            'name': 'Button Type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action'
            }
        }
    },
    'white1.Transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/1',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/1',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        common: {
            'name': 'Transition Time',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': true,
            'unit': 'ms'
        }
    },
    'white2.power': {
        coap: {
            no_display: true
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/2/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).power : undefined; },
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'white2.Switch': {
        coap: {
            coap_publish: '1301', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value === 1 ? true : false; },
            http_cmd: '/white/2',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/2/status',
            mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/2/set',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    },
    'white2.brightness': {
        coap: {
            coap_publish: '5301', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value; },
            http_cmd: '/white/2',
            http_cmd_funct: (value) => { return { brightness: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/2/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/2/set',
            mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
        },
        common: {
            'name': 'Brightness',
            'type': 'number',
            'role': 'level.brightness',
            'read': true,
            'write': true,
            'min': 0,
            'max': 100
        }
    },
    'white2.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/white/2',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/white/2',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            'name': 'Button Type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action'
            }
        }
    },
    'white2.Transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/2',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/2',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        common: {
            'name': 'Transition Time',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': true,
            'unit': 'ms'
        }
    },
    'white3.power': {
        coap: {
            no_display: true
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/3/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).power : undefined; },
        },
        common: {
            'name': 'Power',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'W'
        }
    },
    'white3.Switch': {
        coap: {
            coap_publish: '1401', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value === 1 ? true : false; },
            http_cmd: '/white/3',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/3/status',
            mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/3/set',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    },
    'white3.brightness': {
        coap: {
            coap_publish: '5401', // CoAP >= FW 1.8
            coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value; },
            http_cmd: '/white/3',
            http_cmd_funct: (value) => { return { brightness: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/white/3/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/white/3/set',
            mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
        },
        common: {
            'name': 'Brightness',
            'type': 'number',
            'role': 'level.brightness',
            'read': true,
            'write': true,
            'min': 0,
            'max': 100
        }
    },
    'white3.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/white/3',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/white/3',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
            http_cmd_funct: (value) => { return { btn_type: value }; }
        },
        common: {
            'name': 'Button Type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'momentary': 'momentary',
                'toggle': 'toggle',
                'edge': 'edge',
                'detached': 'detached',
                'action': 'action'
            }
        }
    },
    'white3.Transiton': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/3',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].transition : undefined; },
            http_cmd: '/settings/white/3',
            http_cmd_funct: (value) => { return { transition: value }; }
        },
        common: {
            'name': 'Transition Time',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': true,
            'unit': 'ms'
        }
    },
    'input': {
        coap: {
            coap_publish: '118',
            coap_publish_funct: (value) => { return value === 1 ? true : false; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/0',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
        },
        common: {
            'name': 'Input / Detach',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false,
            'def': false
        }
    },
    'Event': {
        coap: {
            coap_publish: '2102'  // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
        },
        common: {
            'name': 'Event',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false,
            'states': {
                'S': '1xShort',
                'L': 'Long'
            }
        }
    },
    'EventCount': {
        coap: {
            coap_publish: '2103' // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; }
        },
        common: {
            'name': 'Event Counter',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'longpush': {
        coap: {
            coap_publish: '2102', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value == 'L' ? true : false; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/0',
            mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
        },
        common: {
            'name': 'Longpush',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false,
            'def': false
        }
    },
    'mode': {
        coap: {
            coap_publish: '9101' // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { mode: value }; }
        },
        common: {
            'name': 'Mode',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'color': 'color',
                'white': 'white'
            }
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
            'name': 'Factory reset from switch',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    }
};

module.exports = {
    shellyrgbw2: shellyrgbw2
};
