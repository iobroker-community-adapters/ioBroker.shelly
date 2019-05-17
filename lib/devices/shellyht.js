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
  },
  'online': {
    coap: {
    },
    mqtt: {
      // mqtt_publish: 'shellies/shelly1-<deviceid>/online'
    },
    common: {
      'name': 'Online',
      'type': 'boolean',
      'role': 'indicator.reachable',
      'read': true,
      'write': false
    }
  },
  'firmware': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).update.has_update : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).new_fw : false; }
    },
    common: {
      'name': 'New firmware available',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'hostname': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).wifi_sta.ip : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).ip : false; }
    },
    common: {
      'name': 'Device Hostname',
      'type': 'string',
      'role': 'info.ip',
      'read': true,
      'write': false
    }
  },
  'rssi': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
    },
    common: {
      'name': 'Device RSSI status',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false
    }
  },
  'protocol': {
    coap: {
      coap_init_value: 'coap'
    },
    mqtt: {
      mqtt_init_value: 'mqtt'
    },
    common: {
      'name': 'Protocol',
      'type': 'string',
      'role': 'info',
      'read': true,
      'write': false
    }
  }
};

module.exports = {
  shellyht: shellyht
};
