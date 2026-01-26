'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Naming convention (for new entries)
 *
 * devices are named like shelly components, i.e. Light, EM, PM1, ...
 * id follows componentname without seperator if component does not end with a number (Light - Light0, EM - EM0, ...)
 * id follows componentname with seperator ':' if component ends with a number (EM1 - EM1:0, ...)
 */

/**
 * Component VirtualNumber
 * https://shelly-api-docs.shelly.cloud/gen2/DynamicComponents/Virtual/Number
 *
 * Adds a virtual number definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param Id
 * @param id
 */
function addVirtualNumber(deviceObj, id) {
    deviceObj[`VirtualNumber${id}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${id}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Cover${id}`, JSON.parse(value).name)
                    : undefined;
            },
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
            def: `cover_${id}`,
        },
    };

    deviceObj[`VirtualNumber${id}.Persistent`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${id}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Cover${id}`, JSON.parse(value).name)
                    : undefined;
            },
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
            write: true,
        },
    };

    deviceObj[`VirtualNumber${id}.Value`] = {
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${id}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Cover${id}`, JSON.parse(value).name)
                    : undefined;
            },
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
            type: 'number',
            role: 'level',
            read: true,
            write: true,
        },
    };
}

module.exports = {
    addVirtualNumber,
};
