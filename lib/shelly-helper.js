/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const colorconv = require('./colorconv');

/**
 * 
 * @param {*} self 
 * @param {*} devicename - Name of the device like 'livingroom'  
 */
async function setDeviceName(self, devicename) {
  let name = devicename;
  let deviceid = self.getDeviceName();
  let obj = await self.adapter.getObjectAsync(deviceid);
  // if (!name) name = 'Device ' + deviceid;
  if (name && obj && obj.common && name !== obj.common.name) {
    obj.common.name = name;
    await self.adapter.setObjectAsync(deviceid, obj);
    self.states[deviceid] = name;
  }
  return devicename;
}

/**
 * 
 * @param {*} self 
 * @param {*} state - channel like Relay0.Channel
 * @param {*} channelename - Name of the channel like 'channel 1 like livingroom'
 */
async function setChannelName(self, state, channelename) {
  let name = channelename;
  let channel = state.split('.').slice(0, -1).join();
  if (channel) {
    let channelid = self.getDeviceName() + '.' + channel;
    let obj = await self.adapter.getObjectAsync(channelid);
    // if (!name) name = 'Channel ' + state.split('.').slice(0, 1).join();
    if (name && obj && obj.common && name !== obj.common.name) {
      obj.common.name = name;
      await self.adapter.setObjectAsync(channelid, obj);
      self.states[channelid] = name;
    }
  }
  return channelename;
}


/**
 * returns seconds in format daysDTT:MM:SS
 * Example: 123D20:10:08 or 12:41:02
 * @param {number} uptime - seconds
 */
function uptimeString(uptime) {
  if (uptime) {
    let timeDifference = new Date(uptime * 1000);
    let secondsInADay = 60 * 60 * 1000 * 24;
    let secondsInAHour = 60 * 60 * 1000;
    let days = Math.floor(timeDifference / (secondsInADay) * 1);
    let hours = Math.floor((timeDifference % (secondsInADay)) / (secondsInAHour) * 1);
    let mins = Math.floor(((timeDifference % (secondsInADay)) % (secondsInAHour)) / (60 * 1000) * 1);
    let secs = Math.floor((((timeDifference % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000 * 1);
    if (hours < 10) { hours = '0' + hours; }
    if (mins < 10) { mins = '0' + mins; }
    if (secs < 10) { secs = '0' + secs; }
    if (days > 0) {
      uptime = days + 'D' + hours + ':' + mins + ':' + secs;
    } else {
      uptime = hours + ':' + mins + ':' + secs;
    }
  }
  return uptime;
}

/**
 * get the CoAP value by key
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

/**
 * Get external temperature for device with key in unit C or F
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
  if (value && value.hasOwnProperty('ext_temperature') && value.ext_temperature.hasOwnProperty(key) && value.ext_temperature[key].hasOwnProperty(unitkey)) {
    return value.ext_temperature[key][unitkey];
  } else {
    return 0;
  }
}

/**
 * Get external humidity for device with key 
 * @param {*} value - like JSON.parse(value)
 * @param {*} key  - '0', '1', ....
 */
function getExtHum(value, key) {
  if (value && value.hasOwnProperty('ext_humidity') && value.ext_humidity.hasOwnProperty(key) && value.ext_humidity[key].hasOwnProperty('hum')) {
    return value.ext_humidity[key]['hum'];
  } else {
    return 0;
  }
}

/**
 *
 * @param {*} self 
 */
async function getLightsObjectColor(self) {
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

async function getLightsObjectWhite(self) {
  let id = self.getDeviceName();
  let obj = {
    'ison': 'lights.Switch',
    'white': 'lights.white',
    'temp': 'lights.temp',
    'brightness': 'lights.brightness'
  };
  for (let i in obj) {
    let stateId = id + '.' + obj[i];
    let state = await self.adapter.getStateAsync(stateId);
    obj[i] = state ? state.val : undefined;
  }
  return obj;
}

/**
 * get the hex value for an integer value
 * @param {*} number like 10 or 99
 */
function intToHex(number) {
  if (!number) number = 0;
  let hex = number.toString(16);
  hex = ('00' + hex).slice(-2).toUpperCase(); // 'a' -> '0A'
  return hex;
}

/**
 * get the integer value for a hex value
 * @param {*} hex like 0A or FF
 */
function hextoInt(hex) {
  if (!hex) hex = '00';
  return parseInt(hex, 16);
}

/**
 * get the RGBW value for red, green, blue, white value
 * @param {*} self 
 */
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
    red: hextoInt(value.substr(1, 2) || '00'),
    green: hextoInt(value.substr(3, 2) || '00'),
    blue: hextoInt(value.substr(5, 2) || '00'),
    white: hextoInt(value.substr(7, 2) || '00')
  };
  return obj;
}



async function getHsvFromRgb(self) {
  let value = await getRGBW(self);
  let rgbw = getColorsFromRGBW(value);
  let hsv = colorconv.rgbToHsv(rgbw.red, rgbw.green, rgbw.blue);
  return {
    hue: hsv[0],
    saturation: hsv[1],
    brightness: hsv[2]
  };
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
  let rgb = colorconv.hsvToRgb(valhue, valsaturation, valvalue);
  let obj = {
    red: rgb[0],
    green: rgb[1],
    blue: rgb[2],
  };
  return obj;
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

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self 
 */
async function getTotalSumm(self) {
  let calctotal = 0.00;
  let TotalPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Total');
  let TotalPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Total');
  let TotalPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Total');
  calctotal = (TotalPhase1.val + TotalPhase2.val + TotalPhase3.val);
  calctotal = Math.round(calctotal * 100) / 100;
  return calctotal;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self 
 */
async function getCurrentSumm(self) {
  let calccurrent = 0.00;
  let CurrentPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Current');
  let CurrentPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Current');
  let CurrentPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Current');
  calccurrent = (CurrentPhase1.val + CurrentPhase2.val + CurrentPhase3.val);
  calccurrent = Math.round(calccurrent * 100) / 100;
  return calccurrent;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self 
 */
async function getPowerSumm(self) {
  let calcPower = 0.00;
  let PowerPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Power');
  let PowerPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Power');
  let PowerPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Power');
  calcPower = (PowerPhase1.val + PowerPhase2.val + PowerPhase3.val);
  calcPower = Math.round(calcPower * 100) / 100;
  return calcPower;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self 
 */
async function getVoltageCalc(self, vtype) {
  let calcVoltage = 0.00;
  let VoltagePhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Voltage');
  let VoltagePhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Voltage');
  let VoltagePhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Voltage');
  if (vtype == 'mean') {
    calcVoltage = ((VoltagePhase1.val + VoltagePhase2.val + VoltagePhase3.val) / 3);
  } else {
    calcVoltage = ((VoltagePhase1.val + VoltagePhase2.val + VoltagePhase3.val) / Math.sqrt(3));
  }
  calcVoltage = Math.round(calcVoltage * 100) / 100;
  return calcVoltage;
}

/**
 * Get golor mode like white or color
 * @param {*} self 
 */
async function getMode(self) {
  let id = self.getDeviceName();
  let stateId = id + '.mode';
  let state = await self.adapter.getStateAsync(stateId);
  return state ? state.val : undefined;
}

/**
 * Timer 
 * @param {*} self 
 * @param {*} id - like 'Relay0.Timer'
 * @param {*} newval - 10
 */
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
 * @param {*} self        - self object 
 * @param {*} id          - id of state like relay0.switch
 * @param {*} value       - value like true
 * @param {*} initvalue   - value like false
 * @param {*} ms          - time in ms
 */
function setAndInitValue(self, id, value, initvalue, ms) {
  id = self.getDeviceName() + '.' + id;
  if (!ms) ms = 100;
  if (value != initvalue) setTimeout(async () => {
    self.states[id] = initvalue;
    await self.adapter.setStateAsync(id, { val: initvalue, ack: true });
  }, ms);
  return value;
}

/**
 * 
 * @param {*} self    - self object 
 * @param {*} id      - id of state like relay0.switch
 * @param {*} value   - value like false or 'huhu'
 */
async function setValueForId(self, id, value) {
  id = self.getDeviceName() + '.' + id;
  await self.adapter.setStateAsync(id, { val: value, ack: true });
}

module.exports = {
  setDeviceName: setDeviceName,
  setChannelName: setChannelName,
  uptimeString: uptimeString,
  getExtTemp: getExtTemp,
  getExtHum: getExtHum,
  getLightsObjectColor: getLightsObjectColor,
  getLightsObjectWhite: getLightsObjectWhite,
  intToHex: intToHex,
  getHsvFromRgb: getHsvFromRgb,
  getColorsFromHue: getColorsFromHue,
  getColorsFromRGBW: getColorsFromRGBW,
  getPowerFactor: getPowerFactor,
  getTotalSumm: getTotalSumm,
  getCurrentSumm: getCurrentSumm,
  getPowerSumm: getPowerSumm,
  getVoltageCalc: getVoltageCalc,
  getMode: getMode,
  getSetDuration: getSetDuration,
  getRGBW: getRGBW,
  setAndInitValue: setAndInitValue,
  setValueForId: setValueForId
};