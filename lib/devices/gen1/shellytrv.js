'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly TRV / SHTRV-01 / shellytrv
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":33,"D":"temperature","T":"T","R":"-40/125","L":1},{"I":44,"D":"humidity","T":"H","R":"0/100","L":1},{"I":77,"D":"battery","T":"B","R":"0/100","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly HT SHTRV-01: {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
const shellytrv = {
    'bat.value': {
        coap: {
            coap_publish: '3412',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).bat.value : 0; },
        },
        common: {
            name: {
                en: 'Battery capacity',
                de: 'Batteriekapazität',
                ru: 'Емкость батареи',
                pt: 'Capacidade da bateria',
                nl: 'Batterij capaciteit',
                fr: 'Capacité de la batterie',
                it: 'Capacità della batteria',
                es: 'Capacidad de la batería',
                pl: 'Pojemność baterii',
                'zh-cn': '包 容能力',
            },
            type: 'number',
            role: 'value.battery',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'bat.voltage': {
        coap: {
            coap_publish: '3412',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).bat.voltage : 0; },

        },
        common: {
            name: {
                en: 'Battery voltage',
                de: 'Batteriespannung',
                ru: 'Напряжение батареи',
                pt: 'Tensão da bateria',
                nl: 'Batterij voltage',
                fr: 'Tension de la batterie',
                it: 'Tensione della batteria',
                es: 'Tensión de la batería',
                pl: 'Napięcie',
                'zh-cn': '電池電壓',
            },
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
        },
    },
    'bat.charger': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).charger : false; },
        },
        common: {
            name: 'Charger connected',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'tmp.temperatureC': {
        coap: {
            coap_publish: '3104',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => {
                if (value) {
                    const valObj = JSON.parse(value).thermostats[0];
                    if (valObj.tmp.units === 'C') {
                        return valObj.tmp.value;
                    } else if (valObj.tmp.units === 'F') {
                        return shellyHelper.fahrenheitToCelsius(valObj.tmp.value);
                    }
                }

                return undefined;
            },
        },
        common: {
            name: {
                en: 'Temperature',
                de: 'Temperatur',
                ru: 'Температура',
                pt: 'Temperatura',
                nl: 'Temperatuur',
                fr: 'Température',
                it: 'Temperatura',
                es: 'Temperatura',
                pl: 'Temperatura',
                'zh-cn': '模范',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'tmp.temperatureF': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: 'shellies/<mqttprefix>/status',
            http_publish_funct: (value) => {
                if (value) {
                    const valObj = JSON.parse(value).thermostats[0];
                    if (valObj.tmp.units === 'C') {
                        return shellyHelper.celsiusToFahrenheit(valObj.tmp.value);
                    } else if (valObj.tmp.units === 'F') {
                        return valObj.tmp.value;
                    }
                }

                return undefined;
            },
        },
        common: {
            name: {
                en: 'Temperature',
                de: 'Temperatur',
                ru: 'Температура',
                pt: 'Temperatura',
                nl: 'Temperatuur',
                fr: 'Température',
                it: 'Temperatura',
                es: 'Temperatura',
                pl: 'Temperatura',
                'zh-cn': '模范',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    'tmp.temperatureSensorWorking': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].tmp.is_valid : undefined; },
        },
        common: {
            name: 'Temperature Sensor Working',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'tmp.temperatureTargetC': {
        coap: {
            coap_publish: '3103',
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].target_t.value : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { target_t: value }; },
        },
        common: {
            name: 'Target temperature',
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
            min: 4,
            max: 31,
        },
    },
     'tmp.temperatureOffset': {
        coap: {
            coap_publish: '3103',
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].temperature_offset : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { temperature_offset: value }; },
        },
        common: {
            name: 'Temperature Offset',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            unit: '°C',
            min: -9,
            max: 9,
        },
    },
    'tmp.valvePosition': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].pos : undefined; },
        },
        common: {
            name: 'Valve position',
            type: 'number',
            role: 'value.valve',
            read: true,
            write: false,
            unit: '%',
        },
    },
    'ext.temperature': {
        coap: {
            http_cmd: '/ext_t',
            http_cmd_funct: (value) => { return { temp: value }; },
        },
        mqtt: {
            http_cmd: '/ext_t',
            http_cmd_funct: (value) => { return { temp: value }; },
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
        },
    },
    'schedule.schedule': {
        coap: {
            coap_publish: '3102',
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { schedule: value }; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].schedule : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/thermostat/0/command',
            mqtt_cmd_funct: (value) => { value ? 1 : 0; },
        },
        common: {
            name: 'Schedule active',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'schedule.profile': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].schedule_profile : undefined; },
            mqtt_cmd: 'shellies/<mqttprefix>/thermostat/0/command',
            mqtt_cmd_funct: (value) => { value ? 1 : 0; },
        },
        common: {
            name: 'Schedule Profile',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
            min: 0,
            max: 5,
        },
    },
    'boost.timeRemaining': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).thermostats[0].boost_minutes : undefined; },
        },
        common: {
            name: 'Boost time remaining',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'min',
        },
    },
    'boost.setDuration': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/settings/thermostat/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).boost_minutes : undefined; },
            http_cmd: '/settings/thermostat/0',
            http_cmd_funct: (value) => { return { boost_minutes: value }; },
        },
        common: {
            name: 'Boot duration',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
            unit: 'min',
        },
    },
};

module.exports = {
    shellytrv: shellytrv,
};
