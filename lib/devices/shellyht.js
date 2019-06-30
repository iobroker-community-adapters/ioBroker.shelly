/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

/**
 * Shelly HT
 */
let shellyht = {
  'bat.value': {
    coap: {
      coap_publish_funct: (value) => { return value.G[2][2]; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyht-<deviceid>/sensor/battery',
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
  'hum.value': {
    coap: {
      coap_publish_funct: (value) => { return value.G[1][2]; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyht-<deviceid>/sensor/humidity',
    },
    common: {
      'name': 'Relative humidity',
      'type': 'number',
      'role': 'value.humidity',
      'read': true,
      'write': false,
      'min': 0,
      'max': 100,
      'unit': '%'
    }
  },
  'tmp.value': {
    coap: {
      coap_publish_funct: (value) => { return value.G[0][2]; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyht-<deviceid>/sensor/temperature',
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
  shellyht: shellyht
};
