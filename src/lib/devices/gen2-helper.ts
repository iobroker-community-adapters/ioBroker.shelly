import type { DeviceDefinition } from '../deviceTypes';
import * as shellyHelper from '../shelly-helper';

/**
 * Naming convention (for new entries)
 *
 * devices are named like shelly components, i.e. Light, EM, PM1, ...
 * id follows componentname without seperator if component does not end with a number (Light - Light0, EM - EM0, ...)
 * id follows componentname with seperator ':' if component ends with a number (EM1 - EM1:0, ...)
 */

/**
 * Adds a generic analog input sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Input/
 *
 * @param deviceObj
 * @param inputId
 */
function addAnalogInput(deviceObj: DeviceDefinition, inputId: number): void {
    deviceObj[`Input${inputId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Input${inputId}`, JSON.parse(value).name)
                    : undefined;
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
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
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
            http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
            // mqtt_cmd: '<mqttprefix>/rpc',
            // mqtt_cmd_funct: (value, self) => {
            //     return JSON.stringify({
            //         id: self.getNextMsgId(),
            //         src: 'iobroker',
            //         method: 'Input.SetConfig',
            //         params: { id: inputId, config: { type: value } },
            //     });
            // },
        },
        common: {
            name: 'Input Type',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                analog: 'analog',
            },
        },
    };

    deviceObj[`Input${inputId}.Enable`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Input enable',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`Input${inputId}.InputInverted`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).invert : undefined),
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

    deviceObj[`Input${inputId}.ReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).report_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { report_thr: value } },
                });
            },
        },
        common: {
            name: 'Report threshold',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            unit: '%',
            min: 1,
            max: 50,
        },
    };

    deviceObj[`Input${inputId}.RangeMap`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.stringify(JSON.parse(value).range_map) : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { range_map: JSON.parse(value) } },
                });
            },
        },
        common: {
            name: 'Range mapping',
            type: 'string',
            role: 'json',
            read: true,
            write: true,
        },
    };

    deviceObj[`Input${inputId}.Range`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).range : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { range: value } },
                });
            },
        },
        common: {
            name: 'Range',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
        },
    };

    deviceObj[`Input${inputId}.Percent`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value)?.percent,
        },
        common: {
            name: 'Percentage value',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
        },
    };

    deviceObj[`Input${inputId}.Xpercent`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value)?.xpercent,
        },
        common: {
            name: 'Transformed percentage value',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
        },
    };
}
/**
 * Adds a generic CCT light definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/CCT
 *
 * @param deviceObj
 * @param cctId
 * @param hasPowerMetering
 */
function addCCT(deviceObj: DeviceDefinition, cctId: number, hasPowerMetering: boolean): void {
    deviceObj[`CCT${cctId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `CCT${cctId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            def: `cct_${cctId}`,
        },
    };

    deviceObj[`CCT${cctId}.Switch`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).output,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.Set',
                    params: { id: cctId, on: value },
                });
            },
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`CCT${cctId}.Brightness`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).brightness,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.Set',
                    params: { id: cctId, brightness: value },
                });
            },
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`CCT${cctId}.ColorTemperature`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).ct,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.Set',
                    params: { id: cctId, ct: value },
                });
            },
        },
        common: {
            name: 'Color Temperature',
            type: 'number',
            role: 'level.color.temperature',
            read: true,
            write: true,
            unit: 'K',
        },
    };

    deviceObj[`CCT${cctId}.source`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).source,
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`CCT${cctId}.Event`] = {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];
                        if (typeof event === 'object' && event.component === `cct:${cctId}`) {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'CCT Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    deviceObj[`CCT${cctId}.TimerStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).timer_started_at,
        },
        common: {
            name: 'Start time of the timer',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`CCT${cctId}.TimerDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).timer_duration,
        },
        common: {
            name: 'Duration of the timer',
            type: 'number',
            role: 'value.timer',
            read: true,
            write: false,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`CCT${cctId}.Transition_Output`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.target?.output,
        },
        common: {
            name: 'Target output state',
            type: 'boolean',
            role: 'sensor.switch',
            read: true,
            write: false,
        },
    };

    deviceObj[`CCT${cctId}.Transition_Brightness`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.target?.brightness,
        },
        common: {
            name: 'Target brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`CCT${cctId}.Transition_ColorTemperature`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.target?.ct,
        },
        common: {
            name: 'Target color temperature',
            type: 'number',
            role: 'level.color.temperature',
            read: true,
            write: false,
            unit: 'K',
        },
    };

    deviceObj[`CCT${cctId}.Transition_StartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.started_at,
        },
        common: {
            name: 'Start time of transition',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`CCT${cctId}.Transition_Duration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.duration,
        },
        common: {
            name: 'Duration of transition',
            type: 'number',
            role: 'value.timer',
            read: true,
            write: false,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`CCT${cctId}.temperatureC`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature?.tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj[`CCT${cctId}.temperatureF`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature?.tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj[`CCT${cctId}.InitialState`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { initial_state: value } },
                });
            },
        },
        common: {
            name: 'Initial State',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                on: 'on',
                off: 'off',
                restore_last: 'restore_last',
            },
        },
    };

    deviceObj[`CCT${cctId}.AutoTimerOn`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).auto_on : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { auto_on: value } },
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

    deviceObj[`CCT${cctId}.AutoTimerOnDelay`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).auto_on_delay : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { auto_on_delay: value } },
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

    deviceObj[`CCT${cctId}.AutoTimerOff`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).auto_off : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { auto_off: value } },
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

    deviceObj[`CCT${cctId}.AutoTimerOffDelay`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).auto_off_delay : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { auto_off_delay: value } },
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

    deviceObj[`CCT${cctId}.TransitionDuration`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).transition_duration : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { transition_duration: value } },
                });
            },
        },
        common: {
            name: 'Transition Duration',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    };

    deviceObj[`CCT${cctId}.MinBrightnessOnToggle`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).min_brightness_on_toggle : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { min_brightness_on_toggle: value } },
                });
            },
        },
        common: {
            name: 'Min Brightness on Toggle',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    // ----------
    // ATTENTION:
    // ----------
    //
    //  Night mode requires firmware 2.x.x - otherwise device might be damaged
    //  ----------------------------------------------------------------------
    //
    // deviceObj[`CCT${cctId}.NightModeEnable`] = {
    //     mqtt: {
    //         http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
    //         http_publish_funct: value => (value ? JSON.parse(value).night_mode?.enable : undefined),
    //         mqtt_cmd: '<mqttprefix>/rpc',
    //         mqtt_cmd_funct: (value, self) => {
    //             return JSON.stringify({
    //                 id: self.getNextMsgId(),
    //                 src: 'iobroker',
    //                 method: 'CCT.SetConfig',
    //                 params: { id: cctId, config: { night_mode: { enable: value } } },
    //             });
    //         },
    //     },
    //     common: {
    //         name: {
    //             en: 'Night Mode Enable',
    //             de: 'Nachtmodus aktivieren',
    //             ru: 'Включить ночной режим',
    //             pt: 'Ativar modo noturno',
    //             nl: 'Nachtmodus inschakelen',
    //             fr: 'Activer le mode nuit',
    //             it: 'Abilita modalità notte',
    //             es: 'Activar modo nocturno',
    //             pl: 'Włącz tryb nocny',
    //             uk: 'Увімкнути нічний режим',
    //             'zh-cn': '启用夜间模式',
    //         },
    //         type: 'boolean',
    //         role: 'switch.enable',
    //         def: false,
    //         read: true,
    //         write: true,
    //     },
    // };

    // deviceObj[`CCT${cctId}.NightModeBrightness`] = {
    //     mqtt: {
    //         http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
    //         http_publish_funct: value => (value ? JSON.parse(value).night_mode?.brightness : undefined),
    //         mqtt_cmd: '<mqttprefix>/rpc',
    //         mqtt_cmd_funct: (value, self) => {
    //             return JSON.stringify({
    //                 id: self.getNextMsgId(),
    //                 src: 'iobroker',
    //                 method: 'CCT.SetConfig',
    //                 params: { id: cctId, config: { night_mode: { brightness: value } } },
    //             });
    //         },
    //     },
    //     common: {
    //         name: {
    //             en: 'Night Mode Brightness',
    //             de: 'Nachtmodus Helligkeit',
    //             ru: 'Яркость ночного режима',
    //             pt: 'Brilho do modo noturno',
    //             nl: 'Nachtmodus helderheid',
    //             fr: 'Luminosité du mode nuit',
    //             it: 'Luminosità modalità notte',
    //             es: 'Brillo del modo nocturno',
    //             pl: 'Jasność trybu nocnego',
    //             uk: 'Яскравість нічного режиму',
    //             'zh-cn': '夜间模式亮度',
    //         },
    //         type: 'number',
    //         role: 'level.brightness',
    //         read: true,
    //         write: true,
    //         min: 0,
    //         max: 100,
    //         unit: '%',
    //     },
    // };

    // deviceObj[`CCT${cctId}.NightModeColorTemperature`] = {
    //     mqtt: {
    //         http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
    //         http_publish_funct: value => (value ? JSON.parse(value).night_mode?.ct : undefined),
    //         mqtt_cmd: '<mqttprefix>/rpc',
    //         mqtt_cmd_funct: (value, self) => {
    //             return JSON.stringify({
    //                 id: self.getNextMsgId(),
    //                 src: 'iobroker',
    //                 method: 'CCT.SetConfig',
    //                 params: { id: cctId, config: { night_mode: { ct: value } } },
    //             });
    //         },
    //     },
    //     common: {
    //         name: {
    //             en: 'Night Mode Color Temperature',
    //             de: 'Nachtmodus Farbtemperatur',
    //             ru: 'Цветовая температура ночного режима',
    //             pt: 'Temperatura de cor do modo noturno',
    //             nl: 'Nachtmodus kleurtemperatuur',
    //             fr: 'Température de couleur du mode nuit',
    //             it: 'Temperatura colore modalità notte',
    //             es: 'Temperatura de color del modo nocturno',
    //             pl: 'Temperatura barwowa trybu nocnego',
    //             uk: 'Колірна температура нічного режиму',
    //             'zh-cn': '夜间模式色温',
    //         },
    //         type: 'number',
    //         role: 'level.color.temperature',
    //         read: true,
    //         write: true,
    //         unit: 'K',
    //     },
    // };

    deviceObj[`CCT${cctId}.ButtonFadeRate`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).button_fade_rate : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { button_fade_rate: value } },
                });
            },
        },
        common: {
            name: 'Button Fade Rate',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            min: 1,
            max: 5,
        },
    };

    deviceObj[`CCT${cctId}.ButtonDoublePushBrightness`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value =>
                value ? JSON.parse(value).button_presets?.button_doublepush?.brightness : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { button_presets: { button_doublepush: { brightness: value } } } },
                });
            },
        },
        common: {
            name: 'Button Double Push Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`CCT${cctId}.ButtonDoublePushColorTemperature`] = {
        mqtt: {
            http_publish: `/rpc/CCT.GetConfig?id=${cctId}`,
            http_publish_funct: value => (value ? JSON.parse(value).button_presets?.button_doublepush?.ct : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.SetConfig',
                    params: { id: cctId, config: { button_presets: { button_doublepush: { ct: value } } } },
                });
            },
        },
        common: {
            name: 'Button Double Push Color Temperature',
            type: 'number',
            role: 'level.color.temperature',
            read: true,
            write: true,
            unit: 'K',
        },
    };

    deviceObj[`CCT${cctId}.Toggle`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.Toggle',
                    params: { id: cctId },
                });
            },
        },
        common: {
            name: 'Toggle',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`CCT${cctId}.DimUp`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.DimUp',
                    params: { id: cctId },
                });
            },
        },
        common: {
            name: 'Dim Up',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`CCT${cctId}.DimDown`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.DimDown',
                    params: { id: cctId },
                });
            },
        },
        common: {
            name: 'Dim Down',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`CCT${cctId}.DimStop`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CCT.DimStop',
                    params: { id: cctId },
                });
            },
        },
        common: {
            name: 'Dim Stop',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    if (hasPowerMetering) {
        deviceObj[`CCT${cctId}.Power`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
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

        deviceObj[`CCT${cctId}.Voltage`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
                mqtt_publish_funct: value => JSON.parse(value).voltage,
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
        };

        deviceObj[`CCT${cctId}.Current`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
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

        // deviceObj[`CCT${cctId}.Energy`] = {
        //     mqtt: {
        //         mqtt_publish: `<mqttprefix>/status/cct:${cctId}`,
        //         mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
        //     },
        //     common: {
        //         name: {
        //             en: 'Energy',
        //             de: 'Energie',
        //             ru: 'Энергия',
        //             pt: 'Energia',
        //             nl: 'Energie',
        //             fr: 'Énergie',
        //             it: 'Energia',
        //             es: 'Energía',
        //             pl: 'Energia',
        //             uk: 'Енергія',
        //             'zh-cn': '能量',
        //         },
        //         type: 'number',
        //         role: 'value.energy',
        //         read: true,
        //         write: false,
        //         def: 0,
        //         unit: 'Wh',
        //     },
        // };
    }
}

/**
 * Adds a generic counter input definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Input/
 *
 * @param deviceObj
 * @param inputId
 */
function addCounterInput(deviceObj: DeviceDefinition, inputId: number): void {
    deviceObj[`Input${inputId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Input${inputId}`, JSON.parse(value).name)
                    : undefined;
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
            name: 'Channel name',
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
            http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
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
                button: 'button',
                switch: 'switch',
            },
        },
    };

    deviceObj[`Input${inputId}.InputEnable`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Input enable',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`Input${inputId}.CountReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).count_rep_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { count_rep_thr: value } },
                });
            },
        },
        common: {
            name: 'Report threshold',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            min: 1,
            max: 2147483647,
        },
    };

    deviceObj[`Input${inputId}.FreqWindow`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).freq_window : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { freq_window: value } },
                });
            },
        },
        common: {
            name: 'Frequence measurement window',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            unit: 's',
            min: 1,
            max: 3600,
        },
    };

    deviceObj[`Input${inputId}.FreuencyReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).freq_rep_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { freq_rep_thr: value } },
                });
            },
        },
        common: {
            name: 'Report threshold',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            unit: 'Hz',
            min: 1,
            max: 10000,
        },
    };

    deviceObj[`Input${inputId}.ResetCounters`] = {
        mqtt: {
            //http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            //http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.ResetCounters',
                    params: { id: inputId },
                });
            },
        },
        common: {
            name: 'Reset counter',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Input${inputId}.CountsTotal`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value).counts?.total,
        },
        common: {
            name: 'Total pulses',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
    };

    deviceObj[`Input${inputId}.CountsXTotal`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value).counts?.xtotal,
        },
        common: {
            name: 'Total pulses (transformed)',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
    };

    deviceObj[`Input${inputId}.Frequency`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value).freq,
        },
        common: {
            name: 'Frequency',
            type: 'number',
            role: 'value.frequency',
            unit: 'Hz',
            read: true,
            write: false,
        },
    };

    deviceObj[`Input${inputId}.Xfrequency`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value).xfreq,
        },
        common: {
            name: 'Frequency (transformed)',
            type: 'number',
            role: 'value.frequency',
            unit: 'Hz',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds a generic cover definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Cover
 *
 * @param deviceObj
 * @param coverId
 * @param hasSlat
 */
function addCover(deviceObj: DeviceDefinition, coverId: number, hasSlat: boolean): void {
    deviceObj[`Cover${coverId}.InitialState`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { initial_state: value } },
                });
            },
        },
        common: {
            name: 'Initial State',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                open: 'open',
                closed: 'closed',
                stopped: 'stopped',
            },
        },
    };

    deviceObj[`Cover${coverId}.ChannelName`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Cover${coverId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
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
            http_publish_funct: async (value, self) => {
                return await shellyHelper.getSetDuration(self, `Cover${coverId}.Duration`);
            },
        },
        common: {
            name: 'Duration',
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

                if (duration && duration > 0) {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Cover.Open',
                        params: { id: coverId, duration: duration },
                    });
                }
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.Open',
                    params: { id: coverId },
                });
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
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.Stop',
                    params: { id: coverId },
                });
            },
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

                if (duration && duration > 0) {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Cover.Close',
                        params: { id: coverId, duration: duration },
                    });
                }
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.Close',
                    params: { id: coverId },
                });
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
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.Calibrate',
                    params: { id: coverId },
                });
            },
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
            http_publish_funct: value => (value ? JSON.parse(value).swap_inputs : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { swap_inputs: value } },
                });
            },
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
            http_publish_funct: value => (value ? JSON.parse(value).in_mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { in_mode: value } },
                });
            },
        },
        common: {
            name: 'Input Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                single: 'single',
                dual: 'dual',
                detached: 'detached',
            },
        },
    };

    deviceObj[`Cover${coverId}.LimitPower`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: value => (value ? JSON.parse(value).power_limit : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { power_limit: value } },
                });
            },
        },
        common: {
            name: 'Power Limit',
            type: 'number',
            role: 'level.max',
            unit: 'W',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.LimitCurrent`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: value => (value ? JSON.parse(value).current_limit : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { current_limit: value } },
                });
            },
        },
        common: {
            name: 'Current Limit',
            type: 'number',
            role: 'level.current.max',
            unit: 'A',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.LimitVoltage`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Cover.GetConfig?id=${coverId}`,
            http_publish_funct: value => (value ? JSON.parse(value).voltage_limit : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.SetConfig',
                    params: { id: coverId, config: { voltage_limit: value } },
                });
            },
        },
        common: {
            name: 'Voltage Limit',
            type: 'number',
            role: 'level.voltage.max',
            unit: 'V',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.Position`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).current_pos,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.GoToPosition',
                    params: { id: coverId, pos: value },
                });
            },
        },
        common: {
            name: 'Current Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            def: 0,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj[`Cover${coverId}.TargetPosition`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).target_pos,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cover.GoToPosition',
                    params: { id: coverId, pos: value },
                });
            },
        },
        common: {
            name: 'Target Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            def: 0,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj[`Cover${coverId}.Status`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).state,
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

    deviceObj[`Cover${coverId}.Voltage`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
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
    };

    deviceObj[`Cover${coverId}.Current`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
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

    deviceObj[`Cover${coverId}.Energy`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
        },
        common: {
            name: 'Energy',
            type: 'number',
            role: 'value.energy',
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
            mqtt_publish_funct: value => JSON.parse(value).source,
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cover${coverId}.temperatureC`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature.tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj[`Cover${coverId}.temperatureF`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature.tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj[`Cover${coverId}.PosControl`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
            mqtt_publish_funct: value => JSON.parse(value).pos_control,
        },
        common: {
            name: 'positioncontrol supported',
            type: 'boolean',
            role: 'indicator',
            read: true,
            write: false,
        },
    };

    // Favorites support:
    // http://<shell-ip>/rpc/Shelly.GetConfig
    //   "sys": {
    //     "ui_data": {
    //       "cover": "12,80,60",
    // ...
    deviceObj[`Cover${coverId}.FavoritePos1.Pos`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Shelly.GetConfig`,
            http_publish_funct: (value, _self) => {
                const ui = JSON.parse(value).sys?.ui_data?.cover;
                //self.adapter.log.debug(`ui: ${ui}`);
                return ui === undefined ? null : ui.split(',')[0];
            },
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: false,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj[`Cover${coverId}.FavoritePos2.Pos`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Shelly.GetConfig`,
            http_publish_funct: (value, _self) => {
                const ui = JSON.parse(value).sys?.ui_data?.cover;
                return ui === undefined ? null : ui.split(',')[1];
            },
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: false,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj[`Cover${coverId}.FavoritePos3.Pos`] = {
        device_mode: 'cover',
        mqtt: {
            http_publish: `/rpc/Shelly.GetConfig`,
            http_publish_funct: (value, _self) => {
                const ui = JSON.parse(value).sys?.ui_data?.cover;
                return ui === undefined ? null : ui.split(',')[2];
            },
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: false,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj[`Cover${coverId}.FavoritePos1.GoTo`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: async (_value, self) => {
                const pos = await shellyHelper.getState(self, `Cover${coverId}.FavoritePos1.Pos`);
                return pos === undefined
                    ? undefined
                    : JSON.stringify({
                          id: self.getNextMsgId(),
                          src: 'iobroker',
                          method: 'Cover.GoToPosition',
                          params: { id: coverId, pos: pos },
                      });
            },
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.FavoritePos2.GoTo`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: async (_value, self) => {
                const pos = await shellyHelper.getState(self, `Cover${coverId}.FavoritePos2.Pos`);
                return pos === undefined
                    ? undefined
                    : JSON.stringify({
                          id: self.getNextMsgId(),
                          src: 'iobroker',
                          method: 'Cover.GoToPosition',
                          params: { id: coverId, pos: pos },
                      });
            },
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cover${coverId}.FavoritePos3.GoTo`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: async (_value, self) => {
                const pos = await shellyHelper.getState(self, `Cover${coverId}.FavoritePos3.Pos`);
                return pos === undefined
                    ? undefined
                    : JSON.stringify({
                          id: self.getNextMsgId(),
                          src: 'iobroker',
                          method: 'Cover.GoToPosition',
                          params: { id: coverId, pos: _value },
                      });
            },
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    if (hasSlat) {
        deviceObj[`Cover${coverId}.SlatPos`] = {
            device_mode: 'cover',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
                mqtt_publish_funct: value =>
                    JSON.parse(value).slat_pos != undefined ? JSON.parse(value).slat_pos : null,
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Cover.GoToPosition',
                        params: { id: coverId, slat_pos: value },
                    });
                },
            },
            common: {
                name: 'slat position',
                type: 'number',
                role: 'value',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
        };
    }
}

/**
 * Adds a Cury component definition for Gen 2+ devices (Powered by Shelly)
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/ShellyCury#cury-1
 *
 * @param deviceObj
 * @param curyId
 */
function addCury(deviceObj: DeviceDefinition, curyId: number): void {
    // === Config states ===

    deviceObj[`Cury${curyId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Cury${curyId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.BoostTime`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).boost_time : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { boost_time: value } },
                });
            },
        },
        common: {
            name: 'Boost time',
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.AutoHeatingOn`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).auto_heating_on : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { auto_heating_on: value } },
                });
            },
        },
        common: {
            name: 'Auto heating on',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.UiMode`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).ui.mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { ui: { mode: value } } },
                });
            },
        },
        common: {
            name: 'UI mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                off: 'off',
                level: 'level',
                intensity: 'intensity',
            },
        },
    };

    deviceObj[`Cury${curyId}.UiBrightness`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).ui.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { ui: { brightness: value } } },
                });
            },
        },
        common: {
            name: 'UI brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Cury${curyId}.AmbientEnable`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).ambient.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { ambient: { enable: value } } },
                });
            },
        },
        common: {
            name: 'Ambient light enabled',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.AmbientUseVialColor`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).ambient.use_vial_color : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { ambient: { use_vial_color: value } } },
                });
            },
        },
        common: {
            name: 'Ambient use vial color',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.AmbientColor`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.stringify(JSON.parse(value).ambient.color) : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { ambient: { color: JSON.parse(value) } } },
                });
            },
        },
        common: {
            name: 'Ambient color (RGB)',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.AmbientBrightness`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).ambient.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { ambient: { brightness: value } } },
                });
            },
        },
        common: {
            name: 'Ambient brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Cury${curyId}.InitialStateLeft`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state.left : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { initial_state: { left: value } } },
                });
            },
        },
        common: {
            name: 'Initial state left slot',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                restore_last: 'restore_last',
                on: 'on',
                off: 'off',
            },
        },
    };

    deviceObj[`Cury${curyId}.InitialStateRight`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state.right : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { initial_state: { right: value } } },
                });
            },
        },
        common: {
            name: 'Initial state right slot',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                restore_last: 'restore_last',
                on: 'on',
                off: 'off',
            },
        },
    };

    deviceObj[`Cury${curyId}.TimerLeftAutoOn`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.left.auto_on : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { left: { auto_on: value } } } },
                });
            },
        },
        common: {
            name: 'Timer left slot auto on',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`Cury${curyId}.TimerLeftAutoOnDelay`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.left.auto_on_delay : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { left: { auto_on_delay: value } } } },
                });
            },
        },
        common: {
            name: 'Timer left slot auto on delay',
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.TimerLeftAutoOff`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.left.auto_off : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { left: { auto_off: value } } } },
                });
            },
        },
        common: {
            name: 'Timer left slot auto off',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`Cury${curyId}.TimerLeftAutoOffDelay`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.left.auto_off_delay : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { left: { auto_off_delay: value } } } },
                });
            },
        },
        common: {
            name: 'Timer left slot auto off delay',
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.TimerRightAutoOn`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.right.auto_on : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { right: { auto_on: value } } } },
                });
            },
        },
        common: {
            name: 'Timer right slot auto on',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`Cury${curyId}.TimerRightAutoOnDelay`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.right.auto_on_delay : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { right: { auto_on_delay: value } } } },
                });
            },
        },
        common: {
            name: 'Timer right slot auto on delay',
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.TimerRightAutoOff`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.right.auto_off : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { right: { auto_off: value } } } },
                });
            },
        },
        common: {
            name: 'Timer right slot auto off',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`Cury${curyId}.TimerRightAutoOffDelay`] = {
        mqtt: {
            http_publish: `/rpc/Cury.GetConfig?id=${curyId}`,
            http_publish_funct: value => (value ? JSON.parse(value).timer.right.auto_off_delay : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetConfig',
                    params: { id: curyId, config: { timer: { right: { auto_off_delay: value } } } },
                });
            },
        },
        common: {
            name: 'Timer right slot auto off delay',
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    };

    // === Status states ===

    deviceObj[`Cury${curyId}.mode`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.mode !== undefined ? parsed.mode : null;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetMode',
                    params: { id: curyId, mode: value || null },
                });
            },
        },
        common: {
            name: 'Operation mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                '': 'none',
                hall: 'hall',
                bedroom: 'bedroom',
                living_room: 'living_room',
                lavatory_room: 'lavatory_room',
                reception: 'reception',
                workplace: 'workplace',
            },
        },
    };

    deviceObj[`Cury${curyId}.AwayMode`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => JSON.parse(value).away_mode,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.SetAwayMode',
                    params: { id: curyId, on: value },
                });
            },
        },
        common: {
            name: 'Away mode',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.LeftOn`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left ? parsed.slots.left.on : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.Set',
                    params: { id: curyId, slot: 'left', on: value },
                });
            },
        },
        common: {
            name: 'Left slot heating on',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.LeftIntensity`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left ? parsed.slots.left.intensity : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.Set',
                    params: { id: curyId, slot: 'left', intensity: value },
                });
            },
        },
        common: {
            name: 'Left slot intensity',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Cury${curyId}.LeftBoostStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.boost
                    ? parsed.slots.left.boost.started_at
                    : undefined;
            },
        },
        common: {
            name: 'Left slot boost started at',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.LeftBoostDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.boost
                    ? parsed.slots.left.boost.duration
                    : undefined;
            },
        },
        common: {
            name: 'Left slot boost duration',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.LeftTimerStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.timer
                    ? parsed.slots.left.timer.timer_started_at
                    : undefined;
            },
        },
        common: {
            name: 'Left slot timer started at',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.LeftTimerDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.timer
                    ? parsed.slots.left.timer.timer_duration
                    : undefined;
            },
        },
        common: {
            name: 'Left slot timer duration',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.LeftVialLevel`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.vial
                    ? parsed.slots.left.vial.level
                    : undefined;
            },
        },
        common: {
            name: 'Left vial liquid level',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            min: -1,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Cury${curyId}.LeftVialSerial`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.vial
                    ? parsed.slots.left.vial.serial
                    : undefined;
            },
        },
        common: {
            name: 'Left vial serial number',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.LeftVialName`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.vial
                    ? parsed.slots.left.vial.name
                    : undefined;
            },
        },
        common: {
            name: 'Left vial aroma name',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.LeftVialFault`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.left && parsed.slots.left.vial
                    ? parsed.slots.left.vial.vial_fault
                    : undefined;
            },
        },
        common: {
            name: 'Left vial fault',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                non_genuine: 'non_genuine',
                tag_error: 'tag_error',
                expired: 'expired',
                empty: 'empty',
            },
        },
    };

    deviceObj[`Cury${curyId}.RightOn`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right ? parsed.slots.right.on : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.Set',
                    params: { id: curyId, slot: 'right', on: value },
                });
            },
        },
        common: {
            name: 'Right slot heating on',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.RightIntensity`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right ? parsed.slots.right.intensity : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.Set',
                    params: { id: curyId, slot: 'right', intensity: value },
                });
            },
        },
        common: {
            name: 'Right slot intensity',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Cury${curyId}.RightBoostStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.boost
                    ? parsed.slots.right.boost.started_at
                    : undefined;
            },
        },
        common: {
            name: 'Right slot boost started at',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.RightBoostDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.boost
                    ? parsed.slots.right.boost.duration
                    : undefined;
            },
        },
        common: {
            name: 'Right slot boost duration',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.RightTimerStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.timer
                    ? parsed.slots.right.timer.timer_started_at
                    : undefined;
            },
        },
        common: {
            name: 'Right slot timer started at',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.RightTimerDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.timer
                    ? parsed.slots.right.timer.timer_duration
                    : undefined;
            },
        },
        common: {
            name: 'Right slot timer duration',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 's',
        },
    };

    deviceObj[`Cury${curyId}.RightVialLevel`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.vial
                    ? parsed.slots.right.vial.level
                    : undefined;
            },
        },
        common: {
            name: 'Right vial liquid level',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            min: -1,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Cury${curyId}.RightVialSerial`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.vial
                    ? parsed.slots.right.vial.serial
                    : undefined;
            },
        },
        common: {
            name: 'Right vial serial number',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.RightVialName`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.vial
                    ? parsed.slots.right.vial.name
                    : undefined;
            },
        },
        common: {
            name: 'Right vial aroma name',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Cury${curyId}.RightVialFault`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.slots && parsed.slots.right && parsed.slots.right.vial
                    ? parsed.slots.right.vial.vial_fault
                    : undefined;
            },
        },
        common: {
            name: 'Right vial fault',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                non_genuine: 'non_genuine',
                tag_error: 'tag_error',
                expired: 'expired',
                empty: 'empty',
            },
        },
    };

    deviceObj[`Cury${curyId}.errors`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cury:${curyId}`,
            mqtt_publish_funct: value => JSON.stringify(JSON.parse(value).errors || []),
        },
        common: {
            name: 'Device errors',
            type: 'array',
            role: 'list',
            read: true,
            write: false,
        },
    };

    // === Command states ===

    deviceObj[`Cury${curyId}.LeftBoost`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.Boost',
                    params: { id: curyId, slot: 'left' },
                });
            },
        },
        common: {
            name: 'Left slot boost',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.LeftStopBoost`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.StopBoost',
                    params: { id: curyId, slot: 'left' },
                });
            },
        },
        common: {
            name: 'Left slot stop boost',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.RightBoost`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.Boost',
                    params: { id: curyId, slot: 'right' },
                });
            },
        },
        common: {
            name: 'Right slot boost',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Cury${curyId}.RightStopBoost`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cury.StopBoost',
                    params: { id: curyId, slot: 'right' },
                });
            },
        },
        common: {
            name: 'Right slot stop boost',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };
}

/**
 * Adds a generic power definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/DevicePower
 *
 * @param deviceObj
 * @param devicePowerId
 * @param hasExternalPower
 */
function addDevicePower(deviceObj: DeviceDefinition, devicePowerId: number, hasExternalPower: boolean): void {
    deviceObj[`DevicePower${devicePowerId}.BatteryVoltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
            mqtt_publish_funct: value => JSON.parse(value).battery.V,
        },
        common: {
            name: 'Battery voltage',
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
            mqtt_publish_funct: value => JSON.parse(value).battery.percent,
        },
        common: {
            name: 'Battery charge level',
            type: 'number',
            role: 'value.battery',
            read: true,
            write: false,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    if (hasExternalPower) {
        deviceObj[`DevicePower${devicePowerId}.ExternalPower`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
                mqtt_publish_funct: value => JSON.parse(value).external.present,
            },
            common: {
                name: 'External power supply',
                type: 'boolean',
                role: 'state',
                read: true,
                write: false,
            },
        };
    }
}

/**
 * Adds a generic energymeter definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/EM
 *
 * @param deviceObj
 * @param emId
 * @param phases
 */
function addEM(deviceObj: DeviceDefinition, emId: number, phases: (string | number)[]): void {
    deviceObj[`EM${emId}.ChannelName`] = {
        device_mode: 'triphase',
        mqtt: {
            http_publish: `/rpc/EM.GetConfig?id=${emId}`,
            http_publish_funct: async (value, self) => {
                return value ? await shellyHelper.setChannelName(self, `EM${emId}`, JSON.parse(value).name) : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'EM.SetConfig',
                    params: { id: emId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`EM${emId}.CurrentN`] = {
        device_mode: 'triphase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).n_current;
            },
        },
        common: {
            name: 'Current N',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    };

    deviceObj[`EM${emId}.TotalCurrent`] = {
        device_mode: 'triphase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_current;
            },
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
    };

    deviceObj[`EM${emId}.TotalActivePower`] = {
        device_mode: 'triphase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_act_power;
            },
        },
        common: {
            name: 'Total Active Power',
            type: 'number',
            role: 'value.power.active',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    };

    deviceObj[`EM${emId}.TotalApparentPower`] = {
        device_mode: 'triphase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_aprt_power;
            },
        },
        common: {
            name: 'Total Apparent Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'VA',
        },
    };

    for (const phase of phases) {
        const phaseUp = String(phase).toUpperCase();

        deviceObj[`EM${emId}.Voltage${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_voltage`];
                },
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
        };

        deviceObj[`EM${emId}.Current${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_current`];
                },
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

        deviceObj[`EM${emId}.ActivePower${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_act_power`];
                },
            },
            common: {
                name: 'Active Power',
                type: 'number',
                role: 'value.power.active',
                read: true,
                write: false,
                def: 0,
                unit: 'W',
            },
        };

        deviceObj[`EM${emId}.ApparentPower${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_aprt_power`];
                },
            },
            common: {
                name: 'Apparent Power',
                type: 'number',
                role: 'value.power',
                read: true,
                write: false,
                def: 0,
                unit: 'VA',
            },
        };

        deviceObj[`EM${emId}.PowerFactor${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_pf`];
                },
            },
            common: {
                name: 'Power Factor',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
                def: 0,
            },
        };
    }
}

/**
 * Adds a generic energymeter definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/EM1
 *
 * @param deviceObj
 * @param emId
 * @param addEM1Data - NOTE: Only present for backwards compatibility, for new devices every component should be added individually
 */
function addEM1(deviceObj: DeviceDefinition, emId: number, addEM1Data: boolean): void {
    deviceObj[`EM1:${emId}.Power`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${emId}`,
            mqtt_publish_funct: value => JSON.parse(value).act_power,
        },
        common: {
            name: 'Active Power',
            type: 'number',
            role: 'value.power.active',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    };

    deviceObj[`EM1:${emId}.Voltage`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${emId}`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
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
    };

    deviceObj[`EM1:${emId}.Current`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${emId}`,
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

    deviceObj[`EM1:${emId}.ApparentPower`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${emId}`,
            mqtt_publish_funct: value => JSON.parse(value).aprt_power,
        },
        common: {
            name: 'Apparent Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'VA',
        },
    };

    deviceObj[`EM1:${emId}.PowerFactor`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${emId}`,
            mqtt_publish_funct: value => JSON.parse(value).pf,
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    };

    deviceObj[`EM1:${emId}.Frequency`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${emId}`,
            mqtt_publish_funct: value => JSON.parse(value).freq,
        },
        common: {
            name: 'Frequency',
            type: 'number',
            role: 'value.frequency',
            read: true,
            write: false,
            def: 0,
            unit: 'Hz',
        },
    };

    if (addEM1Data) {
        deviceObj[`EM1:${emId}.TotalEnergy`] = {
            device_mode: 'monophase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em1data:${emId}`,
                mqtt_publish_funct: value => JSON.parse(value).total_act_energy,
            },
            common: {
                name: 'Total Energy',
                type: 'number',
                role: 'value.energy.consumed',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };

        deviceObj[`EM1:${emId}.TotalRetEnergy`] = {
            device_mode: 'monophase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em1data:${emId}`,
                mqtt_publish_funct: value => JSON.parse(value).total_act_ret_energy,
            },
            common: {
                name: 'Total Returned Energy',
                type: 'number',
                role: 'value.energy.produced',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };
    }
}

/**
 * Adds a generic energymeter data definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/EM1Data
 *
 * @param deviceObj
 * @param emId
 */
function addEM1Data(deviceObj: DeviceDefinition, emId: number): void {
    deviceObj[`EM1Data${emId}.ResetCounters`] = {
        device_mode: 'monophase',
        mqtt: {
            //http_publish: `/rpc/Input.GetConfig?id=${pmId}`,
            //http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'EM1Data.ResetCounters',
                    params: { id: emId },
                });
            },
        },
        common: {
            name: 'Reset counters',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`EM1Data${emId}.TotalActiveEnergy`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1data:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_act_energy;
            },
        },
        common: {
            name: 'Energy',
            type: 'number',
            role: 'value.energy.consumed',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`EM1Data${emId}.TotalActiveReturnEnergy`] = {
        device_mode: 'monophase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1data:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_act_ret_energy;
            },
        },
        common: {
            name: 'Returned Energy',
            type: 'number',
            role: 'value.energy.produced',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };
}

/**
 * Adds a generic energymeter data definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/EMData
 *
 * @param deviceObj
 * @param emId
 * @param phases
 */
function addEMData(deviceObj: DeviceDefinition, emId: number, phases: (string | number)[]): void {
    deviceObj[`EMData${emId}.ResetCounters`] = {
        device_mode: 'triphase',
        mqtt: {
            //http_publish: `/rpc/Input.GetConfig?id=${pmId}`,
            //http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'EMData.ResetCounters',
                    params: { id: emId },
                });
            },
        },
        common: {
            name: 'Reset counters',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`EMData${emId}.TotalActiveEnergy`] = {
        device_mode: 'triphase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_act;
            },
        },
        common: {
            name: 'Total Energy',
            type: 'number',
            role: 'value.energy.consumed',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`EMData${emId}.TotalActiveReturnEnergy`] = {
        device_mode: 'triphase',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value).total_act_ret;
            },
        },
        common: {
            name: 'Total Returned Energy',
            type: 'number',
            role: 'value.energy.produced',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    for (const phase of phases) {
        const phaseUp = String(phase).toUpperCase();

        deviceObj[`EMData${emId}.TotalActiveEnergy${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_total_act_energy`];
                },
            },
            common: {
                name: 'Energy',
                type: 'number',
                role: 'value.energy.consumed',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };

        deviceObj[`EMData${emId}.TotalActiveReturnEnergy${phaseUp}`] = {
            device_mode: 'triphase',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_total_act_ret_energy`];
                },
            },
            common: {
                name: 'Returned Energy',
                type: 'number',
                role: 'value.energy.produced',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };
    }
}

/**
 * Adds a generic Temp-Sensor definition for Shelly Pro3EM63 devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Temperature
 *
 * @param deviceObj
 */
function addEMTemperatureSensor(deviceObj: DeviceDefinition): void {
    deviceObj[`EMTemperature.tC`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetStatus?id=0`,
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).tC) : undefined),
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };
    deviceObj[`EMTemperature.tF`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetStatus?id=0`,
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).tF) : undefined),
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };
    deviceObj[`EMTemperature.ReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=0`,
            http_publish_funct: value => (value ? JSON.parse(value).report_thr_C : undefined),
        },
        common: {
            name: 'Threshold',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };
    deviceObj[`EMTemperature.Offset`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=0`,
            http_publish_funct: value => (value ? JSON.parse(value).offset_C : undefined),
        },
        common: {
            name: 'Offset',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };
}

/**
 * Adds a generic flood component definition for Shelly Gen2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Flood
 *
 * @param deviceObj
 * @param floodId
 */
function addFlood(deviceObj: DeviceDefinition, floodId: number): void {
    deviceObj[`Flood${floodId}.alarm`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/flood:${floodId}`,
            mqtt_publish_funct: value => !!JSON.parse(value).alarm,
        },
        common: {
            name: 'alarm',
            type: 'boolean',
            role: 'indicator.alarm.flood',
            read: true,
            write: false,
            //unit: '',
        },
    };
    deviceObj[`Flood${floodId}.mute`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/flood:${floodId}`,
            mqtt_publish_funct: value => !!JSON.parse(value).mute,
        },
        common: {
            name: 'mute',
            type: 'boolean',
            role: 'indicator',
            read: true,
            write: false,
            //unit: '',
        },
    };
    deviceObj[`Flood${floodId}.errors`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/flood:${floodId}`,
            mqtt_publish_funct: value => JSON.stringify(JSON.parse(value).errors || []),
        },
        common: {
            name: 'errors',
            type: 'array',
            role: 'list',
            read: true,
            write: false,
            //unit: '',
        },
    };
}

/**
 * Adds a generic humidity sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Humidity
 *
 * @param deviceObj
 * @param sensorId
 */
function addHumiditySensor(deviceObj: DeviceDefinition, sensorId: number): void {
    deviceObj[`Humidity${sensorId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Humidity.GetConfig?id=${sensorId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Humidity${sensorId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Humidity.SetConfig',
                    params: { id: sensorId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`Humidity${sensorId}.Relative`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/humidity:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).rh,
        },
        common: {
            name: 'Humidity',
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
            http_publish_funct: value => (value ? JSON.parse(value).report_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Humidity.SetConfig',
                    params: { id: sensorId, config: { report_thr: value } },
                });
            },
        },
        common: {
            name: 'Report threshold',
            type: 'number',
            role: 'level.humidity',
            read: true,
            write: true,
            unit: '%',
            min: 1,
            max: 20,
        },
    };
}

/**
 * Adds a generic Illuminance sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Illuminance
 *
 * @param deviceObj
 * @param sensorId
 */
function addIlluminanceSensor(deviceObj: DeviceDefinition, sensorId: number): void {
    deviceObj[`Illuminance${sensorId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Illuminance.GetConfig?id=${sensorId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Illuminance${sensorId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Illuminance.SetConfig',
                    params: { id: sensorId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`Illuminance${sensorId}.Lux`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/illuminance:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).lux,
        },
        common: {
            name: 'Illuminance',
            type: 'number',
            role: 'value.brightness',
            read: true,
            write: false,
            unit: 'Lux',
        },
    };

    deviceObj[`Illuminance${sensorId}.Illumination`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/illuminance:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).illumination,
        },
        common: {
            name: 'Illumination',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
            states: {
                dark: 'dark',
                twilight: 'twilight',
                bright: 'bright',
            },
        },
    };

    deviceObj[`Illuminance${sensorId}.DarkThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Illuminance.GetConfig?id=${sensorId}`,
            http_publish_funct: value => (value ? JSON.parse(value).dark_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Illuminance.SetConfig',
                    params: { id: sensorId, config: { dark_thr: value } },
                });
            },
        },
        common: {
            name: 'Dark threshold',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: 'Lux',
        },
    };

    deviceObj[`Illuminance${sensorId}.BrightThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Illuminance.GetConfig?id=${sensorId}`,
            http_publish_funct: value => (value ? JSON.parse(value).bright_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Illuminance.SetConfig',
                    params: { id: sensorId, config: { bright_thr: value } },
                });
            },
        },
        common: {
            name: 'Bright threshold',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: 'Lux',
        },
    };
}

/**
 * Adds a generic digital (switch, button) input definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Input
 *
 * @param deviceObj
 * @param inputId
 */
function addInput(deviceObj: DeviceDefinition, inputId: number): void {
    deviceObj[`Input${inputId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Input${inputId}`, JSON.parse(value).name)
                    : undefined;
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
            name: 'Channel name',
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
            http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
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
                button: 'button',
                switch: 'switch',
            },
        },
    };

    deviceObj[`Input${inputId}.InputEnable`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Input.SetConfig',
                    params: { id: inputId, config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Input enable',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`Input${inputId}.InputInverted`] = {
        mqtt: {
            http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
            http_publish_funct: value => (value ? JSON.parse(value).invert : undefined),
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
}

/**
 * Adds a generic light definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Light
 *
 * @param deviceObj
 * @param lightId
 * @param hasPowerMetering
 */
function addLight(deviceObj: DeviceDefinition, lightId: number, hasPowerMetering: boolean): void {
    deviceObj[`Light${lightId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Light.GetConfig?id=${lightId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Light${lightId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Light.SetConfig',
                    params: { id: lightId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            def: `light_${lightId}`,
        },
    };

    deviceObj[`Light${lightId}.Switch`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).output,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Light.Set',
                    params: { id: lightId, on: value },
                });
            },
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`Light${lightId}.InitialState`] = {
        mqtt: {
            http_publish: `/rpc/Light.GetConfig?id=${lightId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Light.SetConfig',
                    params: { id: lightId, config: { initial_state: value } },
                });
            },
        },
        common: {
            name: 'Initial State',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                on: 'on',
                off: 'off',
                restore_last: 'restore_last',
            },
        },
    };

    deviceObj[`Light${lightId}.Brightness`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).brightness,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Light.Set',
                    params: { id: lightId, brightness: value },
                });
            },
        },
        common: {
            name: 'Illuminance',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Light${lightId}.source`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).source,
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Light${lightId}.Event`] = {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];

                        if (typeof event === 'object' && event.component === `light:${lightId}`) {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Light Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    deviceObj[`Light${lightId}.TimerStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).timer_started_at,
        },
        common: {
            name: 'start time of the timer',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Light${lightId}.TimerDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).timer_duration,
        },
        common: {
            name: 'duration of the timer',
            type: 'number',
            role: 'value.timer',
            read: true,
            write: false,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`Light${lightId}.Transition_Output`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.output,
        },
        common: {
            name: 'target state',
            type: 'boolean',
            role: 'sensor.switch',
            read: true,
            write: false,
        },
    };

    deviceObj[`Light${lightId}.Transition_Brightness`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.brightness,
        },
        common: {
            name: 'target illuminance',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`Light${lightId}.Transition_StartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.started_at,
        },
        common: {
            name: 'starttime of transition',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Light${lightId}.Transition_Duration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).transition?.duration,
        },
        common: {
            name: 'duration of transition',
            type: 'number',
            role: 'value.timer',
            read: true,
            write: false,
            def: 0,
            unit: 's',
        },
    };

    deviceObj[`Light${lightId}.CalibrationProgress`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).calibration,
        },
        common: {
            name: 'calibration progress',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
            unit: '%',
        },
    };

    deviceObj[`Light${lightId}.temperatureC`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature.tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj[`Light${lightId}.temperatureF`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
            mqtt_publish_funct: value => JSON.parse(value).temperature.tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    if (hasPowerMetering) {
        deviceObj[`Light${lightId}.Power`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
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

        deviceObj[`Light${lightId}.Voltage`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
                mqtt_publish_funct: value => JSON.parse(value).voltage,
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
        };

        deviceObj[`Light${lightId}.Current`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
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

        deviceObj[`Light${lightId}.Energy`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
                mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
            },
            common: {
                name: 'Energy',
                type: 'number',
                role: 'value.energy',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };
    }
}

/**
 * Adds a generic PM definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/PM1
 *
 * @param deviceObj
 * @param pmId
 */
function addPM1(deviceObj: DeviceDefinition, pmId: number): void {
    deviceObj[`PM1:${pmId}.ResetCounters`] = {
        mqtt: {
            //http_publish: `/rpc/Input.GetConfig?id=${pmId}`,
            //http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PM1.ResetCounters',
                    params: { id: pmId },
                });
            },
        },
        common: {
            name: 'Reset counters',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`PM1:${pmId}.Power`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
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

    deviceObj[`PM1:${pmId}.ApparentPower`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
            mqtt_publish_funct: value => JSON.parse(value).aprtpower,
        },
        common: {
            name: 'Apparent Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'VA',
        },
    };

    deviceObj[`PM1:${pmId}.PowerFactor`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
            mqtt_publish_funct: value => JSON.parse(value).pf,
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    };

    deviceObj[`PM1:${pmId}.Voltage`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
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
    };

    deviceObj[`PM1:${pmId}.Current`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
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

    deviceObj[`PM1:${pmId}.Energy`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
            mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
        },
        common: {
            name: 'Energy',
            type: 'number',
            role: 'value.energy',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`PM1:${pmId}.ReturnedEnergy`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
            mqtt_publish_funct: value => JSON.parse(value).ret_aenergy?.total,
        },
        common: {
            name: 'Returned Energy',
            type: 'number',
            role: 'value.energy.produced',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`PM1:${pmId}.Frequency`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${pmId}`,
            mqtt_publish_funct: value => JSON.parse(value).freq,
        },
        common: {
            name: 'Frequenz',
            type: 'number',
            role: 'value.frequency',
            read: true,
            write: false,
            def: 0,
            unit: 'Hz',
        },
    };
}

/**
 * Adds states for the PLUGS_UI component used by Shelly Plug* (gen 2+)
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/0.14/Devices/ShellyPlusPlugS#plugs_ui
 *
 * @param deviceObj
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addPlugsUI(deviceObj: DeviceDefinition): void {
    deviceObj['PLUGS_UI.Mode'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).leds.mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: value,
                                /*
                                colors: {
                                    power: {
                                        brightness: 100,
                                    },
                                    'switch:0': {
                                        on: {
                                            rgb: [0,100,0],
                                            brightness: 100,
                                        },
                                        off: {
                                            rgb: [100,0,0],
                                            brightness: 100,
                                        },
                                    },
                                },
                                */
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            def: 'off',
            states: {
                power: 'power',
                switch: 'switch',
                off: 'off',
            },
        },
    };

    deviceObj['PLUGS_UI.PowerBrightness'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.colors?.power?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'power',
                                colors: {
                                    power: {
                                        brightness: value,
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness (Mode: power)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj['PLUGS_UI.SwitchOnBrightness'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.on?.brightness : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        on: {
                                            brightness: value,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness On (Mode: switch)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj['PLUGS_UI.SwitchOnColor'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.on?.rgb.join(',') : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        on: {
                                            rgb: value.split(',').map(Number),
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Color',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj['PLUGS_UI.SwitchOffBrightness'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.off?.brightness : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        off: {
                                            brightness: value,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness Off (Mode: switch)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj['PLUGS_UI.SwitchOffColor'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value =>
                value ? JSON.parse(value)?.leds?.colors?.['switch:0']?.off?.rgb.join(',') : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'switch',
                                colors: {
                                    'switch:0': {
                                        off: {
                                            rgb: value.split(',').map(Number),
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Color',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj['PLUGS_UI.NightModeEnabled'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.night_mode?.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                night_mode: {
                                    enable: value,
                                    brightness: 100,
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Night Mode Enabled',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj['PLUGS_UI.NightModeBrightness'] = {
        mqtt: {
            http_publish: '/rpc/PLUGS_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.night_mode?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGS_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                night_mode: {
                                    brightness: value,
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness (Mode: night)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    };
}

/**
 * Adds states for the PLUGPM_UI component used by Shelly Plug PM (gen 3+)
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugPMG3#plugpm_ui
 *
 * @param deviceObj
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addPlugpmUI(deviceObj: DeviceDefinition): void {
    deviceObj['PLUGPM_UI.Mode'] = {
        mqtt: {
            http_publish: '/rpc/PLUGPM_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).leds.mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGPM_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: value,
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            def: 'off',
            states: {
                power: 'power',
                off: 'off',
            },
        },
    };

    deviceObj['PLUGPM_UI.PowerBrightness'] = {
        mqtt: {
            http_publish: '/rpc/PLUGPM_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.colors?.power?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGPM_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                mode: 'power',
                                colors: {
                                    power: {
                                        brightness: value,
                                    },
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness (Mode: power)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    };

    deviceObj['PLUGPM_UI.NightModeEnabled'] = {
        mqtt: {
            http_publish: '/rpc/PLUGPM_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.night_mode?.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGPM_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                night_mode: {
                                    enable: value,
                                    brightness: 100,
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Night Mode Enabled',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj['PLUGPM_UI.NightModeBrightness'] = {
        mqtt: {
            http_publish: '/rpc/PLUGPM_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.leds?.night_mode?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PLUGPM_UI.SetConfig',
                    params: {
                        config: {
                            leds: {
                                night_mode: {
                                    brightness: value,
                                },
                            },
                        },
                    },
                });
            },
        },
        common: {
            name: 'Brightness (Mode: night)',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    };
}

/**
 * Adds states for the Shelly Plus AddOn
 * see
 * https://kb.shelly.cloud/knowledge-base/shelly-plus-add-on
 * https://shelly-api-docs.shelly.cloud/gen2/Addons/ShellySensorAddon
 *
 * @param deviceObj
 */
function addPlusAddon(deviceObj: DeviceDefinition): void {
    deviceObj['Ext.input100digital'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:100`,
            mqtt_publish_funct: value => JSON.parse(value)?.state,
        },
        common: {
            name: 'Input 100 (digital)',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    };

    deviceObj['Ext.input100analog'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:100`,
            mqtt_publish_funct: value => JSON.parse(value)?.percent,
        },
        common: {
            name: 'Input 100 (analog)',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
            def: 0,
        },
    };

    deviceObj['Ext.input101digital'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:101`,
            mqtt_publish_funct: value => JSON.parse(value)?.state,
        },
        common: {
            name: 'Input 101 (digital)',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    };

    deviceObj['Ext.input101analog'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:101`,
            mqtt_publish_funct: value => JSON.parse(value)?.percent,
        },
        common: {
            name: 'Input 101 (analog)',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
            def: 0,
        },
    };

    deviceObj['Ext.voltmeter100'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/voltmeter:100`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
        },
        common: {
            name: 'Voltage',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
            def: 0,
        },
    };

    deviceObj['Ext.temperature100C'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:100`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj['Ext.temperature100F'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:100`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj['Ext.temperature101C'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:101`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj['Ext.temperature101F'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:101`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj['Ext.temperature102C'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:102`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj['Ext.temperature102F'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:102`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj['Ext.temperature103C'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:103`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj['Ext.temperature103F'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:103`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj['Ext.temperature104C'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:104`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };

    deviceObj['Ext.temperature104F'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:104`,
            mqtt_publish_funct: value => JSON.parse(value).tF,
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    };

    deviceObj['Ext.humidity100'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/humidity:100`,
            mqtt_publish_funct: value => JSON.parse(value).rh,
        },
        common: {
            name: 'Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            unit: '%',
        },
    };
}

/**
 * Adds a generic presence component definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Presence
 *
 * @param deviceObj
 */
function addPresence(deviceObj: DeviceDefinition): void {
    deviceObj[`Presence.TiltCalibrate`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.TiltCalibrate',
                });
            },
        },
        common: {
            name: 'Tilt Calibrate',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Presence.LiveTrack`] = {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.LiveTrack',
                });
            },
        },
        common: {
            name: 'Live Track',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`Presence.Enable`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Enable',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.ZMin`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).zmin : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { zmin: value } },
                });
            },
        },
        common: {
            name: 'Lower detection limit',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
            unit: 'm',
        },
    };

    deviceObj[`Presence.ZMax`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).zmax : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { zmax: value } },
                });
            },
        },
        common: {
            name: 'Upper detection limit',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
            unit: 'm',
        },
    };

    deviceObj[`Presence.SensorFlipped`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.flipped : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { flipped: value } } },
                });
            },
        },
        common: {
            name: 'Sensor flipped',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorHeight`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.height : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { height: value } } },
                });
            },
        },
        common: {
            name: 'Sensor height',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
            unit: 'm',
        },
    };

    deviceObj[`Presence.SensorTilt`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.tilt : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { tilt: value } } },
                });
            },
        },
        common: {
            name: 'Sensor tilt',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorPoints`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.points : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { points: value } } },
                });
            },
        },
        common: {
            name: 'Object recognition threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorVelocity`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.velocity : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { velocity: value } } },
                });
            },
        },
        common: {
            name: 'Velocity threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorSNR`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.snr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { snr: value } } },
                });
            },
        },
        common: {
            name: 'SNR threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorMaxVelocity`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.max_velocity : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { max_velocity: value } } },
                });
            },
        },
        common: {
            name: 'Max velocity difference',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorPosition`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.position : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { position: value } } },
                });
            },
        },
        common: {
            name: 'Sensor position',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                left: 'left',
                center: 'center',
                right: 'right',
            },
        },
    };

    deviceObj[`Presence.SensorPower`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.power : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { power: value } } },
                });
            },
        },
        common: {
            name: 'Sensor power',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                low: 'low',
                medium: 'medium',
                high: 'high',
            },
        },
    };

    deviceObj[`Presence.SensorSensitivity`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.sensitivity : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { sensitivity: value } } },
                });
            },
        },
        common: {
            name: 'Sensor sensitivity',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                low: 'low',
                medium: 'medium',
                high: 'high',
            },
        },
    };

    deviceObj[`Presence.SensorStateDetActThr`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.state?.det_act_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { state: { det_act_thr: value } } } },
                });
            },
        },
        common: {
            name: 'Motion activation threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorStateDetFreeThr`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.state?.det_free_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { state: { det_free_thr: value } } } },
                });
            },
        },
        common: {
            name: 'Motion release threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorStateActFreeThr`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.state?.act_free_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { state: { act_free_thr: value } } } },
                });
            },
        },
        common: {
            name: 'Tracking loss threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorStateStatFreeThr`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.state?.stat_free_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { state: { stat_free_thr: value } } } },
                });
            },
        },
        common: {
            name: 'Stillness tracking threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.SensorStateSleepFreeThr`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).sensor.state?.sleep_free_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { sensor: { state: { sleep_free_thr: value } } } },
                });
            },
        },
        common: {
            name: 'Stillness timeout threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.UIImperial`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).ui?.imperial : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { ui: { imperial: value } } },
                });
            },
        },
        common: {
            name: 'Imperial units',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.LEDsBrightness`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).leds?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { leds: { brightness: value } } },
                });
            },
        },
        common: {
            name: 'LED brightness',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.NightModeEnable`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).leds?.night_mode?.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { leds: { night_mode: { enable: value } } } },
                });
            },
        },
        common: {
            name: 'Night mode enable',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.NightModeBrightness`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).leds?.night_mode?.brightness : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Presence.SetConfig',
                    params: { config: { leds: { night_mode: { brightness: value } } } },
                });
            },
        },
        common: {
            name: 'Night mode brightness',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
        },
    };

    deviceObj[`Presence.MainZone`] = {
        mqtt: {
            http_publish: `/rpc/Presence.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value).main_zone : undefined),
        },
        common: {
            name: 'Main zone',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    deviceObj[`Presence.LiveTrackTimerStartedAt`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/presence`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.live_track ? parsed.live_track.timer_started_at : undefined;
            },
        },
        common: {
            name: 'Live track timer started at',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    deviceObj[`Presence.LiveTrackTimerDuration`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/presence`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.live_track ? parsed.live_track.timer_duration : undefined;
            },
        },
        common: {
            name: 'Live track duration',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 's',
        },
    };

    deviceObj[`Presence.LiveTrackInterval`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/presence`,
            mqtt_publish_funct: value => {
                const parsed = JSON.parse(value);
                return parsed.live_track ? parsed.live_track.interval : undefined;
            },
        },
        common: {
            name: 'Live track interval',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 's',
        },
    };
}

/**
 * Adds states for the Shelly PresenceZone component
 * see https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/PresenceZone
 *
 * @param deviceObj
 * @param zoneId
 */
function addPresenceZone(deviceObj: DeviceDefinition, zoneId: number): void {
    deviceObj[`PresenceZone${zoneId}.Name`] = {
        mqtt: {
            http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => (value ? JSON.parse(value).name : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PresenceZone.SetConfig',
                    params: { id: zoneId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Zone name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`PresenceZone${zoneId}.Enable`] = {
        mqtt: {
            http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => (value ? JSON.parse(value).enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PresenceZone.SetConfig',
                    params: { id: zoneId, config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Enable',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    // deviceObj[`PresenceZone${zoneId}.Color`] = {
    //     mqtt: {
    //         http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
    //         http_publish_funct: value => {
    //             if (!value) {
    //                 return undefined;
    //             }
    //             const color = JSON.parse(value).color;
    //             return color ? JSON.stringify(color) : undefined;
    //         },
    //         mqtt_cmd: '<mqttprefix>/rpc',
    //         mqtt_cmd_funct: (value, self) => {
    //             return JSON.stringify({
    //                 id: self.getNextMsgId(),
    //                 src: 'iobroker',
    //                 method: 'PresenceZone.SetConfig',
    //                 params: { id: zoneId, config: { color: JSON.parse(value) } },
    //             });
    //         },
    //     },
    //     common: {
    //         name: {
    //             en: 'Preview color',
    //             de: 'Vorschaufarbe',
    //             ru: 'Цвет предварительного просмотра',
    //             pt: 'Cor de pré-visualização',
    //             nl: 'Voorbeeldkleur',
    //             fr: 'Couleur de prévisualisation',
    //             it: 'Colore anteprima',
    //             es: 'Color de vista previa',
    //             pl: 'Kolor podglądu',
    //             uk: 'Колір попереднього перегляду',
    //             'zh-cn': '预览颜色',
    //         },
    //         type: 'string',
    //         role: 'json',
    //         read: true,
    //         write: true,
    //     },
    // };

    // presence_delay is deocumented at api but not provided by rpc output
    //
    // deviceObj[`PresenceZone${zoneId}.PresenceDelay`] = {
    //     mqtt: {
    //         http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
    //         http_publish_funct: value => (value ? JSON.parse(value).presence_delay : undefined),
    //         mqtt_cmd: '<mqttprefix>/rpc',
    //         mqtt_cmd_funct: (value, self) => {
    //             return JSON.stringify({
    //                 id: self.getNextMsgId(),
    //                 src: 'iobroker',
    //                 method: 'PresenceZone.SetConfig',
    //                 params: { id: zoneId, config: { presence_delay: value } },
    //             });
    //         },
    //     },
    //     common: {
    //         name: {
    //             en: 'Presence delay',
    //             de: 'Anwesenheitsverzögerung',
    //             ru: 'Задержка присутствия',
    //             pt: 'Atraso de presença',
    //             nl: 'Aanwezigheidsvertraging',
    //             fr: 'Délai de présence',
    //             it: 'Ritardo di presenza',
    //             es: 'Retardo de presencia',
    //             pl: 'Opóźnienie obecności',
    //             uk: 'Затримка присутності',
    //             'zh-cn': '存在延迟',
    //         },
    //         type: 'number',
    //         role: 'value',
    //         read: true,
    //         write: true,
    //         unit: 's',
    //     },
    // };

    // absence_delay is deocumented at api but not provided by rpc output
    //
    // deviceObj[`PresenceZone${zoneId}.AbsenceDelay`] = {
    //     mqtt: {
    //         http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
    //         http_publish_funct: value => (value ? JSON.parse(value).absence_delay : undefined),
    //         mqtt_cmd: '<mqttprefix>/rpc',
    //         mqtt_cmd_funct: (value, self) => {
    //             return JSON.stringify({
    //                 id: self.getNextMsgId(),
    //                 src: 'iobroker',
    //                 method: 'PresenceZone.SetConfig',
    //                 params: { id: zoneId, config: { absence_delay: value } },
    //             });
    //         },
    //     },
    //     common: {
    //         name: {
    //             en: 'Absence delay',
    //             de: 'Abwesenheitsverzögerung',
    //             ru: 'Задержка отсутствия',
    //             pt: 'Atraso de ausência',
    //             nl: 'Afwezigheidsvertraging',
    //             fr: "Délai d'absence",
    //             it: 'Ritardo di assenza',
    //             es: 'Retardo de ausencia',
    //             pl: 'Opóźnienie nieobecności',
    //             uk: 'Затримка відсутності',
    //             'zh-cn': '缺席延迟',
    //         },
    //         type: 'number',
    //         role: 'value',
    //         read: true,
    //         write: true,
    //         unit: 's',
    //     },
    // };

    // presence_thr is not documented at api but provided by rpc output
    //
    deviceObj[`PresenceZone${zoneId}.PresenceThr`] = {
        mqtt: {
            http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => (value ? JSON.parse(value).presence_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PresenceZone.SetConfig',
                    params: { id: zoneId, config: { presence_thr: value } },
                });
            },
        },
        common: {
            name: 'Presence threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
        },
    };

    // absence_thr is not documented at api but provided by rpc output
    //
    deviceObj[`PresenceZone${zoneId}.AbsenceThr`] = {
        mqtt: {
            http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => (value ? JSON.parse(value).absence_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PresenceZone.SetConfig',
                    params: { id: zoneId, config: { absence_thr: value } },
                });
            },
        },
        common: {
            name: 'Absence threshold',
            type: 'number',
            role: 'value',
            read: true,
            write: true,
            unit: 's',
        },
    };

    deviceObj[`PresenceZone${zoneId}.Area`] = {
        mqtt: {
            http_publish: `/rpc/PresenceZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => {
                if (!value) {
                    return undefined;
                }
                const area = JSON.parse(value).area;
                return area ? JSON.stringify(area) : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PresenceZone.SetConfig',
                    params: { id: zoneId, config: { area: JSON.parse(value) } },
                });
            },
        },
        common: {
            name: 'Zone area',
            type: 'string',
            role: 'json',
            read: true,
            write: true,
        },
    };

    deviceObj[`PresenceZone${zoneId}.State`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/presencezone:${zoneId}`,
            //mqtt_publish_funct: value => JSON.parse(value).state, // documentations state 'state'
            mqtt_publish_funct: value => JSON.parse(value).value, // log shows 'value'
        },
        common: {
            name: 'Presence state',
            type: 'boolean',
            role: 'sensor',
            read: true,
            write: false,
        },
    };

    deviceObj[`PresenceZone${zoneId}.NumObjects`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/presencezone:${zoneId}`,
            mqtt_publish_funct: value => JSON.parse(value).num_objects,
        },
        common: {
            name: 'Number of detected objects',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds states for the Shelly Pro Output Add-On
 * see
 * https://kb.shelly.cloud/knowledge-base/shelly-pro-3em-switch-add-on
 * https://shelly-api-docs.shelly.cloud/gen2/Addons/ShellyProOutputAddon
 *
 * @param deviceObj
 */
function addProOutputAddon(deviceObj: DeviceDefinition): void {
    // {"method":"switch.toggle","id":34,"src":"098b2679-ab6d-4d51-ac59-dbbc20c52465","auth":{"auth_type":"digest","nonce":1714380207,"nc":1,"realm":"shellypro3em-08f9e0e8913c","algorithm":"SHA-256","username":"admin","cnonce":"B3HoovDzmPWk0g5F","response":"8ef6dce461b506eb20f87309c849b982a8a36a148ec057522f16baf6c896a9ea"},"params":{"id":100}}	1714380387.2724333
    deviceObj['Ext.switch100'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/switch:100`,
            mqtt_publish_funct: value => JSON.parse(value).output,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Switch.Set',
                    params: { id: 100, on: value },
                });
            },
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    };
}

/**
 * Adds a generic RGB light definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/RGB
 *
 * @param deviceObj
 * @param rgbId
 * @param hasPowerMetering
 */
function addRGB(deviceObj: DeviceDefinition, rgbId: number, hasPowerMetering: boolean): void {
    deviceObj[`RGB${rgbId}.Switch`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
            mqtt_publish_funct: value => JSON.parse(value).output,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.Set',
                    params: { id: rgbId, on: value },
                });
            },
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`RGB${rgbId}.Brightness`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
            mqtt_publish_funct: value => JSON.parse(value).brightness,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.Set',
                    params: { id: rgbId, brightness: value },
                });
            },
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`RGB${rgbId}.ColorRGB`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
            mqtt_publish_funct: value =>
                Array.isArray(JSON.parse(value).rgb) ? JSON.parse(value).rgb.join(',') : null,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.Set',
                    params: { id: rgbId, rgb: value.split(',').map(Number) },
                });
            },
        },
        common: {
            name: 'Color',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };
    deviceObj[`RGB${rgbId}.Color`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
            mqtt_publish_funct: value =>
                `#${JSON.parse(value)
                    .rgb.map((x: number) => x.toString(16).padStart(2, '0'))
                    .join('')}`,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.Set',
                    params: { id: rgbId, rgb: value.match(/[a-f0-9]{2}/gi).map((x: string) => parseInt(x, 16)) },
                });
            },
        },
        common: {
            name: 'Color HEX',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`RGB${rgbId}.transition`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
            mqtt_publish_funct: value => JSON.parse(value)?.transition?.duration,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.Set',
                    params: { id: rgbId, transition_duration: value },
                });
            },
        },
        common: {
            name: 'Transition Time',
            type: 'number',
            role: 'value',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    };

    deviceObj[`RGB${rgbId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/RGB.GetConfig?id=${rgbId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `RGB${rgbId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.SetConfig',
                    params: { id: rgbId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            def: `rgb_${rgbId}`,
        },
    };

    deviceObj[`RGB${rgbId}.InitialState`] = {
        mqtt: {
            http_publish: `/rpc/RGB.GetConfig?id=${rgbId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.SetConfig',
                    params: { id: rgbId, config: { initial_state: value } },
                });
            },
        },
        common: {
            name: 'Initial State',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                on: 'on',
                off: 'off',
                restore_last: 'restore_last',
            },
        },
    };

    deviceObj[`RGB${rgbId}.source`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
            mqtt_publish_funct: value => JSON.parse(value).source,
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`RGB${rgbId}.Event`] = {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];
                        if (typeof event === 'object' && event.component === `rgb:${rgbId}`) {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'RGB Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    if (hasPowerMetering) {
        deviceObj[`RGB${rgbId}.Power`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
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

        deviceObj[`RGB${rgbId}.Voltage`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
                mqtt_publish_funct: value => JSON.parse(value).voltage,
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
        };

        deviceObj[`RGB${rgbId}.Current`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
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

        deviceObj[`RGB${rgbId}.Energy`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgb:${rgbId}`,
                mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
            },
            common: {
                name: 'Energy',
                type: 'number',
                role: 'value.energy',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };
    }
}

/**
 * Adds a generic RGBW light definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/RGBW
 *
 * @param deviceObj
 * @param rgbwId
 * @param hasPowerMetering
 */
function addRGBW(deviceObj: DeviceDefinition, rgbwId: number, hasPowerMetering: boolean): void {
    deviceObj[`RGBW${rgbwId}.Switch`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value => JSON.parse(value).output,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, on: value },
                });
            },
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    };

    deviceObj[`RGBW${rgbwId}.Brightness`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value => JSON.parse(value).brightness,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, brightness: value },
                });
            },
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    };

    deviceObj[`RGBW${rgbwId}.ColorRGB`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value =>
                Array.isArray(JSON.parse(value).rgb) ? JSON.parse(value).rgb.join(',') : null,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, rgb: value.split(',').map(Number) },
                });
            },
        },
        common: {
            name: 'Color RGB',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`RGBW${rgbwId}.Color`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value =>
                `#${JSON.parse(value)
                    .rgb.map((x: number) => x.toString(16).padStart(2, '0'))
                    .join('')}`,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, rgb: value.match(/[a-f0-9]{2}/gi).map((x: string) => parseInt(x, 16)) },
                });
            },
        },
        common: {
            name: 'Color HEX',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    };

    deviceObj[`RGBW${rgbwId}.White`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value => JSON.parse(value).white,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, white: value },
                });
            },
        },
        common: {
            name: 'White Channel',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            min: 0,
            max: 255,
        },
    };

    deviceObj[`RGBW${rgbwId}.transition`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value => JSON.parse(value)?.transition?.duration,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, transition_duration: value },
                });
            },
        },
        common: {
            name: 'Transition Time',
            type: 'number',
            role: 'level',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    };
    deviceObj[`RGBW${rgbwId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/RGBW.GetConfig?id=${rgbwId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `RGBW${rgbwId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.SetConfig',
                    params: { id: rgbwId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            def: `rgbw_${rgbwId}`,
        },
    };

    deviceObj[`RGBW${rgbwId}.InitialState`] = {
        mqtt: {
            http_publish: `/rpc/RGBW.GetConfig?id=${rgbwId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.SetConfig',
                    params: { id: rgbwId, config: { initial_state: value } },
                });
            },
        },
        common: {
            name: 'Initial State',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                on: 'on',
                off: 'off',
                restore_last: 'restore_last',
            },
        },
    };

    deviceObj[`RGBW${rgbwId}.source`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
            mqtt_publish_funct: value => JSON.parse(value).source,
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`RGBW${rgbwId}.Event`] = {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];
                        if (typeof event === 'object' && event.component === `rgbw:${rgbwId}`) {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'RGBW Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    if (hasPowerMetering) {
        deviceObj[`RGBW${rgbwId}.Power`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
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

        deviceObj[`RGBW${rgbwId}.Voltage`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
                mqtt_publish_funct: value => JSON.parse(value).voltage,
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
        };

        deviceObj[`RGBW${rgbwId}.Current`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
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

        deviceObj[`RGBW${rgbwId}.Energy`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/rgbw:${rgbwId}`,
                mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
            },
            common: {
                name: 'Energy',
                type: 'number',
                role: 'value.energy',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };
    }
}

/**
 * Adds a generic switch definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Switch
 *
 * @param deviceObj
 * @param switchId
 * @param hasPowerMetering
 */
function addSwitch(deviceObj: DeviceDefinition, switchId: number, hasPowerMetering: boolean): void {
    deviceObj[`Relay${switchId}.ChannelName`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Relay${switchId}`, JSON.parse(value).name)
                    : undefined;
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
            name: 'Channel name',
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
            name: 'Switch',
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
            http_publish_funct: value => (value ? JSON.parse(value).in_mode : undefined),
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
            name: 'Input mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                momentary: 'momentary',
                follow: 'follow',
                flip: 'flip',
                detached: 'detached',
            },
        },
    };

    deviceObj[`Relay${switchId}.InitialState`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => (value ? JSON.parse(value).initial_state : undefined),
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
            name: 'Initial state',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                on: 'on',
                off: 'off',
                restore_last: 'restore_last',
                match_input: 'match_input',
            },
        },
    };

    deviceObj[`Relay${switchId}.AutoTimerOn`] = {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
            http_publish_funct: value => (value ? JSON.parse(value).auto_on : undefined),
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
            http_publish_funct: value => (value ? JSON.parse(value).auto_on_delay : undefined),
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
            http_publish_funct: value => (value ? JSON.parse(value).auto_off : undefined),
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
            http_publish_funct: value => (value ? JSON.parse(value).auto_off_delay : undefined),
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
            name: 'Source of last command',
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
            mqtt_publish_funct: value => JSON.parse(value)?.temperature?.tC,
        },
        common: {
            name: 'Temperature',
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
            mqtt_publish_funct: value => JSON.parse(value)?.temperature?.tF,
        },
        common: {
            name: 'Temperature',
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
                name: 'Voltage',
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

        deviceObj[`Relay${switchId}.PowerFactor`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).pf,
            },
            common: {
                name: 'Power Factor',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
                def: 0,
            },
        };

        deviceObj[`Relay${switchId}.Frequency`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).freq,
            },
            common: {
                name: 'Frequency',
                type: 'number',
                role: 'value.frequency',
                read: true,
                write: false,
                def: 0,
                unit: 'Hz',
            },
        };

        deviceObj[`Relay${switchId}.Energy`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
            },
            common: {
                name: 'Energy',
                type: 'number',
                role: 'value.energy',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };

        deviceObj[`Relay${switchId}.ReturnedEnergy`] = {
            device_mode: 'switch',
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/switch:${switchId}`,
                mqtt_publish_funct: value => JSON.parse(value).ret_aenergy?.total,
            },
            common: {
                name: 'Returned Energy',
                type: 'number',
                role: 'value.energy.produced',
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
                http_publish_funct: value => (value ? JSON.parse(value).power_limit : undefined),
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
                role: 'level.max',
                unit: 'W',
                read: true,
                write: true,
            },
        };

        deviceObj[`Relay${switchId}.LimitCurrent`] = {
            device_mode: 'switch',
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: value => (value ? JSON.parse(value).current_limit : undefined),
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
                role: 'level.current.max',
                unit: 'A',
                read: true,
                write: true,
            },
        };

        deviceObj[`Relay${switchId}.LimitVoltage`] = {
            device_mode: 'switch',
            mqtt: {
                http_publish: `/rpc/Switch.GetConfig?id=${switchId}`,
                http_publish_funct: value => (value ? JSON.parse(value).voltage_limit : undefined),
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
                role: 'level.voltage.max',
                unit: 'V',
                read: true,
                write: true,
            },
        };

        deviceObj[`Relay${switchId}.ResetCounters`] = {
            device_mode: 'switch',
            mqtt: {
                //http_publish: `/rpc/Input.GetConfig?id=${inputId}`,
                //http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
                mqtt_cmd: '<mqttprefix>/rpc',
                mqtt_cmd_funct: (value, self) => {
                    return JSON.stringify({
                        id: self.getNextMsgId(),
                        src: 'iobroker',
                        method: 'Switch.ResetCounters',
                        params: { id: switchId },
                    });
                },
            },
            common: {
                name: 'Reset counters',
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
            },
        };
    }
}

/**
 * Adds a generic temperature sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Temperature
 *
 * @param deviceObj
 * @param sensorId
 */
function addTemperatureSensor(deviceObj: DeviceDefinition, sensorId: number): void {
    deviceObj[`Temperature${sensorId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=${sensorId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Temperature${sensorId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Temperature.SetConfig',
                    params: { id: sensorId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`Temperature${sensorId}.Celsius`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).tC,
        },
        common: {
            name: 'Temperature',
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
            mqtt_publish_funct: value => JSON.parse(value).tF,
        },
        common: {
            name: 'Temperature',
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
            http_publish_funct: value => (value ? JSON.parse(value).report_thr_C : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Temperature.SetConfig',
                    params: { id: sensorId, config: { report_thr_C: value } },
                });
            },
        },
        common: {
            name: 'Report threshold',
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
            min: 0.1,
            max: 5,
        },
    };

    deviceObj[`Temperature${sensorId}.Offset_C`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=${sensorId}`,
            http_publish_funct: value => (value ? JSON.parse(value).offset_C : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Temperature.SetConfig',
                    params: { id: sensorId, config: { offset_C: value } },
                });
            },
        },
        common: {
            name: 'Offset',
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
            min: -50,
            max: 50,
        },
    };
}

/**
 * Adds a generic voltmeter sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Voltmeter
 *
 * @param deviceObj
 * @param sensorId
 */
function addVoltmeterSensor(deviceObj: DeviceDefinition, sensorId: number): void {
    deviceObj[`Voltmeter${sensorId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Voltmeter.GetConfig?id=${sensorId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Voltmeter${sensorId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Voltmeter.SetConfig',
                    params: { id: sensorId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`Voltmeter${sensorId}.ReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Voltmeter.GetConfig?id=${sensorId}`,
            http_publish_funct: value => (value ? JSON.parse(value).report_thr : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Voltmeter.SetConfig',
                    params: { id: sensorId, config: { report_thr: value } },
                });
            },
        },
        common: {
            name: 'Report threshold',
            type: 'number',
            role: 'level.voltage',
            read: true,
            write: true,
            unit: 'V',
            min: 0,
        },
    };

    deviceObj[`Voltmeter${sensorId}.Range`] = {
        mqtt: {
            http_publish: `/rpc/Voltmeter.GetConfig?id=${sensorId}`,
            http_publish_funct: value => (value ? JSON.parse(value).range : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Voltmeter.SetConfig',
                    params: { id: sensorId, config: { range: value } },
                });
            },
        },
        common: {
            name: 'Range',
            type: 'number',
            role: 'level',
            read: true,
            write: true,
        },
    };

    deviceObj[`Voltmeter${sensorId}.voltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/voltmeter:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
        },
        common: {
            // The sensor id is encoded in the object id (Voltmeter<id>.*); the display name uses the
            // plain i18n key, resolved to all languages at runtime by objectHelper.setOrUpdateObject.
            name: 'Voltage',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
        },
    };

    deviceObj[`Voltmeter${sensorId}.voltageTransformed`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/voltmeter:${sensorId}`,
            mqtt_publish_funct: value => {
                const obj = JSON.parse(value);

                if (obj?.xvoltage && obj.xvoltage !== null) {
                    return obj.xvoltage;
                }

                return undefined;
            },
        },
        common: {
            // The sensor id is encoded in the object id (Voltmeter<id>.*); the display name uses the
            // plain i18n key, resolved to all languages at runtime by objectHelper.setOrUpdateObject.
            name: 'Voltage (transformed)',
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
        },
    };
}

export {
    addAnalogInput,
    addCCT,
    addCounterInput,
    addCover,
    addCury,
    addDevicePower,
    addEM,
    addEM1,
    addEM1Data,
    addEMData,
    addEMTemperatureSensor,
    addFlood,
    addHumiditySensor,
    addIlluminanceSensor,
    addInput,
    addLight,
    addPM1,
    addPlusAddon,
    addPresence,
    addPresenceZone,
    addProOutputAddon,
    addRGB,
    addRGBW,
    addSwitch,
    addTemperatureSensor,
    addVoltmeterSensor,
};
