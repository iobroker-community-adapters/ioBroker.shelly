/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shellyswitch 2.0 / SHSW-21 / shellyswitch
 * CoAP:
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Relay1"},{"I":2,"D":"Device"},{"I":118,"T":"S","D":"Input","R":"0/1/2","L":2},{"I":128,"T":"S","D":"Input","R":"0/1/2","L":2}],"sen":[{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":122,"T":"S","D":"State","R":"0/1","L":1},{"I":111,"T":"W","D":"Power","R":"0/3680","L":2},{"I":113,"T":"S","D":"Position","R":"0/100","L":2}]}
 *
 * CoAP Version >= 1.8
 *  Shelly 2 SHSW-21 relay-mode:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":1201,"T":"S","D":"output","R":"0/1","L":2},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3680","-1"],"L":4},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":4},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":4},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6202,"T":"A","D":"overpower","R":["0/1","-1"],"L":2},{"I":9101,"T":"S","D":"mode","R":"relay/roller","L":4}]}
 *  Shelly 2 SHSW-21 roller-mode:	{"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":3,"D":"roller_0"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1102,"T":"S","D":"roller","R":"open/close/stop","L":3},{"I":1103,"T":"S","D":"rollerPos","R":["0/100","-1"],"L":3},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":4102,"T":"P","D":"rollerPower","U":"W","R":["0/1840","-1"],"L":3},{"I":4104,"T":"E","D":"rollerEnergy","U":"Wmin","R":["U32","-1"],"L":3},{"I":6103,"T":"A","D":"rollerStopReason","R":"normal/safety_switch/obstacle/overpower","L":3},{"I":9101,"T":"S","D":"mode","R":"relay/roller","L":4}]}
*/

let shellyswitch = {
  'Relay0.Switch': {
    coap: {
      coap_publish: '1101',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/0',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/relay/0/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
      mqtt_publish_funct: (value) => { return value === 'on'; }
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
  'Relay0.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
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
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
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
  'Relay0.Timer': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay0.Timer'); }
    },
    mqtt: {
      no_display: true
    },
    common: {
      'name': 'Duration',
      'type': 'number',
      'role': 'level.timer',
      'read': true,
      'write': true,
      'def': 0,
      'unit': 's'
    }
  },
  'Relay0.Power': {
    coap: {
      coap_publish: '4101', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/power',
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
  'Relay0.Energy': {
    coap: {
      coap_publish: '4103', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/energy',
      mqtt_publish_funct: (value) => { return Math.round((value / 60) * 100) / 100; }
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
  'Relay0.Input': {
    coap: {
      coap_publish: '2101', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/input/0',
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
  'Relay0.Event': {
    coap: {
      coap_publish: '2102'  // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/input_event/0',
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
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/input_event/0',
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
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/longpush/0',
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
  'Relay1.Switch': {
    coap: {
      coap_publish: '1201', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/1',
      http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay1.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay1.Timer') }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/1',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/relay/1/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
      mqtt_publish_funct: (value) => { return value === 'on'; }
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
  'Relay1.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
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
  'Relay1.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
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
  'Relay1.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_type : undefined; },
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
  'Relay1.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].btn_reverse : undefined; },
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
  'Relay1.Timer': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay1.Timer'); }
    },
    mqtt: {
      no_display: true
    },
    common: {
      'name': 'Duration',
      'type': 'number',
      'role': 'level.timer',
      'read': true,
      'write': true,
      'def': 0,
      'unit': 's'
    }
  },
  'Relay1.Power': {
    coap: {
      coap_publish: '4102', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/power',
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
  'Relay1.Energy': {
    coap: {
      coap_publish: '4104', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/energy',
      mqtt_publish_funct: (value) => { return Math.round((value / 60) * 100) / 100; }
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
  'Relay1.Input': {
    coap: {
      coap_publish: '2201', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/input/1',
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
  'Relay1.Event': {
    coap: {
      coap_publish: '2202'  // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/input_event/1',
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
  'Relay1.EventCount': {
    coap: {
      coap_publish: '2203' // CoAP >= 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/input_event/1',
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
  'Relay1.longpush': {
    coap: {
      coap_publish: '2202', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 'L'; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/longpush/1',
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
  'Shutter.state': {
    coap: {
      coap_publish: '1102', // CoAP >= FW 1.8
      //      coap_publish_funct: (value) => { return value[0] === 1 ? 'open' : value[1] === 1 ? 'close' : 'stop'; },
      http_cmd: '/roller/0',
      http_cmd_funct: (value) => { return { go: value }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command'
    },
    common: {
      'name': 'Roller state',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'close:close;open:open;stop:stop'
    }
  },
  'Shutter.Close': {
    coap: {
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'close' }; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { go: 'close', duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0) }; },
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd_funct: () => { return 'close'; },
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      mqtt_publish_funct: (value) => { return value == 'close' ? true : false; }
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
      // http_cmd: '/roller/0',
      // http_cmd_funct: async (value,self) => { return { go: 'close', duration: await getSetDuration(self, 'Shutter.Duration') }
    },
    common: {
      'name': 'Close',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Shutter.Open': {
    coap: {
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'open' }; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { go: 'open', duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0) }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd_funct: () => { return 'open'; },
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      mqtt_publish_funct: (value) => { return value == 'open' ? true : false; }
    },
    common: {
      'name': 'Open',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Shutter.Pause': {
    coap: {
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'stop' }; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { go: 'stop', duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      mqtt_cmd_funct: () => { return 'stop'; },
      mqtt_publish_funct: (value) => { return value == 'stop' ? true : false; }
    },
    common: {
      'name': 'Pause',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Shutter.Duration': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Shutter.Duration'); }
      // http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].maxtime : undefined; },
    },
    mqtt: {
      // http_publish : '/settings',
      // http:publish_funct: (value) =>  { return value ? JSON.parse(value).rollers[0].maxtime : undefined; }     
      no_display: true
    },
    common: {
      'name': 'Duration',
      'type': 'number',
      'role': 'level.timer',
      'read': true,
      'write': true,
      'def': 0,
      'unit': 's'
    }
  },
  'Shutter.Position': {
    coap: {
      coap_publish: '1103', // CoAP >= FW 1.8
      //      coap_publish_funct: (value) => { return value == -1 ? 101 : value; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': value, 'duration': await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0/pos',
      mqtt_publish_funct: (value) => { return value == -1 ? 101 : value; },
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command/pos',
      mqtt_cmd_funct: (value) => { return value.toString(); }
    },
    common: {
      'name': 'Position',
      'type': 'number',
      'role': 'level.blind',
      'read': true,
      'write': true,
      'unit': '%',
      'min': 0,
      'max': 100
    }
  },
  'Shutter.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/roller/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].button_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/roller/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].button_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;detached:detached'
    }
  },
  'Shutter.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/roller/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/roller/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].btn_reverse : undefined; },
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
  'Shutter.Power': {
    coap: {
      coap_publish: '4102',
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0/power',
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
  'Shutter.Energy': {
    coap: {
      coap_publish: '4104',
      coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0/energy',
      mqtt_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
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
  'mode': {
    coap: {
      coap_publish: '9101', // CoAP >= FW 1.8
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    common: {
      'name': 'Modus',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'relay:relay;roller:shutter'
    }
  },
  'factoryResetFromSwitch': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).factory_reset_from_switch : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { factory_reset_from_switch: value }; }    },
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
  },
  'Shutter.StopReason': {
    coap: {
      coap_publish: '6103', // CoAP >= FW 1.8
    },
    mqtt: {
      http_publish: '/status/rollers/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).stop_reason : undefined; },
    },
    common: {
      'name': 'Shutter stop reason',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  }

};

module.exports = {
  shellyswitch: shellyswitch
};
