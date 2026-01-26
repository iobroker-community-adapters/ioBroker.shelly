'use strict';

//const shellyHelper = require('../shelly-helper');

/**
 * This module contains helpers to add VIRTUAL COMPONENTS
 *
 * see https://shelly-api-docs.shelly.cloud/gen2/DynamicComponents/Virtual/
 *
 * Components can be added automatically by code or explicitly configured for devices.
 */

/**
 * Component Boolean
 * https://shelly-api-docs.shelly.cloud/gen2/DynamicComponents/Virtual/Boolean
 *
 * Adds a virtual boolean component definition to Gen 2+ devices
 *
 * @param deviceObj
 * @param id
 * @param access ('crw', 'cr', ...)
 */
function addBoolean(deviceObj, id, access) {
    deviceObj[`Boolean${id}.Name`] = {
        mqtt: {
            http_publish: `/rpc/Boolean.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).name;
            },
        },
        common: {
            name: {
                en: 'Name',
                de: 'Name',
                ru: 'Имя',
                pt: 'Nome',
                nl: 'Naam',
                fr: 'Nom',
                it: 'Nome',
                es: 'Nombre',
                pl: 'Nazwa',
                uk: "Ім'я",
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };
    deviceObj[`Boolean${id}.Persisted`] = {
        mqtt: {
            http_publish: `/rpc/Boolean.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).persisted;
            },
        },
        common: {
            name: {
                en: 'persistent',
                de: 'persistent',
                ru: 'настойчивый',
                pt: 'persistente',
                nl: 'volhardend',
                fr: 'persistant',
                it: 'persistente',
                es: 'persistente',
                pl: 'uporczywy',
                uk: 'стійкий',
                'zh-cn': '执着的',
            },
            type: 'boolean',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Boolean${id}.Value`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/rpc/boolean:${id}`,
            mqtt_publish_funct: value => JSON.parse(value).value,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: id, config: { name: value } },
                });
            },
        },
        common: {
            name: {
                en: 'Value',
                de: 'Wert',
                ru: 'Ценность',
                pt: 'Valor',
                nl: 'Waarde',
                fr: 'Valeur',
                it: 'Valore',
                es: 'Valor',
                pl: 'Wartość',
                uk: 'Ціна',
                'zh-cn': '数值',
            },
            type: 'boolean',
            role: access.includes('w') ? (access.includes('r') ? 'switch' : 'button') : 'indicator',
            read: access.includes('r'),
            write: access.includes('w'),
        },
    };
}

// /**
//  * Component VirtualNumber
//  * https://shelly-api-docs.shelly.cloud/gen2/DynamicComponents/Virtual/Number
//  *
//  * Adds a virtual number definition for Gen 2+ devices
//  *
//  * @param deviceObj
//  * @param id
//  */
// function addVirtualNumber(deviceObj, id) {
//     deviceObj[`VirtualNumber${id}.ChannelName`] = {
//         mqtt: {
//             http_publish: `/rpc/Cover.GetConfig?id=${id}`,
//             http_publish_funct: async (value, self) => {
//                 return value
//                     ? await shellyHelper.setChannelName(self, `Cover${id}`, JSON.parse(value).name)
//                     : undefined;
//             },
//             mqtt_cmd: '<mqttprefix>/rpc',
//             mqtt_cmd_funct: (value, self) => {
//                 return JSON.stringify({
//                     id: self.getNextMsgId(),
//                     src: 'iobroker',
//                     method: 'Cover.SetConfig',
//                     params: { id: id, config: { name: value } },
//                 });
//             },
//         },
//         common: {
//             name: {
//                 en: 'Channel name',
//                 de: 'Kanalname',
//                 ru: 'Имя канала',
//                 pt: 'Nome do canal',
//                 nl: 'Kanaalnaam',
//                 fr: 'Nom du canal',
//                 it: 'Nome del canale',
//                 es: 'Nombre del canal',
//                 pl: 'Channel imię',
//                 'zh-cn': '姓名',
//             },
//             type: 'string',
//             role: 'text',
//             read: true,
//             write: true,
//             def: `cover_${id}`,
//         },
//     };

//     deviceObj[`VirtualNumber${id}.Persistent`] = {
//         mqtt: {
//             http_publish: `/rpc/Cover.GetConfig?id=${id}`,
//             http_publish_funct: async (value, self) => {
//                 return value
//                     ? await shellyHelper.setChannelName(self, `Cover${id}`, JSON.parse(value).name)
//                     : undefined;
//             },
//             mqtt_cmd: '<mqttprefix>/rpc',
//             mqtt_cmd_funct: (value, self) => {
//                 return JSON.stringify({
//                     id: self.getNextMsgId(),
//                     src: 'iobroker',
//                     method: 'Cover.SetConfig',
//                     params: { id: id, config: { name: value } },
//                 });
//             },
//         },
//         common: {
//             name: {
//                 en: 'persistent',
//                 de: 'persistent',
//                 ru: 'настойчивый',
//                 pt: 'persistente',
//                 nl: 'volhardend',
//                 fr: 'persistant',
//                 it: 'persistente',
//                 es: 'persistente',
//                 pl: 'uporczywy',
//                 uk: 'стійкий',
//                 'zh-cn': '执着的',
//             },
//             type: 'boolean',
//             role: 'text',
//             read: true,
//             write: true,
//         },
//     };

//     deviceObj[`VirtualNumber${id}.Value`] = {
//         mqtt: {
//             http_publish: `/rpc/Cover.GetConfig?id=${id}`,
//             http_publish_funct: async (value, self) => {
//                 return value
//                     ? await shellyHelper.setChannelName(self, `Cover${id}`, JSON.parse(value).name)
//                     : undefined;
//             },
//             mqtt_cmd: '<mqttprefix>/rpc',
//             mqtt_cmd_funct: (value, self) => {
//                 return JSON.stringify({
//                     id: self.getNextMsgId(),
//                     src: 'iobroker',
//                     method: 'Cover.SetConfig',
//                     params: { id: id, config: { name: value } },
//                 });
//             },
//         },
//         common: {
//             name: {
//                 en: 'Value',
//                 de: 'Wert',
//                 ru: 'Ценность',
//                 pt: 'Valor',
//                 nl: 'Waarde',
//                 fr: 'Valeur',
//                 it: 'Valore',
//                 es: 'Valor',
//                 pl: 'Wartość',
//                 uk: 'Ціна',
//                 'zh-cn': '数值',
//             },
//             type: 'number',
//             role: 'level',
//             read: true,
//             write: true,
//         },
//     };
// }

module.exports = {
    addBoolean,
    //addNumber,
};
