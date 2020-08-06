/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly IX3 / SHIX3-1 / shellyix3
 * CoAP:
  *
 * CoAP Version >= 1.8
 *  Shelly i3 SHIX3-1:    {"blk":[{"I":1,"D":"input_0"},{"I":2,"D":"input_1"},{"I":3,"D":"input_2"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS/SL/LS",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS/SL/LS",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":2301,"T":"S","D":"input","R":"0/1","L":3},{"I":2302,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS/SL/LS",""],"L":3},{"I":2303,"T":"EVC","D":"inputEventCnt","R":"U16","L":3}]}
 */
let shellyix3 = {
  'Relay0.Input': {
    coap: {
      coap_publish: '118',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input/0',
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
      coap_publish: '119'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input_event/0',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
    },
    common: {
      'name': 'Event',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Relay0.EventCount': {
    coap: {
      coap_publish: '120'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input_event/0',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; }
    },
    common: {
      'name': 'Event Counter',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true
    }
  },
  'Relay0.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/input/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/input/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle'
    }
  },
  'Relay0.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/input/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[0].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/input/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[0].btn_reverse : undefined; },
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
  'Relay1.Input': {
    coap: {
      coap_publish: '128',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input/1',
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
  'Relay1.Event': {
    coap: {
      coap_publish: '129'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input_event/1',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
    },
    common: {
      'name': 'Event',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Relay1.EventCount': {
    coap: {
      coap_publish: '130'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input_event/1',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; }
    },
    common: {
      'name': 'Event Counter',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true
    }
  },
  'Relay1.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/input/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[1].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/input/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[1].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle'
    }
  },
  'Relay1.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/input/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[1].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/input/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[1].btn_reverse : undefined; },
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
  'Relay2.Input': {
    coap: {
      coap_publish: '138',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input/2',
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
  'Relay2.Event': {
    coap: {
      coap_publish: '139'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input_event/2',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
    },
    common: {
      'name': 'Event',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Relay2.EventCount': {
    coap: {
      coap_publish: '140'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyix3-<deviceid>/input_event/2',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; }
    },
    common: {
      'name': 'Event Counter',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true
    }
  },
  'Relay2.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/input/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[2].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/input/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[2].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle'
    }
  },
  'Relay2.ButtonReverse': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/input/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[2].btn_reverse : undefined; },
      http_cmd_funct: (value) => { return { btn_reverse: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/input/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[2].btn_reverse : undefined; },
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
  }
};

module.exports = {
  shellyix3: shellyix3
};
