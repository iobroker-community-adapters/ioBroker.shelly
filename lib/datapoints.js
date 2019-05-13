/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

let states = {};

async function shuterDuration(self) {
  let state = await self.adapter.getStateAsync(self.getDeviceName() + '.Shutter.Duration');
  let value;
  if (state) {
    value = state.val > 0 ? state.val : undefined;
  }
  return value;
}

let devicenames = {
  shellyswitch: 'SHSW-21',
  shellyswitch25: 'SHSW-25',
  shelly1: 'SHSW-1'
};

/**
 * Shelly 1
 */
let shelly1 = {
  'Relay0.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
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


/**
 * Shelly 2
 */
let shellyswitch = {
  'Relay0.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/0',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/relay/0/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
      mqtt_publish_funct: (value) => { return value === 'on'; }
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
  'Relay0.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
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
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
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
  'Relay1.Switch': {
    coap: {
      coap_publish_funct: (value) => { return value.G[1][2] === 1 ? true : false; },
      http_cmd: '/relay/1',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/1',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/relay/1/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
      mqtt_publish_funct: (value) => { return value === 'on'; }
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
  'Relay1.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
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
  'Relay1.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
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
  'Shutter.state': {
    coap: {
      coap_publish_funct: (value) => { return value.G[0][2] === 1 ? 'open' : value.G[1][2] === 1 ? 'close' : 'stop'; },
      http_cmd: '/roller/0',
      http_cmd_funct: (value) => { return { go: value }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command'
    },
    common: {
      'name': 'Roller state',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'close:close;open:open;stop:stop'
    }
  },
  'Shutter.Close': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: () => { return { go: 'close' }; },
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'close', duration: async (self) => shuterDuration(self) }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd_funct: () => { return 'close'; },
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      mqtt_publish_funct: (value) => { return value == 'close' ? true : false; }
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'close', duration: async (self) => shuterDuration(self) }; },
    },
    common: {
      'name': 'Close',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Shutter.Open': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: () => { return { go: 'open' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd_funct: () => { return 'open'; },
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      mqtt_publish_funct: (value) => { return value == 'open' ? true : false; }
    },
    common: {
      'name': 'Open',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Shutter.Pause': {
    coap: {
      http_cmd: '/roller/0',
      http_cmd_funct: () => { return { go: 'stop' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      mqtt_cmd_funct: () => { return 'stop'; },
      mqtt_publish_funct: (value) => { return value == 'stop' ? true : false; }
    },
    common: {
      'name': 'Pause',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  /*
  'Shutter.Duration': {
    coap: {
      // http_publish : '/settings',
      // http:publish_funct: (value) =>  { return value ? JSON.parse(value).rollers[0].maxtime : undefined; }
    },
    mqtt: {
      // http_publish : '/settings',
      // http:publish_funct: (value) =>  { return value ? JSON.parse(value).rollers[0].maxtime : undefined; }      
    },
    common: {
      'name': 'Duration',
      'type': 'number',
      'role': 'level.timer',
      'read': true,
      'write': true,
      'def': 0,
      'unit': 's'
    }
  },
  */
  'Shutter.Position': {
    coap: {
      coap_publish_funct: (value) => { return value.G[2][2] == -1 ? 101 : value; },
      http_cmd: '/roller/0',
      http_cmd_funct: (value) => {return { 'go': 'to_pos', 'roller_pos': value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/roller/0/pos',
      mqtt_cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command/pos',
      mqtt_cmd_funct: (value) => { return value.toString(); },
      mqtt_publish_funct: (value) => { return value == -1 ? 101 : value; }
    },
    common: {
      'name': 'Position',
      'type': 'number',
      'role': 'level.blind',
      'read': true,
      'write': true,
      'unit': '%',
      'min': 0,
      'max': 100
    }
  },
  'Power': {
    coap: {
      coap_publish_funct: (value) => { return (Math.round(value.G[2][2] * 2) / 2); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 2) / 2); }
    },
    common: {
      'name': 'Power',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },
  'Energy': {
    coap: {
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/relay/energy',
      mqtt_publish_funct: (value) => { return Math.round((value / 60) * 2) / 2; }
    },
    common: {
      'name': 'Energy',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'online': {
    coap: {
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch-<deviceid>/online'
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
  'mode': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings',
      http_publish_funct: (value) => { return value && JSON.parse(value) ? JSON.parse(value).mode : undefined; },
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings',
      http_publish_funct: (value) => { return value && JSON.parse(value) ? JSON.parse(value).mode : undefined; },
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    common: {
      'name': 'Roller/Relay mode',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'roller:roller;relay:relay'
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

let devices = {
  shellyswitch: shellyswitch,
  shelly1: shelly1
};

function getAll() {
  return devices;
}

function getDeviceNameForMQTT(name) {
  return devicenames[name];
}

function getDeviceNameForCoAP(name) {
  let value = Object.keys(devicenames).find((key) => devicenames[key] === name);
  return value;
}




module.exports = {
  getAll: getAll,
  getDeviceNameForMQTT: getDeviceNameForMQTT,
  getDeviceNameForCoAP: getDeviceNameForCoAP
};
