/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Sense / SHSEN-1 / shellysense
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":11,"D":"motion","T":"S","R":"0/1","L":1},{"I":22,"D":"charger","T":"S","R":"0/1","L":1},{"I":33,"D":"temperature","T":"T","R":"-40/125","L":1},{"I":44,"D":"humidity","T":"H","R":"0/100","L":1},{"I":66,"D":"lux","T":"L","R":"0/1","L":1},{"I":77,"D":"battery","T":"H","R":"0/100","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly Sense SHSEN-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":1},{"I":6107,"T":"A","D":"motion","R":["0/1","-1"],"L":1},{"I":3106,"T":"L","D":"luminosity","U":"lux","R":["U32","-1"],"L":1},{"I":3112,"T":"S","D":"charger","R":["0/1","-1"],"L":2},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2}]}
 */
let shellysense = {
  'sensor.battery': {
    coap: {
      coap_publish: '3111' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysense-<deviceid>/sensor/battery',
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
  'sensor.humidity': {
    coap: {
      coap_publish: '3103' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysense-<deviceid>/sensor/humidity',
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
  'sensor.temperature': {
    coap: {
      coap_publish: '3101' // CoAP >= FW 1,8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysense-<deviceid>/sensor/temperature',
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
  },
  'sensor.motion': {
    coap: {
      coap_publish: '6107', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 ? true : false; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysense-<deviceid>/sensor/motion',
    },
    common: {
      'name': 'Motion',
      'type': 'boolean',
      'role': 'sensor.motion',
      'read': true,
      'write': false
    }
  },
  'sensor.charger': {
    coap: {
      coap_publish: '3112', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value === 1 ? true : false; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysense-<deviceid>/sensor/charger',
    },
    common: {
      'name': 'External Power',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'sensor.lux': {
    coap: {
      coap_publish: '3106', // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/shellysense-<deviceid>/sensor/lux',
    },
    common: {
      'name': 'Illuminance',
      'type': 'number',
      'role': 'value.brightness',
      'read': true,
      'write': false,
      'unit': 'Lux'
    }
  }
};

module.exports = {
  shellysense: shellysense
};
