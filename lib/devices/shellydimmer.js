
/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Dimmer / SHDM-1 / shellydimmer
 * CoAP:
 *  {"3332":"SHDM-1#D47EBD#1"} / {"blk":[{"I":0,"D":"Dimmer"}],"sen":[{"I":111,"T":"S","D":"Brightness","R":"0/100","L":0},{"I":121,"T":"S","D":"State","R":"0/1","L":0},{"I":131,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0},{"I":141,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0},{"I":211,"T":"S","D":"Energy counter 0 [W-min]","L":0},{"I":212,"T":"S","D":"Energy counter 1 [W-min]","L":0},{"I":213,"T":"S","D":"Energy counter 2 [W-min]","L":0},{"I":214,"T":"S","D":"Energy counter total [W-min]","L":0},{"I":311,"T":"T","D":"Temperature C","R":"-40/300","L":0},{"I":312,"T":"T","D":"Temperature F","R":"-40/300","L":0},{"I":313,"T":"S","D":"Overtemp","R":"0/1","L":0}]}
  *
 * CoAP Version >= 1.8
 *  Shelly Dimmer SHDM-1:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"input_0"},{"I":3,"D":"input_1"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5101,"T":"S","D":"brightness","R":"1/100","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":2},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":2201,"T":"S","D":"input","R":"0/1","L":3},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":3},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":3},{"I":4101,"T":"P","D":"power","U":"W","R":["0/230","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6104,"T":"A","D":"loadError","R":"0/1","L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":4},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":4},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":4},{"I":9101,"T":"S","D":"mode","R":"color/white","L":4}]}
 */
let shellydimmer = {
  'lights.Switch': {
    coap: {
      coap_publish: '1101',  // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).ison === true : undefined; },
      mqtt_cmd: 'shellies/<mqttprefix>/light/0/command',
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
  'lights.ChannelName': {
    coap: {
      http_publish: '/settings/light/0',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'lights.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings/light/0',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'lights.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/light/0',
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
  'lights.brightness': {
    coap: {
      coap_publish: '5101', // CoAP >= FW 1.8
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/<mqttprefix>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return value >= 0 ? JSON.stringify({ brightness: value }) : undefined; }
    },
    common: {
      'name': 'Brightness',
      'type': 'number',
      'role': 'level.brightness',
      'read': true,
      'write': true,
      'unit': '%',
      'min': 1,
      'max': 100
    }
  },
  'lights.mode': {
    coap: {
      coap_publish: '9101',  // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
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
      coap_publish: '4101',  // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/light/0/power',
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
      coap_publish: '4103',  // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); },
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
  'lights.Event1': {
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
      'states': 'S:1xShort;L:Long'
    }
  },
  'lights.EventCount1': {
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
  'lights.Input1': {
    coap: {
      coap_publish: '2101', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
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
  'lights.longpush1': {
    coap: {
      coap_publish: '2102', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 'L'; }
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
  'lights.Event2': {
    coap: {
      coap_publish: '2202'  // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
    },
    common: {
      'name': 'Event',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false,
      'states': 'S:1xShort;L:Long'
    }
  },
  'lights.EventCount2': {
    coap: {
      coap_publish: '2203' // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
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
  'lights.Input2': {
    coap: {
      coap_publish: '2201', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input/1',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
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
  'lights.longpush2': {
    coap: {
      coap_publish: '2202', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 'L'; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/longpush/1',
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
  'lights.Transiton': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? JSON.parse(value).transition : undefined; },
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? JSON.parse(value).transition : undefined; },
    },
    common: {
      'name': 'Fade Rate',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': false,
      'unit': 'ms',
      'min': 0,
      'max': 5000
    }
  },
  'lights.FadeRate': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? JSON.parse(value).fade_rate : undefined; },
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? JSON.parse(value).fade_rate : undefined; },
    },
    common: {
      'name': 'Transitions Time',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': false,
    }
  },
  'temperatureC': {
    coap: {
      coap_publish: '3104', // CoAP >= FW 1.8
      //coap_publish_funct: (value) => { return value; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/temperature',
    },
    common: {
      'name': 'Temperature °C',
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
      coap_publish: '3105', // CoAP >= FW 1.8
      //coap_publish_funct: (value) => { return value; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/temperature_f',
    },
    common: {
      'name': 'Temperature °F',
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
      coap_publish: '6106', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 1 ? true : false; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/overtemperature',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Over Temperature',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
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
  shellydimmer: shellydimmer
};

