/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly 4 Pro
 */
let shelly4pro = {
  'Relay0.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[1][2] === 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shelly4pro-<deviceid>/relay/0/command',
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
  'Relay0.Power': {
    coap: {
      coap_publish_funct: (value) => { return value.G[0][2]; },
      // http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).meters[0].power * 100) / 100) : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/0/power',
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
  'Relay1.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[3][2] === 1 ? true : false; },
      http_cmd: '/relay/1',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/1',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shelly4pro-<deviceid>/relay/1/command',
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
  'Relay1.Power': {
    coap: {
      coap_publish_funct: (value) => { return value.G[2][2]; },
      // http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).meters[1].power * 100) / 100) : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/1/power',
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
  'Relay2.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[5][2] === 1 ? true : false; },
      http_cmd: '/relay/2',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/2',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shelly4pro-<deviceid>/relay/2/command',
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
  'Relay2.Power': {
    coap: {
      coap_publish_funct: (value) => { return value.G[4][2]; },
      // http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).meters[2].power * 100) / 100) : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/2/power',
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
  'Relay3.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[7][2] === 1 ? true : false; },
      http_cmd: '/relay/3',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/3',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shelly4pro-<deviceid>/relay/3/command',
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
  'Relay3.Power': {
    coap: {
      coap_publish_funct: (value) => { return value.G[6][2]; },
      // http_publish: '/settings',
      http_publish_funct: (value) => {
        return value ? (Math.round(JSON.parse(value).meters[3].power * 100) / 100) : undefined;
      },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly4pro-<deviceid>/relay/3/power',
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
  }
};


module.exports = {
  shelly4pro: shelly4pro
};
