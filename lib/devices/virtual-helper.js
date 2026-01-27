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
 * @param addCommon (optional) - Object with additional properties to add to the .Value common object
 */
function addBoolean(deviceObj, id, access, addCommon) {
    const isReadable = access.includes('r');
    const isWriteable = access.includes('w');

    deviceObj[`Boolean${id}.Name`] = {
        mqtt: {
            http_publish: `/rpc/Boolean.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).name;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Boolean.SetConfig',
                    params: { id: id, config: { name: value } },
                });
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
            write: true,
        },
    };

    deviceObj[`Boolean${id}.Persisted`] = {
        mqtt: {
            http_publish: `/rpc/Boolean.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).persisted;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Boolean.SetConfig',
                    params: { id: id, config: { persisted: value } },
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
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Boolean${id}.Value`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/rpc/boolean:${id}`,
            mqtt_publish_funct: value => JSON.parse(value).value,
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
            role: isWriteable ? (isReadable ? 'switch' : 'button') : 'indicator',
            read: isReadable,
            write: isWriteable,
            ...(addCommon || {}),
        },
    };

    if (isWriteable) {
        deviceObj[`Boolean${id}.Value`].mqtt.mqtt_cmd = '<mqttprefix>/rpc';
        deviceObj[`Boolean${id}.Value`].mqtt.mqtt_cmd_funct = (value, self) => {
            return JSON.stringify({
                id: self.getNextMsgId(),
                src: 'iobroker',
                method: 'Boolean.value',
                params: { id: id, value: value },
            });
        };
    }
}

/**
 * Component Button
 * https://shelly-api-docs.shelly.cloud/gen2/DynamicComponents/Virtual/Button
 *
 * Adds a virtual button component definition to Gen 2+ devices
 *
 * @param deviceObj
 * @param id
 * @param _access (unused)
 * @param addCommon (optional) - Object with additional properties to add to the .Value common object
 */
function addButton(deviceObj, id, _access, addCommon) {
    deviceObj[`Button${id}.Name`] = {
        mqtt: {
            http_publish: `/rpc/Button.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).name;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Button.SetConfig',
                    params: { id: id, config: { name: value } },
                });
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
            write: true,
        },
    };

    deviceObj[`Button${id}.Value`] = {
        mqtt: {
            // mqtt_publish: `<mqttprefix>/rpc/button:${id}`,
            // mqtt_publish_funct: value => JSON.parse(value).value,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Button.value',
                    params: { id: id, value: value },
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
            role: 'button',
            read: false,
            write: true,
            ...(addCommon || {}),
        },
    };
}

/**
 * Component Number
 * https://shelly-api-docs.shelly.cloud/gen2/DynamicComponents/Virtual/Number
 *
 * Adds a virtual Number component definition to Gen 2+ devices
 *
 * @param deviceObj
 * @param id
 * @param access ('crw', 'cr', ...)
 * @param addCommon (optional) - Object with additional properties to add to the .Value common object
 */
function addNumber(deviceObj, id, access, addCommon) {
    // const isReadable = access.includes('r');
    const isWriteable = access.includes('w');

    deviceObj[`Number${id}.Name`] = {
        mqtt: {
            http_publish: `/rpc/Number.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).name;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Number.SetConfig',
                    params: { id: id, config: { name: value } },
                });
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
            write: true,
        },
    };
    deviceObj[`Number${id}.Persisted`] = {
        mqtt: {
            http_publish: `/rpc/Number.GetConfig?id=${id}`,
            http_publish_funct: async (value, _self) => {
                return JSON.parse(value).persisted;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Number.SetConfig',
                    params: { id: id, config: { persisted: value } },
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
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Number${id}.Value`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/number:${id}`,
            mqtt_publish_funct: value => JSON.parse(value).value,
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
            role: isWriteable ? 'level' : 'value',
            read: true,
            write: isWriteable,
            ...(addCommon || {}),
        },
    };

    if (isWriteable) {
        deviceObj[`Number${id}.Value`].mqtt.mqtt_cmd = '<mqttprefix>/rpc';
        deviceObj[`Number${id}.Value`].mqtt.mqtt_cmd_funct = (value, self) => {
            return JSON.stringify({
                id: self.getNextMsgId(),
                src: 'iobroker',
                method: 'Number.Set',
                params: { id: id, value: value },
            });
        };
    }
}

module.exports = {
    addBoolean,
    addButton,
    addNumber,
};
