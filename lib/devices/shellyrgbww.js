/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly RGBWW / SHRGBWW-01 / shellyrgbww
 * CoAP:
  *
 * CoAP Version >= 1.8
 *  Shelly RGBW SHRGBWW-01 color-mode:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5105,"T":"S","D":"red","R":"0/255","L":1},{"I":5106,"T":"S","D":"green","R":"0/255","L":1},{"I":5107,"T":"S","D":"blue","R":"0/255","L":1},{"I":5108,"T":"S","D":"white","R":"0/255","L":1},{"I":5102,"T":"S","D":"gain","R":"0/100","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":5103,"T":"S","D":"colorTemp","U":"K","R":"3000/6500","L":1},{"I":9101,"T":"S","D":"mode","R":"color/white","L":1}]}
 *  Shelly RGBW SHRGBWW-01 white-mode:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5105,"T":"S","D":"red","R":"0/255","L":1},{"I":5106,"T":"S","D":"green","R":"0/255","L":1},{"I":5107,"T":"S","D":"blue","R":"0/255","L":1},{"I":5108,"T":"S","D":"white","R":"0/255","L":1},{"I":5102,"T":"S","D":"gain","R":"0/100","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":5103,"T":"S","D":"colorTemp","U":"K","R":"3000/6500","L":1},{"I":9101,"T":"S","D":"mode","R":"color/white","L":1}]}
 */
let shellyrgbww = {
  'lights.Switch': {
    coap: {
      coap_publish: '1101', // CoAP >= FW 1.8
      coap_publish_funct: async (value) => { return value == 1 ? true : false; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/command',
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
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/light/0',
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
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
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
  'lights.mode': {
    coap: {
      coap_publish: '9101', // CoAP >= FW 1.8
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
    },
    common: {
      'name': 'Modus',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'color:color;white:white'
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
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
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
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
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
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).blue : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
    },
    common: {
      'name': 'Green',
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
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
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
//      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { gain: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).gain : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
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
  'lights.temp': {
    coap: {
      coap_publish: '5103', // CoAP >= FW 1.8
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { temp: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).temp : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'level.temperature',
      'read': true,
      'write': true,
      'min': 3000,
      'max': 6500
    }
  },
  'lights.brightness': {
    coap: {
      coap_publish: '5101', // CoAP >= FW 1.8
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
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
  'lights.effect': {
    coap: {
      http_publish: '/settings/light/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { effect: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbww-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      mqtt_cmd: 'shellies/shellyrgbww-<deviceid>/color/0/set',
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
      'states': '0:Off;1:Meteor Shower;2:Gradual Change;3:Breath;4:Flash;5:On/Off Gradual;6:Red/Green Change'
    }
  }
};

module.exports = {
  shellyrgbww: shellyrgbww
};
