/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plug / SHPLG-1 / shellyplug
 * CoAP:
  *
 * CoAP Version >= 1.8
 *  Shelly Plug SHPLG-1:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1}]}
 */
const shellyplug = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return value ? true : false; },
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
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
    'Relay0.ChannelName': {
        coap: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0.ChannelName', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { name: value }; }
        },
        mqtt: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0.ChannelName', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { name: value }; }
        },
        common: {
            'name': 'Channel Name',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'Relay0.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_off: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
            http_cmd: '/settings/relay/0',
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
    'Relay0.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_on: value }; }
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
    'Relay0.Power': {
        coap: {
            coap_publish: '4101', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/power',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
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
        coap: {
            coap_publish: '4103', // CoAP >= FW 1.8
            coap_publish_funct: (value) => { return (Math.round((value / 60) * 100) / 100); }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/energy',
            mqtt_publish_funct: (value) => { return Math.round((value / 60) * 100) / 100; }
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
    'Relay0.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay0.Timer'); }
        },
        mqtt: {
            no_display: true
        },
        common: {
            'name': 'Duration',
            'type': 'number',
            'role': 'level.timer',
            'read': true,
            'write': true,
            'def': 0,
            'unit': 's'
        }
    },
    'Relay0.overpowerValue': {
        coap: {
            coap_publish: '6109', // CoAP >= FW 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/overpower_value',
        },
        common: {
            'name': 'overpower Value',
            'type': 'number',
            'role': 'state',
            'unit': 'W',
            'read': true,
            'write': false,
            'def': 0
        }
    },
};


module.exports = {
    shellyplug: shellyplug
};
