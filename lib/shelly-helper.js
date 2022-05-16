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
 * @param {*} id - channel id like Relay0
 * @param {*} name - Name of the channel
 */
async function setChannelName(self, id, name) {
    const channelId = self.getDeviceName() + '.' + id;
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
    if (value?.ext_temperature?.[key]?.[unitkey]) {
        return value.ext_temperature[key][unitkey];
    } else {
        return null;
    }
}

/**
 * Get external humidity for device with key
 * @param {*} value - like JSON.parse(value)
 * @param {*} key  - '0', '1', ....
 */
function getExtHum(value, key) {
    if (value?.ext_humidity?.[key]?.['hum']) {
        return value.ext_humidity[key]['hum'];
    } else {
        return null;
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
        const stateId = `${id}.${obj[i]}`;
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
        const stateId = `${id}.${obj[i]}`;
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

/**
 * Adds a generic switch definition for gen 2 devices
 * @param {*} deviceObj
 * @param {*} switchId
 */
function addSwitchToGen2Device(deviceObj, switchId, hasPowerMetering) {

    deviceObj[`Relay${switchId}.Switch`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).output; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 1, src: 'iobroker', method: 'Switch.Set', params: {id: switchId, on: value}}); }
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    };

    deviceObj[`Relay${switchId}.InputMode`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).in_mode : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {in_mode: value}}}); }
        },
        common: {
            'name': 'Input Mode',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'momentary': 'momentary',
                'follow': 'follow',
                'flip': 'flip',
                'detached': 'detached'
            }
        }
    };

    deviceObj[`Relay${switchId}.InitialState`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).initial_state : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {initial_state: value}}}); }
        },
        common: {
            'name': 'Initial State',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'on': 'on',
                'off': 'off',
                'restore_last': 'restore_last',
                'match_input': 'match_input'
            }
        }
    };

    deviceObj[`Relay${switchId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? await setChannelName(self, `Relay${switchId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {name: value}}}); }
        },
        common: {
            'name': 'Channel Name',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'def': `switch_${switchId}`
        }
    };

    deviceObj[`Relay${switchId}.AutoTimerOn`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).auto_on : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {auto_on: value}}}); }
        },
        common: {
            'name': 'Auto Timer On',
            'type': 'boolean',
            'role': 'switch.enable',
            'def': false,
            'read': true,
            'write': true
        }
    };

    deviceObj[`Relay${switchId}.AutoTimerOnDelay`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).auto_on_delay : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {auto_on_delay: value}}}); }
        },
        common: {
            'name': 'Auto Timer On Delay',
            'type': 'number',
            'role': 'level.timer',
            'def': 0,
            'unit': 's',
            'read': true,
            'write': true
        }
    };

    deviceObj[`Relay${switchId}.AutoTimerOff`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).auto_off : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {auto_off: value}}}); }
        },
        common: {
            'name': 'Auto Timer Off',
            'type': 'boolean',
            'role': 'switch.enable',
            'def': false,
            'read': true,
            'write': true
        }
    };

    deviceObj[`Relay${switchId}.AutoTimerOffDelay`] = {
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).auto_off_delay : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {auto_off_delay: value}}}); }
        },
        common: {
            'name': 'Auto Timer Off Delay',
            'type': 'number',
            'role': 'level.timer',
            'def': 0,
            'unit': 's',
            'read': true,
            'write': true
        }
    };

    deviceObj[`Relay${switchId}.source`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).source; }
        },
        common: {
            'name': 'Source of last command',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    };

    deviceObj[`Relay${switchId}.temperatureC`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).temperature.tC; }
        },
        common: {
            'name': 'Temperature °C',
            'type': 'number',
            'role': 'value.temperature',
            'read': true,
            'write': false,
            'unit': '°C'
        }
    };

    deviceObj[`Relay${switchId}.temperatureF`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).temperature.tF; }
        },
        common: {
            'name': 'Temperature °F',
            'type': 'number',
            'role': 'value.temperature',
            'read': true,
            'write': false,
            'unit': '°F'
        }
    };

    if (hasPowerMetering) {

        deviceObj[`Relay${switchId}.Power`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: (value) => { return JSON.parse(value).apower; }
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
        };

        deviceObj[`Relay${switchId}.Voltage`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: (value) => { return JSON.parse(value).voltage; }
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
        };

        deviceObj[`Relay${switchId}.Current`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: (value) => { return JSON.parse(value).current; }
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
        };

        deviceObj[`Relay${switchId}.Energy`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: (value) => { return JSON.parse(value).aenergy.total; }
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
        };

        /*
        deviceObj[`Relay${switchId}.Overvoltage`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: (value) => {
                    const valueObj = JSON.parse(value);
                    return valueObj.errors && Array.prototype.includes.call(valueObj.errors, 'overvoltage');
                }
            },
            common: {
                'name': 'Overvoltage',
                'type': 'boolean',
                'role': 'indicator.alarm',
                'read': true,
                'write': false,
                'def': false
            }
        };
        */

        deviceObj[`Relay${switchId}.LimitPower`] = {
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: async (value, self) => { return value ? JSON.parse(value).power_limit : undefined; },
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {power_limit: value}}}); }
            },
            common: {
                'name': 'Power Limit',
                'type': 'number',
                'role': 'value.power',
                'unit': 'W',
                'read': true,
                'write': true
            }
        };

        deviceObj[`Relay${switchId}.LimitCurrent`] = {
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: async (value, self) => { return value ? JSON.parse(value).current_limit : undefined; },
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {current_limit: value}}}); }
            },
            common: {
                'name': 'Current Limit',
                'type': 'number',
                'role': 'value.current',
                'unit': 'A',
                'read': true,
                'write': true
            }
        };

        deviceObj[`Relay${switchId}.LimitVoltage`] = {
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: async (value, self) => { return value ? JSON.parse(value).voltage_limit : undefined; },
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Switch.SetConfig', params: {id: switchId, config: {voltage_limit: value}}}); }
            },
            common: {
                'name': 'Current Limit',
                'type': 'number',
                'role': 'value.voltage',
                'unit': 'V',
                'read': true,
                'write': true
            }
        };
    }

}

/**
 * Adds a generic input definition for gen 2 devices
 * @param {*} deviceObj
 * @param {*} inputId
 */
function addInputToGen2Device(deviceObj, inputId) {

    deviceObj[`Input${inputId}.Status`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).state; }
        },
        common: {
            'name': 'Input Status',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    };

    deviceObj[`Input${inputId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => { return value ? await setChannelName(self, `Input${inputId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Input.SetConfig', params: {id: inputId, config: {name: value}}}); }
        },
        common: {
            'name': 'Channel Name',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'def': `input_${inputId}`
        }
    };

    deviceObj[`Input${inputId}.Event`] = {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: (value) => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];

                        if (typeof event === 'object' && event.component === `input:${inputId}`) {
                            return event.event;
                        }
                    }
                }
                return undefined;
            }
        },
        common: {
            'name': 'Input Event',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    };

    deviceObj[`Input${inputId}.InputType`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).type : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Input.SetConfig', params: {id: inputId, config: {type: value}}}); }
        },
        common: {
            'name': 'Input Type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'button': 'button',
                'switch': 'switch'
            }
        }
    };

    deviceObj[`Input${inputId}.InputInverted`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).invert : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Input.SetConfig', params: {id: inputId, config: {invert: value}}}); }
        },
        common: {
            'name': 'Input Inverted',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    };

}

/**
 * Adds a generic cover definition for gen 2 devices
 * @param {*} deviceObj
 * @param {*} inputId
 */
function addCoverToGen2Device(deviceObj, coverId) {

    deviceObj[`Cover${coverId}.Open`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.Open', params: {id: coverId}}); }
        },
        common: {
            'name': 'Open',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.InitialState`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).initial_state : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {initial_state: value}}}); }
        },
        common: {
            'name': 'Initial State',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'open': 'oopenn',
                'closed': 'closed',
                'stopped': 'stopped'
            }
        }
    };

    deviceObj[`Cover${coverId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? await setChannelName(self, `Cover${coverId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {name: value}}}); }
        },
        common: {
            'name': 'Channel Name',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'def': `cover_${coverId}`
        }
    };

    deviceObj[`Cover${coverId}.Stop`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.Stop', params: {id: coverId}}); }
        },
        common: {
            'name': 'Stop',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.Close`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.Close', params: {id: coverId}}); }
        },
        common: {
            'name': 'Close',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.Calibrate`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.Calibrate', params: {id: coverId}}); }
        },
        common: {
            'name': 'Calibrate',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.InputSwap`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).swap_inputs : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {swap_inputs: value}}}); }
        },
        common: {
            'name': 'Input Swap',
            'type': 'boolean',
            'role': 'switch.enable',
            'read': true,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.InputMode`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).in_mode : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {in_mode: value}}}); }
        },
        common: {
            'name': 'Input Mode',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true,
            'states': {
                'single': 'single',
                'dual': 'dual',
                'detached': 'detached'
            }
        }
    };

    deviceObj[`Cover${coverId}.LimitPower`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).power_limit : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {power_limit: value}}}); }
        },
        common: {
            'name': 'Power Limit',
            'type': 'number',
            'role': 'value.power',
            'unit': 'W',
            'read': true,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.LimitCurrent`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).current_limit : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {current_limit: value}}}); }
        },
        common: {
            'name': 'Current Limit',
            'type': 'number',
            'role': 'value.current',
            'unit': 'A',
            'read': true,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.LimitVoltage`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? JSON.parse(value).voltage_limit : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.SetConfig', params: {id: coverId, config: {voltage_limit: value}}}); }
        },
        common: {
            'name': 'Current Limit',
            'type': 'number',
            'role': 'value.voltage',
            'unit': 'V',
            'read': true,
            'write': true
        }
    };

    deviceObj[`Cover${coverId}.Position`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).current_pos; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Cover.GoToPosition', params: {id: coverId, pos: value}}); }
        },
        common: {
            'name': 'Position',
            'type': 'number',
            'role': 'level.blind',
            'read': true,
            'write': true,
            'unit': '%',
            'def': 0,
            'min': 0,
            'max': 100
        }
    };

    deviceObj[`Cover${coverId}.Status`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).state; }
        },
        common: {
            'name': 'Cover Status',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    };

    deviceObj[`Cover${coverId}.Power`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).apower; }
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
    };

    deviceObj[`Cover${coverId}.Voltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).voltage; }
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
    };

    deviceObj[`Cover${coverId}.Current`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).current; }
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
    };

    deviceObj[`Cover${coverId}.Energy`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).aenergy.total; }
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
    };

    deviceObj[`Cover${coverId}.source`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).source; }
        },
        common: {
            'name': 'Source of last command',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    };

}

module.exports = {
    celsiusToFahrenheit: celsiusToFahrenheit,
    setDeviceName: setDeviceName,
    setChannelName: setChannelName,
    getExtTemp: getExtTemp,
    getExtHum: getExtHum,
    getLightsObjectColor: getLightsObjectColor,
    getLightsObjectWhite: getLightsObjectWhite,
    intToHex: intToHex,
    hextoInt: hextoInt,
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
    getRGBW: getRGBW,
    addSwitchToGen2Device: addSwitchToGen2Device,
    addInputToGen2Device: addInputToGen2Device,
    addCoverToGen2Device: addCoverToGen2Device
};
