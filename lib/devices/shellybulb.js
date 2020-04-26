
/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const colorconv = require('../colorconv');

function intToHex(number) {
  if (!number) number = 0;
  let hex = number.toString(16);
  hex = ('00' + hex).slice(-2).toUpperCase(); // 'a' -> '0A'
  return hex;
}

function hextoInt(hex) {
  if (!hex) hex = '00';
  return parseInt(hex, 16);
}

async function getRGBW(self) {
  let id = self.getDeviceName();
  let stateId;
  let state;
  stateId = id + '.lights.red';
  state = await self.adapter.getStateAsync(stateId);
  let valred = state ? state.val : 0;
  stateId = id + '.lights.green';
  state = await self.adapter.getStateAsync(stateId);
  let valgreen = state ? state.val : 0;
  stateId = id + '.lights.blue';
  state = await self.adapter.getStateAsync(stateId);
  let valblue = state ? state.val : 0;
  stateId = id + '.lights.white';
  state = await self.adapter.getStateAsync(stateId);
  let valwhite = state ? state.val : 0;
  return '#' + intToHex(valred) + intToHex(valgreen) + intToHex(valblue) + intToHex(valwhite);
}

function getColorsFromRGBW(value) {
  value = value || '#00000000';
  let obj = {
    red: hextoInt(value.substr(1, 2)),
    green: hextoInt(value.substr(3, 2)),
    blue: hextoInt(value.substr(5, 2)),
    white: hextoInt(value.substr(7, 2))
  };
  return obj;
}

async function getHsvFromRgb(self) {
  let value = await getRGBW(self); 
  let rgbw  = getColorsFromRGBW(value);

  let hsv = colorconv.rgbToHsv(rgbw.red, rgbw.green, rgbw.blue);
  return {
    hue: hsv[0],
    saturation: hsv[1],
    brightness: hsv[2]
  }
}

async function getColorsFromHue(self) {
  let id = self.getDeviceName();
  let stateId;
  let state;
  stateId = id + '.lights.hue';
  state = await self.adapter.getStateAsync(stateId);
  let valhue = state ? state.val : 0;
  stateId = id + '.lights.saturation';
  state = await self.adapter.getStateAsync(stateId);
  let valsaturation = state ? state.val : 0;
  // stateId = id + '.lights.value';
  stateId = id + '.lights.gain';
  state = await self.adapter.getStateAsync(stateId);
  let valvalue = state ? state.val : 0;
  let rgb = colorconv.hsvToRgb(valhue,valsaturation,valvalue);
  let obj = {
    red: rgb[0],
    green: rgb[1],
    blue: rgb[2],
  };
  return obj;
}

async function getLightsObject(self) {
  let id = self.getDeviceName();
  let obj = {
    'ison': 'lights.Switch',
    'mode': 'lights.mode',
    'red': 'lights.red',
    'green': 'lights.green',
    'blue': 'lights.blue',
    'white': 'lights.white',
    'gain': 'lights.gain',
    'temp': 'lights.temp',
    'brightness': 'lights.brightness',
    'effect': 'lights.effect'
  };
  for (let i in obj) {
    let stateId = id + '.' + obj[i];
    let state = await self.adapter.getStateAsync(stateId);
    obj[i] = state ? state.val : undefined;
  }
  return obj;
}

/**
 * Shelly Bulb
 */
let shellybulb = {
  'lights.Switch': {
    coap: {
      coap_publish_funct: (value) => {
        return value.G[4][2] === 1 ? true : false;
      },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/command',
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
  'lights.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/light/0',
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
  'lights.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/light/0',
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
  'lights.mode': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Modus',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'color:color;white:white'
    }
  },
  'lights.red': {
    coap: {
      coap_publish_funct: (value) => { return value.G[0][2]; },
      // http_publish: '/color/0',
      // http_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { red: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Red',
      'type': 'number',
      'role': 'level.color.red',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'lights.green': {
    coap: {
      coap_publish_funct: (value) => { return value.G[1][2]; },
      // http_publish: '/color/0',
      // http_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { green: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Green',
      'type': 'number',
      'role': 'level.color.green',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'lights.blue': {
    coap: {
      coap_publish_funct: (value) => { return value.G[2][2]; },
      // http_publish: '/color/0',
      // http_publish_funct: (value) => {return value ? JSON.parse(value).blue : undefined;},
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { blue: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).blue : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Green',
      'type': 'number',
      'role': 'level.color.blue',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'lights.white': {
    coap: {
      coap_publish_funct: (value) => { return value.G[3][2]; },
      // http_publish: '/color/0',
      // http_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { white: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'White',
      'type': 'number',
      'role': 'level.color.white',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'lights.gain': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: (value) => {
        return value ? JSON.parse(value).gain : undefined;
      },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { gain: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).gain : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Gain',
      'type': 'number',
      'role': 'level.color.brightness',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  },
  'lights.temp': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).temp : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { temp: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).temp : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'level.temperature',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  },
  'lights.brightness': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: (value) => {
        return value ? JSON.parse(value).brightness : undefined;
      },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Brightness',
      'type': 'number',
      'role': 'level.brightness',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  },
  'lights.effect': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { effect: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Effect',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100,
      'states': '0:Off;1:Meteor Shower;2:Gradual Change;3:Breath;4:Flash;5:On/Off Gradual;6:Red/Green Change'
    }
  },
  'lights.rgbw': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: async (value, self) => { return await getRGBW(self) || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return getColorsFromRGBW(value); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return await getRGBW(self) || undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(getColorsFromRGBW(value)); }
    },
    common: {
      'name': 'Color RGBW',
      'type': 'string',
      'role': 'level.color.rgb',
      'read': false,
      'write': true
    }
  },
  'lights.hue': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: async (value, self) => { return (await getHsvFromRgb(self)).hue || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return await getColorsFromHue(self); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return (await getHsvFromRgb(self)).hue || undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getColorsFromHue(self)); }
    },
    common: {
      'name': 'Hue',
      'type': 'number',
      'role': 'level.color.hue',
      'min': 0,
      'max': 360,      
      'read': false,
      'write': true
    }
  },
  'lights.saturation': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: async (value, self) => { return (await getHsvFromRgb(self)).saturation || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return await getColorsFromHue(self); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellybulb-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return (await getHsvFromRgb(self)).saturation || undefined; },
      mqtt_cmd: 'shellies/shellybulb-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getColorsFromHue(self)); }
    },
    common: {
      'name': 'Saturation',
      'type': 'number',
      'role': 'level.color.saturation',
      'min': 0,
      'max': 100,      
      'read': false,
      'write': true
    }
  }
};

module.exports = {
  shellybulb: shellybulb
};
