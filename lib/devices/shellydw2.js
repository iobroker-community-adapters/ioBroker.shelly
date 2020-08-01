/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Door/Windows Sensor / SHDW-2 / shellydw2
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":3108,"T":"S","D":"dwIsOpened","R":["0/1","-1"],"L":1},{"I":3109,"T":"S","D":"tilt","U":"deg","R":["0/180","-1"],"L":1},{"I":6110,"T":"A","D":"vibration","R":["0/1","-1"],"L":1},{"I":3106,"T":"L","D":"luminosity","U":"lux","R":["U32","-1"],"L":1},{"I":3110,"T":"S","D":"luminosityLevel","R":["dark/twilight/bright","unknown"],"L":1},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
let shellydw2 = {
  'sensor.battery': {
    coap: {
      coap_publish: '3111'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/battery',
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
  'sensor.door': {
    coap: {
      coap_publish: '3108',
      coap_publish_funct: (value) => { return value == 0 ? false : true; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/state',
      mqtt_publish_funct: (value) => { return value === 'open'; }
    },
    common: {
      'name': 'Door Sensor',
      'type': 'boolean',
      'role': 'sensor.door',
      'read': true,
      'write': false,
      'def': false
    }
  },
  'sensor.lux': {
    coap: {
      coap_publish: '3106',
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/lux',
    },
    common: {
      'name': 'Illuminance',
      'type': 'number',
      'role': 'value.brightness',
      'read': true,
      'write': false,
      'unit': 'Lux'
    }
  },
  'sensor.illuminantion': {
    coap: {
      coap_publish: '3110',
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/illumination',
    },
    common: {
      'name': 'Illumination Level',
      'type': 'string',
      'role': 'value',
      'read': true,
      'write': false,
      'states': 'dark:dark;twilight:twilight;bright:bright'
    }
  },
  'sensor.vibration': {
    coap: {
      coap_publish: '6110',
      coap_publish_funct: (value) => { return value != 0; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/vibration',
      mqtt_publish_funct: (value) => { return value != 0; }
    },
    common: {
      'name': 'Vibration',
      'type': 'boolean',
      'role': 'sensor',
      'read': true,
      'write': false
    }
  },
  'sensor.tilt': {
    coap: {
      coap_publish: '3109'
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/tilt',
    },
    common: {
      'name': 'Tilt',
      'type': 'number',
      'role': 'sensor',
      'read': true,
      'write': false,
      'unit': 'degree'
    }
  },
  'sensor.temperature': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw2-<deviceid>/sensor/temperature'
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'min': -100,
      'max': 100,
      'def': 0
    }
  },
  'sensor.temperatureC': {
    coap: {
      coap_publish: '3101'
    },
    mqtt: {
      no_display: true
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°C',
      'min': -100,
      'max': 100,
      'def': 0
    }
  },
  'sensor.temperatureF': {
    coap: {
      coap_publish: '3102'
    },
    mqtt: {
      no_display: true
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°F',
      'min': -100,
      'max': 100,
      'def': 0
    }
  },
};

module.exports = {
  shellydw2: shellydw2
};
