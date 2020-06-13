/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Door/Windows Sensor
 */
let shellydw = {
  'sensor.battery': {
    coap: {
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(77, value.G); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw-<deviceid>/sensor/battery',
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
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(55, value.G) === 0 ? false : true; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw-<deviceid>/sensor/state',
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
      coap_publish_funct: (value) => { return shellyHelper.getCoapValue(66, value.G); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw-<deviceid>/sensor/lux',
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
  'sensor.vibration': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).accel.vibration == 1 : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw-<deviceid>/sensor/vibration',
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? Math.round(JSON.parse(value)) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellydw-<deviceid>/sensor/tilt',
    },
    common: {
      'name': 'Tilt',
      'type': 'number',
      'role': 'sensor',
      'read': true,
      'write': false,
      'unit': 'degree'
    }
  }
};

module.exports = {
  shellydw: shellydw
};
