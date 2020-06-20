/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Smoke
 */
let shellybutton1 = {
  'bat.value': {
    coap: {
      coap_publish_funct: (value) => { shellyHelper.getCoapValue(77, value.G); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybutton1-<deviceid>/sensor/battery',
    },
    common: {
      'name': 'Battery capacity',
      'type': 'number',
      'role': 'value.battery',
      'read': true,
      'write': false,
      'min': 0,
      'max': 100,
      'unit': '%'
    }
  },
  'Button.Event': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(119, value.G); },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybutton1-<deviceid>/input_event/0',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; }
    },
    common: {
      'name': 'Event',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'S:1 x Short;SS:2 x Short;SSS:3 x Short;L:Long'
    }
  },
  'Button.EventCount': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(120, value.G); },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybutton1-<deviceid>/input_event/0',
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
};

module.exports = {
  shellybutton1: shellybutton1
};
