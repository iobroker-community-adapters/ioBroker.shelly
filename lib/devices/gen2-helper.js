'use strict';

const shellyHelper = require(__dirname + '/../shelly-helper');

/**
 * Adds a generic switch definition for gen 2 devices
 * @param {object} deviceObj
 * @param {number} switchId
 * @param {boolean} hasPowerMetering
 */
function addSwitchToGen2Device(deviceObj, switchId, hasPowerMetering) {

    deviceObj[`Relay${switchId}.ChannelName`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Relay${switchId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { name: value }}}); },
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
            mqtt_publish_funct: (value) => { return JSON.parse(value).output; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.Set', params: { id: switchId, on: value }}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).in_mode : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { in_mode: value }}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).initial_state : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { initial_state: value }}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).auto_on : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { auto_on: value }}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).auto_on_delay : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { auto_on_delay: value }}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).auto_off : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { auto_off: value }}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).auto_off_delay : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { auto_off_delay: value }}}); },
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
            mqtt_publish_funct: (value) => { return JSON.parse(value).source; },
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
            mqtt_publish_funct: (value) => { return JSON.parse(value).temperature.tC; },
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
            mqtt_publish_funct: (value) => { return JSON.parse(value).temperature.tF; },
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
                mqtt_publish_funct: (value) => { return JSON.parse(value).apower; },
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
                mqtt_publish_funct: (value) => { return JSON.parse(value).voltage; },
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
                mqtt_publish_funct: (value) => { return JSON.parse(value).current; },
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
                mqtt_publish_funct: (value) => { return JSON.parse(value).aenergy.total; },
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
                mqtt_publish_funct: (value) => {
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
                http_publish_funct: (value) => { return value ? JSON.parse(value).power_limit : undefined; },
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { power_limit: value }}}); },
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
                http_publish_funct: (value) => { return value ? JSON.parse(value).current_limit : undefined; },
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { current_limit: value }}}); },
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
                http_publish_funct: (value) => { return value ? JSON.parse(value).voltage_limit : undefined; },
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Switch.SetConfig', params: { id: switchId, config: { voltage_limit: value }}}); },
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
function addInputToGen2Device(deviceObj, inputId) {

    deviceObj[`Input${inputId}.Status`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).state; },
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
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Input${inputId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Input.SetConfig', params: { id: inputId, config: { name: value }}}); },
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
            mqtt_publish_funct: (value) => {
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).type : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Input.SetConfig', params: { id: inputId, config: { type: value }}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).invert : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Input.SetConfig', params: { id: inputId, config: { invert: value }}}); },
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

/**
 * Adds a generic cover definition for gen 2 devices
 * @param {object} deviceObj
 * @param {number} coverId
 */
function addCoverToGen2Device(deviceObj, coverId) {

    deviceObj[`Cover${coverId}.InitialState`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).initial_state : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { initial_state: value }}}); },
        },
        common: {
            name: 'Initial State',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'open': 'oopenn',
                'closed': 'closed',
                'stopped': 'stopped',
            },
        },
    };

    deviceObj[`Cover${coverId}.ChannelName`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Cover${coverId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { name: value }}}); },
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
            def: `cover_${coverId}`,
        },
    };

    deviceObj[`Cover${coverId}.Duration`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, `Cover${coverId}.Duration`); },
        },
        common: {
            name: {
                en: 'Duration',
                de: 'Dauer',
                ru: 'Продолжительность',
                pt: 'Duração',
                nl: 'Vertaling:',
                fr: 'Durée',
                it: 'Durata',
                es: 'Duración',
                pl: 'Duracja',
                'zh-cn': '期间',
            },
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`Cover${coverId}.Open`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: async (value, self) => {
                const duration = await shellyHelper.getSetDuration(self, `Cover${coverId}.Duration`, 0);

                if (duration > 0) {
                    return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.Open', params: { id: coverId, duration: duration }});
                } else {
                    return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.Open', params: { id: coverId }});
                }
            },
        },
        common: {
            name: 'Open',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.Stop`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.Stop', params: { id: coverId }}); },
        },
        common: {
            name: 'Stop',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.Close`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: async (value, self) => {
                const duration = await shellyHelper.getSetDuration(self, `Cover${coverId}.Duration`, 0);

                if (duration > 0) {
                    return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.Close', params: { id: coverId, duration: duration }});
                } else {
                    return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.Close', params: { id: coverId }});
                }
            },
        },
        common: {
            name: 'Close',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.Calibrate`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.Calibrate', params: { id: coverId }}); },
        },
        common: {
            name: 'Calibrate',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.InputSwap`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).swap_inputs : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { swap_inputs: value }}}); },
        },
        common: {
            name: 'Input Swap',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.InputMode`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).in_mode : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { in_mode: value }}}); },
        },
        common: {
            name: 'Input Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'single': 'single',
                'dual': 'dual',
                'detached': 'detached',
            },
        },
    };

    deviceObj[`Cover${coverId}.LimitPower`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).power_limit : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { power_limit: value }}}); },
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

    deviceObj[`Cover${coverId}.LimitCurrent`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).current_limit : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { current_limit: value }}}); },
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

    deviceObj[`Cover${coverId}.LimitVoltage`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).voltage_limit : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.SetConfig', params: { id: coverId, config: { voltage_limit: value }}}); },
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

    deviceObj[`Cover${coverId}.Position`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).current_pos; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cover.GoToPosition', params: { id: coverId, pos: value }}); },
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            unit: '%',
            def: 0,
            min: 0,
            max: 100,
        },
    };

    deviceObj[`Cover${coverId}.Status`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).state; },
        },
        common: {
            name: 'Cover Status',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cover${coverId}.Power`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).apower; },
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

    deviceObj[`Cover${coverId}.Voltage`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).voltage; },
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

    deviceObj[`Cover${coverId}.Current`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).current; },
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

    deviceObj[`Cover${coverId}.Energy`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).aenergy.total; },
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

    deviceObj[`Cover${coverId}.source`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).source; },
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

}

/**
 * Adds a generic power definition for gen 2 devices
 * @param {object} deviceObj
 * @param {number} devicePowerId
 */
function addDevicePowerToGen2Device(deviceObj, devicePowerId) {

    deviceObj[`DevicePower${devicePowerId}.BatteryVoltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).battery.V; },
        },
        common: {
            name: {
                en: 'Battery voltage',
                de: 'Batteriespannung',
                ru: 'Напряжение батареи',
                pt: 'Tensão da bateria',
                nl: 'Batterij voltage',
                fr: 'Tension de la batterie',
                it: 'Tensione della batteria',
                es: 'Tensión de la batería',
                pl: 'Napięcie',
                'zh-cn': '電池電壓',
            },
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
        },
    };

    deviceObj[`DevicePower${devicePowerId}.BatteryPercent`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).battery.percent; },
        },
        common: {
            name: {
                en: 'Battery charge level',
                de: 'Batterieladestand',
                ru: 'Уровень заряда батареи',
                pt: 'Nível de carga da bateria',
                nl: 'Batterij niveau',
                fr: 'Niveau de charge de la batterie',
                it: 'Livello di carica della batteria',
                es: 'Nivel de carga de la batería',
                pl: 'Poziom baterii',
                'zh-cn': '包 费',
            },
            type: 'number',
            role: 'value.battery',
            read: true,
            write: false,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj[`DevicePower${devicePowerId}.ExternalPower`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).external.present; },
        },
        common: {
            name: {
                en: 'External power supply',
                de: 'Externe Stromversorgung',
                ru: 'Внешний источник питания',
                pt: 'Fonte de alimentação externa',
                nl: 'Vertaling:',
                fr: 'Alimentation extérieure',
                it: 'Alimentazione elettrica esterna',
                es: 'Fuente de alimentación externa',
                pl: 'Zasilanie zewnętrzne',
                'zh-cn': '外部电力供应',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    };

}

/**
 * Adds a generic temperature sensor definition for gen 2 devices
 * @param {object} deviceObj
 * @param {number} sensorId
 */
function addTemperatureSensorToGen2Device(deviceObj, sensorId) {

    deviceObj[`Temperature${sensorId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=${sensorId}`,
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Temperature${sensorId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Temperature.SetConfig', params: { id: sensorId, config: { name: value }}}); },
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

    deviceObj[`Temperature${sensorId}.Celsius`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:${sensorId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).tC; },
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

    deviceObj[`Temperature${sensorId}.Fahrenheit`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:${sensorId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).tF; },
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

    deviceObj[`Temperature${sensorId}.ReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=${sensorId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).report_thr_C : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Temperature.SetConfig', params: { id: sensorId, config: { report_thr_C: value } }}); },
        },
        common: {
            name: {
                en: 'Report threshold',
                de: 'Meldeschwelle',
                ru: 'Порог отчета',
                pt: 'Limiar de referência',
                nl: 'Vertaling:',
                fr: 'Limite du rapport',
                it: 'Soglia di relazione',
                es: 'Nivel de informe',
                pl: 'Raport o progu',
                'zh-cn': '报告阈值',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
            def: 1,
            min: 0.5,
            max: 5,
        },
    };

}

/**
 * Adds a generic humidity sensor definition for gen 2 devices
 * @param {object} deviceObj
 * @param {number} sensorId
 */
function addHumiditySensorToGen2Device(deviceObj, sensorId) {

    deviceObj[`Humidity${sensorId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Humidity.GetConfig?id=${sensorId}`,
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Humidity${sensorId}`, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Humidity.SetConfig', params: { id: sensorId, config: { name: value }}}); },
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

    deviceObj[`Humidity${sensorId}.Relative`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/humidity:${sensorId}`,
            mqtt_publish_funct: (value) => { return JSON.parse(value).rh; },
        },
        common: {
            name: {
                en: 'Humidity',
                de: 'Luftfeuchtigkeit',
                ru: 'Влажность',
                pt: 'Humidade',
                nl: 'Humid',
                fr: 'Humidité',
                it: 'Umidità',
                es: 'Humedad',
                pl: 'Humity',
                'zh-cn': '死 情',
            },
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            unit: '%',
        },
    };

    deviceObj[`Humidity${sensorId}.ReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Humidity.GetConfig?id=${sensorId}`,
            http_publish_funct: (value) => { return value ? JSON.parse(value).report_thr : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Humidity.SetConfig', params: { id: sensorId, config: { report_thr: value } }}); },
        },
        common: {
            name: {
                en: 'Report threshold',
                de: 'Meldeschwelle',
                ru: 'Порог отчета',
                pt: 'Limiar de referência',
                nl: 'Vertaling:',
                fr: 'Limite du rapport',
                it: 'Soglia di relazione',
                es: 'Nivel de informe',
                pl: 'Raport o progu',
                'zh-cn': '报告阈值',
            },
            type: 'number',
            role: 'level.humidity',
            read: true,
            write: true,
            unit: '%',
            def: 5,
            min: 1,
            max: 20,
        },
    };

}

module.exports = {
    addSwitchToGen2Device: addSwitchToGen2Device,
    addInputToGen2Device: addInputToGen2Device,
    addCoverToGen2Device: addCoverToGen2Device,
    addDevicePowerToGen2Device: addDevicePowerToGen2Device,
    addTemperatureSensorToGen2Device: addTemperatureSensorToGen2Device,
    addHumiditySensorToGen2Device: addHumiditySensorToGen2Device,
};
