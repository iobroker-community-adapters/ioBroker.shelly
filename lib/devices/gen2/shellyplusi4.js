'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus I4 / shellyplusi4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusI4
 */
const shellyplusi4 = {
    'Ext.input100': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:100`,
            mqtt_publish_funct: value => JSON.parse(value).state,
        },
        common: {
            name: 'Input100',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'Ext.input101': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:101`,
            mqtt_publish_funct: value => JSON.parse(value).percent,
        },
        common: {
            name: 'Input101',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
            def: 0,
        },
    },
    'Ext.voltmeter100': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/voltmeter:100`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
        },
        common: {
            name: 'Volmeter100',
            type: 'value.number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
            def: 0,
        },
    },
    'Ext.temperature100C': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:100`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
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
    'Ext.temperature100F': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:100`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
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
    'Ext.temperature101C': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:101`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
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
    'Ext.temperature101F': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:101`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
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
    'Ext.temperature102C': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:102`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
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
    'Ext.temperature102F': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:102`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
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
    'Ext.temperature103C': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:103`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
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
    'Ext.temperature103F': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:103`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
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
    'Ext.temperature104C': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:104`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
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
    'Ext.temperature104F': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:104`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
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

shellyHelperGen2.addInputToGen2Device(shellyplusi4, 0);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 1);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 2);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 3);

module.exports = {
    shellyplusi4,
};
