/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly RGBW2
 */
let shellyrgbw2 = {
  'lights.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value.G[5][2] === 1 ? true : false; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/command',
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
      http_cmd: '/settings/color/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/color/0',
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
      http_cmd: '/settings/color/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/color/0',
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
  'lights.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/color/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/color/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;edge:edge;detached:detached;action:action'
    }
  },
  'lights.red': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value.G[0][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { red: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
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
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value.G[1][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { green: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
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
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value.G[2][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { blue: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).blue : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
    },
    common: {
      'name': 'Blue',
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
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value.G[3][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { white: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
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
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'color') return value.G[4][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { gain: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).gain : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
    },
    common: {
      'name': 'Gain',
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
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].effect : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { effect: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectColor(self)); }
    },
    common: {
      'name': 'Effect',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100,
      'states': '0:Off;1:Meteor Shower;2:Gradual Change;3:Flash'
    }
  },
  'lights.rgbw': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: async (value, self) => { return await shellyHelper.getRGBW(self) || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return shellyHelper.getColorsFromRGBW(value); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return await shellyHelper.getRGBW(self) || undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(shellyHelper.getColorsFromRGBW(value)); }
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
      http_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).hue || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return await shellyHelper.getColorsFromHue(self); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).hue || undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getColorsFromHue(self)); }
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
      http_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).saturation || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return await shellyHelper.getColorsFromHue(self); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return (await shellyHelper.getHsvFromRgb(self)).saturation || undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getColorsFromHue(self)); }
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
  },
  'white0.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[4][2] === 1 ? true : false; },
      http_cmd: '/white/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/0/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/0/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'lights.power': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).meters[0].power : undefined; },
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).meters[0].power : undefined; },
    },
    common: {
      'name': 'Power 1',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },


  'white0.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[0][2]; },
      http_cmd: '/white/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/0/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  'white0.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/white/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/white/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;edge:edge;detached:detached;action:action'
    }
  },
  'white1.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[5][2] === 1 ? true : false; },
      http_cmd: '/white/1',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/1/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/1/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white1.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[1][2]; },
      http_cmd: '/white/1',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/1/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/1/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  'white1.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/white/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/white/1',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;edge:edge;detached:detached;action:action'
    }
  },
  'white2.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[6][2] === 1 ? true : false; },
      http_cmd: '/white/2',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/2/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/2/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white2.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[2][2]; },
      http_cmd: '/white/2',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/2/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/2/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  'white2.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/white/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/white/2',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;edge:edge;detached:detached;action:action'
    }
  },
  'white3.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[7][2] === 1 ? true : false; },
      http_cmd: '/white/3',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/3/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/3/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white3.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await shellyHelper.getMode(self)) === 'white') return value.G[3][2]; },
      http_cmd: '/white/3',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/3/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/3/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  'white3.ButtonType': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/white/3',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/white/3',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].btn_type : undefined; },
      http_cmd_funct: (value) => { return { btn_type: value }; }
    },
    common: {
      'name': 'Button Type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'momentary:momentary;toggle:toggle;edge:edge;detached:detached;action:action'
    }
  },
  'input': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/input/0',
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
  'mode': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    common: {
      'name': 'Modus',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'color:color;white:white'
    }
  }
};

module.exports = {
  shellyrgbw2: shellyrgbw2
};
