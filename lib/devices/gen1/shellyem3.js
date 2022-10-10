'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly 3 EM / SHEM-3 / shellyem3
 * CoAP:
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Meter0"},{"I":2,"D":"Meter1"},{"I":3,"D":"Meter2"}],"sen":[{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":111,"T":"P","D":"Power","R":"0/26400","L":1},{"I":114,"T":"S","D":"PF","R":"0/1","L":1},{"I":115,"T":"S","D":"Current","R":"0/120","L":1},{"I":116,"T":"S","D":"Voltage","R":"0/265","L":1},{"I":121,"T":"P","D":"Power","R":"0/26400","L":2},{"I":124,"T":"S","D":"PF","R":"0/1","L":2},{"I":125,"T":"S","D":"Current","R":"0/120","L":2},{"I":126,"T":"S","D":"Voltage","R":"0/265","L":2},{"I":131,"T":"P","D":"Power","R":"0/26400","L":3},{"I":134,"T":"S","D":"PF","R":"0/1","L":3},{"I":135,"T":"S","D":"Current","R":"0/120","L":3},{"I":136,"T":"S","D":"Voltage","R":"0/265","L":3}]}
 *
 * CoAP Version >= 1.8
 *  Shelly 3EM SHEM-3:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"emeter_0"},{"I":3,"D":"emeter_1"},{"I":4,"D":"emeter_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":4105,"T":"P","D":"power","U":"W","R":["0/31800","-1"],"L":2},{"I":4106,"T":"E","D":"energy","U":"Wh","R":["U32","-1"],"L":2},{"I":4107,"T":"E","D":"energyReturned","U":"Wh","R":["U32","-1"],"L":2},{"I":4108,"T":"V","D":"voltage","U":"V","R":["0/265","-1"],"L":2},{"I":4109,"T":"I","D":"current","U":"A","R":["0/120","-1"],"L":2},{"I":4110,"T":"S","D":"powerFactor","R":["0/1","-1"],"L":2},{"I":4205,"T":"P","D":"power","U":"W","R":["0/31800","-1"],"L":3},{"I":4206,"T":"E","D":"energy","U":"Wh","R":["U32","-1"],"L":3},{"I":4207,"T":"E","D":"energyReturned","U":"Wh","R":["U32","-1"],"L":3},{"I":4208,"T":"V","D":"voltage","U":"V","R":["0/265","-1"],"L":3},{"I":4209,"T":"I","D":"current","U":"A","R":["0/120","-1"],"L":3},{"I":4210,"T":"S","D":"powerFactor","R":["0/1","-1"],"L":3},{"I":4305,"T":"P","D":"power","U":"W","R":["0/31800","-1"],"L":4},{"I":4306,"T":"E","D":"energy","U":"Wh","R":["U32","-1"],"L":4},{"I":4307,"T":"E","D":"energyReturned","U":"Wh","R":["U32","-1"],"L":4},{"I":4308,"T":"V","D":"voltage","U":"V","R":["0/265","-1"],"L":4},{"I":4309,"T":"I","D":"current","U":"A","R":["0/120","-1"],"L":4},{"I":4310,"T":"S","D":"powerFactor","R":["0/1","-1"],"L":4},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1}]}
 */
const shellyem3 = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: '/relay/0',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
            mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
        },
        common: {
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Vertaling:',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Switch',
                'zh-cn': '目 录',
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
    'Relay0.ChannelName': {
        coap: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        common: {
            name: {
                en: 'Channel name',
                de: 'Kanalname',
                ru: 'Имя канала',
                pt: 'Nome do canal',
                nl: 'Kanaalnaam',
                fr: 'Nom du canal',
                it: 'Nome del canale',
                es: 'Nombre del canal',
                pl: 'Channel imię',
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Relay0.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_off: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
            http_cmd: '/settings/relay/0',
            http_cmd_funct: (value) => { return { auto_off: value }; },
        },
        common: {
            name: 'Auto Timer Off',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    },
    'Relay0.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
            http_cmd_funct: (value) => { return { auto_on: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
            http_cmd_funct: (value) => { return { auto_on: value }; },
        },
        common: {
            name: 'Auto Timer On',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    },
    'Emeter0.ChannelName': {
        coap: {
            http_publish: '/settings/emeter/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Emeter0', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/emeter/0',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings/emeter/0',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Emeter0', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/emeter/0',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        common: {
            name: {
                en: 'Channel name',
                de: 'Kanalname',
                ru: 'Имя канала',
                pt: 'Nome do canal',
                nl: 'Kanaalnaam',
                fr: 'Nom du canal',
                it: 'Nome del canale',
                es: 'Nombre del canal',
                pl: 'Channel imię',
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Emeter0.Power': {
        coap: {
            coap_publish: '4105',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/power',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Emeter0.Total': {
        coap: {
            coap_publish: '4106',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/total',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Total',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter0.Total_Returned': {
        coap: {
            coap_publish: '4107',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/total_returned',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Total Returned',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter0.PowerFactor': {
        coap: {
            coap_publish: '4110',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/pf',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Emeter0.Voltage': {
        coap: {
            coap_publish: '4108',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/voltage',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Voltage',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
    'Emeter0.Current': {
        coap: {
            coap_publish: '4109',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/current',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Current',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    },
    'Emeter1.ChannelName': {
        coap: {
            http_publish: '/settings/emeter/1',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Emeter1', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/emeter/1',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings/emeter/1',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Emeter1', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/emeter/1',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        common: {
            name: {
                en: 'Channel name',
                de: 'Kanalname',
                ru: 'Имя канала',
                pt: 'Nome do canal',
                nl: 'Kanaalnaam',
                fr: 'Nom du canal',
                it: 'Nome del canale',
                es: 'Nombre del canal',
                pl: 'Channel imię',
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Emeter1.Power': {
        coap: {
            coap_publish: '4205',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/power',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Emeter1.Total': {
        coap: {
            coap_publish: '4206',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/total',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Total',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter1.Total_Returned': {
        coap: {
            coap_publish: '4207',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/total_returned',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Total Returned',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter1.PowerFactor': {
        coap: {
            coap_publish: '4210',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/pf',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Emeter1.Voltage': {
        coap: {
            coap_publish: '4208',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/voltage',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Voltage',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
    'Emeter1.Current': {
        coap: {
            coap_publish: '4209',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/current',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Current',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    },
    'Emeter2.ChannelName': {
        coap: {
            http_publish: '/settings/emeter/2',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Emeter2', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/emeter/2',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings/emeter/2',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, 'Emeter2', JSON.parse(value).name) : undefined; },
            http_cmd: '/settings/emeter/2',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        common: {
            name: {
                en: 'Channel name',
                de: 'Kanalname',
                ru: 'Имя канала',
                pt: 'Nome do canal',
                nl: 'Kanaalnaam',
                fr: 'Nom du canal',
                it: 'Nome del canale',
                es: 'Nombre del canal',
                pl: 'Channel imię',
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Emeter2.Power': {
        coap: {
            coap_publish: '4305',
            coap_publish_funct: (value) => { return (value * 100) / 100; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/2/power',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Emeter2.Total': {
        coap: {
            coap_publish: '4306',
            coap_publish_funct: (value) => { return (Math.round(value) * 100) / 100; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/2/total',
            mqtt_publish_funct: (value) => { return (Math.round(value) * 100) / 100; },
        },
        common: {
            name: 'Total',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter2.Total_Returned': {
        coap: {
            coap_publish: '4307',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/2/total_returned',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Total Returned',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter2.PowerFactor': {
        coap: {
            coap_publish: '4310',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/2/pf',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Emeter2.Voltage': {
        coap: {
            coap_publish: '4308',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/2/voltage',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Voltage',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
    'Emeter2.Current': {
        coap: {
            coap_publish: '4309',
            coap_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/2/current',
            mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); },
        },
        common: {
            name: 'Current',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    },
    'Total.ConsumedPower': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => { return shellyHelper.getTotalSumm(self); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/total',
            mqtt_publish_funct: async (value, self) => { return shellyHelper.getTotalSumm(self); },
        },
        common: {
            name: 'Total Energy',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Total.Current': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => { return shellyHelper.getCurrentSumm(self); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/current',
            mqtt_publish_funct: async (value, self) => { return shellyHelper.getCurrentSumm(self); },
        },
        common: {
            name: 'Total Current',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    },
    'Total.InstantPower': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => { return shellyHelper.getPowerSumm(self); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/power',
            mqtt_publish_funct: async (value, self) => { return shellyHelper.getPowerSumm(self); },
        },
        common: {
            name: 'Total Instantaneous power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Total.VoltageMean': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'mean'); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/voltage',
            mqtt_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'mean'); },
        },
        common: {
            name: 'Voltage Mean',
            type: 'number',
            role: 'value.voltagemean',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
    'Total.Total_Returned': {
        coap: {
            coap_publish: '4107',
            coap_publish_funct: async (value, self) => { return shellyHelper.getTotalReturnedSumm(self); },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/total_returned',
            mqtt_publish_funct: async (value, self) => { return shellyHelper.getTotalReturnedSumm(self); },
        },
        common: {
            name: 'Total Returned',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    /* Das macht keinen Sinn */
    'Total.Voltage': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'total'); },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => { return shellyHelper.getVoltageCalc(self, 'total'); },
        },
        common: {
            name: 'Voltage Total',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
};

module.exports = {
    shellyem3: shellyem3,
};
