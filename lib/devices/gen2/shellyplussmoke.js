'use strict';

const shellyHelper = require('../../shelly-helper');
const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus Smoke / shellyplussmoke
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusSmoke
 */
const shellyplussmoke = {
    'Smoke0.ChannelName': {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Smoke.GetConfig?id=0`,
            http_publish_funct: async (value, self) => {
                return value ? await shellyHelper.setChannelName(self, 'Smoke0', JSON.parse(value).name) : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Smoke.SetConfig',
                    params: {id: 0, config: {name: value}},
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
    },
    'Smoke0.Alarm': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/smoke:0`,
            mqtt_publish_funct: value => JSON.parse(value).alarm,
        },
        common: {
            name: 'Smoke detected',
            type: 'boolean',
            role: 'sensor.alarm.fire',
            read: true,
            write: false,
        },
    },
    'Smoke0.Muted': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/smoke:0`,
            mqtt_publish_funct: value => JSON.parse(value).mute,
        },
        common: {
            name: 'Muted',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Smoke0.MuteAlarm': {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: async (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Smoke.Mute',
                    params: {id: 0},
                });
            },
        },
        common: {
            name: 'Mute alarm',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Smoke0.Event': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];

                        if (typeof event === 'object' && event.component === 'smoke:0') {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Smoke Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
};

shellyHelperGen2.addDevicePowerToGen2Device(shellyplussmoke, 0);

module.exports = {
    shellyplussmoke,
};
