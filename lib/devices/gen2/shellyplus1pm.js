/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 1 PM / shellyplus1pm
 */
let shellyplus1pm = {
  'Relay0.Switch': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
        const valueObj = JSON.parse(value);
        if (
          Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
          valueObj.method === 'NotifyStatus' &&
          Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
          Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
          Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'output')
        ) {
          return valueObj.params['switch:0'].output;
        }
        return undefined;
      },
      mqtt_cmd: '<mqttprefix>/rpc',
      mqtt_cmd_funct: (value) => { return JSON.stringify({"id": 1, "src": "iobroker", "method": "Switch.Set", "params": {"id": 0, "on": value}}) },
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
  'Relay0.source': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
        const valueObj = JSON.parse(value);
        if (
          Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
          valueObj.method === 'NotifyStatus' &&
          Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
          Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
          Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'source')
        ) {
          return valueObj.params['switch:0'].source;
        }
        return undefined;
      }
    },
    common: {
      'name': 'source of last command',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'Relay0.Power': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
        const valueObj = JSON.parse(value);
        if (
          Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
          valueObj.method === 'NotifyStatus' &&
          Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
          Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
          Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'apower')
        ) {
          return valueObj.params['switch:0'].apower;
        }
        return undefined;
      }
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
  'Relay0.Energy': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
        const valueObj = JSON.parse(value);
        if (
          Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
          valueObj.method === 'NotifyStatus' &&
          Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
          Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
          Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'aenergy')
        ) {
          return valueObj.params['switch:0'].aenergy.total;
        }
        return undefined;
      }
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
  },
  'temperatureC': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
        const valueObj = JSON.parse(value);
        if (
          Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
          valueObj.method === 'NotifyStatus' &&
          Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
          Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
          Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'temperature')
        ) {
          return valueObj.params['switch:0'].temperature.tC;
        }
        return undefined;
      }
    },
    common: {
      'name': 'Temperature °C',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°C'
    }
  },
  'temperatureF': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
        const valueObj = JSON.parse(value);
        if (
          Object.prototype.hasOwnProperty.call(valueObj, 'method') &&
          valueObj.method === 'NotifyStatus' &&
          Object.prototype.hasOwnProperty.call(valueObj, 'params') &&
          Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0') &&
          Object.prototype.hasOwnProperty.call(valueObj.params['switch:0'], 'temperature')
        ) {
          return valueObj.params['switch:0'].temperature.tF;
        }
        return undefined;
      }
    },
    common: {
      'name': 'Temperature °F',
      'type': 'number',
      'role': 'value.temperature',
      'read': true,
      'write': false,
      'unit': '°F'
    }
  }
};

module.exports = {
  shellyplus1pm: shellyplus1pm
};
