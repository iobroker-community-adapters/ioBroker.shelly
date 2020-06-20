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
let shellygas = {
  'Gas.SensorState': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(118, value.G); },
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
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(119, value.G); },
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
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(120, value.G); },
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
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(122, value.G); },
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
