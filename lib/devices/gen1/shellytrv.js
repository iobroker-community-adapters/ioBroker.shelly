'use strict';

/**
 * Shelly HT / SHHT-1 / shellytrv
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":33,"D":"temperature","T":"T","R":"-40/125","L":1},{"I":44,"D":"humidity","T":"H","R":"0/100","L":1},{"I":77,"D":"battery","T":"B","R":"0/100","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly HT SHHT-1: {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
const shellytrv = {
    'bat.value': {
        coap: {
            coap_publish: '3412' // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).bat.value : 0; }
        },
        common: {
            'name': 'Battery capacity',
            'type': 'number',
            'role': 'value.battery',
            'read': true,
            'write': false,
            'min': 0,
            'max': 100,
            'unit': '%'
        }
    },
    'bat.voltage': {
        coap: {
            coap_publish: '3412' // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).bat.voltage : 0; }

        },
        common: {
            'name': 'Battery voltage',
            'type': 'number',
            'role': 'value.voltage',
            'read': true,
            'write': false,
            'unit': 'V'
        }
    },
    'bat.charger': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).charger : false; }
        },
        common: {
            'name': 'Charger connected',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'tmp.temperatureC': {
        coap: {
            coap_publish: '3104', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].tmp.value : 0; }
        },
        common: {
            'name': 'Temperature',
            'type': 'number',
            'role': 'value.temperature',
            'read': true,
            'write': false,
            'unit': '°C'
        }
    },
    'tmp.temperatureSensorWorking': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].tmp.is_valid : undefined; }
        },
        common: {
            'name': 'Temperature Sensor Working',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'tmp.temperatureTargetC': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].target_t.value : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { target_t: value }; }
        },
        common: {
            'name': 'Target temperature',
            'type': 'number',
            'role': 'level.temperature',
            'read': true,
            'write': true,
            'unit': '°C'
        }
    },
    'tmp.valvePosition': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].pos : undefined; }
        },
        common: {
            'name': 'Valve position',
            'type': 'number',
            'role': 'value.valve',
            'read': true,
            'write': false,
            'unit': '%'
        }
    },
    'schedule.schedule': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].schedule : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { schedule: value }; }
        },
        common: {
            'name': 'Schedule active',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'schedule.profile': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].schedule_profile : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { schedule_profile: value }; }
        },
        common: {
            'name': 'Schedule Profile',
            'type': 'number',
            'role': 'value',
            'read': true,
            'write': true,
            'min': 1,
            'max': 5,
        }
    },
    'boost.timeRemaining': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].boost_minutes : undefined; }
        },
        common: {
            'name': 'Boost time remaining',
            'type': 'number',
            'role': 'value',
            'read': true,
            'write': false,
            'unit': 'min'
        }
    },
    'boost.setDuration': {
        coap: {
            coap_publish: '3102', // CoAP >= FW 1.8
        },
        mqtt: {
            http_publish: '/settings/thermostat/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).boost_minutes : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { boost_minutes: value }; }
        },
        common: {
            'name': 'Boot duration',
            'type': 'number',
            'role': 'value',
            'read': true,
            'write': true,
            'unit': 'min',
        }
    }
};

module.exports = {
    shellytrv: shellytrv
};
