/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const colorconv = require('./colorconv');

/**
 * Celsius to Fahrenheit
 * @param {number} celsius - 10
 */
function celsiusToFahrenheit(celsius) {
    try {
        const fahrenheit = celsius * 1.8 + 32;
        return Math.round(fahrenheit * 100) / 100;
    } catch (error) {
        return undefined;
    }
}

/**
 *
 * @param {*} self
 * @param {*} name - Name of the device
 */
async function setDeviceName(self, name) {
    const deviceId = self.getDeviceName();
    const obj = await self.adapter.getObjectAsync(deviceId);

    if (name && obj && obj.common && name !== obj.common.name) {
        await self.adapter.extendObjectAsync(deviceId, {
            common: {
                name: name
            }
        });

        self.states[deviceId] = name;
    }

    return name;
}

/**
 *
 * @param {*} self
 * @param {*} state - channel like Relay0.Channel
 * @param {*} name - Name of the channel
 */
async function setChannelName(self, state, name) {
    const channel = state.split('.').slice(0, -1).join();

    const channelId = self.getDeviceName() + '.' + channel;
    const obj = await self.adapter.getObjectAsync(channelId);

    if (name && obj && obj.common && name !== obj.common.name) {
        await self.adapter.extendObjectAsync(channelId, {
            common: {
                name: name
            }
        });

        self.states[channelId] = name;
    }

    return name;
}

/**
 * returns seconds in format daysDTT:MM:SS
 * Example: 123D20:10:08 or 12:41:02
 * @param {number} uptime - seconds
 */
function uptimeString(uptime) {
    if (uptime < 0) {
        uptime = 0;
    }

    const timeDifference = new Date(uptime * 1000);
    const secondsInADay = 60 * 60 * 1000 * 24;
    const secondsInAHour = 60 * 60 * 1000;
    const days = Math.floor(timeDifference / (secondsInADay) * 1);
    let hours = Math.floor((timeDifference % (secondsInADay)) / (secondsInAHour) * 1);
    let mins = Math.floor(((timeDifference % (secondsInADay)) % (secondsInAHour)) / (60 * 1000) * 1);
    let secs = Math.floor((((timeDifference % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000 * 1);

    if (hours < 10) { hours = '0' + hours; }
    if (mins < 10) { mins = '0' + mins; }
    if (secs < 10) { secs = '0' + secs; }

    if (days > 0) {
        return days + 'D' + hours + ':' + mins + ':' + secs;
    } else {
        return hours + ':' + mins + ':' + secs;
    }
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
    const id = self.getDeviceName();
    const obj = {
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
    for (const i in obj) {
        const stateId = id + '.' + obj[i];
        const state = await self.adapter.getStateAsync(stateId);
        obj[i] = state ? state.val : undefined;
    }
    return obj;
}

async function getLightsObjectWhite(self) {
    const id = self.getDeviceName();
    const obj = {
        'ison': 'lights.Switch',
        'white': 'lights.white',
        'temp': 'lights.temp',
        'brightness': 'lights.brightness'
    };
    for (const i in obj) {
        const stateId = id + '.' + obj[i];
        const state = await self.adapter.getStateAsync(stateId);
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
    const id = self.getDeviceName();
    let stateId;
    let state;
    stateId = id + '.lights.red';
    state = await self.adapter.getStateAsync(stateId);
    const valred = state ? state.val : 0;
    stateId = id + '.lights.green';
    state = await self.adapter.getStateAsync(stateId);
    const valgreen = state ? state.val : 0;
    stateId = id + '.lights.blue';
    state = await self.adapter.getStateAsync(stateId);
    const valblue = state ? state.val : 0;
    stateId = id + '.lights.white';
    state = await self.adapter.getStateAsync(stateId);
    const valwhite = state ? state.val : 0;
    return '#' + intToHex(valred) + intToHex(valgreen) + intToHex(valblue) + intToHex(valwhite);
}

function getColorsFromRGBW(value) {
    value = value || '#00000000';
    const obj = {
        red: hextoInt(value.substr(1, 2) || '00'),
        green: hextoInt(value.substr(3, 2) || '00'),
        blue: hextoInt(value.substr(5, 2) || '00'),
        white: hextoInt(value.substr(7, 2) || '00')
    };
    return obj;
}

async function getHsvFromRgb(self) {
    const value = await getRGBW(self);
    const rgbw = getColorsFromRGBW(value);
    const hsv = colorconv.rgbToHsv(rgbw.red, rgbw.green, rgbw.blue);
    return {
        hue: hsv[0],
        saturation: hsv[1],
        brightness: hsv[2]
    };
}

async function getColorsFromHue(self) {
    const id = self.getDeviceName();
    let stateId;
    let state;
    stateId = id + '.lights.hue';
    state = await self.adapter.getStateAsync(stateId);
    const valhue = state ? state.val : 0;
    stateId = id + '.lights.saturation';
    state = await self.adapter.getStateAsync(stateId);
    const valsaturation = state ? state.val : 0;
    // stateId = id + '.lights.value';
    stateId = id + '.lights.gain';
    state = await self.adapter.getStateAsync(stateId);
    const valvalue = state ? state.val : 0;
    const rgb = colorconv.hsvToRgb(valhue, valsaturation, valvalue);
    const obj = {
        red: rgb[0],
        green: rgb[1],
        blue: rgb[2],
    };
    return obj;
}

async function getPowerFactor(self, channel) {
    // let stateVoltage = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter' + channel + '.Voltage');
    const statePower = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter' + channel + '.Power');
    const stateReactivePower = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter' + channel + '.ReactivePower');
    let pf = 0.00;
    if (statePower && stateReactivePower) {
        // let voltage = stateVoltage.val;
        const power = statePower.val;
        const reactive = stateReactivePower.val;
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
    const TotalPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Total');
    const TotalPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Total');
    const TotalPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Total');
    calctotal = (TotalPhase1.val + TotalPhase2.val + TotalPhase3.val);
    calctotal = Math.round(calctotal * 100) / 100;
    return calctotal;
}

async function getTotalReturnedSumm(self) {
    let calctotal = 0.00;
    const TotalPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Total_Returned');
    const TotalPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Total_Returned');
    const TotalPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Total_Returned');
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
    const CurrentPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Current');
    const CurrentPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Current');
    const CurrentPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Current');
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
    const PowerPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Power');
    const PowerPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Power');
    const PowerPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Power');
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
    const VoltagePhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Voltage');
    const VoltagePhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Voltage');
    const VoltagePhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Voltage');
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
    const id = self.getDeviceName();
    const stateId = id + '.mode';
    const state = await self.adapter.getStateAsync(stateId);
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
        const state = await self.adapter.getStateAsync(id);
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
 * Get favorite position
 * @param {*} self
 * @param {*} id
 */
async function getFavoritePosition(self, id) {
    const node = self.getDeviceName() + '.' + id;
    const state = await self.adapter.getStateAsync(node);
    return state ? state.val : undefined;
}

module.exports = {
    celsiusToFahrenheit: celsiusToFahrenheit,
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
    getTotalReturnedSumm: getTotalReturnedSumm,
    getCurrentSumm: getCurrentSumm,
    getPowerSumm: getPowerSumm,
    getVoltageCalc: getVoltageCalc,
    getMode: getMode,
    getSetDuration: getSetDuration,
    getFavoritePosition: getFavoritePosition,
    getRGBW: getRGBW
};
