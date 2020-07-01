/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Gas / SHGS-1 / shellygas
 * CoAP:
 *  {"blk":[{"I":0,"D":"Device"}],"sen":[{"I":118,"T":"S","D":"Sensor state","R":"unknown/warmup/normal/fault","L":0},{"I":119,"T":"S","D":"Alarm state","R":"unknown/none/mild/heavy/test","L":0},{"I":120,"T":"S","D":"Self-test state","R":"not_completed/completed/running/pending","L":0},{"I":122,"T":"S","D":"Concentration (ppm)","R":"0-65535","L":0}]}
 */
let shellygas = {
  'Gas.SensorState': {
    coap: {
      coap_publish: '118'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellygas-<deviceid>/sensor/operation',
    },
    common: {
      'name': 'Sensor State',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Gas.SelfTestState': {
    coap: {
      coap_publish: '119'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellygas-<deviceid>/sensor/self_test',
    },
    common: {
      'name': 'Self-test state',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Gas.AlarmState': {
    coap: {
      coap_publish: '120'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellygas-<deviceid>/sensor/gas',
    },
    common: {
      'name': 'Alarm state',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Gas.Concentration': {
    coap: {
      coap_publish: '122'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellygas-<deviceid>/sensor/concentration',
    },
    common: {
      'name': 'Concentration',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': false,
      'uunit': 'ppm'
    }
  }
};

module.exports = {
  shellygas: shellygas
};
