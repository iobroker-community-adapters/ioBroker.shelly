'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Default, used from all Shelly devices Gen 1
 * https://shelly-api-docs.shelly.cloud/gen1/
 */
const defaultsgen1 = {
    'gen': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceGen(); }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceGen(); }
        },
        common: {
            'name': 'Device generation',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'online': {
        coap: {
            coap_init_value: false
        },
        mqtt: {
            mqtt_init_value: false
        },
        common: {
            'name': 'Online',
            'type': 'boolean',
            'role': 'indicator.reachable',
            'read': true,
            'write': false
        }
    },
    'firmware': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).update.has_update : undefined; }
        },
        mqtt: {
            mqtt_publish: 'shellies/announce',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).new_fw : false; }
        },
        common: {
            'name': 'New firmware available',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'firmwareupdate': {
        coap: {
            http_cmd: '/ota?update=true',
        },
        mqtt: {
            http_cmd: '/ota?update=true',
        },
        common: {
            'name': 'Update Firmware',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    },
    'uptime': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? parseInt(JSON.parse(value).uptime) : undefined; }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? parseInt(JSON.parse(value).uptime) : undefined; }
        },
        common: {
            'name': 'Uptime',
            'type': 'number',
            'role': 'info',
            'unit': 'sec',
            'read': true,
            'write': false
        }
    },
    'version': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).fw : undefined; }
        },
        mqtt: {
            mqtt_publish: 'shellies/announce',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).fw_ver : undefined; }
        },
        common: {
            'name': 'Firmware version',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'hostname': {
        coap: {
        },
        mqtt: {
        },
        common: {
            'name': 'Device Hostname',
            'type': 'string',
            'role': 'info.ip',
            'read': true,
            'write': false
        }
    },
    'id': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceId(); }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceId(); }
        },
        common: {
            'name': 'Device Id',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'class': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceClass(); }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceClass(); }
        },
        common: {
            'name': 'Device class',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'type': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceType(); }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value, self) => { return self.getDeviceType(); }
        },
        common: {
            'name': 'Device type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'rssi': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
        },
        common: {
            'name': 'Device RSSI status',
            'type': 'number',
            'role': 'value',
            'unit': 'db',
            'read': true,
            'write': false
        }
    },
    'reboot': {
        coap: {
            http_cmd: '/reboot',
        },
        mqtt: {
            http_cmd: '/reboot',
        },
        common: {
            'name': 'Reboot',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    },
    'protocol': {
        coap: {
            coap_init_value: 'coap'
        },
        mqtt: {
            mqtt_init_value: 'mqtt'
        },
        common: {
            'name': 'Protocol',
            'type': 'string',
            'role': 'info',
            'read': true,
            'write': false
        }
    },
    'name': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { name: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { name: value }; }
        },
        common: {
            'name': 'Device Name',
            'type': 'string',
            'role': 'info.name',
            'read': true,
            'write': true
        }
    },
    'Sys.eco': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).eco_mode_enabled : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { eco_mode_enabled: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).eco_mode_enabled : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { eco_mode_enabled: value }; }
        },
        common: {
            'name': 'Eco Mode',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'Sys.sntp': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).sntp.server : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { sntp_server: value }; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).sntp.server : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { sntp_server: value }; }
        },
        common: {
            'name': 'SNTP Server',
            'type': 'string',
            'role': 'url',
            'read': true,
            'write': true
        }
    },
    'Sys.timezone': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).timezone : undefined; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).timezone : undefined; }
        },
        common: {
            'name': 'Timezone',
            'type': 'string',
            'role': 'text',
            'read': true,
            'write': false
        }
    },
    'Sys.lat': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lat : undefined; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lat : undefined; }
        },
        common: {
            'name': 'Latitude',
            'type': 'number',
            'role': 'value.gps.latitude',
            'read': true,
            'write': false
        }
    },
    'Sys.lon': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lng : undefined; }
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lng : undefined; }
        },
        common: {
            'name': 'Longitude',
            'type': 'number',
            'role': 'value.gps.longitude',
            'read': true,
            'write': false
        }
    },
    'Mqtt.topicPrefix': {
        coap: {
            no_display: true
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value)?.mqtt?.id : undefined;
                if (result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(`[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix and actual topic prefix do not match. Please check configuration`);
                }

                return result;
            }
        },
        common: {
            'name': 'Topic Prefix',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
};

/**
 * Default, used from all Shelly devices Gen 2
 * https://shelly-api-docs.shelly.cloud/gen2/
 */
const defaultsgen2 = {
    'gen': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value) => { return value ? JSON.parse(value).gen : undefined; }
        },
        common: {
            'name': 'Device generation',
            'type': 'number',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'online': {
        mqtt: {
            mqtt_init_value: false
        },
        common: {
            'name': 'Online',
            'type': 'boolean',
            'role': 'indicator.reachable',
            'read': true,
            'write': false
        }
    },
    'firmware': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: (value) => {
                if (value) {
                    const valueObj = JSON.parse(value);
                    if (valueObj?.sys?.available_updates?.stable?.version) {
                        // TODO: Thats not a good check, if a beta version is installed - compare with current version!
                        //return true;
                    }
                }
                return false;
            }
        },
        common: {
            'name': 'New firmware available',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'firmwareupdate': {
        mqtt: {
            http_cmd: '/rpc/Shelly.Update',
        },
        common: {
            'name': 'Update Firmware',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    },
    'uptime': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: (value) => { return value ? parseInt(JSON.parse(value).sys.uptime) : undefined; }
        },
        common: {
            'name': 'Uptime',
            'type': 'number',
            'role': 'info',
            'unit': 'sec',
            'read': true,
            'write': false
        }
    },
    'version': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value) => { return value ? JSON.parse(value).fw_id : undefined; }
        },
        common: {
            'name': 'Firmware version',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'hostname': {
        mqtt: {
        },
        common: {
            'name': 'Device Hostname',
            'type': 'string',
            'role': 'info.ip',
            'read': true,
            'write': false
        }
    },
    'id': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value, self) => { return self.getDeviceId(); }
        },
        common: {
            'name': 'Device Id',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'class': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value, self) => { return self.getDeviceClass(); }
        },
        common: {
            'name': 'Device class',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'type': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value, self) => { return self.getDeviceType(); }
        },
        common: {
            'name': 'Device type',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'model': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value) => { return value ? JSON.parse(value).model : undefined; }
        },
        common: {
            'name': 'Device Model',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'authEnabled': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value) => { return value ? JSON.parse(value).auth_en : undefined; }
        },
        common: {
            'name': 'Authentication enabled',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'rssi': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: (value) => { return value ? JSON.parse(value).wifi.rssi : undefined; }
        },
        common: {
            'name': 'Device RSSI status',
            'type': 'number',
            'role': 'value',
            'unit': 'db',
            'read': true,
            'write': false
        }
    },
    'reboot': {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: () => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Shelly.Reboot'}); }
        },
        common: {
            'name': 'Reboot',
            'type': 'boolean',
            'role': 'button',
            'read': false,
            'write': true
        }
    },
    'protocol': {
        mqtt: {
            mqtt_init_value: 'mqtt'
        },
        common: {
            'name': 'Protocol',
            'type': 'string',
            'role': 'info',
            'read': true,
            'write': false
        }
    },
    'name': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {device: {name: value}}}}); }
        },
        common: {
            'name': 'Device Name',
            'type': 'string',
            'role': 'info.name',
            'read': true,
            'write': true
        }
    },
    'Sys.eco': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).device.eco_mode : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {device: {eco_mode: value}}}}); }
        },
        common: {
            'name': 'Eco Mode',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'Sys.sntp': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).sntp.server : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {sntp: {server: value}}}}); }
        },
        common: {
            'name': 'SNTP Server',
            'type': 'string',
            'role': 'url',
            'read': true,
            'write': true
        }
    },
    'Sys.timezone': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).location.tz : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {location: {tz: value}}}}); }
        },
        common: {
            'name': 'Timezone',
            'type': 'string',
            'role': 'text',
            'read': true,
            'write': true
        }
    },
    'Sys.lat': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).location.lat : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {location: {lat: value}}}}); }
        },
        common: {
            'name': 'Latitude',
            'type': 'number',
            'role': 'value.gps.latitude',
            'read': true,
            'write': true
        }
    },
    'Sys.lon': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).location.lon : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {location: {lon: value}}}}); }
        },
        common: {
            'name': 'Longitude',
            'type': 'number',
            'role': 'value.gps.longitude',
            'read': true,
            'write': true
        }
    },
    'Sys.debugEnabled': {
        mqtt: {
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).debug.mqtt.enable : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: {config: {debug: {mqtt: {enable: value}}}}}); }
        },
        common: {
            'name': 'Debug (MQTT)',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'WiFi.apEnabled': {
        mqtt: {
            http_publish: '/rpc/WiFi.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).ap.enable : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({id: 0, src: 'iobroker', method: 'WiFi.SetConfig', params: {config: {ap: {enable: value}}}}); }
        },
        common: {
            'name': 'Access Point Enabled',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': true
        }
    },
    'Mqtt.topicPrefix': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).topic_prefix : undefined;
                if (result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(`[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix and actual topic prefix do not match. Please check configuration`);
                }

                return result;
            }
        },
        common: {
            'name': 'Topic Prefix',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'Mqtt.rpcNotifications': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).rpc_ntf : undefined;
                if (result === false) {
                    self.adapter.log.warn(`[Mqtt.rpcNotifications] ${self.getLogInfo()}: "RPC Status Notifications" are disabled. Enable to get all information.`);
                }

                return result;
            }
        },
        common: {
            'name': 'RPC Status Notifications Enabled',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'Mqtt.statusNotifications': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value, self) => {
                const result = value ? JSON.parse(value).status_ntf : undefined;
                if (result === false) {
                    self.adapter.log.warn(`[Mqtt.statusNotifications] ${self.getLogInfo()}: "General Status Notifications" are disabled. Enable to get all information.`);
                }

                return result;
            }
        },
        common: {
            'name': 'Generic Status Notifications Enabled',
            'type': 'boolean',
            'role': 'state',
            'read': true,
            'write': false
        }
    },
    'Mqtt.clientId': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).client_id : undefined; }
        },
        common: {
            'name': 'Client Id',
            'type': 'string',
            'role': 'state',
            'read': true,
            'write': false
        }
    }
};

module.exports = {
    defaultsgen1: defaultsgen1,
    defaultsgen2: defaultsgen2
};
