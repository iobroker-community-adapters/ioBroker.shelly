/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly HT / SHHT-1 / shellyht
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":33,"D":"temperature","T":"T","R":"-40/125","L":1},{"I":44,"D":"humidity","T":"H","R":"0/100","L":1},{"I":77,"D":"battery","T":"B","R":"0/100","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly HT SHHT-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
let shellyht = {
  'bat.value': {
    coap: {
      coap_publish: '3111' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/battery',
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
      coap_publish: '3103' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/humidity'
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
  'tmp.temperatureC': {
    coap: {
      coap_publish: '3101', // CoAP >= FW 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).tmp.tC : undefined; },
    },
    common: {
      'name': 'Temperature  °C',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°C',
      'min': -100,
      'max': 300
    }
  },
  'tmp.temperatureF': {
    coap: {
      coap_publish: '3102', // CoAP >= FW 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).tmp.tF : undefined; },
    },
    common: {
      'name': 'Temperature °F',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°F',
      'min': -100,
      'max': 572
    }
  },
};

module.exports = {
  shellyht: shellyht
};
