'use strict';

/**
 * Shelly Smoke / SHSM-01 / shellysmoke
 * CoAP:
 *
 * CoAP Version >= 1.8
 *  Shelly Smoke SHSM-01:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":6105,"T":"A","D":"smoke","R":["0/1","-1"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
const shellysmoke = {
    'bat.value': {
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
    'smoke.value': {
        coap: {
            coap_publish: '6105',
            coap_publish_funct: value => value == 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/smoke',
            mqtt_publish_funct: value => {
                return value === true || value === 1;
            },
        },
        common: {
            name: 'Smoke detected',
            type: 'boolean',
            role: 'sensor.alarm.fire',
            read: true,
            write: false,
        },
    },
    'tmp.temperatureC': {
        coap: {
            coap_publish: '3101',
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).tmp.tC : undefined),
            // mqtt_publish: 'shellies/<mqttprefix>/sensor/temperature',
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
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).tmp.tF : undefined),
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
};

module.exports = {
    shellysmoke,
};
