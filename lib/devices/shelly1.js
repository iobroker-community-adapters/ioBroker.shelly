/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly 1 / SHSW-1 / shelly1
 * CoAP Version < 1.8
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Sensors"}],"sen":[{"I":112,"T":"S","D":"Switch","R":"0/1","L":0},{"I":118,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0}]}
 *
 * CoAP Version >= 1.8
 *  Shelly 1 SHSW-1 with-dht22:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1 SHSW-1 no-addon:      {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1 SHSW-1 with-ds1820:   {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1 SHSW-1 with-lp-input: {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 */
let shelly1 = {
  'Relay0.Switch': {
    coap: {
      coap_publish: '1101', // Coap >= FW 1.8
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/relay/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shelly1-<deviceid>/relay/0/command',
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
  'Relay0.ChannelName': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, 'Relay0.ChannelName', JSON.parse(value).relays[0].name) : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, 'Relay0.ChannelName', JSON.parse(value).relays[0].name) : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    common: {
      'name': 'Channel Name',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true
    }
  },
  'Relay0.Input': {
    coap: {
      coap_publish: '2101', // Coap >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/input/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Input / Detach',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false,
      'states': '0:Input;1:Detach'
      //'def': false
    }
  },
  'Relay0.extInput': {
    coap: {
      no_display: true // CoAP >= 1.8
      //coap_publish: '3117', // Coap >= FW 1.8
      //coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      no_display: true // CoAP >= 1.8
      //mqtt_publish: 'shellies/shelly1-<deviceid>/input/0',
      //mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'ext. Input',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
      //'def': false
    }
  },
  'Relay0.Event': {
    coap: {
      coap_publish: '2102'  // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/input_event/0',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
    },
    common: {
      'name': 'Event',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false,
      'states': 'S:1 x Short;L:Long'
    }
  },
  'Relay0.EventCount': {
    coap: {
      coap_publish: '2103' // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/input_event/0',
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
  'Relay0.longpush': {
    coap: {
      coap_publish: '2102', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 'L'; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/longpush/0',
      mqtt_publish_funct: (value) => { return value; }
    },
    common: {
      'name': 'Longpush',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Relay0.longpushtime': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { longpush_time: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/longpushtime/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { longpush_time: value }; }
    },
    common: {
      'name': 'Longpush Time',
      'type': 'number',
      'role': 'state',
      'unit': 'ms',
      'min': 1,
      'max': 5000,
      'read': true,
      'write': true
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
      'name': 'source of last command',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
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
      'name': 'Auto Timer Off',
      'type': 'number',
      'role': 'level.timer',
      'def': 0,
      'unit': 's',
      'read': true,
      'write': true
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
      'name': 'Auto Timer Off',
      'type': 'number',
      'role': 'level.timer',
      'def': 0,
      'unit': 's',
      'read': true,
      'write': true
    }
  },
  'Relay0.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;edge:edge;detached:detached;action:action;cycle:cycle;momentary_on_release:momentary_on_release'
    }
  },
  'Relay0.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true,
      'states': '0:normal;1:inverted'
    }
  },
  'ext.temperatureC1': {
    coap: {
      coap_publish: '3101', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature/0',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC2': {
    coap: {
      coap_publish: '3201', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature/1',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC3': {
    coap: {
      coap_publish: '3301', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature/2',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC4': {
    coap: {
      no_display: true // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature/3',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF1': {
    coap: {
      coap_publish: '3102', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature_f/0',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF2': {
    coap: {
      coap_publish: '3202', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature_f/1',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF3': {
    coap: {
      coap_publish: '3302', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature_f/2',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF4': {
    coap: {
      no_display: true // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/ext_temperature_f/3',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.]/g, ''); }
    },
    common: {
      'name': 'External Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.humidity1': {
    coap: {
      coap_publish: '3103', // CoAP >= FW 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtHum(JSON.parse(value), '0') : undefined; }
    },
    common: {
      'name': 'External Humidity',
      'type': 'number',
      'role': 'value.humidity',
      'read': true,
      'write': false,
      'min': 0,
      'max': 100,
      'unit': '%'
    }
  },
  'ext.humidity2': {
    coap: {
      no_display: true // CoAP >= 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtHum(JSON.parse(value), '1') : undefined; }
    },
    common: {
      'name': 'External Humidity',
      'type': 'number',
      'role': 'value.humidity',
      'read': true,
      'write': false,
      'min': 0,
      'max': 100,
      'unit': '%'
    }
  },
  'ext.humidity3': {
    coap: {
      no_display: true // CoAP >= 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtHum(JSON.parse(value), '2') : undefined; }
    },
    common: {
      'name': 'External Humidity',
      'type': 'number',
      'role': 'value.humidity',
      'read': true,
      'write': false,
      'min': 0,
      'max': 100,
      'unit': '%'
    }
  },
  'ext.humidity4': {
    coap: {
      no_display: true // CoAP >= 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtHum(JSON.parse(value), '3') : undefined; }
    },
    common: {
      'name': 'External Humidity',
      'type': 'number',
      'role': 'value.humidity',
      'read': true,
      'write': false,
      'min': 0,
      'max': 100,
      'unit': '%'
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
  shelly1: shelly1
};
