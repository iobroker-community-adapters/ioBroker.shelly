/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Plus 1 PM / shellyplus1pm
 */
let shellyplus1pm = {
  'Relay0.Switch': {
    mqtt: {
      mqtt_publish: '<mqttprefix>/events/rpc',
      mqtt_publish_funct: (value) => {
          const valueObj = JSON.parse(value);
          if (valueObj.method === 'NotifyStatus' && Object.prototype.hasOwnProperty.call(valueObj.params, 'switch:0')) {
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
  }
};

module.exports = {
  shellyplus1pm: shellyplus1pm
};
