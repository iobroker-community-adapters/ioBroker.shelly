/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Switch 2.5 / SHSW-25 / shellyswitch25
 * CoAP:
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Relay1"},{"I":2,"D":"Device"}],"sen":[{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":122,"T":"S","D":"State","R":"0/1","L":1},{"I":111,"T":"W","D":"Power","R":"0/2300","L":0},{"I":121,"T":"W","D":"Power","R":"0/2300","L":1},{"I":113,"T":"S","D":"Position","R":"0/100","L":2},{"I":118,"T":"S","D":"Input","R":"0/1/2","L":2},{"I":128,"T":"S","D":"Input","R":"0/1/2","L":2},{"I":115,"T":"tC","R":"-40/300","L":2},{"I":116,"T":"tF","R":"-40/300","L":2},{"I":117,"T":"Overtemp","R":"0/1","L":2}]}
 *
 * CoAP Version >= 1.8
 *  Shelly 2.5 SHSW-25 relay-mode:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":1201,"T":"S","D":"output","R":"0/1","L":2},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":4101,"T":"P","D":"power","U":"W","R":["0/2300","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":4201,"T":"P","D":"power","U":"W","R":["0/2300","-1"],"L":2},{"I":4203,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":2},{"I":6202,"T":"A","D":"overpower","R":["0/1","-1"],"L":2},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":4},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":4},{"I":9101,"T":"S","D":"mode","R":"relay/roller","L":4}]}
 *  Shelly 2.5 SHSW-25 roller-mode:   {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":3,"D":"roller_0"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1102,"T":"S","D":"roller","R":"open/close/stop","L":3},{"I":1103,"T":"S","D":"rollerPos","R":["0/100","-1"],"L":3},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":4102,"T":"P","D":"rollerPower","U":"W","R":["0/2300","-1"],"L":3},{"I":4104,"T":"E","D":"rollerEnergy","U":"Wmin","R":["U32","-1"],"L":3},{"I":6103,"T":"A","D":"rollerStopReason","R":"normal/safety_switch/obstacle/overpower","L":3},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":4},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":4},{"I":9101,"T":"S","D":"mode","R":"relay/roller","L":4}]}
 */
let shellyswitch25 = {
  'Relay0.Switch': {
    coap: {
      coap_publish: '1101', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/0',
      mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
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
  'Relay0.ChannelName': {
    coap: {
      http_publish: '/settings/relay/0',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings/relay/0',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0.ChannelName', JSON.parse(value).name) : undefined; },
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
  'Shutter.swap': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].swap : undefined; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].swap : undefined; }
    },
    common: {
      'name': 'swap OPEN and CLOSE directions',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Shutter.swap_inputs': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].swap_inputs : undefined; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].swap_inputs : undefined; }
    },
    common: {
      'name': 'inputs are swapped',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Relay0.Power': {
    coap: {
      coap_publish: '4101', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/0/power',
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
      mqtt_publish: 'shellies/<mqttprefix>/relay/0/energy',
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
  'Relay0.Event': {
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
  'Relay0.EventCount': {
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
  'Relay0.longpush': {
    coap: {
      coap_publish: '2102', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 'L' ? true : false; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/longpush/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
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
  'Relay0.longpushtime': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { longpush_time: value }; }
    },
    mqtt: {
      http_publish: '/settings',
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
  'Relay0.overpowerValue': {
    coap: {
      // coap_publish: '6109', // CoAP >= FW 1.8
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/0/overpower_value',
    },
    common: {
      'name': 'overpower Value',
      'type': 'number',
      'role': 'state',
      'unit': 'W',
      'read': true,
      'write': false,
      'def': 0
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
      mqtt_publish: 'shellies/<mqttprefix>/relay/1',
      mqtt_cmd: 'shellies/<mqttprefix>/relay/1/command',
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
  'Relay1.ChannelName': {
    coap: {
      http_publish: '/settings/relay/1',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay1.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/1',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings/relay/1',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay1.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/1',
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
      coap_publish: '4201', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/1/power',
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
      coap_publish: '4203', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/1/energy',
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
  'Relay1.Event': {
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
  'Relay1.EventCount': {
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
  'Relay1.Input': {
    coap: {
      coap_publish: '2201', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 || value === 2 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input/1',
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
  'Relay1.longpush': {
    coap: {
      coap_publish: '2202', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 'L' ? true : false; }
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
  'Relay1.longpushtime': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { longpush_time: value }; }
    },
    mqtt: {
      http_publish: '/settings',
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
  'Relay1.overpowerValue': {
    coap: {
      // coap_publish: '6109', // CoAP >= FW 1.8
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/1/overpower_value',
    },
    common: {
      'name': 'overpower Value',
      'type': 'number',
      'role': 'state',
      'unit': 'W',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Shutter.state': {
    coap: {
      coap_publish: '1102', // CoAP >= FW 1.8
      // coap_publish_funct: (value) => { return value[0] === 1 ? 'open' : value[1] === 1 ? 'close' : 'stop'; },
      http_cmd: '/roller/0',
      http_cmd_funct: (value) => { return { go: value }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/roller/0',
      mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command'
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
      mqtt_publish: 'shellies/<mqttprefix>/roller/0',
      mqtt_cmd_funct: () => { return 'close'; },
      mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
      mqtt_publish_funct: (value) => { return value == 'close' ? true : false; }
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => async (value,self) => { return { go: 'close', duration: await getSetDuration(self, 'Shutter.Duration') }; }
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
      http_cmd_funct: async (value, self) => { return { go: 'open', duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/roller/0',
      mqtt_cmd_funct: () => { return 'open'; },
      mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
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
      mqtt_publish: 'shellies/<mqttprefix>/roller/0',
      mqtt_publish_funct: (value) => { return value == 'stop' ? true : false; },
      mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
      mqtt_cmd_funct: () => { return 'stop'; }
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
      coap_publish_funct: (value) => { return value == -1 ? undefined : value; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': value, 'duration': await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/roller/0/pos',
      mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command/pos',
      mqtt_cmd_funct: (value) => { return value.toString(); },
      mqtt_publish_funct: (value) => { return value == -1 ? 101 : value; }
    },
    common: {
      'name': 'Position',
      'type': 'number',
      'role': 'level.blind',
      'read': true,
      'write': true,
      'unit': '%'
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
      mqtt_publish: 'shellies/<mqttprefix>/roller/0/power',
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
      mqtt_publish: 'shellies/<mqttprefix>/roller/0/energy ',
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
  'temperatureC': {
    coap: {
      coap_publish: '3104', // CoAP >= FW 1.8
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).temperature : undefined; }
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
      'unit': '°C'
    }
  },
  'overtemperature': {
    coap: {
      coap_publish: '6101', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 1 ? true : false; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/overtemperature',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Temperature',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'mode': {
    coap: {
      coap_publish: '9101', // CoAP >= FW 1.8
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
  'ext.temperatureC1': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtTemp(JSON.parse(value), '0', 'C') : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/0',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.-]/g, ''); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtTemp(JSON.parse(value), '1', 'C') : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/1',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.-]/g, ''); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtTemp(JSON.parse(value), '2', 'C') : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/2',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.-]/g, ''); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtTemp(JSON.parse(value), '0', 'F') : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/0',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.-]/g, ''); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtTemp(JSON.parse(value), '1', 'F') : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/1',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.-]/g, ''); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? shellyHelper.getExtTemp(JSON.parse(value), '2', 'F') : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/2',
      mqtt_publish_funct: (value) => { return String(value).replace(/[^0-9\.-]/g, ''); }
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
  },
  'Favorites.Position1Name' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[0].name : undefined; },
      http_cmd: '/settings/favorites/0',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[0].name : undefined; },
      http_cmd: '/settings/favorites/0',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    common: {
      'name': 'Position Name',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true
    }	  
  },
  'Favorites.Position1Pos' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[0].pos : undefined; },
      http_cmd: '/settings/favorites/0',
      http_cmd_funct: (value) => { return { pos: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[0].pos : undefined; },
      http_cmd: '/settings/favorites/0',
      http_cmd_funct: (value) => { return { pos: value }; }
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
    },
  },
  'Favorites.Position1': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position1Pos') }; }
    },
    mqtt: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position1Pos') }; }
    },
    common: {
      'name': 'Set favorite position',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Favorites.Position2Name' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[1].name : undefined; },
      http_cmd: '/settings/favorites/1',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[1].name : undefined; },
      http_cmd: '/settings/favorites/1',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    common: {
      'name': 'Position Name',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true
    }   
  },
  'Favorites.Position2Pos' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[1].pos : undefined; },
      http_cmd: '/settings/favorites/1',
      http_cmd_funct: (value) => { return { pos: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[1].pos : undefined; },
      http_cmd: '/settings/favorites/1',
      http_cmd_funct: (value) => { return { pos: value }; }
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
    },
  },
  'Favorites.Position2': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position2Pos') }; }
    },
    mqtt: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position2Pos') }; }
    },
    common: {
      'name': 'Set favorite position',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Favorites.Position3Name' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[2].name : undefined; },
      http_cmd: '/settings/favorites/2',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[2].name : undefined; },
      http_cmd: '/settings/favorites/2',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    common: {
      'name': 'Position Name',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true
    }   
  },
  'Favorites.Position3Pos' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[2].pos : undefined; },
      http_cmd: '/settings/favorites/2',
      http_cmd_funct: (value) => { return { pos: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[2].pos : undefined; },
      http_cmd: '/settings/favorites/2',
      http_cmd_funct: (value) => { return { pos: value }; }
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
    },
  },
  'Favorites.Position3': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position3Pos') }; }
    },
    mqtt: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position3Pos') }; }
    },
    common: {
      'name': 'Set favorite position',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Favorites.Position4Name' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[3].name : undefined; },
      http_cmd: '/settings/favorites/3',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[3].name : undefined; },
      http_cmd: '/settings/favorites/3',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    common: {
      'name': 'Position Name',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true
    }   
  },
  'Favorites.Position4Pos' : {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[3].pos : undefined; },
      http_cmd: '/settings/favorites/3',
      http_cmd_funct: (value) => { return { pos: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).favorites[3].pos : undefined; },
      http_cmd: '/settings/favorites/3',
      http_cmd_funct: (value) => { return { pos: value }; }
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
    },
  },
  'Favorites.Position4': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position4Pos') }; }
    },
    mqtt: {
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': await shellyHelper.getFavoritePosition(self, 'Favorites.Position4Pos') }; }
    },
    common: {
      'name': 'Set favorite position',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
};

module.exports = {
  shellyswitch25: shellyswitch25
};
