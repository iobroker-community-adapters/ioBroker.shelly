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

async function getSetDuration(self, id, newval) {
  try {
    id = self.getDeviceName() + '.' + id;
    let state = await self.adapter.getStateAsync(id);
    let value;
    if (state) {
      value = state.val > 0 ? state.val : 0;
    }
    if (newval >= 0) {
      await self.adapter.setStateAsync(id, { val: newval, ack: true });
    }
    return value;
  } catch (error) {
    return 0;
  }
}

/**
 * 
 * @param {*} value - like JSON.parse(value)
 * @param {*} key  - '0', '1', ....
 * @param {*} unit . 'C' or 'F'
 */
function getExtTemp(value, key, unit) {
  let unitkey = '';
  switch (unit) {
    case 'C':
      unitkey = 'tC';
      break;
    case 'F':
      unitkey = 'tF';
      break;
    default:
      return 0;
  }
  if(value && value.hasOwnProperty('ext_temperature') &&  value.ext_temperature.hasOwnProperty(key) && value.ext_temperature[key].hasOwnProperty(unitkey)) {
      return value.ext_temperature[key][unitkey];
  } else {
    return 0;
  }
}

let shellyswitch25 = {
  'Relay0.Switch': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
      coap_publish_funct: (value) => { return getCoapValue(112, value.G) == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await getSetDuration(self, 'Relay0.Timer') }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/relay/0',
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/relay/0/command',
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
  'Relay0.Timer': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return await getSetDuration(self, 'Relay0.Timer'); }
    },
    mqtt: {
      no_display: true
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
  'Relay0.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(111, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/relay/0/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
  'Relay0.Energy': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[0].total / 60) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/relay/0/energy',
      mqtt_publish_funct: (value) => { return Math.round((value / 60) * 100) / 100; }
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
  'Relay0.Input': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/input/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
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
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/longpush/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; }
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
  'Relay1.Switch': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[1][2] === 1 ? true : false; },
      coap_publish_funct: (value) => { return getCoapValue(122, value.G) == 1 ? true : false; },
      http_cmd: '/relay/1',
      http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await getSetDuration(self, 'Relay1.Timer') } : { turn: 'off', timer: await getSetDuration(self, 'Relay1.Timer') }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/relay/1',
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/relay/1/command',
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
  'Relay1.Timer': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return await getSetDuration(self, 'Relay1.Timer'); }
    },
    mqtt: {
      no_display: true
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
  'Relay1.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[3][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(121, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/relay/1/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
  'Relay1.Energy': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).meters[1].total / 60) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/relay/1/energy',
      mqtt_publish_funct: (value) => { return Math.round((value / 60) * 100) / 100; }
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
  'Relay1.Input': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/input/1',
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
  'Relay1.longpush': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/longpush/1',
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
  'Shutter.state': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[0][2] === 1 ? 'open' : value.G[1][2] === 1 ? 'close' : 'stop'; },
      coap_publish_funct: (value) => { return getCoapValue(112, value.G) === 1 ? 'open' : getCoapValue(122, value.G) === 1 ? 'close' : 'stop'; },
      http_cmd: '/roller/0',
      http_cmd_funct: (value) => { return { go: value }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/roller/0',
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/roller/0/command'
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
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'close' }; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { go: 'close', duration: await getSetDuration(self, 'Shutter.Duration', 0) }; },
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/roller/0',
      mqtt_cmd_funct: () => { return 'close'; },
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/roller/0/command',
      mqtt_publish_funct: (value) => { return value == 'close' ? true : false; }
      // http_publish: '/settings',
      // http_publish_funct: (value) => { return JSON.parse(value) ? JSON.parse(value).rollers.maxtime : undefined; },
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => async (value,self) => { return { go: 'close', duration: await getSetDuration(self, 'Shutter.Duration') }; }
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
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'open' }; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { go: 'open', duration: await getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/roller/0',
      mqtt_cmd_funct: () => { return 'open'; },
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/roller/0/command',
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
      // http_cmd: '/roller/0',
      // http_cmd_funct: () => { return { go: 'stop' }; },
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { go: 'stop', duration: await getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/roller/0',
      mqtt_publish_funct: (value) => { return value == 'stop' ? true : false; },
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/roller/0/command',
      mqtt_cmd_funct: () => { return 'stop'; }
    },
    common: {
      'name': 'Pause',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'Shutter.Duration': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return await getSetDuration(self, 'Shutter.Duration'); }
      // http_publish_funct: (value) => { return value ? JSON.parse(value).rollers[0].maxtime : undefined; },
    },
    mqtt: {
      // http_publish : '/settings',
      // http:publish_funct: (value) =>  { return value ? JSON.parse(value).rollers[0].maxtime : undefined; }     
      no_display: true
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
  'Shutter.Position': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[2][2] == -1 ? 101 : value.G[2][2]; },
      coap_publish_funct: (value) => { return getCoapValue(113, value.G) == -1 ? 101 : getCoapValue(113, value.G); },
      // http_cmd: '/roller/0',
      // http_cmd_funct: (value) => { return { 'go': 'to_pos', 'roller_pos': value }; }
      http_cmd: '/roller/0',
      http_cmd_funct: async (value, self) => { return { 'go': 'to_pos', 'roller_pos': value, 'duration': await getSetDuration(self, 'Shutter.Duration', 0) }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/roller/0/pos',
      mqtt_cmd: 'shellies/shellyswitch25-<deviceid>/roller/0/command/pos',
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
  'temperature': {
    coap: {
      // no_display: true
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).temperature : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyswitch25-<deviceid>/temperature',
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°C',
      'min': -100,
      'max': 100
    }
  },
  'overtemperature': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).overtemperature : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyplug-s-<deviceid>/overtemperature',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Temperature',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'ext.temperatureC1': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '0', 'C') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '1', 'C') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '2', 'C') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '3', 'C') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '0', 'F') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '1', 'F') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '2', 'F') : undefined; }
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
      http_publish_funct: (value) => { return value ? getExtTemp(JSON.parse(value), '3', 'F') : undefined; }
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
  shellyswitch25: shellyswitch25
};
