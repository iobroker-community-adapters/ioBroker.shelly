/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Smoke / SHBTN-1 / shellybutton1
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":77,"D":"battery","T":"B","R":"0/100","L":1},{"I":118,"T":"S","D":"Input","R":"0","L":1},{"I":119,"T":"S","D":"Input event","R":"S/SS/SSS/L","L":1},{"I":120,"T":"S","D":"Input event counter","R":"U16","L":1}]}
 */
let shellybutton1 = {
  'bat.value': {
    coap: {
      coap_publish: '77',
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
      coap_publish: ['119','120'],
      coap_publish_funct: (value) => { return value[0]; },
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
      'write': false,
      'states': 'S:1 x Short;SS:2 x Short;SSS:3 x Short;L:Long'
    }
  },
  'Button.EventCount': {
    coap: {
      coap_publish: '120'
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
      'write': false
    }
  },
  'Button.Input': {
    coap: {
      coap_publish: '118'
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).inputs[0].input : undefined; },
    },
    common: {
      'name': 'Input',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
};

module.exports = {
  shellybutton1: shellybutton1
};
