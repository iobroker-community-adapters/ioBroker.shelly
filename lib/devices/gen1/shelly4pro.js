/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly 4 Pro / SHSW-44 / shelly4pro
 * CoAP: {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Relay1"},{"I":2,"D":"Relay2"},{"I":3,"D":"Relay3"}],"sen":[{"I":111,"T":"W","R":"0/2650","L":0},{"I":112,"T":"Switch","R":"0/1","L":0},{"I":121,"T":"W","R":"0/2650","L":1},{"I":122,"T":"Switch","R":"0/1","L":1},{"I":131,"T":"W","R":"0/2650","L":2},{"I":132,"T":"Switch","R":"0/1","L":2},{"I":141,"T":"W","R":"0/2650","L":3},{"I":142,"T":"Switch","R":"0/1","L":3},{"I":118,"T":"S","D":"Input","R":"0/1","L":4},{"I":128,"T":"S","D":"Input","R":"0/1","L":4},{"I":138,"T":"S","D":"Input","R":"0/1","L":4},{"I":148,"T":"S","D":"Input","R":"0/1","L":4}]}
 */
let shelly4pro = {
  'Relay0.Switch': {
    coap: {
      coap_publish: '112',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
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
  /*
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
  */
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
  'Relay0.Power': {
    coap: {
      coap_publish: '111',
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
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[0].total / 60) * 100) / 100) : undefined; }
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
      coap_publish: '118',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
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
  'Relay1.Switch': {
    coap: {
      coap_publish: '122',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/1',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/1',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/<mqttprefix>/relay/1/command',
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
  /*
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
  */
  'Relay1.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
      http_cmd: '/settings/relay/1',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
      http_cmd: '/settings/relay/1',
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
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
      http_cmd: '/settings/relay/1',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
      http_cmd: '/settings/relay/1',
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
  'Relay1.Power': {
    coap: {
      coap_publish: '121',
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
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[1].total / 60) * 100) / 100) : undefined; }
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
  'Relay1.Input': {
    coap: {
      coap_publish: '128',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
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
  'Relay2.Switch': {
    coap: {
      coap_publish: '132',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/2',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/2',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/<mqttprefix>/relay/2/command',
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
  /*
  'Relay2.ChannelName': {
    coap: {
      http_publish: '/settings/relay/2',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay2.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/2',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings/relay/2',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay2.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/2',
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
  */
  'Relay2.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].auto_off : undefined; },
      http_cmd: '/settings/relay/2',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].auto_off : undefined; },
      http_cmd: '/settings/relay/2',
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
  'Relay2.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].auto_on : undefined; },
      http_cmd: '/settings/relay/2',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].auto_on : undefined; },
      http_cmd: '/settings/relay/2',
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
  'Relay2.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].btn_type : undefined; },
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
  'Relay2.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[2].btn_reverse : undefined; },
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
  'Relay2.Power': {
    coap: {
      coap_publish: '131',
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/2/power',
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
  'Relay2.Energy': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[2].total / 60) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/2/energy',
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
  'Relay2.Input': {
    coap: {
      coap_publish: '138',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input/2',
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
  'Relay3.Switch': {
    coap: {
      coap_publish: '142',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
      http_cmd: '/relay/3',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/3',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/<mqttprefix>/relay/3/command',
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
  /*
  'Relay3.ChannelName': {
    coap: {
      http_publish: '/settings/relay/3',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay3.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/3',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings/relay/3',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay3.ChannelName', JSON.parse(value).name) : undefined; },
      http_cmd: '/settings/relay/3',
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
  */
  'Relay3.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].auto_off : undefined; },
      http_cmd: '/settings/relay/3',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].auto_off : undefined; },
      http_cmd: '/settings/relay/3',
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
  'Relay3.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].auto_on : undefined; },
      http_cmd: '/settings/relay/3',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].auto_on : undefined; },
      http_cmd: '/settings/relay/3',
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
  'Relay3.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/3',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/3',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].btn_type : undefined; },
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
  'Relay3.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/3',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/3',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[3].btn_reverse : undefined; },
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
  'Relay3.Power': {
    coap: {
      coap_publish: '141',
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/3/power',
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
  'Relay3.Energy': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[3].total / 60) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/relay/3/energy',
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
  'Relay3.Input': {
    coap: {
      coap_publish: '148',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/input/3',
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
};


module.exports = {
  shelly4pro: shelly4pro
};
