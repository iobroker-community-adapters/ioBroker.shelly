
/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Dimmer
 */
let shellydimmer2 = {
  'lights.Switch': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(121, value.G) == 1 ? true : false; },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).ison === true : undefined; },
      mqtt_cmd: 'shellies/shellydimmer2-<deviceid>/light/0/command',
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
  'lights.brightness': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(111, value.G); },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellydimmer2-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return value >= 0 ? JSON.stringify({ brightness: value }) : undefined; }
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
  'lights.mode': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; }
    },
    common: {
      'name': 'Modus',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false,
      'states': 'color:color;white:white'
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
  'lights.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'one_button:one_button;dual_button:dual_button;toggle:toggle;edge:edge;detached:detached;action:action'
    }
  },
  'lights.Power': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => {
        return value ? (Math.round(JSON.parse(value).meters[0].power * 100) / 100) : undefined;
      }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/light/0/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
  'lights.Energy': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[0].total / 60) * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[0].total / 60) * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Energy',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'temperatureC': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(311, value.G); },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/temperature'
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°C',
      'min': -100,
      'max': 100
    }
  },
  'temperatureF': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(312, value.G); },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/temperature_f'
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°F',
      'min': -100,
      'max': 100
    }
  },
  'overtemperature': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(313, value.G) == 1; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydimmer2-<deviceid>/overtemperature',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Temperature',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  }
};

module.exports = {
  shellydimmer2: shellydimmer2
};

