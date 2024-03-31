'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Adds a generic switch definition for gen 3 devices
 * @param {object} deviceObj
 * @param {number} switchId
 * @param {boolean} hasPowerMetering
 */
function addSwitchToGen3Device(deviceObj, switchId, hasPowerMetering) {

    deviceObj[`Relay${switchId}.ChannelName`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => {
                return value ? await shellyHelper.setChannelName(self, `Relay${switchId}`, JSON.parse(value).name) : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { name: value } },
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
        },
    };

    deviceObj[`Relay${switchId}.Switch`] = {
        device_mode: 'switch',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).output,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.Set',
                    params: { id: switchId, on: value },
                });
            },
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
    };

    deviceObj[`Relay${switchId}.InputMode`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => value ? JSON.parse(value).in_mode : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { in_mode: value } },
                });
            },
        },
        common: {
            name: {
                en: 'Input mode',
                de: 'Eingangsmodus',
                ru: 'Входной режим',
                pt: 'Modo de entrada',
                nl: 'Input modus',
                fr: 'Mode d \' entrée',
                it: 'Modalità di ingresso',
                es: 'Modo de entrada',
                pl: 'Tryb gry',
                'zh-cn': '投入模式',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'momentary': 'momentary',
                'follow': 'follow',
                'flip': 'flip',
                'detached': 'detached',
            },
        },
    };

    deviceObj[`Relay${switchId}.InitialState`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => value ? JSON.parse(value).initial_state : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { initial_state: value } },
                });
            },
        },
        common: {
            name: {
                en: 'Initial state',
                de: 'Ausgangszustand',
                ru: 'Начальное состояние',
                pt: 'Estado inicial',
                nl: 'Initiële staat',
                fr: 'État initial',
                it: 'Stato iniziale',
                es: 'Estado inicial',
                pl: 'Państwo inicjalne',
                'zh-cn': '初次报告',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'on': 'on',
                'off': 'off',
                'restore_last': 'restore_last',
                'match_input': 'match_input',
            },
        },
    };

    deviceObj[`Relay${switchId}.AutoTimerOn`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => value ? JSON.parse(value).auto_on : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { auto_on: value } },
                });
            },
        },
        common: {
            name: 'Auto Timer On',
            type: 'boolean',
            role: 'switch.enable',
            def: false,
            read: true,
            write: true,
        },
    };

    deviceObj[`Relay${switchId}.AutoTimerOnDelay`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => value ? JSON.parse(value).auto_on_delay : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { auto_on_delay: value } },
                });
            },
        },
        common: {
            name: 'Auto Timer On Delay',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    };

    deviceObj[`Relay${switchId}.AutoTimerOff`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => value ? JSON.parse(value).auto_off : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { auto_off: value } },
                });
            },
        },
        common: {
            name: 'Auto Timer Off',
            type: 'boolean',
            role: 'switch.enable',
            def: false,
            read: true,
            write: true,
        },
    };

    deviceObj[`Relay${switchId}.AutoTimerOffDelay`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => value ? JSON.parse(value).auto_off_delay : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.SetConfig',
                    params: { id: switchId, config: { auto_off_delay: value } },
                });
            },
        },
        common: {
            name: 'Auto Timer Off Delay',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    };

    deviceObj[`Relay${switchId}.source`] = {
        device_mode: 'switch',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).source,
        },
        common: {
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: 'Fonte dell\'ultimo comando',
                es: 'Fuente del último comando',
                pl: 'Źródło ostatniego dowództwa',
                'zh-cn': '最后一次指挥的来源',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Relay${switchId}.temperatureC`] = {
        device_mode: 'switch',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature.tC,
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
    };

    deviceObj[`Relay${switchId}.temperatureF`] = {
        device_mode: 'switch',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature.tF,
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
    };

    if (hasPowerMetering) {

        deviceObj[`Relay${switchId}.Power`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).apower,
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
        };

        deviceObj[`Relay${switchId}.Voltage`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).voltage,
            },
            common: {
                name: {
                    en: 'Voltage',
                    de: 'Spannung',
                    ru: 'Напряжение',
                    pt: 'Tensão',
                    nl: 'Voltage',
                    fr: 'Tension',
                    it: 'Tensione',
                    es: 'Voltaje',
                    pl: 'Voltage',
                    'zh-cn': '动产',
                },
                type: 'number',
                role: 'value.voltage',
                read: true,
                write: false,
                def: 0,
                unit: 'V',
            },
        };

        deviceObj[`Relay${switchId}.Current`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).current,
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
        };

        deviceObj[`Relay${switchId}.Energy`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).aenergy.total,
            },
            common: {
                name: 'Energy',
                type: 'number',
                role: 'value.power.consumption',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };

        /*
        deviceObj[`Relay${switchId}.Overvoltage`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => {
                    const valueObj = JSON.parse(value);
                    return valueObj.errors && Array.prototype.includes.call(valueObj.errors, 'overvoltage');
                },
            },
            common: {
                name: 'Overvoltage',
                type: 'boolean',
                role: 'indicator.alarm',
                read: true,
                write: false,
                def: false
            }
        };
        */

        deviceObj[`Relay${switchId}.LimitPower`] = {
            device_mode: 'switch',
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: value => value ? JSON.parse(value).power_limit : undefined,
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Switch.SetConfig',
                        params: { id: switchId, config: { power_limit: value } },
                    });
                },
            },
            common: {
                name: 'Power Limit',
                type: 'number',
                role: 'value.power',
                unit: 'W',
                read: true,
                write: true,
            },
        };

        deviceObj[`Relay${switchId}.LimitCurrent`] = {
            device_mode: 'switch',
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: value => value ? JSON.parse(value).current_limit : undefined,
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Switch.SetConfig',
                        params: { id: switchId, config: { current_limit: value } },
                    });
                },
            },
            common: {
                name: 'Current Limit',
                type: 'number',
                role: 'value.current',
                unit: 'A',
                read: true,
                write: true,
            },
        };

        deviceObj[`Relay${switchId}.LimitVoltage`] = {
            device_mode: 'switch',
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: value => value ? JSON.parse(value).voltage_limit : undefined,
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Switch.SetConfig',
                        params: { id: switchId, config: { voltage_limit: value } },
                    });
                },
            },
            common: {
                name: 'Voltage Limit',
                type: 'number',
                role: 'value.voltage',
                unit: 'V',
                read: true,
                write: true,
            },
        };
    }

}

/**
 * Adds a generic input definition for gen 2 devices
 * @param {object} deviceObj
 * @param {number} inputId
 */
function addInputToGen3Device(deviceObj, inputId) {

    deviceObj[`Input${inputId}.Status`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value).state,
        },
        common: {
            name: 'Input Status',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    };

    deviceObj[`Input${inputId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => {
                return value ? await shellyHelper.setChannelName(self, `Input${inputId}`, JSON.parse(value).name) : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { name: value } },
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
            def: `input_${inputId}`,
        },
    };

    deviceObj[`Input${inputId}.Event`] = {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];

                        if (typeof event === 'object' && event.component === `input:${inputId}`) {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Input Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    deviceObj[`Input${inputId}.InputType`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => value ? JSON.parse(value).type : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { type: value } },
                });
            },
        },
        common: {
            name: 'Input Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'button': 'button',
                'switch': 'switch',
            },
        },
    };

    deviceObj[`Input${inputId}.InputInverted`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => value ? JSON.parse(value).invert : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { invert: value } },
                });
            },
        },
        common: {
            name: 'Input Inverted',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    };

}

module.exports = {
    addSwitchToGen3Device: addSwitchToGen3Device,
    addInputToGen3Device: addInputToGen3Device,
};
