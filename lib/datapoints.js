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

let coapnames = {
  'SHSW-21': 'shellyswitch',
  'SHSW-25': 'shellyswitch25',
  'SHSW-1': 'shelly1'
};

let devicenames = {
  shellyswitch: 'SHSW-21#<deviceid>#1',
  shellyswitch25: 'SHSW-25#<deviceid>#1',
  shelly1: 'SHSW-1#<deviceid>#1'
};

/**
 * Shelly 1
 */
let shelly1 = {
  'Relay0.Switch': {
    coap: {
      funct_in: (value) => { return value.G[0][2] === 1 ? true : false; }
    },
    http: {
      cmd: '/relay/0',
      funct_out: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      publish: 'shellies/shelly1-<deviceid>/relay/0',
      cmd: 'shellies/shelly1-<deviceid>/relay/0/command',
      funct_out: (value) => { return value === true ? 'on' : 'off'; },
      funct_in: (value) => { return value === 'on'; }
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings/relay/0',
      funct_in: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      funct_out: (value) => { return { auto_off: value }; }
    },
    mqtt: {
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings/relay/0',
      funct_in: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      funct_out: (value) => { return { auto_on: value }; }
    },
    mqtt: {
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
    http: {
    },
    mqtt: {
      // publish: 'shellies/shelly1-<deviceid>/online'
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
    },
    http: {
      publish: '/status',
      funct_in: (value) => { return value ? JSON.parse(value).update.has_update : undefined; }
    },
    mqtt: {
      publish: 'shellies/announce',
      funct_in: (value) => { return value ? JSON.parse(value).new_fw : false; }
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
    },
    http: {
      publish: '/status',
      funct_in: (value) => {
        return value ? JSON.parse(value).wifi_sta.ip : undefined;
      }
    },
    mqtt: {
      publish: 'shellies/announce',
      funct_in: (value) => { return value ? JSON.parse(value).ip : false; }
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
    },
    http: {
      publish: '/status',
      funct_in: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
    },
    mqtt: {
    },
    common: {
      'name': 'Device RSSI status',
      'type': 'number',
      'role': 'value',
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
      funct_in: (value) => { return value.G[0][2] === 1 ? true : false; }
    },
    http: {
      cmd: '/relay/0',
      funct_out: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/relay/0',
      cmd: 'shellies/shellyswitch-<deviceid>/relay/0/command',
      funct_out: (value) => { return value === true ? 'on' : 'off'; },
      funct_in: (value) => { return value === 'on'; }
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings/relay/0',
      funct_in: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      funct_out: (value) => { return { auto_off: value }; }
    },
    mqtt: {
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings/relay/0',
      funct_in: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      funct_out: (value) => { return { auto_on: value }; }
    },
    mqtt: {
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
      funct_in: (value) => {
        return value.G[1][2] === 1 ? true : false;
      }
    },
    http: {
      cmd: '/relay/1',
      funct_out: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/relay/1',
      cmd: 'shellies/shellyswitch-<deviceid>/relay/1/command',
      funct_out: (value) => { return value === true ? 'on' : 'off'; },
      funct_in: (value) => { return value === 'on'; }
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings/relay/1',
      funct_in: (value) => { return value ? JSON.parse(value).relays[1].auto_off : undefined; },
      funct_out: (value) => { return { auto_off: value }; }
    },
    mqtt: {
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings/relay/1',
      funct_in: (value) => { return value ? JSON.parse(value).relays[1].auto_on : undefined; },
      funct_out: (value) => { return { auto_on: value }; }
    },
    mqtt: {
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
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command'
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
    },
    http: {
      // publish: '/settings',
      // funct_in: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
      // cmd: '/roller/0',
      // funct_out: () => { return { go: 'close', duration: async (self) => shuterDuration(self) }; },
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      funct_out: () => { return 'close'; },
      cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      funct_in: (value) => { return value == 'close' ? true : false; }
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
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      funct_out: () => { return 'open'; },
      cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      funct_in: (value) => { return value == 'open' ? true : false; }
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
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/roller/0',
      cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command',
      funct_out: () => { return 'stop'; },
      funct_in: (value) => { return value == 'stop' ? true : false; }
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
    },
    http: {
      // publish : '/settings',
      // funct_in: (value) =>  { return value ? JSON.parse(value).rollers[0].maxtime : undefined; }
    },
    mqtt: {
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
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/roller/0/pos',
      cmd: 'shellies/shellyswitch-<deviceid>/roller/0/command/pos',
      funct_out: (value) => { return value.toString(); },
      funct_in: (value) => { return value == -1 ? 101 : value; }
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
      funct_in: (value) => { return (Math.round(value.G[2][2] * 2) / 2); }
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/relay/power',
      funct_in: (value) => { return (Math.round(value * 2) / 2); }
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
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/relay/energy',
      funct_in: (value) => { return Math.round((value / 60) * 2) / 2; }
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
    http: {
    },
    mqtt: {
      publish: 'shellies/shellyswitch-<deviceid>/online'
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
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/announce',
      funct_in: (value) => { return value ? JSON.parse(value).new_fw : false; }
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
    },
    http: {
    },
    mqtt: {
      publish: 'shellies/announce',
      funct_in: (value) => { return value ? JSON.parse(value).ip : false; }
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
    },
    http: {
      publish: '/status',
      funct_in: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
    },
    mqtt: {
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
    },
    http: {
      publish: '/settings',
      cmd: '/settings',
      funct_in: (value) => { return value && JSON.parse(value) ? JSON.parse(value).mode : undefined; },
      funct_out: (value) => { return { mode: value }; }
    },
    mqtt: {
    },
    common: {
      'name': 'Roller/Relay mode',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'roller:roller;relay:relay'
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

function getDeviceName(name) {
  return devicenames[name];
}

function getCoapName(name) {
  return coapnames[name];
}



module.exports = {
  getAll: getAll,
  getDeviceName: getDeviceName,
  getCoapName: getCoapName
};
