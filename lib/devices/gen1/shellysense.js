'use strict';

/**
 * Shelly Sense / SHSEN-1 / shellysense
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":11,"D":"motion","T":"S","R":"0/1","L":1},{"I":22,"D":"charger","T":"S","R":"0/1","L":1},{"I":33,"D":"temperature","T":"T","R":"-40/125","L":1},{"I":44,"D":"humidity","T":"H","R":"0/100","L":1},{"I":66,"D":"lux","T":"L","R":"0/1","L":1},{"I":77,"D":"battery","T":"H","R":"0/100","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly Sense SHSEN-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":1},{"I":6107,"T":"A","D":"motion","R":["0/1","-1"],"L":1},{"I":3106,"T":"L","D":"luminosity","U":"lux","R":["U32","-1"],"L":1},{"I":3112,"T":"S","D":"charger","R":["0/1","-1"],"L":2},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2}]}
 */
const shellysense = {
    'sensor.battery': {
        coap: {
            coap_publish: '3111',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/battery',
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
    'sensor.humidity': {
        coap: {
            coap_publish: '3103',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/humidity',
        },
        common: {
            name: 'Relative humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'sensor.temperatureC': {
        coap: {
            coap_publish: '3101',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => value ? JSON.parse(value).tmp.tC : undefined,
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
    'sensor.temperatureF': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => value ? JSON.parse(value).tmp.tF : undefined,
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
    'sensor.motion': {
        coap: {
            coap_publish: '6107',
            coap_publish_funct: value => value === 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/motion',
        },
        common: {
            name: 'Motion',
            type: 'boolean',
            role: 'sensor.motion',
            read: true,
            write: false,
        },
    },
    'sensor.charger': {
        coap: {
            coap_publish: '3112',
            coap_publish_funct: value => value === 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/charger',
        },
        common: {
            name: 'External Power',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'sensor.lux': {
        coap: {
            coap_publish: '3106',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/lux',
        },
        common: {
            name: 'Illuminance',
            type: 'number',
            role: 'value.brightness',
            read: true,
            write: false,
            unit: 'Lux',
        },
    },
};

module.exports = {
    shellysense,
};
