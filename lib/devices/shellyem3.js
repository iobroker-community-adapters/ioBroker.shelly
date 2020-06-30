/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly 3 EM / SHEM-3 / shellyem3
 * CoAP: 
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Meter0"},{"I":2,"D":"Meter1"},{"I":3,"D":"Meter2"}],"sen":[{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":111,"T":"P","D":"Power","R":"0/26400","L":1},{"I":114,"T":"S","D":"PF","R":"0/1","L":1},{"I":115,"T":"S","D":"Current","R":"0/120","L":1},{"I":116,"T":"S","D":"Voltage","R":"0/265","L":1},{"I":121,"T":"P","D":"Power","R":"0/26400","L":2},{"I":124,"T":"S","D":"PF","R":"0/1","L":2},{"I":125,"T":"S","D":"Current","R":"0/120","L":2},{"I":126,"T":"S","D":"Voltage","R":"0/265","L":2},{"I":131,"T":"P","D":"Power","R":"0/26400","L":3},{"I":134,"T":"S","D":"PF","R":"0/1","L":3},{"I":135,"T":"S","D":"Current","R":"0/120","L":3},{"I":136,"T":"S","D":"Voltage","R":"0/265","L":3}]} 
 */
let shellyem3 = {
  'Relay0.Switch': {
    coap: {
      coap_publish: '112',
      coap_publish_funct: (value) => { return value == 1 ? true : false; },
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
      coap_publish: '111',
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).emeters[0].total / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/total'
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.total',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter0.Total_Returned': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).emeters[0].total_returned / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/total_returned'
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.total_returned',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter0.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].pf * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/pf',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].current * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].current * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current',
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
      coap_publish: '121',
      coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[1].total / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/total'
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.total',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter1.Total_Returned': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[1].total_returned / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/total_returned'
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.total_returned',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter1.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].pf * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/pf',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].current * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].current * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current',
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
      coap_publish: '131',
      coap_publish_funct: (value) => { return (value * 100) / 100; }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[2].total / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/total'
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.total',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter2.Total_Returned': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[2].total_returned / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/total_returned'
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.total_returned',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter2.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].pf * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/pf',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].current * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].current * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Total.ConsumedPower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getTotalSumm(self); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getTotalSumm(self); }
    },
    common: {
      'name': 'Total consumed energy',
      'type': 'number',
      'role': 'value.totalconsumed',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Total.Current': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getCurrentSumm(self); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getCurrentSumm(self); }
    },
    common: {
      'name': 'Total Current',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Total.InstantPower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getPowerSumm(self); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getPowerSumm(self); }
    },
    common: {
      'name': 'Total Instantaneous power',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },
  'Total.VoltageMean': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'mean'); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'mean'); }
    },
    common: {
      'name': 'Voltage Mean',
      'type': 'number',
      'role': 'value.voltagemean',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Total.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'total'); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'total'); }
    },
    common: {
      'name': 'Voltage Total',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  }
};

module.exports = {
  shellyem3: shellyem3
};