/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

/**
 * Shelly Sense
 */
let shellysense = {
  'sensor.battery': {
    coap: {
      coap_publish_funct: (value) => { return value.G[5][2]; }
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
      coap_publish_funct: (value) => { return value.G[3][2]; }
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
      coap_publish_funct: (value) => { return value.G[2][2]; }
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
      coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; }
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
      coap_publish_funct: (value) => { return value.G[1][2] === 1 ? true : false; }
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
      coap_publish_funct: (value) => { return value.G[4][2]; }
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
