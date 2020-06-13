
/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Bulb Duo
 */
let shellybulbduo = {
  'lights.Switch': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].ison === true : undefined; },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/command',
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
  'lights.white': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].white : undefined; },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { white: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectWhite(self)); }
    },
    common: {
      'name': 'White',
      'type': 'number',
      'role': 'level.color.white',
      'read': true,
      'write': true
    }
  },
  'lights.temp': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].temp : undefined; },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { temp: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).temp : undefined; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectWhite(self)); }
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'level.temperature',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  },
  'lights.brightness': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].brightness : undefined;},
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectWhite(self)); }
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
  }
};

module.exports = {
  shellybulbduo: shellybulbduo
};
