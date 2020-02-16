/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

/**
 * get the value of the key
 * @param {integer} key - like 112
 * @param {array} array - [[0,111,0],[0,112,1]]
 */
function getCoapValue(key, array) {
  if (array) {
    for (let k in array) {
      if (array[k][1] === key) return array[k][2];
    }
  }
  return undefined;
}

/**
 * Shelly 1
 */
let shelly1 = {
  'Relay0.Switch': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
      coap_publish_funct: (value) => { return getCoapValue(112, value.G) == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/relay/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shelly1-<deviceid>/relay/0/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
    },
    common: {
      'name': 'Switch',
      'type': 'boolean',
      'role': 'switch',
      'read': true,
      'write': true,
      'def': false
    }
  },
  'Relay0.Input': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/input/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Input / Detach',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false,
      'def': false
    }
  },
  'Relay0.longpush': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1-<deviceid>/longpush/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Longpush',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false,
      'def': false
    }
  },
  'Relay0.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    common: {
      'name': 'Auto Timer Off',
      'type': 'number',
      'role': 'level.timer',
      'def': 0,
      'unit': 's',
      'read': true,
      'write': true
    }
  },
  'Relay0.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    common: {
      'name': 'Auto Timer Off',
      'type': 'number',
      'role': 'level.timer',
      'def': 0,
      'unit': 's',
      'read': true,
      'write': true
    }
  },
  'ext.temperatureC1': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['0'].tC : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature/0',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC2': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['1'].tC : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature/1',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC3': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['2'].tC : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature/2',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC4': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['3'].tC : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature/3',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°C',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF1': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['0'].tF : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature_f/0',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF2': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['1'].tF : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature_f/1',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF3': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['2'].tF : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature_f/2',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°F',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureF4': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value).ext_temperature ? JSON.parse(value).ext_temperature['3'].tF : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shelly1pm-<deviceid>/ext_temperature_f/3',
      mqtt_publish_funct: (value) => { return value }
    },
    common: {
      'name': 'External Tmperature',
      'type': 'number',
      'role': 'level.timer',
      'unit': '°F',
      'read': true,
      'write': false
    }
  }
};


module.exports = {
  shelly1: shelly1
};
