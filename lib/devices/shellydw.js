/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Door/Windows Sensor / SHDW-1 / shellydw
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":66,"D":"lux","T":"L","R":"0/100000","L":1},{"I":55,"D":"State","T":"S","R":"0/1","L":1},{"I":77,"D":"battery","T":"B","R":"0/100","L":1},{"I":88,"D":"tilt","T":"S","R":"0/180","L":1},{"I":99,"D":"vibration","T":"S","R":"0/1","L":1}]}
 */
let shellydw = {
  'sensor.battery': {
    coap: {
      coap_publish: '77'
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
      coap_publish: '55',
      coap_publish_funct: (value) => { return value === 0 ? false : true; }
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
      coap_publish: '66',
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
      coap_publish: '99',
      coap_publish_funct: (value) => { return value != 0; }
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
      coap_publish: '88'
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
