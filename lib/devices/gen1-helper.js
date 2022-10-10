'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Adds a generic switch definition for gen 1 devices
 * @param {object} deviceObj
 * @param {number} relayId
 */
function addRelay(deviceObj, relayId) {

    deviceObj[`Relay${relayId}.ChannelName`] = {
        coap: {
            http_publish: `/settings/relay/${relayId}`,
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Relay${relayId}`, JSON.parse(value).name) : undefined; },
            http_cmd: `/settings/relay/${relayId}`,
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: `/settings/relay/${relayId}`,
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setChannelName(self, `Relay${relayId}`, JSON.parse(value).name) : undefined; },
            http_cmd: `/settings/relay/${relayId}`,
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
        },
    };

    deviceObj[`Relay${relayId}.Switch`] = {
        coap: {
            coap_publish: `1${relayId + 1}01`, // 1101 = Channel 1, 1201 = Channel 2, 1301 = Channel 3, ...
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: `/relay/${relayId}`,
            http_cmd_funct: async (value, self) => { return value ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, `Relay${relayId}.Timer`) } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, `Relay${relayId}.Timer`) }; },
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/relay/${relayId}`,
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: `shellies/<mqttprefix>/relay/${relayId}/command`,
            mqtt_cmd_funct: (value) => { return value ? 'on' : 'off'; },
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

    deviceObj[`Relay${relayId}.Input`] = {
        coap: {
            coap_publish: `2${relayId + 1}01`, // 2101 = Channel 1, 2201 = Channel 2, 2301 = Channel 3, ...
            coap_publish_funct: (value) => { return value === 1 || value === 2; },
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/input/${relayId}`,
            mqtt_publish_funct: (value) => { return value == 1; },
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
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            states: {
                0: 'Input',
                1: 'Detach',
            },
        },
    };

    deviceObj[`Relay${relayId}.Event`] = {
        coap: {
            coap_publish: `2${relayId + 1}02`, // 2102 = Channel 1, 2202 = Channel 2, 2302 = Channel 3, ...
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/input_event/${relayId}`,
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event : undefined; },
        },
        common: {
            name: {
                en: 'Event',
                de: 'Ereignis',
                ru: 'Событие',
                pt: 'Evento',
                nl: 'Avond',
                fr: 'Événement',
                it: 'Evento',
                es: 'Evento',
                pl: 'Event',
                'zh-cn': '活动',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'L': 'Long',
            },
        },
    };

    deviceObj[`Relay${relayId}.EventCount`] = {
        coap: {
            coap_publish: `2${relayId + 1}03`, // 2103 = Channel 1, 2203 = Channel 2, 2303 = Channel 3, ...
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/input_event/${relayId}`,
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).event_cnt : undefined; },
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: 'Compte de l\'événement',
                it: 'Conteggio eventi',
                es: 'Conteo de eventos',
                pl: 'Event',
                'zh-cn': '活动',
            },
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: {
                'S': '1xShort',
                'L': 'Long',
            },
        },
    };

    deviceObj[`Relay${relayId}.longpush`] = {
        coap: {
            coap_publish: `2${relayId + 1}02`, // 2102 = Channel 1, 2202 = Channel 2, 2302 = Channel 3, ...
            coap_publish_funct: (value) => { return value == 'L'; },
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/longpush/${relayId}`,
            mqtt_publish_funct: (value) => { return value == 1; },
        },
        common: {
            name: {
                en: 'Button pushed long',
                de: 'Knopf lange gedrückt',
                ru: 'Кнопка подтолкнула долго',
                pt: 'Botão empurrado por muito tempo',
                nl: 'Button duwde lang',
                fr: 'Button a poussé longtemps',
                it: 'Pulsante spinto lungo',
                es: 'Button empujó mucho tiempo',
                pl: 'Button nasilił się długo',
                'zh-cn': '布顿旷日持久的推动',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    };

    // Just exists once
    if (relayId === 0) {
        deviceObj[`Relay${relayId}.longpushtime`] = {
            coap: {
                http_publish: '/settings',
                http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
                http_cmd: '/settings',
                http_cmd_funct: (value) => { return { longpush_time: value }; },
            },
            mqtt: {
                http_publish: '/settings',
                http_publish_funct: (value) => { return value ? JSON.parse(value).longpush_time : undefined; },
                http_cmd: '/settings',
                http_cmd_funct: (value) => { return { longpush_time: value }; },
            },
            common: {
                name: {
                    en: 'Time for long button push',
                    de: 'Zeit für langen Knopfdruck',
                    ru: 'Время для длинной кнопки нажмите',
                    pt: 'Tempo para apertar botão longo',
                    nl: 'Tijd voor lange knop',
                    fr: 'Time for long bouton push',
                    it: 'Tempo per pulsante lungo',
                    es: 'Tiempo para pulsar botón largo',
                    pl: 'Czas na długi przycisk',
                    'zh-cn': 'A. 长顿推动时间',
                },
                type: 'number',
                role: 'state',
                unit: 'ms',
                min: 1,
                max: 5000,
                read: true,
                write: true,
            },
        };
    }

    deviceObj[`Relay${relayId}.source`] = {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[relayId].source : undefined; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).relays[relayId].source : undefined; },
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

module.exports = {
    addRelay: addRelay,
};
