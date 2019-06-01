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
      http_publish_funct: async (value, self) => { 
        await self.firmwareUpdate(value && JSON.parse(value).update.has_update);
        return value ? JSON.parse(value).update.has_update : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: async (value, self) => { 
        await self.firmwareUpdate(value && JSON.parse(value).new_fw);
        return value ? JSON.parse(value).new_fw : false; }
    },
    common: {
      'name': 'New firmware available',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'version': {
    coap: {
      http_publish: '/settings',
      http_publish_funct:  (value) => { return value ? JSON.parse(value).fw : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: async (value) => { return value ? JSON.parse(value).fw_ver : undefined; }
    },
    common: {
      'name': 'Firmware version',
      'type': 'string',
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
  shelly1: shelly1
};
