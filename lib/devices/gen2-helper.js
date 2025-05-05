'use strict';

const shellyHelper = require('../shelly-helper');
/**
 * Adds a generic energymeter definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param switchId
 */
function addEM1(deviceObj, switchId) {
    deviceObj[`EM1:${switchId}.Power`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).act_power,
        },
        common: {
            name: {
                en: 'Active Power',
                de: 'Wirkleistung',
                ru: 'Активная мощность',
                pt: 'Potência Ativa',
                nl: 'Actief vermogen',
                fr: 'Puissance active',
                it: 'Potenza attiva',
                es: 'Potencia activa',
                pl: 'Moc czynna',
                uk: 'Активна потужність',
                'zh-cn': '有功功率',
            },
            type: 'number',
            role: 'value.power.active',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    };

    deviceObj[`EM1:${switchId}.Voltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${switchId}`,
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

    deviceObj[`EM1:${switchId}.Current`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).current,
        },
        common: {
            name: {
                en: 'Current',
                de: 'Stromstärke',
                ru: 'Сила тока',
                pt: 'Amperagem',
                nl: 'Amperage',
                fr: 'Intensité de courant',
                it: 'Amperaggio',
                es: 'Amperaje',
                pl: 'Natężenie w amperach',
                uk: 'Сила струму',
                'zh-cn': '安培数',
            },
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    };

    deviceObj[`EM1:${switchId}.ApparentPower`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).aprt_power,
        },
        common: {
            name: {
                en: 'Apparent Power',
                de: 'Scheinleistung',
                ru: 'Кажущаяся мощность',
                pt: 'Poder Aparente',
                nl: 'Schijnbare kracht',
                fr: 'Puissance apparente',
                it: 'Potenza apparente',
                es: 'Potencia aparente',
                pl: 'Moc pozorna',
                uk: 'Видима потужність',
                'zh-cn': '视在功率',
            },
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'VA',
        },
    };

    deviceObj[`EM1:${switchId}.PowerFactor`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).pf,
        },
        common: {
            name: {
                en: 'Power Factor',
                de: 'Leistungsfaktor',
                ru: 'Коэффициент мощности',
                pt: 'Fator de potência',
                nl: 'Vermogensfactor',
                fr: 'Facteur de puissance',
                it: 'Fattore di potenza',
                es: 'Factor de potencia',
                pl: 'Współczynnik mocy',
                uk: 'Фактор потужності',
                'zh-cn': '功率因数',
            },
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    };

    deviceObj[`EM1:${switchId}.Frequency`] = {
        device_mode: 'em1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).freq,
        },
        common: {
            name: {
                en: 'Frequency',
                de: 'Frequenz',
                ru: 'Частота',
                pt: 'Freqüência',
                nl: 'Frequentie',
                fr: 'Fréquence',
                it: 'Frequenza',
                es: 'Frecuencia',
                pl: 'Częstotliwość',
                uk: 'Частота',
                'zh-cn': '频率',
            },
            type: 'number',
            role: 'value.frequency',
            read: true,
            write: false,
            def: 0,
            unit: 'Hz',
        },
    };

    deviceObj[`EM1:${switchId}.TotalEnergy`] = {
        device_mode: 'em1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1data:${switchId}`,
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

    deviceObj[`EM1:${switchId}.TotalRetEnergy`] = {
        device_mode: 'em1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em1data:${switchId}`,
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

/**
 * Adds a generic PM definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param switchId
 */
function addPM1(deviceObj, switchId) {
    deviceObj[`PM1:${switchId}.ResetCounters`] = {
        mqtt: {
            //http_publish: `/rpc/Input.GetConfig?id=${switchId}`,
            //http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PM1.ResetCounters',
                    params: { id: switchId },
                });
            },
        },
        common: {
            name: {
                en: 'Reset counters',
                de: 'Zähler zurücksetzen',
                ru: 'Сбросить счетчик',
                pt: 'Reiniciar contador',
                nl: 'Teller resetten',
                fr: 'Réinitialiser le compteur',
                it: 'Azzera contatore',
                es: 'Reiniciar contador',
                pl: 'Zresetuj licznik',
                uk: 'Скинути лічильник',
                'zh-cn': '重置计数器',
            },
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    };

    deviceObj[`PM1:${switchId}.Power`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).apower,
        },
        common: {
            name: {
                en: 'Power',
                de: 'Leistung',
                ru: 'Власть',
                pt: 'Poder',
                nl: 'Stroom',
                fr: 'Pouvoir',
                it: 'Energia',
                es: 'Fuerza',
                pl: 'Moc',
                uk: 'потужність',
                'zh-cn': '力量',
            },
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    };

    deviceObj[`PM1:${switchId}.ApparentPower`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).aprtpower,
        },
        common: {
            name: {
                en: 'Apparent Power',
                de: 'Scheinleistung',
                ru: 'Кажущаяся мощность',
                pt: 'Poder Aparente',
                nl: 'Schijnbare kracht',
                fr: 'Puissance apparente',
                it: 'Potenza apparente',
                es: 'Potencia aparente',
                pl: 'Moc pozorna',
                uk: 'Видима потужність',
                'zh-cn': '视在功率',
            },
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'VA',
        },
    };

    deviceObj[`PM1:${switchId}.PowerFactor`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).pf,
        },
        common: {
            name: {
                en: 'Power Factor',
                de: 'Leistungsfaktor',
                ru: 'Коэффициент мощности',
                pt: 'Fator de potência',
                nl: 'Vermogensfactor',
                fr: 'Facteur de puissance',
                it: 'Fattore di potenza',
                es: 'Factor de potencia',
                pl: 'Współczynnik mocy',
                uk: 'Фактор потужності',
                'zh-cn': '功率因数',
            },
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    };

    deviceObj[`PM1:${switchId}.Voltage`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
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

    deviceObj[`PM1:${switchId}.Current`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).current,
        },
        common: {
            name: {
                en: 'Current',
                de: 'Stromstärke',
                ru: 'Сила тока',
                pt: 'Amperagem',
                nl: 'Amperage',
                fr: 'Intensité de courant',
                it: 'Amperaggio',
                es: 'Amperaje',
                pl: 'Natężenie w amperach',
                uk: 'Сила струму',
                'zh-cn': '安培数',
            },
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    };

    deviceObj[`PM1:${switchId}.Energy`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).aenergy?.total,
        },
        common: {
            name: {
                en: 'Energy',
                de: 'Energie',
                ru: 'Энергия',
                pt: 'Energia',
                nl: 'Energie',
                fr: 'Énergie',
                it: 'Energia',
                es: 'Energía',
                pl: 'Energia',
                uk: 'Енергія',
                'zh-cn': '活力',
            },
            type: 'number',
            role: 'value.energy.consumed',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`PM1:${switchId}.ReturnedEnergy`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
            mqtt_publish_funct: value => JSON.parse(value).ret_aenergy?.total,
        },
        common: {
            name: {
                en: 'Returned Energy',
                de: 'Zurückgelieferte Energie',
                ru: 'Возвращенная энергия',
                pt: 'Energia Retornada',
                nl: 'Teruggegeven energie',
                fr: 'Énergie restituée',
                it: 'Energia restituita',
                es: 'Energía devuelta',
                pl: 'Zwrócona energia',
                uk: 'Повернена енергія',
                'zh-cn': '回馈能量',
            },
            type: 'number',
            role: 'value.energy.produced',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`PM1:${switchId}.Frequency`] = {
        device_mode: 'pm1',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/pm1:${switchId}`,
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
 * Adds a generic Illuminance sensor definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param sensorId
 */
function addIlluminanceSensor(deviceObj, sensorId) {
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

    deviceObj[`Illuminance${sensorId}.Lux`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/illuminance:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).lux,
        },
        common: {
            name: {
                en: 'Illuminance',
                de: 'Helligkeit',
                ru: 'Освещенность',
                pt: 'Iluminancia',
                nl: 'Verlichtingssterkte',
                fr: 'lumineuse',
                it: 'Illuminazione',
                es: 'Iluminancia',
                pl: 'Podświetlenie',
                'zh-cn': '照度',
            },
            type: 'number',
            role: 'value.brightness',
            read: true,
            write: false,
            unit: 'Lux',
        },
    };
}

/**
 * Adds a generic switch definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param switchId
 * @param hasPowerMetering
 */
function addSwitch(deviceObj, switchId, hasPowerMetering) {
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
            name: {
                en: 'Input mode',
                de: 'Eingangsmodus',
                ru: 'Входной режим',
                pt: 'Modo de entrada',
                nl: 'Input modus',
                fr: "Mode d ' entrée",
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
            name: {
                en: 'Initial state',
                de: 'Initialer Zustand',
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
            name: {
                en: 'Auto Timer On',
                de: 'Automatischer Timer ein',
                ru: 'Автоматический таймер включен',
                pt: 'Temporizador automático ligado',
                nl: 'Automatische timer aan',
                fr: 'Activation automatique de la minuterie',
                it: 'Timer automatico acceso',
                es: 'Temporizador automático activado',
                pl: 'Włączanie automatycznego timera',
                uk: 'Автоматичний таймер увімкнено',
                'zh-cn': '自动定时器开启',
            },
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
            name: {
                en: 'Auto Timer On Delay',
                de: 'Automatischer Timer Einschaltverzögerung',
                ru: 'Автоматический таймер задержки включения',
                pt: 'Temporizador automático com atraso',
                nl: 'Automatische timer bij vertraging',
                fr: 'Temporisation de mise en marche automatique',
                it: 'Ritardo di accensione del timer automatico',
                es: 'Temporizador automático con retardo de activación',
                pl: 'Opóźnienie automatycznego włączania timera',
                uk: 'Автоматична затримка ввімкнення таймера',
                'zh-cn': '自动定时器开启延迟',
            },
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
            name: {
                en: 'Auto Timer Off',
                de: 'Automatischer Timer Aus',
                ru: 'Автоматическое выключение таймера',
                pt: 'Temporizador automático desligado',
                nl: 'Automatische timer uit',
                fr: 'Arrêt automatique de la minuterie',
                it: 'Spegnimento automatico del timer',
                es: 'Apagado automático del temporizador',
                pl: 'Automatyczne wyłączanie timera',
                uk: 'Автоматичне вимкнення таймера',
                'zh-cn': '自动定时器关闭',
            },
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
            name: {
                en: 'Auto Timer Off Delay',
                de: 'Automatischer Timer Ausschaltverzögerung',
                ru: 'Автоматическая задержка выключения таймера',
                pt: 'Atraso de desligamento automático do temporizador',
                nl: 'Automatische timer uitschakelvertraging',
                fr: "Délai d'arrêt automatique de la minuterie",
                it: 'Ritardo spegnimento timer automatico',
                es: 'Retardo de apagado automático del temporizador',
                pl: 'Opóźnienie automatycznego wyłączenia timera',
                uk: 'Затримка автоматичного вимкнення таймера',
                'zh-cn': '自动定时器关闭延迟',
            },
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
                it: "Fonte dell'ultimo comando",
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
            mqtt_publish_funct: value => JSON.parse(value)?.temperature?.tC,
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
            mqtt_publish_funct: value => JSON.parse(value)?.temperature?.tF,
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
                name: {
                    en: 'Power',
                    de: 'Leistung',
                    ru: 'Власть',
                    pt: 'Poder',
                    nl: 'Stroom',
                    fr: 'Pouvoir',
                    it: 'Energia',
                    es: 'Fuerza',
                    pl: 'Moc',
                    uk: 'потужність',
                    'zh-cn': '力量',
                },
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
                name: {
                    en: 'Current',
                    de: 'Stromstärke',
                    ru: 'Сила тока',
                    pt: 'Amperagem',
                    nl: 'Amperage',
                    fr: 'Intensité de courant',
                    it: 'Amperaggio',
                    es: 'Amperaje',
                    pl: 'Natężenie w amperach',
                    uk: 'Сила струму',
                    'zh-cn': '安培数',
                },
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
                name: {
                    en: 'Power Factor',
                    de: 'Leistungsfaktor',
                    ru: 'Коэффициент мощности',
                    pt: 'Fator de potência',
                    nl: 'Vermogensfactor',
                    fr: 'Facteur de puissance',
                    it: 'Fattore di potenza',
                    es: 'Factor de potencia',
                    pl: 'Współczynnik mocy',
                    uk: 'Фактор потужності',
                    'zh-cn': '功率因数',
                },
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
                name: {
                    en: 'Frequency',
                    de: 'Frequenz',
                    ru: 'Частота',
                    pt: 'Freqüência',
                    nl: 'Frequentie',
                    fr: 'Fréquence',
                    it: 'Frequenza',
                    es: 'Frecuencia',
                    pl: 'Częstotliwość',
                    uk: 'Частота',
                    'zh-cn': '频率',
                },
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
                name: {
                    en: 'Energy',
                    de: 'Energie',
                    ru: 'Энергия',
                    pt: 'Energia',
                    nl: 'Energie',
                    fr: 'Énergie',
                    it: 'Energia',
                    es: 'Energía',
                    pl: 'Energia',
                    uk: 'Енергія',
                    'zh-cn': '活力',
                },
                type: 'number',
                role: 'value.energy.consumed',
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
                name: {
                    en: 'Returned Energy',
                    de: 'Zurückgelieferte Energie',
                    ru: 'Возвращенная энергия',
                    pt: 'Energia Retornada',
                    nl: 'Teruggegeven energie',
                    fr: 'Énergie restituée',
                    it: 'Energia restituita',
                    es: 'Energía devuelta',
                    pl: 'Zwrócona energia',
                    uk: 'Повернена енергія',
                    'zh-cn': '回馈能量',
                },
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
                name: {
                    en: 'Power Limit',
                    de: 'Leistungsbegrenzung',
                    ru: 'Ограничение мощности',
                    pt: 'Limite de potência',
                    nl: 'Vermogenslimiet',
                    fr: 'Limite de puissance',
                    it: 'Limite di potenza',
                    es: 'Límite de potencia',
                    pl: 'Ograniczenie mocy',
                    uk: 'Обмеження потужності',
                    'zh-cn': '功率限制',
                },
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
                name: {
                    en: 'Current Limit',
                    de: 'Strombegrenzung',
                    ru: 'Текущий предел',
                    pt: 'Limite de corrente',
                    nl: 'Huidige limiet',
                    fr: 'Limite de courant',
                    it: 'Limite di corrente',
                    es: 'Límite de corriente',
                    pl: 'Obecny limit',
                    uk: 'Обмеження струму',
                    'zh-cn': '电流限制',
                },
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
                name: {
                    en: 'Voltage Limit',
                    de: 'Spannungsbegrenzung',
                    ru: 'Предел напряжения',
                    pt: 'Limite de tensão',
                    nl: 'Spanningslimiet',
                    fr: 'Limite de tension',
                    it: 'Limite di tensione',
                    es: 'Límite de voltaje',
                    pl: 'Ograniczenie napięcia',
                    uk: 'Обмеження напруги',
                    'zh-cn': '电压限制',
                },
                type: 'number',
                role: 'level.voltage.max',
                unit: 'V',
                read: true,
                write: true,
            },
        };

        deviceObj[`Relay${switchId}.ResetCounters`] = {
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
                name: {
                    en: 'Reset counters',
                    de: 'Zähler zurücksetzen',
                    ru: 'Сбросить счетчик',
                    pt: 'Reiniciar contador',
                    nl: 'Teller resetten',
                    fr: 'Réinitialiser le compteur',
                    it: 'Azzera contatore',
                    es: 'Reiniciar contador',
                    pl: 'Zresetuj licznik',
                    uk: 'Скинути лічильник',
                    'zh-cn': '重置计数器',
                },
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
            },
        };
    }
}

/**
 * Adds a generic digital (switch, button) input definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param inputId
 */
function addInput(deviceObj, inputId) {
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
            name: {
                en: 'Input Event',
                de: 'Eingangsereignis',
                ru: 'Входное событие',
                pt: 'Evento de entrada',
                nl: 'Invoergebeurtenis',
                fr: "Événement d'entrée",
                it: 'Evento di input',
                es: 'Evento de entrada',
                pl: 'Zdarzenie wejściowe',
                uk: 'Вхідна подія',
                'zh-cn': '输入事件',
            },
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
            name: {
                en: 'Input Type',
                de: 'Eingangstyp',
                ru: 'Тип ввода',
                pt: 'Tipo de entrada',
                nl: 'Invoertype',
                fr: "Type d'entrée",
                it: 'Tipo di input',
                es: 'Tipo de entrada',
                pl: 'Typ wejścia',
                uk: 'Тип введення',
                'zh-cn': '输入类型',
            },
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
            name: {
                en: 'Input enable',
                de: 'Eingang aktivieren',
                ru: 'Ввод включить',
                pt: 'Habilitar entrada',
                nl: 'Invoer inschakelen',
                fr: "Activation de l'entrée",
                it: 'Abilitazione input',
                es: 'Habilitación de entrada',
                pl: 'Włącz wejście',
                uk: 'Увімкнення входу',
                'zh-cn': '输入使能',
            },
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
            name: {
                en: 'Input Inverted',
                de: 'Eingang invertiert',
                ru: 'Вход инвертированный',
                pt: 'Entrada Invertida',
                nl: 'Invoer omgekeerd',
                fr: 'Entrée inversée',
                it: 'Ingresso invertito',
                es: 'Entrada invertida',
                pl: 'Wejście odwrócone',
                uk: 'Введення інвертовано',
                'zh-cn': '输入反转',
            },
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
            name: {
                en: 'Input Status',
                de: 'Eingangsstatus',
                ru: 'Статус ввода',
                pt: 'Status de entrada',
                nl: 'Invoerstatus',
                fr: "État d'entrée",
                it: 'Stato di input',
                es: 'Estado de entrada',
                pl: 'Status wejścia',
                uk: 'Статус введення',
                'zh-cn': '输入状态',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds a generic analog input sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Input/
 *
 * @param deviceObj
 * @param inputId
 */
function addAnalogInput(deviceObj, inputId) {
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
            name: {
                en: 'Input Event',
                de: 'Eingangsereignis',
                ru: 'Входное событие',
                pt: 'Evento de entrada',
                nl: 'Invoergebeurtenis',
                fr: "Événement d'entrée",
                it: 'Evento di input',
                es: 'Evento de entrada',
                pl: 'Zdarzenie wejściowe',
                uk: 'Вхідна подія',
                'zh-cn': '输入事件',
            },
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
            name: {
                en: 'Input Type',
                de: 'Eingangstyp',
                ru: 'Тип ввода',
                pt: 'Tipo de entrada',
                nl: 'Invoertype',
                fr: "Type d'entrée",
                it: 'Tipo di input',
                es: 'Tipo de entrada',
                pl: 'Typ wejścia',
                uk: 'Тип введення',
                'zh-cn': '输入类型',
            },
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
            name: {
                en: 'Input enable',
                de: 'Eingang aktivieren',
                ru: 'Ввод включить',
                pt: 'Habilitar entrada',
                nl: 'Invoer inschakelen',
                fr: "Activation de l'entrée",
                it: 'Abilitazione input',
                es: 'Habilitación de entrada',
                pl: 'Włącz wejście',
                uk: 'Увімкнення входу',
                'zh-cn': '输入使能',
            },
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
            name: {
                en: 'Input Inverted',
                de: 'Eingang invertiert',
                ru: 'Вход инвертированный',
                pt: 'Entrada Invertida',
                nl: 'Invoer omgekeerd',
                fr: 'Entrée inversée',
                it: 'Ingresso invertito',
                es: 'Entrada invertida',
                pl: 'Wejście odwrócone',
                uk: 'Введення інвертовано',
                'zh-cn': '输入反转',
            },
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
            role: 'level',
            read: true,
            write: true,
            unit: '%',
            def: 1,
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
            name: {
                en: 'Range mapping',
                de: 'Bereichszuordnung',
                ru: 'Картографирование диапазона',
                pt: 'Mapeamento de alcance',
                nl: 'Bereikmapping',
                fr: 'Cartographie de la gamme',
                it: "Mappatura dell'intervallo",
                es: 'Mapeo de rangos',
                pl: 'Mapowanie zasięgu',
                uk: 'Картування діапазону',
                'zh-cn': '范围映射',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            //unit: '%',
            def: [0, 100],
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
            name: {
                en: 'Range',
                de: 'Bereich',
                ru: 'Диапазон',
                pt: 'Faixa',
                nl: 'Bereik',
                fr: 'Gamme',
                it: 'Allineare',
                es: 'Rango',
                pl: 'Zakres',
                uk: 'Діапазон',
                'zh-cn': '范围',
            },
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            //unit: '%',
            def: 0,
            min: 0,
            max: 1,
        },
    };

    deviceObj[`Input${inputId}.Percent`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value)?.percent,
        },
        common: {
            name: {
                en: 'Percentage value',
                de: 'Prozentwert',
                ru: 'Процентное значение',
                pt: 'Valor percentual',
                nl: 'Percentagewaarde',
                fr: 'valeur en pourcentage',
                it: 'Valore percentuale',
                es: 'Valor porcentual',
                pl: 'Wartość procentowa',
                uk: 'Відсоткове значення',
                'zh-cn': '百分比值',
            },
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
            def: 0,
        },
    };

    deviceObj[`Input${inputId}.Xpercent`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:${inputId}`,
            mqtt_publish_funct: value => JSON.parse(value)?.xpercent,
        },
        common: {
            name: {
                en: 'Transformed percentage value',
                de: 'Transformierter Prozentwert',
                ru: 'Преобразованное процентное значение',
                pt: 'Valor percentual transformado',
                nl: 'Getransformeerde percentagewaarde',
                fr: 'Valeur en pourcentage transformée',
                it: 'Valore percentuale trasformato',
                es: 'Valor porcentual transformado',
                pl: 'Przekształcona wartość procentowa',
                uk: 'Трансформоване відсоткове значення',
                'zh-cn': '转换后的百分比值',
            },
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
            def: 0,
        },
    };
}

/**
 * Adds a generic counter input definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param inputId
 */
function addCounterInput(deviceObj, inputId) {
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
            name: {
                en: 'Input Event',
                de: 'Eingangsereignis',
                ru: 'Входное событие',
                pt: 'Evento de entrada',
                nl: 'Invoergebeurtenis',
                fr: "Événement d'entrée",
                it: 'Evento di input',
                es: 'Evento de entrada',
                pl: 'Zdarzenie wejściowe',
                uk: 'Вхідна подія',
                'zh-cn': '输入事件',
            },
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
            name: {
                en: 'Input Type',
                de: 'Eingangstyp',
                ru: 'Тип ввода',
                pt: 'Tipo de entrada',
                nl: 'Invoertype',
                fr: "Type d'entrée",
                it: 'Tipo di input',
                es: 'Tipo de entrada',
                pl: 'Typ wejścia',
                uk: 'Тип введення',
                'zh-cn': '输入类型',
            },
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
            name: {
                en: 'Input enable',
                de: 'Eingang aktivieren',
                ru: 'Ввод включить',
                pt: 'Habilitar entrada',
                nl: 'Invoer inschakelen',
                fr: "Activation de l'entrée",
                it: 'Abilitazione input',
                es: 'Habilitación de entrada',
                pl: 'Włącz wejście',
                uk: 'Увімкнення входу',
                'zh-cn': '输入使能',
            },
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
            role: 'level',
            read: true,
            write: true,
            def: 1,
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
            name: {
                en: 'Frequence measurement window',
                de: 'Frequenzmessfenster',
                ru: 'Окно измерения частоты',
                pt: 'Janela de medição de frequência',
                nl: 'Frequentiemeetvenster',
                fr: 'Fenêtre de mesure de fréquence',
                it: 'Finestra di misurazione della frequenza',
                es: 'Ventana de medición de frecuencia',
                pl: 'Okno pomiaru częstotliwości',
                uk: 'Вікно вимірювання частоти',
                'zh-cn': '频率测量窗口',
            },
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            unit: 's',
            def: 1,
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
            name: {
                en: 'Reset counter',
                de: 'Zähler zurücksetzen',
                ru: 'Сбросить счетчик',
                pt: 'Reiniciar contador',
                nl: 'Teller resetten',
                fr: 'Réinitialiser le compteur',
                it: 'Azzera contatore',
                es: 'Reiniciar contador',
                pl: 'Zresetuj licznik',
                uk: 'Скинути лічильник',
                'zh-cn': '重置计数器',
            },
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
            name: {
                en: 'Total pulses',
                de: 'Gesamtimpulse',
                ru: 'Общее количество импульсов',
                pt: 'Total de pulsos',
                nl: 'Totale pulsen',
                fr: "Nombre total d'impulsions",
                it: 'Impulsi totali',
                es: 'Pulsos totales',
                pl: 'Suma impulsów',
                uk: 'Загальна кількість імпульсів',
                'zh-cn': '总脉冲数',
            },
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
            name: {
                en: 'Total pulses (transformed)',
                de: 'Gesamtimpulse (transformiert)',
                ru: 'Общее количество импульсов (преобразованных)',
                pt: 'Total de pulsos (transformados)',
                nl: 'Totale pulsen (getransformeerd)',
                fr: 'Impulsions totales (transformées)',
                it: 'Impulsi totali (trasformati)',
                es: 'Pulsos totales (transformados)',
                pl: 'Całkowita liczba impulsów (przekształcona)',
                uk: 'Загальна кількість імпульсів (трансформованих)',
                'zh-cn': '总脉冲数（已转换）',
            },
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
            name: {
                en: 'Frequency\n',
                de: 'Frequenz\n',
                ru: 'Частота\n',
                pt: 'Freqüência\n',
                nl: 'Frequentie\n',
                fr: 'Fréquence\n',
                it: 'Frequenza\n',
                es: 'Frecuencia\n',
                pl: 'Częstotliwość\n',
                uk: 'Частота\n',
                'zh-cn': '频率\n',
            },
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
            name: {
                en: 'Frequency (transformed)',
                de: 'Frequenz (transformiert)',
                ru: 'Частота (преобразованная)',
                pt: 'Frequência (transformada)',
                nl: 'Frequentie (getransformeerd)',
                fr: 'Fréquence (transformée)',
                it: 'Frequenza (trasformata)',
                es: 'Frecuencia (transformada)',
                pl: 'Częstotliwość (przekształcona)',
                uk: 'Частота (трансформована)',
                'zh-cn': '频率（转换后）',
            },
            type: 'number',
            role: 'value.frequency',
            unit: 'Hz',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds a generic light definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param lightId
 * @param hasPowerMetering
 */
function addLight(deviceObj, lightId, hasPowerMetering) {
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
            name: {
                en: 'Initial State',
                de: 'Initialer Zustand',
                ru: 'Начальное состояние',
                pt: 'Estado Inicial',
                nl: 'Initiële staat',
                fr: 'État initial',
                it: 'Stato iniziale',
                es: 'Estado inicial',
                pl: 'Stan początkowy',
                uk: 'Початковий стан',
                'zh-cn': '初始状态',
            },
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
            name: {
                en: 'Illuminance',
                de: 'Helligkeit',
                ru: 'Освещенность',
                pt: 'Iluminancia',
                nl: 'Verlichtingssterkte',
                fr: 'lumineuse',
                it: 'Illuminazione',
                es: 'Iluminancia',
                pl: 'Podświetlenie',
                'zh-cn': '照度',
            },
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
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
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
            name: {
                en: 'Light Event',
                de: 'Lichtereignis',
                ru: 'Световое событие',
                pt: 'Evento de Luz',
                nl: 'Licht evenement',
                fr: 'Événement lumineux',
                it: 'Evento di luce',
                es: 'Evento de luz',
                pl: 'Wydarzenie świetlne',
                uk: 'Світла подія',
                'zh-cn': '灯光活动',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };

    if (hasPowerMetering) {
        deviceObj[`Light${lightId}.Power`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
                mqtt_publish_funct: value => JSON.parse(value).apower,
            },
            common: {
                name: {
                    en: 'Power',
                    de: 'Leistung',
                    ru: 'Власть',
                    pt: 'Poder',
                    nl: 'Stroom',
                    fr: 'Pouvoir',
                    it: 'Energia',
                    es: 'Fuerza',
                    pl: 'Moc',
                    uk: 'потужність',
                    'zh-cn': '力量',
                },
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

        deviceObj[`Light${lightId}.Current`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/light:${lightId}`,
                mqtt_publish_funct: value => JSON.parse(value).current,
            },
            common: {
                name: {
                    en: 'Current',
                    de: 'Stromstärke',
                    ru: 'Сила тока',
                    pt: 'Amperagem',
                    nl: 'Amperage',
                    fr: 'Intensité de courant',
                    it: 'Amperaggio',
                    es: 'Amperaje',
                    pl: 'Natężenie w amperach',
                    uk: 'Сила струму',
                    'zh-cn': '安培数',
                },
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
                name: {
                    en: 'Energy',
                    de: 'Energie',
                    ru: 'Энергия',
                    pt: 'Energia',
                    nl: 'Energie',
                    fr: 'Énergie',
                    it: 'Energia',
                    es: 'Energía',
                    pl: 'Energia',
                    uk: 'Енергія',
                    'zh-cn': '活力',
                },
                type: 'number',
                role: 'value.energy.consumed',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };
    }
}

/**
 * Adds a generic cover definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param coverId
 */
function addCover(deviceObj, coverId) {
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
            name: {
                en: 'Initial State',
                de: 'Initialer Zustand',
                ru: 'Начальное состояние',
                pt: 'Estado Inicial',
                nl: 'Initiële staat',
                fr: 'État initial',
                it: 'Stato iniziale',
                es: 'Estado inicial',
                pl: 'Stan początkowy',
                uk: 'Початковий стан',
                'zh-cn': '初始状态',
            },
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
            http_publish_funct: async (value, self) => {
                return await shellyHelper.getSetDuration(self, `Cover${coverId}.Duration`);
            },
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
            name: {
                en: 'Open',
                de: 'Öffnen',
                ru: 'Открыть',
                pt: 'Abrir',
                nl: 'Open',
                fr: 'Ouvrir',
                it: 'Aprire',
                es: 'Abierto',
                pl: 'Otwarte',
                uk: 'ВІДЧИНЕНО',
                'zh-cn': '打开',
            },
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
            name: {
                en: 'Stop',
                de: 'Stoppen',
                ru: 'Останавливаться',
                pt: 'Parar',
                nl: 'Stop',
                fr: 'Arrêt',
                it: 'Fermare',
                es: 'Detener',
                pl: 'Zatrzymywać się',
                uk: 'СТІЙ',
                'zh-cn': '停止',
            },
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
            name: {
                en: 'Close',
                de: 'Schließen',
                ru: 'Закрывать',
                pt: 'Fechar',
                nl: 'Dichtbij',
                fr: 'Fermer',
                it: 'Vicino',
                es: 'Cerca',
                pl: 'Zamknąć',
                uk: 'Закрити',
                'zh-cn': '关闭',
            },
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
            name: {
                en: 'Calibrate',
                de: 'Kalibrieren',
                ru: 'Калибровать',
                pt: 'Calibrar',
                nl: 'Kalibreren',
                fr: 'Étalonner',
                it: 'Calibrare',
                es: 'Calibrar',
                pl: 'Kalibrować',
                uk: 'Відкалібрувати',
                'zh-cn': '校准',
            },
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
            name: {
                en: 'Input Swap',
                de: 'Eingang tauschen',
                ru: 'Входной обмен',
                pt: 'Troca de entrada',
                nl: 'Invoer wisselen',
                fr: "Échange d'entrée",
                it: 'Scambio di input',
                es: 'Intercambio de entrada',
                pl: 'Zamiana wejściowa',
                uk: 'Input Swap',
                'zh-cn': '输入交换',
            },
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
            name: {
                en: 'Input Mode',
                de: 'Eingangsmodus',
                ru: 'Режим ввода',
                pt: 'Modo de entrada',
                nl: 'Invoermodus',
                fr: 'Mode de saisie',
                it: 'Modalità di immissione',
                es: 'Modo de entrada',
                pl: 'Tryb wprowadzania',
                uk: 'Режим введення',
                'zh-cn': '输入模式',
            },
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
            name: {
                en: 'Power Limit',
                de: 'Leistungsbegrenzung',
                ru: 'Ограничение мощности',
                pt: 'Limite de potência',
                nl: 'Vermogenslimiet',
                fr: 'Limite de puissance',
                it: 'Limite di potenza',
                es: 'Límite de potencia',
                pl: 'Ograniczenie mocy',
                uk: 'Обмеження потужності',
                'zh-cn': '功率限制',
            },
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
            name: {
                en: 'Current Limit',
                de: 'Strombegrenzung',
                ru: 'Текущий предел',
                pt: 'Limite de corrente',
                nl: 'Huidige limiet',
                fr: 'Limite de courant',
                it: 'Limite di corrente',
                es: 'Límite de corriente',
                pl: 'Obecny limit',
                uk: 'Обмеження струму',
                'zh-cn': '电流限制',
            },
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
            name: {
                en: 'Voltage Limit',
                de: 'Spannungsbegrenzung',
                ru: 'Предел напряжения',
                pt: 'Limite de tensão',
                nl: 'Spanningslimiet',
                fr: 'Limite de tension',
                it: 'Limite di tensione',
                es: 'Límite de voltaje',
                pl: 'Ograniczenie napięcia',
                uk: 'Обмеження напруги',
                'zh-cn': '电压限制',
            },
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
            name: {
                en: 'Current Position',
                de: 'Aktuelle Position',
                ru: 'Текущая позиция',
                pt: 'Posição atual',
                nl: 'Huidige positie',
                fr: 'Poste actuel',
                it: 'Posizione attuale',
                es: 'Posición actual',
                pl: 'Obecna pozycja',
                uk: 'Поточна позиція',
                'zh-cn': '当前位置',
            },
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
            name: {
                en: 'Target Position',
                de: 'Zielposition',
                ru: 'Целевая позиция',
                pt: 'Posição do alvo',
                nl: 'Doelpositie',
                fr: 'Position cible',
                it: 'Posizione di destinazione',
                es: 'Posición objetivo',
                pl: 'Pozycja docelowa',
                uk: 'Цільова позиція',
                'zh-cn': '目标位置',
            },
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
            name: {
                en: 'Cover Status',
                de: 'Coverstatus',
                ru: 'Статус обложки',
                pt: 'Status da capa',
                nl: 'Dekkingsstatus',
                fr: 'Statut de la couverture',
                it: 'Stato di copertura',
                es: 'Estado de la cubierta',
                pl: 'Status okładki',
                uk: 'Статус обкладинки',
                'zh-cn': '封面状态',
            },
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
            name: {
                en: 'Power',
                de: 'Leistung',
                ru: 'Власть',
                pt: 'Poder',
                nl: 'Stroom',
                fr: 'Pouvoir',
                it: 'Energia',
                es: 'Fuerza',
                pl: 'Moc',
                uk: 'потужність',
                'zh-cn': '力量',
            },
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
            mqtt_publish_funct: value => JSON.parse(value).current,
        },
        common: {
            name: {
                en: 'Current',
                de: 'Stromstärke',
                ru: 'Сила тока',
                pt: 'Amperagem',
                nl: 'Amperage',
                fr: 'Intensité de courant',
                it: 'Amperaggio',
                es: 'Amperaje',
                pl: 'Natężenie w amperach',
                uk: 'Сила струму',
                'zh-cn': '安培数',
            },
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
            name: {
                en: 'Energy',
                de: 'Energie',
                ru: 'Энергия',
                pt: 'Energia',
                nl: 'Energie',
                fr: 'Énergie',
                it: 'Energia',
                es: 'Energía',
                pl: 'Energia',
                uk: 'Енергія',
                'zh-cn': '活力',
            },
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
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
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

    deviceObj[`Cover${coverId}.temperatureC`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
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

    deviceObj[`Cover${coverId}.temperatureF`] = {
        device_mode: 'cover',
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/cover:${coverId}`,
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
}

/**
 * Adds a generic power definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param devicePowerId
 * @param hasExternalPower
 */
function addDevicePower(deviceObj, devicePowerId, hasExternalPower) {
    deviceObj[`DevicePower${devicePowerId}.BatteryVoltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
            mqtt_publish_funct: value => JSON.parse(value).battery.V,
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
            mqtt_publish_funct: value => JSON.parse(value).battery.percent,
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

    if (hasExternalPower) {
        deviceObj[`DevicePower${devicePowerId}.ExternalPower`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/devicepower:${devicePowerId}`,
                mqtt_publish_funct: value => JSON.parse(value).external.present,
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
}

/**
 * Adds a generic temperature sensor definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param sensorId
 */
function addTemperatureSensor(deviceObj, sensorId) {
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
    };

    deviceObj[`Temperature${sensorId}.Fahrenheit`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/temperature:${sensorId}`,
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
            name: {
                en: 'Offset',
                de: 'Offset',
                ru: 'Компенсировать',
                pt: 'Desvio',
                nl: 'Verschuiving',
                fr: 'Compenser',
                it: 'Offset',
                es: 'Compensar',
                pl: 'Zrównoważyć',
                uk: 'Зсув',
                'zh-cn': '抵消',
            },
            type: 'number',
            role: 'level.temperature',
            read: true,
            write: true,
            unit: '°C',
            def: 0,
            min: -50,
            max: 50,
        },
    };
}

/**
 * Adds a generic humidity sensor definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param sensorId
 */
function addHumiditySensor(deviceObj, sensorId) {
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
            mqtt_publish_funct: value => JSON.parse(value).rh,
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

/**
 * Adds a generic voltmeter sensor definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Voltmeter
 *
 * @param deviceObj
 * @param sensorId
 */
function addVoltmeterSensor(deviceObj, sensorId) {
    deviceObj[`Voltmeter${sensorId}.ChannelName`] = {
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
                    method: 'Voltmeter.SetConfig',
                    params: { id: sensorId, config: { name: value } },
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
            name: {
                en: 'Range',
                de: 'Bereich',
                ru: 'Диапазон',
                pt: 'Faixa',
                nl: 'Bereik',
                fr: 'Gamme',
                it: 'Allineare',
                es: 'Rango',
                pl: 'Zakres',
                uk: 'Діапазон',
                'zh-cn': '范围',
            },
            type: 'number',
            role: 'level',
            read: true,
            write: true,
            //unit: '%',
            def: 0,
            min: 0,
            max: 1,
        },
    };

    deviceObj[`Voltmeter${sensorId}.voltage`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/voltmeter:${sensorId}`,
            mqtt_publish_funct: value => JSON.parse(value).voltage,
        },
        common: {
            name: {
                en: `Voltage ${sensorId}`,
                de: `Spannung ${sensorId}`,
                ru: `Напряжение ${sensorId}`,
                pt: `Tensão ${sensorId}`,
                nl: `Spanning ${sensorId}`,
                fr: `Tension ${sensorId}`,
                it: `Voltaggio ${sensorId}`,
                es: `Voltaje ${sensorId}`,
                pl: `Woltaż ${sensorId}`,
                uk: `Напруга ${sensorId}`,
                'zh-cn': `电压 ${sensorId}`,
            },
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            unit: 'V',
            def: 0,
        },
    };
}

/**
 * Adds a generic energymeter definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param emId
 * @param phases
 */
function addEnergyMeter(deviceObj, emId, phases) {
    deviceObj[`EM${emId}.ChannelName`] = {
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

    deviceObj[`EM${emId}.CurrentN`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value)[`n_current`];
            },
        },
        common: {
            name: {
                en: 'Current N',
                de: 'Stromstärke N',
                ru: 'Сила тока N',
                pt: 'Amperagem N',
                nl: 'Amperage N',
                fr: 'Ampérage N',
                it: 'Amperaggio N',
                es: 'Amperaje N',
                pl: 'Natężenie prądu N',
                uk: 'Сила струму Н',
                'zh-cn': '安培数 N',
            },
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    };

    deviceObj[`EM${emId}.TotalCurrent`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value)[`total_current`];
            },
        },
        common: {
            name: {
                en: 'Total Current',
                de: 'Gesamtstromstärke',
                ru: 'Общий ток',
                pt: 'Corrente total',
                nl: 'Totale stroom',
                fr: 'Courant total',
                it: 'Corrente totale',
                es: 'Corriente total',
                pl: 'Całkowity prąd',
                uk: 'Загальний струм',
                'zh-cn': '总电流',
            },
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    };

    deviceObj[`EM${emId}.TotalActivePower`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value)[`total_act_power`];
            },
        },
        common: {
            name: {
                en: 'Total Active Power',
                de: 'Gesamtwirkleistung',
                ru: 'Общая активная мощность',
                pt: 'Potência Ativa Total',
                nl: 'Totaal actief vermogen',
                fr: 'Puissance active totale',
                it: 'Potenza attiva totale',
                es: 'Potencia activa total',
                pl: 'Całkowita moc czynna',
                uk: 'Загальна активна потужність',
                'zh-cn': '总有功功率',
            },
            type: 'number',
            role: 'value.power.active',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    };

    deviceObj[`EM${emId}.TotalApparentPower`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/em:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value)[`total_aprt_power`];
            },
        },
        common: {
            name: {
                en: 'Total Apparent Power',
                de: 'Gesamtscheinleistung',
                ru: 'Общая кажущаяся мощность',
                pt: 'Potência aparente total',
                nl: 'Totaal schijnbaar vermogen',
                fr: 'Puissance apparente totale',
                it: 'Potenza apparente totale',
                es: 'Potencia aparente total',
                pl: 'Całkowita moc pozorna',
                uk: 'Загальна видима потужність',
                'zh-cn': '总视在功率',
            },
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
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_voltage`];
                },
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

        deviceObj[`EM${emId}.Current${phaseUp}`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_current`];
                },
            },
            common: {
                name: {
                    en: 'Current',
                    de: 'Stromstärke',
                    ru: 'Сила тока',
                    pt: 'Amperagem',
                    nl: 'Amperage',
                    fr: 'Intensité de courant',
                    it: 'Amperaggio',
                    es: 'Amperaje',
                    pl: 'Natężenie w amperach',
                    uk: 'Сила струму',
                    'zh-cn': '安培数',
                },
                type: 'number',
                role: 'value.current',
                read: true,
                write: false,
                def: 0,
                unit: 'A',
            },
        };

        deviceObj[`EM${emId}.ActivePower${phaseUp}`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_act_power`];
                },
            },
            common: {
                name: {
                    en: 'Active Power',
                    de: 'Wirkleistung',
                    ru: 'Активная мощность',
                    pt: 'Potência Ativa',
                    nl: 'Actief vermogen',
                    fr: 'Puissance active',
                    it: 'Potenza attiva',
                    es: 'Potencia activa',
                    pl: 'Moc czynna',
                    uk: 'Активна потужність',
                    'zh-cn': '有功功率',
                },
                type: 'number',
                role: 'value.power.active',
                read: true,
                write: false,
                def: 0,
                unit: 'W',
            },
        };

        deviceObj[`EM${emId}.ApparentPower${phaseUp}`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_aprt_power`];
                },
            },
            common: {
                name: {
                    en: 'Apparent Power',
                    de: 'Scheinleistung',
                    ru: 'Кажущаяся мощность',
                    pt: 'Poder Aparente',
                    nl: 'Schijnbare kracht',
                    fr: 'Puissance apparente',
                    it: 'Potenza apparente',
                    es: 'Potencia aparente',
                    pl: 'Moc pozorna',
                    uk: 'Видима потужність',
                    'zh-cn': '视在功率',
                },
                type: 'number',
                role: 'value.power',
                read: true,
                write: false,
                def: 0,
                unit: 'VA',
            },
        };

        deviceObj[`EM${emId}.PowerFactor${phaseUp}`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/em:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_pf`];
                },
            },
            common: {
                name: {
                    en: 'Power Factor',
                    de: 'Leistungsfaktor',
                    ru: 'Коэффициент мощности',
                    pt: 'Fator de potência',
                    nl: 'Vermogensfactor',
                    fr: 'Facteur de puissance',
                    it: 'Fattore di potenza',
                    es: 'Factor de potencia',
                    pl: 'Współczynnik mocy',
                    uk: 'Фактор потужності',
                    'zh-cn': '功率因数',
                },
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
 * Adds a generic energymeter data definition for Gen 2+ devices
 *
 * @param deviceObj
 * @param emId
 * @param phases
 */
function addEnergyMeterData(deviceObj, emId, phases) {
    deviceObj[`EMData${emId}.TotalActiveEnergy`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value)[`total_act`];
            },
        },
        common: {
            name: {
                en: 'Total Energy',
                de: 'Gesamtenergie',
                ru: 'Общая энергия',
                pt: 'Energia Total',
                nl: 'Totale energie',
                fr: 'Énergie totale',
                it: 'Energia totale',
                es: 'Energía total',
                pl: 'Całkowita energia',
                uk: 'Загальна енергія',
                'zh-cn': '总能量',
            },
            type: 'number',
            role: 'value.energy.consumed',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    };

    deviceObj[`EMData${emId}.TotalActiveReturnEnergy`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
            mqtt_publish_funct: value => {
                return JSON.parse(value)[`total_act_ret`];
            },
        },
        common: {
            name: {
                en: 'Total Returned Energy',
                de: 'Gesamte zurückgegebene Energie',
                ru: 'Общая возвращенная энергия',
                pt: 'Energia Total Retornada',
                nl: 'Totaal teruggegeven energie',
                fr: 'Énergie totale restituée',
                it: 'Energia totale restituita',
                es: 'Energía total devuelta',
                pl: 'Całkowita zwrócona energia',
                uk: 'Загальна повернута енергія',
                'zh-cn': '总回馈能量',
            },
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
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_total_act_energy`];
                },
            },
            common: {
                name: {
                    en: 'Energy',
                    de: 'Energie',
                    ru: 'Энергия',
                    pt: 'Energia',
                    nl: 'Energie',
                    fr: 'Énergie',
                    it: 'Energia',
                    es: 'Energía',
                    pl: 'Energia',
                    uk: 'Енергія',
                    'zh-cn': '活力',
                },
                type: 'number',
                role: 'value.energy.consumed',
                read: true,
                write: false,
                def: 0,
                unit: 'Wh',
            },
        };

        deviceObj[`EMData${emId}.TotalActiveReturnEnergy${phaseUp}`] = {
            mqtt: {
                mqtt_publish: `<mqttprefix>/status/emdata:${emId}`,
                mqtt_publish_funct: value => {
                    return JSON.parse(value)[`${phase}_total_act_ret_energy`];
                },
            },
            common: {
                name: {
                    en: 'Returned Energy',
                    de: 'Zurückgegebene Energie',
                    ru: 'Возвращенная энергия',
                    pt: 'Energia Retornada',
                    nl: 'Teruggegeven energie',
                    fr: 'Énergie restituée',
                    it: 'Energia restituita',
                    es: 'Energía devuelta',
                    pl: 'Zwrócona energia',
                    uk: 'Повернена енергія',
                    'zh-cn': '回馈能量',
                },
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
 * Adds states for the Shelly Plus AddOn
 * see
 * https://kb.shelly.cloud/knowledge-base/shelly-plus-add-on
 * https://shelly-api-docs.shelly.cloud/gen2/Addons/ShellySensorAddon
 *
 * @param deviceObj
 */
function addPlusAddon(deviceObj) {
    deviceObj['Ext.input100digital'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/input:100`,
            mqtt_publish_funct: value => JSON.parse(value)?.state,
        },
        common: {
            name: {
                en: 'Input 100 (digital)',
                de: 'Eingang 100 (digital)',
                ru: 'Вход 100 (цифровой)',
                pt: 'Entrada 100 (digital)',
                nl: 'Ingang 100 (digitaal)',
                fr: 'Entrée 100 (numérique)',
                it: 'Ingresso 100 (digitale)',
                es: 'Entrada 100 (digital)',
                pl: 'Wejście 100 (cyfrowe)',
                uk: 'Вхід 100 (цифровий)',
                'zh-cn': '输入 100（数字）',
            },
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
            name: {
                en: 'Input 100 (analog)',
                de: 'Eingang 100 (analog)',
                ru: 'Вход 100 (аналоговый)',
                pt: 'Entrada 100 (analógica)',
                nl: 'Ingang 100 (analoog)',
                fr: 'Entrée 100 (analogique)',
                it: 'Ingresso 100 (analogico)',
                es: 'Entrada 100 (analógica)',
                pl: 'Wejście 100 (analogowe)',
                uk: 'Вхід 100 (аналоговий)',
                'zh-cn': '输入 100（模拟）',
            },
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
            name: {
                en: 'Input 101 (digital)',
                de: 'Eingang 101 (digital)',
                ru: 'Вход 101 (цифровой)',
                pt: 'Entrada 101 (digital)',
                nl: 'Ingang 101 (digitaal)',
                fr: 'Entrée 101 (numérique)',
                it: 'Ingresso 101 (digitale)',
                es: 'Entrada 101 (digital)',
                pl: 'Wejście 101 (cyfrowe)',
                uk: 'Вхід 101 (цифровий)',
                'zh-cn': '输入 101（数字）',
            },
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
            name: {
                en: 'Input 101 (analog)',
                de: 'Eingang 101 (analog)',
                ru: 'Вход 101 (аналоговый)',
                pt: 'Entrada 101 (analógica)',
                nl: 'Ingang 101 (analoog)',
                fr: 'Entrée 101 (analogique)',
                it: 'Ingresso 101 (analogico)',
                es: 'Entrada 101 (analógica)',
                pl: 'Wejście 101 (analogowe)',
                uk: 'Вхід 101 (аналоговий)',
                'zh-cn': '输入 101（模拟）',
            },
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
            name: {
                en: 'Voltage',
                de: 'Spannung',
                ru: 'Напряжение',
                pt: 'Tensão',
                nl: 'Spanning',
                fr: 'Tension',
                it: 'Voltaggio',
                es: 'Voltaje',
                pl: 'Woltaż',
                uk: 'Напруга',
                'zh-cn': '电压',
            },
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

    deviceObj['Ext.temperature100F'] = {
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
    };

    deviceObj['Ext.temperature101C'] = {
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
    };

    deviceObj['Ext.temperature101F'] = {
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
    };

    deviceObj['Ext.temperature102C'] = {
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
    };

    deviceObj['Ext.temperature102F'] = {
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
    };

    deviceObj['Ext.temperature103C'] = {
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
    };

    deviceObj['Ext.temperature103F'] = {
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
    };

    deviceObj['Ext.temperature104C'] = {
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
    };

    deviceObj['Ext.temperature104F'] = {
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
    };

    deviceObj['Ext.humidity100'] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/humidity:100`,
            mqtt_publish_funct: value => JSON.parse(value).rh,
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
}

/**
 * Adds states for the Shelly Pro Output Add-On
 * see
 * https://kb.shelly.cloud/knowledge-base/shelly-pro-3em-switch-add-on
 * https://shelly-api-docs.shelly.cloud/gen2/Addons/ShellyProOutputAddon
 *
 * @param deviceObj
 */
function addProOutputAddon(deviceObj) {
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
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Выключатель',
                pt: 'Trocar',
                nl: 'Schakelaar',
                fr: 'Changer',
                it: 'Interruttore',
                es: 'Cambiar',
                pl: 'Przełącznik',
                uk: 'Перемикач',
                'zh-cn': '转变',
            },
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
 *
 * This function defines the necessary states and MQTT commands for controlling an RGB light
 * device using the Shelly Gen 2 platform. The RGB light can be turned on/off, its brightness
 * and color (in RGB or HEX format) can be adjusted. Additionally, the
 * function supports smooth transitions between colors or brightness levels by specifying a
 * transition time.
 *
 * @param deviceObj - The device object where states and commands are added.
 * @param rgbId - The ID of the RGB light (used in MQTT topics and commands).
 *
 * The following states are added:
 * - Switch (on/off control)
 * - Brightness (brightness level from 0 to 100)
 * - ColorRGB (RGB color in string format, separated by commas)
 * - ColorHEX (RGB color in HEX format, prefixed by '#')
 * - Transition Time (duration of the transition effect in seconds)
 * - Channel Name (name of the RGB light channel)
 * - Initial State (the initial state of the RGB light after power-on)
 * - Source (source of the last command)
 * - Event (RGB light event notifications)
 */
function addRGB(deviceObj, rgbId) {
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
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Schakelaar',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Przełącznik',
                'zh-cn': '开关',
            },
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
            name: {
                en: 'Brightness',
                de: 'Helligkeit',
                ru: 'Яркость',
                pt: 'Brilho',
                nl: 'Helderheid',
                fr: 'Luminosité',
                it: 'Luminosità',
                es: 'Brillo',
                pl: 'Jasność',
                'zh-cn': '亮度',
            },
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
            name: {
                en: 'Color',
                de: 'Farbe',
                ru: 'Цвет',
                pt: 'Cor',
                nl: 'Kleur',
                fr: 'Couleur',
                it: 'Colore',
                es: 'Color',
                pl: 'Kolor',
                'zh-cn': '颜色',
            },
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
                    .rgb.map(x => x.toString(16).padStart(2, '0'))
                    .join('')}`,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGB.Set',
                    params: { id: rgbId, rgb: value.match(/[a-f0-9]{2}/gi).map(x => parseInt(x, 16)) },
                });
            },
        },
        common: {
            name: {
                en: 'Color HEX',
                de: 'Farbe',
                ru: 'Цвет',
                pt: 'Cor',
                nl: 'Kleur',
                fr: 'Couleur',
                it: 'Colore',
                es: 'Color',
                pl: 'Kolor',
                'zh-cn': '颜色',
            },
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
            name: {
                en: 'Transition Time',
                de: 'Übergangszeit',
                ru: 'Время перехода',
                pt: 'Tempo de transição',
                nl: 'Overgangstijd',
                fr: 'Temps de transition',
                it: 'Tempo di transizione',
                es: 'Tiempo de transición',
                pl: 'Czas przejścia',
                'zh-cn': '过渡时间',
            },
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
            name: {
                en: 'Initial State',
                de: 'Initialer Zustand',
                ru: 'Начальное состояние',
                pt: 'Estado Inicial',
                nl: 'Initiële staat',
                fr: 'État initial',
                it: 'Stato iniziale',
                es: 'Estado inicial',
                pl: 'Stan początkowy',
                uk: 'Початковий стан',
                'zh-cn': '初始状态',
            },
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
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
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
            name: {
                en: 'RGB Event',
                de: 'RGB-Ereignis',
                ru: 'RGB-событие',
                pt: 'Evento RGB',
                nl: 'RGB-gebeurtenis',
                fr: 'Événement RVB',
                it: 'Evento RGB',
                es: 'Evento RGB',
                pl: 'Wydarzenie RGB',
                uk: 'Подія RGB',
                'zh-cn': 'RGB 事件',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds a generic RGBW light definition for Gen 2+ devices
 *
 * This function defines the necessary states and MQTT commands for controlling an RGBW light
 * device using the Shelly Gen 2 platform. In addition to RGB color control, it supports adjusting
 * the white channel intensity and applying a transition time for smooth color or brightness changes.
 * It allows for turning the light on/off, adjusting brightness, controlling the RGB color,
 * adjusting the white channel intensity, and specifying transition effects for smoother changes.
 *
 * @param deviceObj - The device object where states and commands are added.
 * @param rgbwId - The ID of the RGBW light (used in MQTT topics and commands).
 *
 * The following states are added:
 * - Switch (on/off control)
 * - Brightness (brightness level from 0 to 100)
 * - ColorRGB (RGB color in string format, separated by commas)
 * - Color (RGB color in HEX format, prefixed by '#')
 * - White (white channel intensity level from 0 to 255)
 * - Transition Time (duration of the transition effect in seconds)
 * - Channel Name (custom name for the channel)
 * - Initial State (the initial state of the light after power-on)
 * - Source (source of the last command issued to the light)
 * - Event (event notifications related to the light)
 */
function addRGBW(deviceObj, rgbwId) {
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
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Schakelaar',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Przełącznik',
                'zh-cn': '开关',
            },
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
            name: {
                en: 'Brightness',
                de: 'Helligkeit',
                ru: 'Яркость',
                pt: 'Brilho',
                nl: 'Helderheid',
                fr: 'Luminosité',
                it: 'Luminosità',
                es: 'Brillo',
                pl: 'Jasność',
                'zh-cn': '亮度',
            },
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
            name: {
                en: 'Color RGB',
                de: 'Farbe',
                ru: 'Цвет',
                pt: 'Cor',
                nl: 'Kleur',
                fr: 'Couleur',
                it: 'Colore',
                es: 'Color',
                pl: 'Kolor',
                'zh-cn': '颜色',
            },
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
                    .rgb.map(x => x.toString(16).padStart(2, '0'))
                    .join('')}`,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'RGBW.Set',
                    params: { id: rgbwId, rgb: value.match(/[a-f0-9]{2}/gi).map(x => parseInt(x, 16)) },
                });
            },
        },
        common: {
            name: {
                en: 'Color HEX',
                de: 'Farbe',
                ru: 'Цвет',
                pt: 'Cor',
                nl: 'Kleur',
                fr: 'Couleur',
                it: 'Colore',
                es: 'Color',
                pl: 'Kolor',
                'zh-cn': '颜色',
            },
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
            name: {
                en: 'White Channel',
                de: 'Weiß-Kanal',
                ru: 'Белый канал',
                pt: 'Canal branco',
                nl: 'Wit kanaal',
                fr: 'Canal blanc',
                it: 'Canale bianco',
                es: 'Canal blanco',
                pl: 'Biały kanał',
                'zh-cn': '白色通道',
            },
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
            name: {
                en: 'Transition Time',
                de: 'Übergangszeit',
                ru: 'Время перехода',
                pt: 'Tempo de transição',
                nl: 'Overgangstijd',
                fr: 'Temps de transition',
                it: 'Tempo di transizione',
                es: 'Tiempo de transición',
                pl: 'Czas przejścia',
                'zh-cn': '过渡时间',
            },
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
            name: {
                en: 'Initial State',
                de: 'Anfangszustand',
                ru: 'Начальное состояние',
                pt: 'Estado Inicial',
                nl: 'Initiële staat',
                fr: 'État initial',
                it: 'Stato iniziale',
                es: 'Estado inicial',
                pl: 'Stan początkowy',
                uk: 'Початковий стан',
                'zh-cn': '初始状态',
            },
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
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
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
            name: {
                en: 'RGBW Event',
                de: 'RGBW-Ereignis',
                ru: 'Событие RGBW',
                pt: 'Evento RGBW',
                nl: 'RGBW-evenement',
                fr: 'Événement RGBW',
                it: 'Evento RGBW',
                es: 'Evento RGBW',
                pl: 'Wydarzenie RGBW',
                uk: 'Подія RGBW',
                'zh-cn': 'RGBW 活动',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    };
}
/**
 * Adds a generic Temp-Sensor definition for Shelly Pro3EM63 devices
 *
 * The following states are added:
 * - EM63 Temperature in °C and °F
 *
 * @param deviceObj - The device object where states and commands are added.
 */
function addEMTemperatureSensor(deviceObj) {
    deviceObj[`EMTemperature.tC`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetStatus?id=0`,
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).tC) : undefined),
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
    deviceObj[`EMTemperature.tF`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetStatus?id=0`,
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).tF) : undefined),
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
    deviceObj[`EMTemperature.ReportThreshold`] = {
        mqtt: {
            http_publish: `/rpc/Temperature.GetConfig?id=0`,
            http_publish_funct: value => (value ? JSON.parse(value).report_thr_C : undefined),
        },
        common: {
            name: {
                en: 'Threshold',
                de: 'Schwellwert',
                ru: 'Порог',
                pt: 'Limitação',
                nl: 'Drempelwaarde',
                fr: 'Seuil',
                it: 'Soglia',
                es: 'Umbral',
                pl: 'Próg',
                uk: 'Пороги',
                'zh-cn': '阈值',
            },
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
            name: {
                en: 'Offset',
                de: 'Offset',
                ru: 'Оффсет',
                pt: 'Fora',
                nl: 'Offset',
                fr: 'Dépassement',
                it: 'Offset',
                es: 'Offset',
                pl: 'Offset',
                uk: 'Оновити',
                'zh-cn': '折换',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    };
}
module.exports = {
    addEM1,
    addPM1,
    addIlluminanceSensor,
    addSwitch,
    addInput,
    addAnalogInput,
    addCounterInput,
    addLight,
    addCover,
    addDevicePower,
    addHumiditySensor,
    addTemperatureSensor,
    addVoltmeterSensor,
    addEnergyMeter,
    addEnergyMeterData,
    addPlusAddon,
    addProOutputAddon,
    addRGB,
    addRGBW,
    addEMTemperatureSensor,
};
