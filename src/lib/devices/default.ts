import type { DeviceDefinition } from '../deviceTypes';
import * as shellyHelper from '../shelly-helper';

/**
 * Default, used for all Shelly devices Gen 1
 * https://shelly-api-docs.shelly.cloud/gen1/
 */
const defaultsgen1: DeviceDefinition = {
    gen: {
        coap: {
            init_funct: self => self.getDeviceGen(),
        },
        mqtt: {
            init_funct: self => self.getDeviceGen(),
        },
        common: {
            name: 'Device generation',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: {
                1: 'Generation 1',
                2: 'Generation 2',
                3: 'Generation 3',
                4: 'Generation 4',
            },
        },
    },
    online: {
        coap: {
            init_funct: self => self.isOnline(),
        },
        mqtt: {
            init_funct: self => self.isOnline(),
        },
        common: {
            name: 'Device online',
            type: 'boolean',
            role: 'indicator.reachable',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('wifi'),
        },
    },
    firmware: {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).update.has_update : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).update.has_update : undefined),
        },
        common: {
            name: 'New firmware available',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    firmwareupdate: {
        coap: {
            http_cmd: '/ota?update=true',
        },
        mqtt: {
            http_cmd: '/ota?update=true',
        },
        common: {
            name: 'Update firmware version',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            icon: shellyHelper.getIcon('update'),
        },
    },
    uptime: {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).uptime) : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).uptime) : undefined),
        },
        common: {
            name: 'Device running since',
            type: 'number',
            role: 'value.interval',
            unit: 'sec',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('clock'),
        },
    },
    version: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).fw : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).fw : undefined),
        },
        common: {
            name: 'Firmware version',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('chip'),
        },
    },
    hostname: {
        coap: {
            init_funct: self => self.getIP(),
        },
        mqtt: {
            init_funct: self => self.getIP(),
        },
        common: {
            name: 'Device IP address or hostname',
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false,
        },
    },
    id: {
        coap: {
            init_funct: self => self.getDeviceId(),
        },
        mqtt: {
            init_funct: self => self.getDeviceId(),
        },
        common: {
            name: 'Device ID',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    class: {
        coap: {
            init_funct: self => self.getDeviceClass(),
        },
        mqtt: {
            init_funct: self => self.getDeviceClass(),
        },
        common: {
            name: 'Device class',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    type: {
        coap: {
            init_funct: self => self.getDeviceType(),
        },
        mqtt: {
            init_funct: self => self.getDeviceType(),
        },
        common: {
            name: 'Device type',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    knowledgeBaseUrl: {
        coap: {
            init_funct: self => self.getKnowledgeBaseUrl(),
        },
        mqtt: {
            init_funct: self => self.getKnowledgeBaseUrl(),
        },
        common: {
            name: 'Knowledge base',
            type: 'string',
            role: 'url.blank',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('question'),
        },
    },
    authEnabled: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const authEnabled = value ? JSON.parse(value)?.login?.enabled : undefined;

                if (!authEnabled && self.config.httppassword) {
                    self.adapter.log.info(
                        `[authEnabled] ${self.getLogInfo()}: This device is not protected via restricted login (see adapter documentation for details)`,
                    );
                }

                return authEnabled;
            },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const authEnabled = value ? JSON.parse(value)?.login?.enabled : undefined;

                if (!authEnabled && self.config.httppassword) {
                    self.adapter.log.info(
                        `[authEnabled] ${self.getLogInfo()}: This device is not protected via restricted login (see adapter documentation for details)`,
                    );
                }

                return authEnabled;
            },
        },
        common: {
            name: 'Authentication enabled',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('auth'),
        },
    },
    rssi: {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value)?.wifi_sta?.rssi : 0),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value)?.wifi_sta?.rssi : 0),
        },
        common: {
            name: 'Received Signal Strength Indication',
            type: 'number',
            role: 'value',
            unit: 'dBm',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('signal'),
        },
    },
    reboot: {
        coap: {
            http_cmd: '/reboot',
        },
        mqtt: {
            http_cmd: '/reboot',
        },
        common: {
            name: 'Reboot',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    protocol: {
        coap: {
            init_value: 'coap',
        },
        mqtt: {
            init_value: 'mqtt',
        },
        common: {
            name: 'Protocol',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    name: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined,
            http_cmd: '/settings',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Device name',
            type: 'string',
            role: 'info.name',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Sys.eco': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).eco_mode_enabled : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ eco_mode_enabled: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).eco_mode_enabled : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ eco_mode_enabled: value }),
        },
        common: {
            name: 'Eco Mode',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Sys.sntp': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).sntp.server : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ sntp_server: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).sntp.server : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ sntp_server: value }),
        },
        common: {
            name: 'SNTP Server',
            type: 'string',
            role: 'text.url',
            read: true,
            write: true,
        },
    },
    'Sys.timezone': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const timeZone = value ? JSON.parse(value).timezone : undefined;

                if (timeZone && timeZone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
                    self.adapter.log.info(
                        `[Sys.timezone] ${self.getLogInfo()}: Configured timezone "${timeZone}" and system timezone "${Intl.DateTimeFormat().resolvedOptions().timeZone}" do not match. Please check configuration`,
                    );
                }

                return timeZone;
            },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const timeZone = value ? JSON.parse(value).timezone : undefined;

                if (timeZone && timeZone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
                    self.adapter.log.info(
                        `[Sys.timezone] ${self.getLogInfo()}: Configured timezone "${timeZone}" and system timezone "${Intl.DateTimeFormat().resolvedOptions().timeZone}" do not match. Please check configuration`,
                    );
                }

                return timeZone;
            },
        },
        common: {
            name: 'Timezone',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    'Sys.lat': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lat : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lat : undefined),
        },
        common: {
            name: 'Latitude',
            type: 'number',
            role: 'value.gps.latitude',
            read: true,
            write: false,
        },
    },
    'Sys.lon': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lng : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lng : undefined),
        },
        common: {
            name: 'Longitude',
            type: 'number',
            role: 'value.gps.longitude',
            read: true,
            write: false,
        },
    },
    'Mqtt.topicPrefix': {
        coap: {
            no_display: true,
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value)?.mqtt?.id : undefined;
                if (result && self.getMqttPrefix() && result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(
                        `[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`,
                    );
                }

                return result;
            },
        },
        common: {
            name: 'Topic prefix',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Mqtt.clientId': {
        coap: {
            no_display: true,
        },
        mqtt: {
            init_funct: self => self.getId(),
            http_publish: '/settings',
            http_publish_funct: (value, self) => self.getId(),
        },
        common: {
            name: 'Client ID',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Cloud.enabled': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value)?.cloud?.enabled : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value)?.cloud?.enabled : undefined),
        },
        common: {
            name: 'Cloud Connection',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: false,
        },
    },
};

/**
 * Default, used for all Shelly devices Gen 2+
 * https://shelly-api-docs.shelly.cloud/gen2/
 */
const defaultsgen2: DeviceDefinition = {
    gen: {
        mqtt: {
            init_funct: self => self.getDeviceGen(),
        },
        common: {
            name: 'Device generation',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: {
                1: 'Generation 1',
                2: 'Generation 2',
                3: 'Generation 3',
                4: 'Generation 4',
            },
        },
    },
    online: {
        mqtt: {
            init_funct: self => self.isOnline(),
        },
        common: {
            name: 'Device online',
            type: 'boolean',
            role: 'indicator.reachable',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('wifi'),
        },
    },
    firmware: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: value => {
                /*
                "sys": {
                    ...
                    "available_updates": {
                        "stable": {
                            "version": "0.13.0"
                        }
                    }
                }
                */
                if (value) {
                    const valueObj = JSON.parse(value);
                    if (valueObj?.sys?.available_updates?.stable?.version) {
                        return true;
                    }
                }

                return false;
            },
        },
        common: {
            name: 'New firmware available',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    firmwareupdate: {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Shelly.Update',
                    params: { stage: 'stable' },
                });
            },
        },
        common: {
            name: 'Update firmware version',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            icon: shellyHelper.getIcon('update'),
        },
    },
    firmwareupdateProgress: {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];

                        if (typeof event === 'object' && event.component === 'sys' && event.event === 'ota_progress') {
                            return event.progress_percent;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Firmware update progress',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
            unit: '%',
        },
    },
    uptime: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: value => (value ? parseInt(JSON.parse(value).sys.uptime) : undefined),
        },
        common: {
            name: 'Device running since',
            type: 'number',
            role: 'value.interval',
            unit: 'sec',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('clock'),
        },
    },
    version: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: value => (value ? JSON.parse(value).fw_id : undefined),
        },
        common: {
            name: 'Firmware version',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('chip'),
        },
    },
    hostname: {
        mqtt: {
            init_funct: self => self.getIP(),
        },
        common: {
            name: 'Device IP address or hostname',
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false,
        },
    },
    id: {
        mqtt: {
            init_funct: self => self.getDeviceId(),
        },
        common: {
            name: 'Device ID',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    class: {
        mqtt: {
            init_funct: self => self.getDeviceClass(),
        },
        common: {
            name: 'Device class',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    type: {
        mqtt: {
            init_funct: self => self.getDeviceType(),
        },
        common: {
            name: 'Device type',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    model: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: value => (value ? JSON.parse(value).model : undefined),
        },
        common: {
            name: 'Device model',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    knowledgeBaseUrl: {
        mqtt: {
            init_funct: self => self.getKnowledgeBaseUrl(),
        },
        common: {
            name: 'Knowledge base',
            type: 'string',
            role: 'url.blank',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('question'),
        },
    },
    authEnabled: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value, self) => {
                const authEnabled = value ? JSON.parse(value).auth_en : undefined;

                if (!authEnabled && self.config.httppassword) {
                    self.adapter.log.info(
                        `[authEnabled] ${self.getLogInfo()}: This device is not protected via restricted login (see adapter documentation for details)`,
                    );
                }

                return authEnabled;
            },
        },
        common: {
            name: 'Authentication enabled',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('auth'),
        },
    },
    rssi: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: value => (value ? JSON.parse(value).wifi.rssi : undefined),
        },
        common: {
            name: 'Received Signal Strength Indication',
            type: 'number',
            role: 'value',
            unit: 'dBm',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('signal'),
        },
    },
    reboot: {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Shelly.Reboot' });
            },
        },
        common: {
            name: 'Reboot',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    protocol: {
        mqtt: {
            init_value: 'mqtt',
        },
        common: {
            name: 'Protocol',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    name: {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { device: { name: value } } },
                });
            },
        },
        common: {
            name: 'Device name',
            type: 'string',
            role: 'info.name',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Sys.eco': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).device.eco_mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { device: { eco_mode: value } } },
                });
            },
        },
        common: {
            name: 'Eco Mode',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Sys.sntp': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).sntp.server : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { sntp: { server: value } } },
                });
            },
        },
        common: {
            name: 'SNTP Server',
            type: 'string',
            role: 'text.url',
            read: true,
            write: true,
        },
    },
    'Sys.timezone': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value, self) => {
                const timeZone = value ? JSON.parse(value).location.tz : undefined;

                if (timeZone && timeZone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
                    self.adapter.log.info(
                        `[Sys.timezone] ${self.getLogInfo()}: Configured timezone "${timeZone}" and system timezone "${Intl.DateTimeFormat().resolvedOptions().timeZone}" do not match. Please check configuration`,
                    );
                }

                return timeZone;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { location: { tz: value } } },
                });
            },
        },
        common: {
            name: 'Timezone',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    },
    'Sys.lat': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).location.lat : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { location: { lat: value } } },
                });
            },
        },
        common: {
            name: 'Latitude',
            type: 'number',
            role: 'value.gps.latitude',
            read: true,
            write: true,
        },
    },
    'Sys.lon': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).location.lon : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { location: { lon: value } } },
                });
            },
        },
        common: {
            name: 'Longitude',
            type: 'number',
            role: 'value.gps.longitude',
            read: true,
            write: true,
        },
    },
    'Sys.debugEnabled': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).debug.mqtt.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Sys.SetConfig',
                    params: { config: { debug: { mqtt: { enable: value } } } },
                });
            },
        },
        common: {
            name: 'Debug mode',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'WiFi.apEnabled': {
        mqtt: {
            http_publish: '/rpc/WiFi.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value)?.ap?.enable : undefined), // e.g. Shelly Wall Display has no AP mode
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'WiFi.SetConfig',
                    params: { config: { ap: { enable: value } } },
                });
            },
        },
        common: {
            name: 'Access point enabled',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Mqtt.topicPrefix': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).topic_prefix : undefined;
                if (result && self.getMqttPrefix() && result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(
                        `[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`,
                    );
                }

                return result;
            },
        },
        common: {
            name: 'Topic prefix',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Mqtt.rpcNotifications': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).rpc_ntf : undefined;
                if (result === false) {
                    self.adapter.log.warn(
                        `[Mqtt.rpcNotifications] ${self.getLogInfo()}: "RPC Status Notifications" are disabled (see adapter documentation for details)`,
                    );
                }

                return result;
            },
        },
        common: {
            name: 'RPC status notifications enabled',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Mqtt.statusNotifications': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).status_ntf : undefined;
                if (result === false) {
                    self.adapter.log.warn(
                        `[Mqtt.statusNotifications] ${self.getLogInfo()}: "General Status Notifications" are disabled (see adapter documentation for details)`,
                    );
                }

                return result;
            },
        },
        common: {
            name: 'Generic status notifications enabled',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Mqtt.clientId': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).client_id : undefined),
        },
        common: {
            name: 'Client ID',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Cloud.enabled': {
        mqtt: {
            http_publish: `/rpc/Cloud.GetConfig`,
            http_publish_funct: value => (value ? JSON.parse(value)?.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Cloud.SetConfig',
                    params: { config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Cloud Connection',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    },
    'BLE.Event': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/events/ble`,
            mqtt_publish_funct: (value, self) => {
                try {
                    const val = JSON.parse(value);

                    self.adapter
                        .processBleMessage(val)
                        .catch(e => self.adapter.log.warn(`[BLE.Event] Unable process ble message "${value}": "${e}"`));
                    return JSON.stringify(val.payload, null, 2);
                } catch {
                    self.adapter.log.warn(`[BLE.Event] ${self.getLogInfo()}: Unable to parse json payload "${value}"`);

                    return JSON.stringify({ error: 'Unable to parse json' });
                }
            },
        },
        common: {
            name: 'BLE JSON-Payload (experimental!)',
            desc: 'Help: https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/master/docs/en/ble-devices.md',
            type: 'string',
            role: 'json',
            read: true,
            write: false,
        },
    },
};

const defaultsgen3 = Object.assign({}, defaultsgen2);
const defaultsgen4 = Object.assign({}, defaultsgen2);

export { defaultsgen1, defaultsgen2, defaultsgen3, defaultsgen4 };
