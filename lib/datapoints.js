'use strict';

// *******************************************************************************
// Devicelist
// *******************************************************************************
const sensorTypes = {

  T: {
    type: 'number',
    role: 'value.temperature',
    name: 'Temperature',
    read: true,
    write: false,
    unit: '°C'
  },
  H: {
    type: 'number',
    role: 'value.humidity',
    name: 'Humidity',
    read: true,
    write: false,
    min: 0,
    max: 100,
    unit: '%'
  },
  L: {
    type: 'number',
    role: 'value.brightness',
    name: 'Luminosty',
    read: true,
    write: false,
    unit: 'Lux'
  },
  M: {
    type: 'number',
    role: 'sensor.motion',
    name: 'Motion',
    read: true,
    write: false,
    states: '0:no motion;1:motion detected',
  },
  A: {
    type: 'number',
    role: 'value.co2',
    name: 'Air Quality',
    read: true,
    write: false,
    min: 0,
    max: 10
  },
  P: {
    type: 'number',
    role: 'value.power',
    name: 'Power',
    read: true,
    write: false,
    unit: 'Watt'
  },
  B: {
    type: 'number',
    role: 'value.battery',
    name: 'Battery',
    read: true,
    write: false,
    min: 0,
    max: 100,
    unit: '%'
  },
  S: {
    type: 'number',
    role: 'value',
    name: 'Status',
    read: true,
    write: true
  }
};


// get ioBroker Device Info by Sensor Type
function getSensorType(type) {

  return sensorTypes[type] || {};

}

// get ioBroker Device Info by Sensor Object
function getSensor(sen) {

  let sensorType = getSensorType(sen.T) || {};
  if (sen.T == 'S') {
    sensorType.name = sen.D;
  }
  return sensorType;

}

module.exports = {
    getSensorType: getSensorType,
    getSensor: getSensor
};
