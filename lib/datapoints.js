/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';


// *******************************************************************************
// Devicelist
// *******************************************************************************
let shelly2 = {
  'Relay0.AutoTimerOff': {
    "name": "Auto Timer Off",
    "type": "number",
    "role": "level.timer",
    "unit": "s",
    "read": true,
    "write": true
  },
  'Relay0.AutoTimerOn': {
    "name": "Auto Timer On",
    "type": "number",
    "role": "level.timer",
    "read": true,
    "write": true,
    "unit": "s"
  },
  'Relay0.Switch': {
    "def": false,
    "type": "boolean",
    "read": true,
    "write": true,
    "name": "Switch",
    "role": "switch"
  },
  'Relay0.Timer': {
    "name": "Timer",
    "type": "number",
    "role": "level.timer",
    "read": true,
    "write": true,
    "unit": "s"
  },
  'Relay1.AutoTimerOff': {
    "name": "Auto Timer Off",
    "type": "number",
    "role": "level.timer",
    "unit": "s",
    "read": true,
    "write": true
  },
  'Relay1.AutoTimerOn': {
    "name": "Auto Timer On",
    "type": "number",
    "role": "level.timer",
    "read": true,
    "write": true,
    "unit": "s"
  },
  'Relay1.Switch': {
    "def": false,
    "type": "boolean",
    "read": true,
    "write": true,
    "name": "Switch",
    "role": "switch"
  },
  'Relay1.Timer': {
    "name": "Timer",
    "type": "number",
    "role": "level.timer",
    "read": true,
    "write": true,
    "unit": "s"
  },
  'Power': {
    "name": "Power",
    "type": "number",
    "role": "value.power",
    "read": true,
    "write": false,
    "unit": "W"
  },
  'hostname': {
    "name": "Device hostname",
    "type": "string",
    "role": "info.ip",
    "read": true,
    "write": false
  },
  'online': {
    "name": "Device online status",
    "type": "boolean",
    "role": "indicator.reachable",
    "read": true,
    "write": false
  },
  'Shutter.Close': {
    "name": "Close",
    "type": "boolean",
    "role": "button",
    "read": false,
    "write": true
  },
  'Shutter.Duration': {
    "name": "Duration",
    "type": "number",
    "role": "level.timer",
    "read": true,
    "write": true,
    "unit": "s"
  },
  'Shutter.Open': {
    "name": "Open",
    "type": "boolean",
    "role": "button",
    "read": false,
    "write": true
  },
  'Shutter.Pause': {
    "name": "Pause",
    "type": "boolean",
    "role": "button.stop",
    "read": false,
    "write": true
  },
  'Shutter.Position': {
    "name": "Position",
    "type": "number",
    "role": "level",
    "read": true,
    "write": true,
    "unit": "%"
  },
  'mode': {
    "name": "Roller/Relay mode",
    "type": "sting",
    "role": "state",
    "read": true,
    "write": false
  },
  'Shutter.state': {
    "name": "Roller state",
    "type": "sting",
    "role": "state",
    "read": true,
    "write": true
  }
}

let allShellys = {
  'shelly2': shelly2
}

let sensorTypes = {

  'T': {
    type: 'number',
    role: 'value.temperature',
    name: 'Temperature',
    read: true,
    write: false,
    unit: '°C'
  },
  'H': {
    type: 'number',
    role: 'value.humidity',
    name: 'Humidity',
    read: true,
    write: false,
    min: 0,
    max: 100,
    unit: '%'
  },
  'L': {
    type: 'number',
    role: 'level.dimmer',
    name: 'Luminosty',
    read: true,
    write: true,
    unit: 'Lux'
  },
  'M': {
    type: 'number',
    role: 'sensor.motion',
    name: 'Motion',
    read: true,
    write: false,
    states: '0:no motion;1:motion detected',
  },
  'A': {
    type: 'number',
    role: 'value.co2',
    name: 'Air-Quality',
    read: true,
    write: false,
    min: 0,
    max: 10
  },
  'P': {
    type: 'number',
    role: 'value.power',
    name: 'Power',
    read: true,
    write: false,
    unit: 'W'
  },
  'B': {
    type: 'number',
    role: 'value.battery',
    name: 'Battery',
    read: true,
    write: false,
    min: 0,
    max: 100,
    unit: '%'
  },
  'S': {
    type: 'number',
    role: 'value',
    name: 'State',
    read: true,
    write: true
  },
  'W': {
    type: 'number',
    role: 'value.power',
    name: 'Power',
    read: true,
    write: false,
    unit: 'W'
  },
  'Switch': {
    type: 'boolean',
    role: 'switch',
    name: 'Switch',
    read: true,
    write: true
  },
  'SwitchTimer': {
    type: 'number',
    role: 'level.timer',
    name: 'Timer',
    read: true,
    write: true,
    unit: 's',
    def: 0
  },
  'AutoTimerOn': {
    type: 'number',
    role: 'level.timer',
    id: 'AutoTimerOn',
    name: 'Auto Timer On',
    read: true,
    write: true,
    unit: 's',
    def: 0
  },
  'AutoTimerOff': {
    type: 'number',
    role: 'level.timer',
    id: 'AutoTimerOff',
    name: 'Auto Timer Off',
    read: true,
    write: true,
    unit: 's',
    def: 0
  },
  'Shutter': {
    type: 'number',
    role: 'value.direction',
    name: 'Shutter',
    read: true,
    write: true,
    states: '0:pause;1:up;2:down'
  },
  'ShutterUp': {
    type: 'boolean',
    role: 'button',
    name: 'Open',
    read: false,
    write: true
  },
  'ShutterDown': {
    type: 'boolean',
    role: 'button',
    name: 'Close',
    read: false,
    write: true
  },
  'ShutterStop': {
    type: 'boolean',
    role: 'button.stop',
    name: 'Pause',
    read: false,
    write: true
  },
  'ShutterPosition': {
    type: 'number',
    role: 'level',
    name: 'Position',
    read: true,
    write: true,
    unit: '%',
    def: 0
  },
  'ShutterDuration': {
    type: 'number',
    role: 'level.timer',
    name: 'Duration',
    read: true,
    write: true,
    unit: 's',
    def: 0
  },
  'VSwitch': {
    type: 'boolean',
    role: 'switch',
    name: 'Switch',
    read: true,
    write: true
  },
  'White': {
    type: 'number',
    role: 'level.color.white',
    name: 'White',
    read: true,
    write: true,
    min: 0,
    max: 65535
  },
  'Red': {
    type: 'number',
    role: 'level.color.red',
    name: 'Red',
    read: true,
    write: true,
    min: 0,
    max: 65535
  },
  'Green': {
    type: 'number',
    role: 'level.color.green',
    name: 'Green',
    read: true,
    write: true,
    min: 0,
    max: 65535
  },
  'Blue': {
    type: 'number',
    role: 'level.color.blue',
    name: 'Blue',
    read: true,
    write: true,
    min: 0,
    max: 65535
  },
  'Brightness': {
    type: 'number',
    role: 'level.dimmer',
    name: 'Brightness',
    read: true,
    write: true
  },

};




// get ioBroker Device Info by Sensor Type
function getSensorType(type) {
  return sensorTypes[type];
}

// get ioBroker Device Info by Sensor Object
function getSensor(sen) {
  let sensorType = getSensorType(sen.T);
  if (sensorType) {
    // if Sensor type S than take description from sensor
    if (sen.T == 'S') {
      sensorType.name = sen.D || "State" + sen.I;
    }
  } else {
    // no Sensor found, take default Sensor type S
    sensorType = getSensorType("S") || {};
    sensorType.name = sen.D || "State" + sen.I;
  }

  return sensorType;
}


function getAll() {
  return allShellys;
}

// getObjectByName("dingdong")
function getObjectByName(name) {
  let all = getAll();
  return all[name] || null;
}

// getObjectByName("dingdong", "sip_token") 
function getObjectById(name, id) {
  let obj = getObjectByName(name);
  if (obj) {
    return obj[id] || null;
  }
  return null;
}



module.exports = {
  getSensorType: getSensorType,
  getSensor: getSensor,
  getAll: getAll,
  getObjectByName: getObjectByName,
  getObjectById: getObjectById
};
