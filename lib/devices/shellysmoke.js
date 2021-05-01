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
  *
 * CoAP Version >= 1.8
 *  Shelly Smoke SHSM-01:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":6105,"T":"A","D":"smoke","R":["0/1","-1"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
let shellysmoke = {
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
  'smoke.value': {
    coap: {
      coap_publish: '6105', // CoAP >= FW 1.8
      coap_publish_funct: (value) => { return value == 1; }
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/smoke',
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
  'tmp.temperatureC': {
    coap: {
      coap_publish: '3101', // CoAP >= FW 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).tmp.tC : undefined; },
      // mqtt_publish: 'shellies/<mqttprefix>/sensor/temperature',
    },
    common: {
      'name': 'Temperature  °C',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°C'
    }
  },
  'tmp.temperatureF': {
    coap: {
      coap_publish: '3102', // CoAP >= FW 1.8
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).tmp.tF : undefined; },
      // mqtt_publish: 'shellies/<mqttprefix>/sensor/temperature',
    },
    common: {
      'name': 'Temperature °F',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°F'
    }
  }
};

module.exports = {
  shellysmoke: shellysmoke
};
