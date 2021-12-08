/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Gas / SHGS-1 / shellygas
 * CoAP:
 *  {"blk":[{"I":0,"D":"Device"}],"sen":[{"I":118,"T":"S","D":"Sensor state","R":"unknown/warmup/normal/fault","L":0},{"I":119,"T":"S","D":"Alarm state","R":"unknown/none/mild/heavy/test","L":0},{"I":120,"T":"S","D":"Self-test state","R":"not_completed/completed/running/pending","L":0},{"I":122,"T":"S","D":"Concentration (ppm)","R":"0-65535","L":0}]}
  *
 * CoAP Version >= 1.8
 *  Shelly Gas SHGS-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"valve_0"},{"I":3,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":3},{"I":3113,"T":"S","D":"sensorOp","R":["warmup/normal/fault","unknown"],"L":1},{"I":3114,"T":"S","D":"selfTest","R":"not_completed/completed/running/pending","L":1},{"I":6108,"T":"A","D":"gas","R":["none/mild/heavy/test","unknown"],"L":1},{"I":3107,"T":"C","D":"concentration","U":"ppm","R":["U16","-1"],"L":1},{"I":1105,"T":"S","D":"valve","R":["closed/opened/not_connected/failure/closing/opening/checking","unknown"],"L":2}]}
 */
let shellygas = {
  'Gas.SensorState': {
    coap: {
      coap_publish: '3113' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/operation',
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
      coap_publish: '3114' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/self_test',
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
      coap_publish: '6108' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/gas',
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
      coap_publish: '3107' // CoAP >= FW 1.8
    },
    mqtt: {
      mqtt_publish: 'shellies/<mqttprefix>/sensor/concentration',
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
