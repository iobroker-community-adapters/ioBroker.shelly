/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Flood
 */
let shellyflood = {
  'sensor.battery': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(77, value.G); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyflood-<deviceid>/sensor/battery',
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
  'sensor.flood': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(23, value.G) === 1 ? true : false; }, 
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyflood-<deviceid>/sensor/flood',
    },
    common: {
      'name': 'Flood',
      'type': 'boolean',
      'role': 'sensor.alarm.flood',
      'read': true,
      'write': false
    }
  },
  'sensor.temperature': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(33, value.G); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyflood-<deviceid>/sensor/temperature',
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'min': -100,
      'max': 100
    }
  }
};

module.exports = {
  shellyflood: shellyflood
};
