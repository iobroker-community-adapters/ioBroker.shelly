/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Smoke / SHSM-01 / shellysmoke
 * CoAP:
 */
let shellysmoke = {
  'bat.value': {
    coap: {
      coap_publish: '77'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysmoke-<deviceid>/sensor/battery',
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
  'smoke.value': {
    coap: {
      coap_publish: '22',
      coap_publish_funct: (value) => { return value == 1; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysmoke-<deviceid>/sensor/smoke',
      mqtt_publish_funct: (value) => {
        return (value === true || value === 1) ? true : false;
      }
    },
    common: {
      'name': 'Smoke detected',
      'type': 'boolean',
      'role': 'sensor.alarm.fire',
      'read': true,
      'write': false
    }
  },
  'tmp.value': {
    coap: {
      coap_publish: '33'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysmoke-<deviceid>/sensor/temperature',
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
  shellysmoke: shellysmoke
};
