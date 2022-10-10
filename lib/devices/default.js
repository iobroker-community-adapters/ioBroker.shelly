'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Default, used for all Shelly devices Gen 1
 * https://shelly-api-docs.shelly.cloud/gen1/
 */
const defaultsgen1 = {
    'gen': {
        coap: {
            init_funct: (self) => { return self.getDeviceGen(); },
        },
        mqtt: {
            init_funct: (self) => { return self.getDeviceGen(); },
        },
        common: {
            name: {
                en: 'Device generation',
                de: 'Gerätegeneration',
                ru: 'Генерация устройства',
                pt: 'Geração de dispositivos',
                nl: 'Vernietigingsgeneratie',
                fr: 'Production d\'appareils',
                it: 'Generazione di dispositivi',
                es: 'Generación de dispositivos',
                pl: 'Pokolenie Device',
                'zh-cn': '代 人',
            },
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: {
                1: 'Generation 1',
                2: 'Generation 2',
            },
        },
    },
    'online': {
        coap: {
            init_value: false,
        },
        mqtt: {
            init_value: false,
        },
        common: {
            name: {
                en: 'Device online',
                de: 'Gerät online',
                ru: 'Устройство онлайн',
                pt: 'Dispositivo online',
                nl: 'Device online',
                fr: 'Appareil en ligne',
                it: 'Dispositivo online',
                es: 'Dispositivo en línea',
                pl: 'Device online',
                'zh-cn': '网上证人',
            },
            type: 'boolean',
            role: 'indicator.reachable',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('wifi'),
        },
    },
    'firmware': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).update.has_update : undefined; },
        },
        mqtt: {
            mqtt_publish: 'shellies/announce',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).new_fw : false; },
        },
        common: {
            name: {
                en: 'New firmware available',
                de: 'Neue Firmware verfügbar',
                ru: 'Новая прошивка доступна',
                pt: 'Novo firmware disponível',
                nl: 'Nieuwe firmaware',
                fr: 'Nouveau firmware disponible',
                it: 'Nuovo firmware disponibile',
                es: 'Nuevo firmware disponible',
                pl: 'Nowy sprzęt',
                'zh-cn': '新的警觉',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'firmwareupdate': {
        coap: {
            http_cmd: '/ota?update=true',
        },
        mqtt: {
            http_cmd: '/ota?update=true',
        },
        common: {
            name: {
                en: 'Update firmware version',
                de: 'Firmware-Version aktualisieren',
                ru: 'Обновление версии прошивки',
                pt: 'Atualizar versão de firmware',
                nl: 'Update firmaware',
                fr: 'Update firmware version',
                it: 'Versione firmware di aggiornamento',
                es: 'Actualizar la versión de firmware',
                pl: 'Oficjalna strona',
                'zh-cn': '最新软件版本',
            },
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            icon: shellyHelper.getIcon('update'),
        },
    },
    'uptime': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? parseInt(JSON.parse(value).uptime) : undefined; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? parseInt(JSON.parse(value).uptime) : undefined; },
        },
        common: {
            name: {
                en: 'Device running since',
                de: 'Gerät läuft seit',
                ru: 'Устройство работает с',
                pt: 'Dispositivo em execução desde',
                nl: 'Device vlucht sinds',
                fr: 'Appareils fonctionnant depuis',
                it: 'Dispositivo in esecuzione da',
                es: 'Dispositivo funcionando desde',
                pl: 'Device biegnie od czasu do czasu',
                'zh-cn': '自那时以来丧失能力',
            },
            type: 'number',
            role: 'value.interval',
            unit: 'sec',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('clock'),
        },
    },
    'version': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).fw : undefined; },
        },
        mqtt: {
            mqtt_publish: 'shellies/announce',
            mqtt_publish_funct: (value) => { return value ? JSON.parse(value).fw_ver : undefined; },
        },
        common: {
            name: {
                en: 'Firmware version',
                de: 'Firmware-Version',
                ru: 'Версия прошивки',
                pt: 'Versão de firmware',
                nl: 'Firmware',
                fr: 'Firmware version',
                it: 'Versione firmware',
                es: 'Versión de firmware',
                pl: 'Okładka',
                'zh-cn': '导 言',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('chip'),
        },
    },
    'hostname': {
        coap: {
            init_funct: (self) => { return self.getIP(); },
        },
        mqtt: {
            init_funct: (self) => { return self.getIP(); },
        },
        common: {
            name: {
                en: 'Device IP address or hostname',
                de: 'Geräte-IP-Adresse oder Hostname',
                ru: 'IP-адрес устройства или имя хоста',
                pt: 'Endereço IP do dispositivo ou nome de host',
                nl: 'IP-adres of gastnaam',
                fr: 'Adresse IP ou nom d\'hôte',
                it: 'Indirizzo IP del dispositivo o nome host',
                es: 'Dirección IP o nombre de host',
                pl: 'Adres IP lub hostname',
                'zh-cn': '設備 IP 地址或主機名',
            },
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false,
        },
    },
    'id': {
        coap: {
            init_funct: (self) => { return self.getDeviceId(); },
        },
        mqtt: {
            init_funct: (self) => { return self.getDeviceId(); },
        },
        common: {
            name: {
                en: 'Device ID',
                de: 'Gerätekennung',
                ru: 'ID устройства',
                pt: 'ID do dispositivo',
                nl: 'Device ID',
                fr: 'ID',
                it: 'ID dispositivo',
                es: 'ID de dispositivo',
                pl: 'ID',
                'zh-cn': '設備ID',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'class': {
        coap: {
            init_funct: (self) => { return self.getDeviceClass(); },
        },
        mqtt: {
            init_funct: (self) => { return self.getDeviceClass(); },
        },
        common: {
            name: {
                en: 'Device class',
                de: 'Geräteklasse',
                ru: 'Класс устройства',
                pt: 'Classe de dispositivo',
                nl: 'Device klas',
                fr: 'Classe d\' appareil',
                it: 'Classe di dispositivo',
                es: 'Clase de dispositivo',
                pl: 'Klasa Device',
                'zh-cn': '证人阶级',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'type': {
        coap: {
            init_funct: (self) => { return self.getDeviceType(); },
        },
        mqtt: {
            init_funct: (self) => { return self.getDeviceType(); },
        },
        common: {
            name: {
                en: 'Device type',
                de: 'Gerätetyp',
                ru: 'Тип устройства',
                pt: 'Tipo de dispositivo',
                nl: 'Device type',
                fr: 'Type de dispositif',
                it: 'Tipo di dispositivo',
                es: 'Tipo de dispositivo',
                pl: 'Device type',
                'zh-cn': '設備類型',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'knowledgeBaseUrl': {
        coap: {
            init_funct: (self) => { return self.getKnowledgeBaseUrl(); },
        },
        mqtt: {
            init_funct: (self) => { return self.getKnowledgeBaseUrl(); },
        },
        common: {
            name: {
                en: 'Knowledge base',
                de: 'Wissensdatenbank',
                ru: 'База знаний',
                pt: 'Base de conhecimento',
                nl: 'Kennisbasis',
                fr: 'Base de connaissances',
                it: 'Base di conoscenza',
                es: 'Base de conocimientos',
                pl: 'Baza wiedzy',
                'zh-cn': '知识基础',
            },
            type: 'string',
            role: 'url.blank',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('question'),
        },
    },
    'authEnabled': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const authEnabled = value ? JSON.parse(value)?.login?.enabled : undefined;

                if (!authEnabled && self.adapter.config.httppassword) {
                    self.adapter.log.warn(`[authEnabled] ${self.getLogInfo()}: This device is not protected via restricted login (see adapter documentation for details)`);
                }

                return authEnabled;
            },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => {
                const authEnabled = value ? JSON.parse(value)?.login?.enabled : undefined;

                if (!authEnabled && self.adapter.config.httppassword) {
                    self.adapter.log.warn(`[authEnabled] ${self.getLogInfo()}: This device is not protected via restricted login (see adapter documentation for details)`);
                }

                return authEnabled;
            },
        },
        common: {
            name: {
                en: 'Authentication enabled',
                de: 'Authentication aktiviert',
                ru: 'Аутентификация включена',
                pt: 'Autenticação activada',
                nl: 'Authenticatie in staat',
                fr: 'Authentification activée',
                it: 'Autenticazione abilitata',
                es: 'Autenticación habilitada',
                pl: 'Authenticacja umożliwiła',
                'zh-cn': '逮捕使',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('auth'),
        },
    },
    'rssi': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value)?.wifi_sta?.rssi : 0; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value)?.wifi_sta?.rssi : 0; },
        },
        common: {
            name: 'Device RSSI status',
            type: 'number',
            role: 'value',
            unit: 'db',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('signal'),
        },
    },
    'reboot': {
        coap: {
            http_cmd: '/reboot',
        },
        mqtt: {
            http_cmd: '/reboot',
        },
        common: {
            name: {
                en: 'Reboot',
                de: 'Neustart',
                ru: 'Перезагрузка',
                pt: 'Reiniciar',
                nl: 'Reboot',
                fr: 'Reboot',
                it: 'Reboot',
                es: 'Reboot',
                pl: 'Reboot',
                'zh-cn': 'Reboot',
            },
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'protocol': {
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
    'name': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { name: value }; },
        },
        common: {
            name: {
                en: 'Device name',
                de: 'Bezeichnung des Geräts',
                ru: 'Наименование устройства',
                pt: 'Nome do dispositivo',
                nl: 'Devicenaam',
                fr: 'Nom du dispositif',
                it: 'Nome del dispositivo',
                es: 'Nombre del dispositivo',
                pl: 'Device name',
                'zh-cn': '证人姓名',
            },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).eco_mode_enabled : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { eco_mode_enabled: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).eco_mode_enabled : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { eco_mode_enabled: value }; },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).sntp.server : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { sntp_server: value }; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).sntp.server : undefined; },
            http_cmd: '/settings',
            http_cmd_funct: (value) => { return { sntp_server: value }; },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).timezone : undefined; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).timezone : undefined; },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).lat : undefined; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lat : undefined; },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).lng : undefined; },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).lng : undefined; },
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
                if (result && result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(`[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`);
                }

                return result;
            },
        },
        common: {
            name: 'Topic Prefix',
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
            init_funct: (self) => { return self.getId(); },
            http_publish: '/settings',
            http_publish_funct: (value, self) => { return self.getId(); },
        },
        common: {
            name: 'Client Id',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Cloud.enabled': {
        coap: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value)?.cloud?.enabled : undefined; },
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value)?.cloud?.enabled : undefined; },
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
 * Default, used for all Shelly devices Gen 2
 * https://shelly-api-docs.shelly.cloud/gen2/
 */
const defaultsgen2 = {
    'gen': {
        mqtt: {
            init_funct: (self) => { return self.getDeviceGen(); },
        },
        common: {
            name: {
                en: 'Device generation',
                de: 'Gerätegeneration',
                ru: 'Генерация устройства',
                pt: 'Geração de dispositivos',
                nl: 'Vernietigingsgeneratie',
                fr: 'Production d\'appareils',
                it: 'Generazione di dispositivi',
                es: 'Generación de dispositivos',
                pl: 'Pokolenie Device',
                'zh-cn': '代 人',
            },
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: {
                1: 'Generation 1',
                2: 'Generation 2',
            },
        },
    },
    'online': {
        mqtt: {
            init_value: false,
        },
        common: {
            name: {
                en: 'Device online',
                de: 'Gerät online',
                ru: 'Устройство онлайн',
                pt: 'Dispositivo online',
                nl: 'Device online',
                fr: 'Appareil en ligne',
                it: 'Dispositivo online',
                es: 'Dispositivo en línea',
                pl: 'Device online',
                'zh-cn': '网上证人',
            },
            type: 'boolean',
            role: 'indicator.reachable',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('wifi'),
        },
    },
    'firmware': {
        mqtt: {
            http_publish: '/rpc/Shelly.CheckForUpdate',
            http_publish_funct: (value) => {
                /*
                {
                "stable": {
                    "version": "0.11.1",
                    "build_id": "20220909-120354/0.11.1-g56f689f"
                  }
                }
                */
                if (value) {
                    const valueObj = JSON.parse(value);
                    if (valueObj?.stable?.version) {
                        return true;
                    }
                }

                return false;
            },
        },
        common: {
            name: {
                en: 'New firmware available',
                de: 'Neue Firmware verfügbar',
                ru: 'Новая прошивка доступна',
                pt: 'Novo firmware disponível',
                nl: 'Nieuwe firmaware',
                fr: 'Nouveau firmware disponible',
                it: 'Nuovo firmware disponibile',
                es: 'Nuevo firmware disponible',
                pl: 'Nowy sprzęt',
                'zh-cn': '新的警觉',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'firmwareupdate': {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: () => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Shelly.Update', params: { stage: 'stable' }}); },
        },
        common: {
            name: {
                en: 'Update firmware version',
                de: 'Firmware-Version aktualisieren',
                ru: 'Обновление версии прошивки',
                pt: 'Atualizar versão de firmware',
                nl: 'Update firmaware',
                fr: 'Update firmware version',
                it: 'Versione firmware di aggiornamento',
                es: 'Actualizar la versión de firmware',
                pl: 'Oficjalna strona',
                'zh-cn': '最新软件版本',
            },
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
            icon: shellyHelper.getIcon('update'),
        },
    },
    'uptime': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: (value) => { return value ? parseInt(JSON.parse(value).sys.uptime) : undefined; },
        },
        common: {
            name: {
                en: 'Device running since',
                de: 'Gerät läuft seit',
                ru: 'Устройство работает с',
                pt: 'Dispositivo em execução desde',
                nl: 'Device vlucht sinds',
                fr: 'Appareils fonctionnant depuis',
                it: 'Dispositivo in esecuzione da',
                es: 'Dispositivo funcionando desde',
                pl: 'Device biegnie od czasu do czasu',
                'zh-cn': '自那时以来丧失能力',
            },
            type: 'number',
            role: 'value.interval',
            unit: 'sec',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('clock'),
        },
    },
    'version': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value) => { return value ? JSON.parse(value).fw_id : undefined; },
        },
        common: {
            name: {
                en: 'Firmware version',
                de: 'Firmware-Version',
                ru: 'Версия прошивки',
                pt: 'Versão de firmware',
                nl: 'Firmware',
                fr: 'Firmware version',
                it: 'Versione firmware',
                es: 'Versión de firmware',
                pl: 'Okładka',
                'zh-cn': '导 言',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('chip'),
        },
    },
    'hostname': {
        mqtt: {
            init_funct: (self) => { return self.getIP(); },
        },
        common: {
            name: {
                en: 'Device IP address or hostname',
                de: 'Geräte-IP-Adresse oder Hostname',
                ru: 'IP-адрес устройства или имя хоста',
                pt: 'Endereço IP do dispositivo ou nome de host',
                nl: 'IP-adres of gastnaam',
                fr: 'Adresse IP ou nom d\'hôte',
                it: 'Indirizzo IP del dispositivo o nome host',
                es: 'Dirección IP o nombre de host',
                pl: 'Adres IP lub hostname',
                'zh-cn': '設備 IP 地址或主機名',
            },
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false,
        },
    },
    'id': {
        mqtt: {
            init_funct: (self) => { return self.getDeviceId(); },
        },
        common: {
            name: {
                en: 'Device ID',
                de: 'Gerätekennung',
                ru: 'ID устройства',
                pt: 'ID do dispositivo',
                nl: 'Device ID',
                fr: 'ID',
                it: 'ID dispositivo',
                es: 'ID de dispositivo',
                pl: 'ID',
                'zh-cn': '設備ID',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'class': {
        mqtt: {
            init_funct: (self) => { return self.getDeviceClass(); },
        },
        common: {
            name: {
                en: 'Device class',
                de: 'Geräteklasse',
                ru: 'Класс устройства',
                pt: 'Classe de dispositivo',
                nl: 'Device klas',
                fr: 'Classe d\' appareil',
                it: 'Classe di dispositivo',
                es: 'Clase de dispositivo',
                pl: 'Klasa Device',
                'zh-cn': '证人阶级',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'type': {
        mqtt: {
            init_funct: (self) => { return self.getDeviceType(); },
        },
        common: {
            name: {
                en: 'Device type',
                de: 'Gerätetyp',
                ru: 'Тип устройства',
                pt: 'Tipo de dispositivo',
                nl: 'Device type',
                fr: 'Type de dispositif',
                it: 'Tipo di dispositivo',
                es: 'Tipo de dispositivo',
                pl: 'Device type',
                'zh-cn': '設備類型',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'model': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value) => { return value ? JSON.parse(value).model : undefined; },
        },
        common: {
            name: {
                en: 'Device model',
                de: 'Gerätemodell',
                ru: 'Модель устройства',
                pt: 'Modelo de dispositivo',
                nl: 'Vernietig model',
                fr: 'Modèle de dispositif',
                it: 'Modello del dispositivo',
                es: 'Modelo de dispositivo',
                pl: 'Model',
                'zh-cn': '证人模式',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'knowledgeBaseUrl': {
        mqtt: {
            init_funct: (self) => { return self.getKnowledgeBaseUrl(); },
        },
        common: {
            name: {
                en: 'Knowledge base',
                de: 'Wissensdatenbank',
                ru: 'База знаний',
                pt: 'Base de conhecimento',
                nl: 'Kennisbasis',
                fr: 'Base de connaissances',
                it: 'Base di conoscenza',
                es: 'Base de conocimientos',
                pl: 'Baza wiedzy',
                'zh-cn': '知识基础',
            },
            type: 'string',
            role: 'url.blank',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('question'),
        },
    },
    'authEnabled': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: (value, self) => {
                const authEnabled = value ? JSON.parse(value).auth_en : undefined;

                if (!authEnabled && self.adapter.config.httppassword) {
                    self.adapter.log.warn(`[authEnabled] ${self.getLogInfo()}: This device is not protected via restricted login (see adapter documentation for details)`);
                }

                return authEnabled;
            },
        },
        common: {
            name: {
                en: 'Authentication enabled',
                de: 'Authentication aktiviert',
                ru: 'Аутентификация включена',
                pt: 'Autenticação activada',
                nl: 'Authenticatie in staat',
                fr: 'Authentification activée',
                it: 'Autenticazione abilitata',
                es: 'Autenticación habilitada',
                pl: 'Authenticacja umożliwiła',
                'zh-cn': '逮捕使',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('auth'),
        },
    },
    'rssi': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: (value) => { return value ? JSON.parse(value).wifi.rssi : undefined; },
        },
        common: {
            name: 'Device RSSI status',
            type: 'number',
            role: 'value',
            unit: 'db',
            read: true,
            write: false,
            icon: shellyHelper.getIcon('signal'),
        },
    },
    'reboot': {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: () => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Shelly.Reboot' }); },
        },
        common: {
            name: {
                en: 'Reboot',
                de: 'Neustart',
                ru: 'Перезагрузка',
                pt: 'Reiniciar',
                nl: 'Reboot',
                fr: 'Reboot',
                it: 'Reboot',
                es: 'Reboot',
                pl: 'Reboot',
                'zh-cn': 'Reboot',
            },
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'protocol': {
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
    'name': {
        mqtt: {
            http_publish: '/rpc/Shelly.GetDeviceInfo',
            http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: {device: { name: value }}}}); },
        },
        common: {
            name: {
                en: 'Device name',
                de: 'Bezeichnung des Geräts',
                ru: 'Наименование устройства',
                pt: 'Nome do dispositivo',
                nl: 'Devicenaam',
                fr: 'Nom du dispositif',
                it: 'Nome del dispositivo',
                es: 'Nombre del dispositivo',
                pl: 'Device name',
                'zh-cn': '证人姓名',
            },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).device.eco_mode : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: { device: { eco_mode: value }}}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).sntp.server : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: { sntp: { server: value }}}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).location.tz : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: { location: { tz: value }}}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).location.lat : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: { location: { lat: value }}}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).location.lon : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: { location: { lon: value }}}}); },
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
            http_publish_funct: (value) => { return value ? JSON.parse(value).debug.mqtt.enable : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'Sys.SetConfig', params: { config: { debug: { mqtt: { enable: value }}}}}); },
        },
        common: {
            name: 'Debug (MQTT)',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'WiFi.apEnabled': {
        mqtt: {
            http_publish: '/rpc/WiFi.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).ap.enable : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 0, src: 'iobroker', method: 'WiFi.SetConfig', params: { config: { ap: { enable: value }}}}); },
        },
        common: {
            name: 'Access Point Enabled',
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
                if (result && result !== self.getMqttPrefix()) {
                    self.adapter.log.warn(`[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`);
                }

                return result;
            },
        },
        common: {
            name: 'Topic Prefix',
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
                    self.adapter.log.warn(`[Mqtt.rpcNotifications] ${self.getLogInfo()}: "RPC Status Notifications" are disabled. Enable to get all information.`);
                }

                return result;
            },
        },
        common: {
            name: 'RPC Status Notifications Enabled',
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
                    self.adapter.log.warn(`[Mqtt.statusNotifications] ${self.getLogInfo()}: "General Status Notifications" are disabled. Enable to get all information.`);
                }

                return result;
            },
        },
        common: {
            name: 'Generic Status Notifications Enabled',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Mqtt.clientId': {
        mqtt: {
            http_publish: '/rpc/Mqtt.GetConfig',
            http_publish_funct: (value) => { return value ? JSON.parse(value).client_id : undefined; },
        },
        common: {
            name: 'Client Id',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Cloud.enabled': {
        mqtt: {
            http_publish: `/rpc/Cloud.GetConfig`,
            http_publish_funct: (value) => { return value ? JSON.parse(value)?.enable : undefined; },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value) => { return JSON.stringify({ id: 1, src: 'iobroker', method: 'Cloud.SetConfig', params: { config: {enable: value} }}); },
        },
        common: {
            name: 'Cloud Connection',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    },
};

module.exports = {
    defaultsgen1: defaultsgen1,
    defaultsgen2: defaultsgen2,
};
