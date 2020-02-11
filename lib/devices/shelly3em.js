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

async function getPowerFactor(self, channel) {
  // let stateVoltage = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter' + channel + '.Voltage');
  let statePower = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter' + channel + '.Power');
  let stateReactivePower = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter' + channel + '.ReactivePower');
  let pf = 0.00;
  if (statePower && stateReactivePower) {
    // let voltage = stateVoltage.val;
    let power = statePower.val;
    let reactive = stateReactivePower.val;
    if (Math.abs(power) + Math.abs(reactive) > 1.5) {
      pf = power / Math.sqrt(power * power + reactive * reactive);
      pf = Math.round(pf * 100) / 100;
    }
  }
  return pf;
}

let shelly3em = {
  'Relay0.Switch': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
      coap_publish_funct: (value) => { return getCoapValue(112, value.G) == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/relay/0',
      mqtt_cmd: 'shellies/shellyem3-<deviceid>/relay/0/command',
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
  'Emeter0.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(111, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/power',
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
  'Emeter0.Total': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].total * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/total',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'Emeter0.Total_Returned': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].total_returned * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/total_returned',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'Emeter0.ReactivePower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].reactive * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/reactive_power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Reactive Power',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'VAR'
    }
  },
  'Emeter0.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerFactor(self, 0); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerFactor(self, 0); }
    },
    common: {
      'name': 'Power Factor',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Emeter0.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].voltage * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/voltage',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Voltage',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Emeter0.Current': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].ctraf_type * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].ctraf_type * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current Transformation Type',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Emeter1.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(121, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/power',
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
  'Emeter1.Total': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].total * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/total',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'Emeter1.Total_Returned': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].total_returned * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/total_returned',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'Emeter1.ReactivePower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].reactive * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/reactive_power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Reactive Power',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'VAR'
    }
  },
  'Emeter1.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerFactor(self, 1); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerFactor(self, 1); }
    },
    common: {
      'name': 'Power Factor',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Emeter1.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].voltage * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/voltage',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Voltage',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Emeter1.Current': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].ctraf_type * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].ctraf_type * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current Transformation Type',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Emeter2.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(131, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/power',
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
  'Emeter2.Total': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].total * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/total',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'Emeter2.Total_Returned': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].total_returned * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/total_returned',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'Wh'
    }
  },
  'Emeter2.ReactivePower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].reactive * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/reactive_power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Reactive Power',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'VAR'
    }
  },
  'Emeter2.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerFactor(self, 2); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerFactor(self, 2); }
    },
    common: {
      'name': 'Power Factor',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Emeter2.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].voltage * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/voltage',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Voltage',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Emeter2.Current': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].ctraf_type * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].ctraf_type * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current Transformation Type',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
   'Emeter2.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(131, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/power',
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
};

module.exports = {
  shelly3em: shelly3em
};
