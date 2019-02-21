/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';


// *******************************************************************************
// Devicelist
// *******************************************************************************
let shelly1 = {
  'Relay0.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay0.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay0.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay0.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'rssi': {
    'name': 'Device RSSI status',
    'type': 'number',
    'role': 'value',
    'read': true,
    'write': false
  },
  'firmware': {
    'name': 'New firmware available',
    'type': 'boolean',
    'role': 'state',
    'read': true,
    'write': false
  }
};

let shelly2 = {
  'Relay0.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay0.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay0.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay0.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay1.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay1.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay1.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay1.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Power': {
    'name': 'Power',
    'type': 'number',
    'role': 'value.power',
    'read': true,
    'write': false,
    'def': 0,
    'unit': 'W'
  },
  'rssi': {
    'name': 'Device RSSI status',
    'type': 'number',
    'role': 'value',
    'read': true,
    'write': false
  },
  'firmware': {
    'name': 'New firmware available',
    'type': 'boolean',
    'role': 'state',
    'read': true,
    'write': false
  },
  'Shutter.Close': {
    'name': 'Close',
    'type': 'boolean',
    'role': 'button',
    'read': false,
    'write': true
  },
  'Shutter.Duration': {
    'name': 'Duration',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Shutter.Open': {
    'name': 'Open',
    'type': 'boolean',
    'role': 'button',
    'read': false,
    'write': true
  },
  'Shutter.Pause': {
    'name': 'Pause',
    'type': 'boolean',
    'role': 'button.stop',
    'read': false,
    'write': true
  },
  'Shutter.Position': {
    'name': 'Position',
    'type': 'number',
    'role': 'level.blind',
    'read': true,
    'write': true,
    'unit': '%',
    'min': 0,
    'max': 100
  },
  'mode': {
    'name': 'Roller/Relay mode',
    'type': 'string',
    'role': 'state',
    'read': true,
    'write': true,
    'states': 'roller:roller;relay:relay'
  },
  'Shutter.state': {
    'name': 'Roller state',
    'type': 'string',
    'role': 'state',
    'read': true,
    'write': true,
    'states': 'close:close;open:open;stop:stop'
  }
};

let shelly4 = {
  'Relay0.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay0.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay0.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay0.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay0.Power': {
    'name': 'Power',
    'type': 'number',
    'role': 'value.power',
    'read': true,
    'write': false,
    'def': 0,
    'unit': 'W'
  },
  'Relay1.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay1.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay1.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay1.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay1.Power': {
    'name': 'Power',
    'type': 'number',
    'role': 'value.power',
    'read': true,
    'write': false,
    'def': 0,
    'unit': 'W'
  },
  'Relay2.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay2.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay2.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay2.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay2.Power': {
    'name': 'Power',
    'type': 'number',
    'role': 'value.power',
    'read': true,
    'write': false,
    'def': 0,
    'unit': 'W'
  },
  'Relay3.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay3.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay3.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay3.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay3.Power': {
    'name': 'Power',
    'type': 'number',
    'role': 'value.power',
    'read': true,
    'write': false,
    'def': 0,
    'unit': 'W'
  },
  'rssi': {
    'name': 'Device RSSI status',
    'type': 'number',
    'role': 'value',
    'read': true,
    'write': false
  },
  'firmware': {
    'name': 'New firmware available',
    'type': 'boolean',
    'role': 'state',
    'read': true,
    'write': false
  }
};

// Shelly Plug
let shplg1 = {
  'Relay0.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  'Relay0.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay0.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'Relay0.Timer': {
    'name': 'Timer',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'Relay0.Power': {
    'name': 'Power',
    'type': 'number',
    'role': 'value.power',
    'read': true,
    'write': false,
    'def': 0,
    'unit': 'W'
  },
  'rssi': {
    'name': 'Device RSSI status',
    'type': 'number',
    'role': 'value',
    'read': true,
    'write': false
  },
  'firmware': {
    'name': 'New firmware available',
    'type': 'boolean',
    'role': 'state',
    'read': true,
    'write': false
  }
};


let shellyrgbww = {
  // lights.ison
  'lights.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'lights.red': {
    'name': 'Red',
    'type': 'number',
    'role': 'level.color.red',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.green': {
    'name': 'Green',
    'type': 'number',
    'role': 'level.color.green',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.blue': {
    'name': 'Blue',
    'type': 'number',
    'role': 'level.color.blue',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.white': {
    'name': 'White',
    'type': 'number',
    'role': 'level.color.white',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.gain': {
    'name': 'Gain',
    'type': 'number',
    'role': 'level',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.temp': {
    'name': 'Temperature',
    'type': 'number',
    'role': 'level.temperature',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.brightness': {
    'name': 'Brightness',
    'type': 'number',
    'role': 'level.dimmer',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  'lights.effect': {
    'name': 'Effect',
    'type': 'number',
    'role': 'state',
    'read': true,
    'write': true,
    'min': 0,
    'max': 65535
  },
  // 'lights.auto_on'
  'lights.AutoTimerOff': {
    'name': 'Auto Timer Off',
    'type': 'number',
    'role': 'level.timer',
    'def': 0,
    'unit': 's',
    'read': true,
    'write': true
  },
  // 'lights.auto_off'
  'lights.AutoTimerOn': {
    'name': 'Auto Timer On',
    'type': 'number',
    'role': 'level.timer',
    'read': true,
    'write': true,
    'def': 0,
    'unit': 's'
  },
  'mode': {
    'name': 'Modus',
    'type': 'string',
    'role': 'state',
    'read': true,
    'write': true,
    'states': 'color:color;white:white'
  }
};

let shellyht = {
  'tmp.value': {
    'name': 'Temperature',
    'type': 'number',
    'role': 'value.temperature',
    'read': true,
    'write': false,
    'min': -100,
    'max': 100
  },
  'hum.value': {
    'name': 'Relative humidity',
    'type': 'number',
    'role': 'value.humidity',
    'read': true,
    'write': false,
    'min': 0,
    'max': 100,
    'unit': '%'
  },
  'bat.value': {
    'name': 'Battery capacity',
    'type': 'number',
    'role': 'value.battery',
    'read': true,
    'write': false,
    'min': 0,
    'max': 100,
    'unit': '%'
  }
};


let shellyrgbww2 = {
  // lights.ison
  'color.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'color.red': {
    'name': 'Red',
    'type': 'number',
    'role': 'level.color.red',
    'read': true,
    'write': true,
    'min': 0,
    'max': 255
  },
  'color.green': {
    'name': 'Green',
    'type': 'number',
    'role': 'level.color.green',
    'read': true,
    'write': true,
    'min': 0,
    'max': 255
  },
  'color.blue': {
    'name': 'Blue',
    'type': 'number',
    'role': 'level.color.blue',
    'read': true,
    'write': true,
    'min': 0,
    'max': 255
  },
  'color.white': {
    'name': 'White',
    'type': 'number',
    'role': 'level.color.white',
    'read': true,
    'write': true,
    'min': 0,
    'max': 255
  },
  'color.gain': {
    'name': 'Gain',
    'type': 'number',
    'role': 'level',
    'read': true,
    'write': true,
    'min': 0,
    'max': 100
  },
  'color.effect': {
    'name': 'Effect',
    'type': 'number',
    'role': 'state',
    'read': true,
    'write': true,
    'min': 0,
    'max': 100
  },
  'white0.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'white0.brightness': {
    'name': 'Brightness',
    'type': 'number',
    'role': 'level.dimmer',
    'read': true,
    'write': true,
    'min': 0,
    'max': 100
  },
  'white1.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'white1.brightness': {
    'name': 'Brightness',
    'type': 'number',
    'role': 'level.dimmer',
    'read': true,
    'write': true,
    'min': 0,
    'max': 100
  },
  'white2.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'white2.brightness': {
    'name': 'Brightness',
    'type': 'number',
    'role': 'level.dimmer',
    'read': true,
    'write': true,
    'min': 0,
    'max': 100
  },
  'white3.Switch': {
    'def': false,
    'type': 'boolean',
    'read': true,
    'write': true,
    'name': 'Switch',
    'role': 'switch'
  },
  'white3.brightness': {
    'name': 'Brightness',
    'type': 'number',
    'role': 'level.dimmer',
    'read': true,
    'write': true,
    'min': 0,
    'max': 100
  },
  'mode': {
    'name': 'Modus',
    'type': 'string',
    'role': 'state',
    'read': true,
    'write': true,
    'states': 'color:color;white:white'
  }
};

let shellysmoke = {
  'tmp.value': {
    'name': 'Temperature',
    'type': 'number',
    'role': 'value.temperature',
    'read': true,
    'write': false,
    'min': -100,
    'max': 100
  },
  'smoke.value': {
    'name': 'Smoke detected',
    'type': 'boolean',
    'role': 'sensor.alarm.fire',
    'read': true,
    'write': false
  },
  'bat.value': {
    'name': 'Battery capacity',
    'type': 'number',
    'role': 'value.battery',
    'read': true,
    'write': false,
    'min': 0,
    'max': 100,
    'unit': '%'
  }
};

let allShellys = {
  'shelly1': shelly1,
  'shelly2': shelly2,
  'shelly4': shelly4,
  'shplg1': shplg1,
  'shellyrgbww': shellyrgbww,
  'shellyrgbww2': shellyrgbww2,
  'shellyht': shellyht,
  'shellysmoke': shellysmoke
};


function getAll() {
  return allShellys;
}

// getObjectByName('dingdong')
function getObjectByName(name) {
  let all = getAll();
  return all[name] || null;
}

// getObjectByName('dingdong', 'sip_token') 
function getObjectById(name, id) {
  let obj = getObjectByName(name);
  if (obj) {
    return obj[id] || null;
  }
  return null;
}


module.exports = {
  getAll: getAll,
  getObjectByName: getObjectByName,
  getObjectById: getObjectById
};
