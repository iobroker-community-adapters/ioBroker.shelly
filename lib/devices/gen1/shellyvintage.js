/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Vintage / SHVIN-1 / shellyvintage
 * CoAP:
  *
 * CoAP Version >= 1.8
 *  Shelly Vintage SHVIN-1:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/6","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1}]}
 */
const shellyvintage = {
    'lights.Switch': {
        coap: {
            coap_publish: '1101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value ? true : false; },
            http_cmd: '/light/0',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/command',
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
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
            http_cmd: '/settings/light/0',
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
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
            http_cmd: '/settings/light/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        common: {
            'name': 'Auto Timer On',
            'type': 'number',
            'role': 'level.timer',
            'def': 0,
            'unit': 's',
            'read': true,
            'write': true
        }
    },
    'lights.brightness': {
        coap: {
            coap_publish: '5101', // CoAP >= FW 1.8
            http_cmd: '/light/0',
            http_cmd_funct: (value) => { return { brightness: value }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/set',
            mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await shellyHelper.getLightsObjectWhite(self)); }
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
    'lights.power': {
        coap: {
            coap_publish: '4101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/power',
            mqtt_publish_funct: (value) => { return value; },
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
    'lights.energy': {
        coap: {
            coap_publish: '4103', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/energy',
            mqtt_publish_funct: (value) => { return value; },
        },
        common: {
            'name': 'Energy',
            'type': 'number',
            'role': 'value.power',
            'read': true,
            'write': false,
            'def': 0,
            'unit': 'Wmin'
        }
    }
};

module.exports = {
    shellyvintage: shellyvintage
};
