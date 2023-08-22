'use strict';

/**
 * Shelly HT / SHHT-1 / shellyht
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":33,"D":"temperature","T":"T","R":"-40/125","L":1},{"I":44,"D":"humidity","T":"H","R":"0/100","L":1},{"I":77,"D":"battery","T":"B","R":"0/100","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly HT SHHT-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":1},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":1},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
const shellyht = {
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
    'bat.charger': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).external_power == 1 : false,
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => value ? JSON.parse(value).external_power == 1 : false,
        },
        common: {
            name: {
                en: 'Charger connected',
                de: 'Ladegerät angeschlossen',
                ru: 'Подключенное зарядное устройство',
                pt: 'Carregador conectado',
                nl: 'Vertaling:',
                fr: 'Charger connecté',
                it: 'Caricabatterie collegato',
                es: 'Cargador conectado',
                pl: 'Charger join',
                'zh-cn': '联系人',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'hum.value': {
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
    'tmp.temperatureC': {
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
    'tmp.temperatureF': {
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
};

module.exports = {
    shellyht,
};
