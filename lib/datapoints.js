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
    "name": "Auto Timer Off",
    "type": "number",
    "role": "level.timer",
    "def": 0,
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
    "def": 0,
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
    "def": 0,
    "unit": "s"
  }
};


let shelly2 = {
  'Relay0.AutoTimerOff': {
    "name": "Auto Timer Off",
    "type": "number",
    "role": "level.timer",
    "def": 0,
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
    "def": 0,
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
    "def": 0,
    "unit": "s"
  },
  'Relay1.AutoTimerOff': {
    "name": "Auto Timer Off",
    "type": "number",
    "role": "level.timer",
    "def": 0,
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
    "def": 0,
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
    "def": 0,
    "unit": "s"
  },
  'Power': {
    "name": "Power",
    "type": "number",
    "role": "value.power",
    "read": true,
    "write": false,
    "def": 0,
    "unit": "W"
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
    "def": 0,
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
};

let allShellys = {
  'shelly1': shelly1,
  'shelly2': shelly2
};


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
  getAll: getAll,
  getObjectByName: getObjectByName,
  getObjectById: getObjectById
};
