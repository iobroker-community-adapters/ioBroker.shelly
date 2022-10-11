'use strict';

/**
 * Shelly Door/Windows Sensor / SHDW-1 / shellydw
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":66,"D":"lux","T":"L","R":"0/100000","L":1},{"I":55,"D":"State","T":"S","R":"0/1","L":1},{"I":77,"D":"battery","T":"B","R":"0/100","L":1},{"I":88,"D":"tilt","T":"S","R":"0/180","L":1},{"I":99,"D":"vibration","T":"S","R":"0/1","L":1}]}
  *
 * CoAP Version >= 1.8
 *  Shelly Door Window SHDW-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":3108,"T":"S","D":"dwIsOpened","R":["0/1","-1"],"L":1},{"I":3109,"T":"S","D":"tilt","U":"deg","R":["0/180","-1"],"L":1},{"I":6110,"T":"A","D":"vibration","R":["0/1","-1"],"L":1},{"I":3106,"T":"L","D":"luminosity","U":"lux","R":["U32","-1"],"L":1},{"I":3110,"T":"S","D":"luminosityLevel","R":["dark/twilight/bright","unknown"],"L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/alarm","unknown"],"L":2}]}
 */
const shellydw = {
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
    'sensor.door': {
        coap: {
            coap_publish: '3108',
            coap_publish_funct: (value) => { return value === 0 ? false : true; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/state',
            mqtt_publish_funct: (value) => { return value === 'open'; },
        },
        common: {
            name: 'Door Sensor',
            type: 'boolean',
            role: 'sensor.door',
            read: true,
            write: false,
            def: false,
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
    'sensor.illuminantion': {
        coap: {
            coap_publish: '3110',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/illumination',
        },
        common: {
            name: 'Illumination Level',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'dark': 'dark',
                'twilight': 'twilight',
                'bright': 'bright',
            },
        },
    },
    'sensor.vibration': {
        coap: {
            coap_publish: '6110',
            coap_publish_funct: (value) => { return value != 0; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/vibration',
            mqtt_publish_funct: (value) => { return value != 0; },
        },
        common: {
            name: 'Vibration',
            type: 'boolean',
            role: 'sensor',
            read: true,
            write: false,
        },
    },
    'sensor.tilt': {
        coap: {
            coap_publish: '3109',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/tilt',
        },
        common: {
            name: 'Tilt',
            type: 'number',
            role: 'value.tilt',
            read: true,
            write: false,
            unit: 'degree',
        },
    },
    'sensor.wakeupevent': {
        coap: {
            coap_publish: '9102',
            coap_publish_funct: (value) => { return JSON.stringify(value); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/wakeupevent',
        },
        common: {
            name: 'Wakeup Event',
            type: 'string',
            role: 'json',
            read: true,
            write: false,
        },
    },
};

module.exports = {
    shellydw: shellydw,
};
