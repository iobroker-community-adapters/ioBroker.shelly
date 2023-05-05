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
                uk: 'Виробництво',
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
            init_funct: (self) => { return self.isOnline(); },
        },
        mqtt: {
            init_funct: (self) => { return self.isOnline(); },
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
                uk: 'Пристрої онлайн',
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
            http_publish: '/status',
            http_publish_funct: (value) => { return value ? JSON.parse(value).update.has_update : undefined; },
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
                uk: 'Нова прошивка доступна',
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
                uk: 'Оновлення версії прошивки',
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
                uk: 'Пристрої, що працюють з',
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
            http_publish: '/settings',
            http_publish_funct: (value) => { return value ? JSON.parse(value).fw : undefined; },
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
                uk: 'Версія прошивки',
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
                uk: 'Пристрої IP адреси або ім\'я користувача',
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
                uk: 'Ідентифікатор пристрою',
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
                uk: 'Клас пристрою',
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
                uk: 'Тип пристрою',
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
                uk: 'База знань',
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
                uk: 'Увімкнення аутентифікації',
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
            name: {
                en: 'Received Signal Strength Indication',
                de: 'Empfangene Signalstärkeanzeige',
                ru: 'Получена индикация силы сигнала',
                pt: 'Indicação de Força de Sinal Recebida',
                nl: 'Vervangde Signal Strength Indicatie',
                fr: 'Indication de force de signal reçue',
                it: 'Indicazione di forza segnale ricevuta',
                es: 'Indicación de fuerza de la señal recibida',
                pl: 'Received Signal Strength (ang.)',
                uk: 'Отриманий показ сигналу',
                'zh-cn': '接受签字国制',
            },
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
                uk: 'Перезавантаження',
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
            name: {
                en: 'Protocol',
                de: 'Protokoll',
                ru: 'Протокол',
                pt: 'Protocolo',
                nl: 'Protocol',
                fr: 'Protocole',
                it: 'Protocollo',
                es: 'Protocolo',
                pl: 'Protokół',
                uk: 'Протокол',
                'zh-cn': '议定书',
            },
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
                uk: 'Назва пристрою',
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
            name: {
                en: 'Eco Mode',
                de: 'Eco-Modus',
                ru: 'Эко режим',
                pt: 'Modo Eco',
                nl: 'Eco Mode',
                fr: 'Eco Mode',
                it: 'Modalità Eco',
                es: 'Eco Mode',
                pl: 'Eko',
                uk: 'Еко режим',
                'zh-cn': 'Eco Mode',
            },
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
            name: {
                en: 'SNTP Server',
                de: 'SNTP Server',
                ru: 'SNTP сервер',
                pt: 'Servidor SNTP',
                nl: 'SNTP',
                fr: 'SNTP Server',
                it: 'Server SNTP',
                es: 'SNTP Server',
                pl: 'SNTP Server',
                uk: 'Статус на сервери',
                'zh-cn': 'SNTP Server',
            },
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
            name: {
                en: 'Timezone',
                de: 'Zeitzone',
                ru: 'Часовой пояс',
                pt: 'Fuso horário',
                nl: 'Tijdzone',
                fr: 'Timezone',
                it: 'Tempo',
                es: 'Zona horaria',
                pl: 'Timezone',
                uk: 'Часовий пояс',
                'zh-cn': '时间区',
            },
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
            name: {
                en: 'Latitude',
                de: 'Breite',
                ru: 'Широта',
                pt: 'Latitude',
                nl: 'Latitude',
                fr: 'Latitude',
                it: 'Latitudine',
                es: 'Latitud',
                pl: 'Latitudes',
                uk: 'Прованс',
                'zh-cn': '学历',
            },
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
            name: {
                en: 'Longitude',
                de: 'Länge',
                ru: 'Долгота',
                pt: 'Longitude',
                nl: 'Longit',
                fr: 'Longitude',
                it: 'Longitudine',
                es: 'Longitud',
                pl: 'Długość',
                uk: 'Довгий',
                'zh-cn': '长 度',
            },
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
                    self.adapter.log.warn(`[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`);
                }

                return result;
            },
        },
        common: {
            name: {
                en: 'Topic prefix',
                de: 'Thema Präfix',
                ru: 'Тема префикса',
                pt: 'Prefixo de tópico',
                nl: 'Onderwerp voorvoegsel',
                fr: 'Préfixe du sujet',
                it: 'Prefisso tematico',
                es: 'Prefijo temático',
                pl: 'Przedrostek',
                uk: 'Тема префікса',
                'zh-cn': '主题前',
            },
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
            name: {
                en: 'Client ID',
                de: 'Client-ID',
                ru: 'ID клиента',
                pt: 'ID do cliente',
                nl: 'Cliënt ID',
                fr: 'ID client',
                it: 'ID cliente',
                es: 'ID de cliente',
                pl: 'Klient Ident',
                uk: 'Клієнт',
                'zh-cn': '客户',
            },
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
            name: {
                en: 'Cloud Connection',
                de: 'Cloud-Verbindung',
                ru: 'Облачное соединение',
                pt: 'Conexão de nuvem',
                nl: 'Cloud Connection',
                fr: 'Cloud Connection',
                it: 'Connessione cloud',
                es: 'Cloud Connection',
                pl: 'Cloud Connection',
                uk: 'Хмарне підключення',
                'zh-cn': 'Cloud Connection',
            },
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
                uk: 'Виробництво',
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
            init_funct: (self) => { return self.isOnline(); },
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
                uk: 'Пристрої онлайн',
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
            http_publish: '/rpc/Shelly.GetStatus',
            http_publish_funct: (value) => {
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
                uk: 'Нова прошивка доступна',
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Shelly.Update', params: { stage: 'stable' }}); },
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
                uk: 'Оновлення версії прошивки',
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
                uk: 'Пристрої, що працюють з',
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
                uk: 'Версія прошивки',
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
                uk: 'Пристрої IP адреси або ім\'я користувача',
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
                uk: 'Ідентифікатор пристрою',
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
                uk: 'Клас пристрою',
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
                uk: 'Тип пристрою',
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
                uk: 'Модель пристрою',
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
                uk: 'База знань',
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
                uk: 'Увімкнення аутентифікації',
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
            name: {
                en: 'Received Signal Strength Indication',
                de: 'Empfangene Signalstärkeanzeige',
                ru: 'Получена индикация силы сигнала',
                pt: 'Indicação de Força de Sinal Recebida',
                nl: 'Vervangde Signal Strength Indicatie',
                fr: 'Indication de force de signal reçue',
                it: 'Indicazione di forza segnale ricevuta',
                es: 'Indicación de fuerza de la señal recibida',
                pl: 'Received Signal Strength (ang.)',
                uk: 'Отриманий показ сигналу',
                'zh-cn': '接受签字国制',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Shelly.Reboot' }); },
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
                uk: 'Перезавантаження',
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
            name: {
                en: 'Protocol',
                de: 'Protokoll',
                ru: 'Протокол',
                pt: 'Protocolo',
                nl: 'Protocol',
                fr: 'Protocole',
                it: 'Protocollo',
                es: 'Protocolo',
                pl: 'Protokół',
                uk: 'Протокол',
                'zh-cn': '议定书',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: {device: { name: value }}}}); },
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
                uk: 'Назва пристрою',
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: { device: { eco_mode: value }}}}); },
        },
        common: {
            name: {
                en: 'Eco Mode',
                de: 'Eco-Modus',
                ru: 'Эко режим',
                pt: 'Modo Eco',
                nl: 'Eco Mode',
                fr: 'Eco Mode',
                it: 'Modalità Eco',
                es: 'Eco Mode',
                pl: 'Eko',
                uk: 'Еко режим',
                'zh-cn': 'Eco Mode',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: { sntp: { server: value }}}}); },
        },
        common: {
            name: {
                en: 'SNTP Server',
                de: 'SNTP Server',
                ru: 'SNTP сервер',
                pt: 'Servidor SNTP',
                nl: 'SNTP',
                fr: 'SNTP Server',
                it: 'Server SNTP',
                es: 'SNTP Server',
                pl: 'SNTP Server',
                uk: 'Статус на сервери',
                'zh-cn': 'SNTP Server',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: { location: { tz: value }}}}); },
        },
        common: {
            name: {
                en: 'Timezone',
                de: 'Zeitzone',
                ru: 'Часовой пояс',
                pt: 'Fuso horário',
                nl: 'Tijdzone',
                fr: 'Timezone',
                it: 'Tempo',
                es: 'Zona horaria',
                pl: 'Timezone',
                uk: 'Часовий пояс',
                'zh-cn': '时间区',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: { location: { lat: value }}}}); },
        },
        common: {
            name: {
                en: 'Latitude',
                de: 'Breite',
                ru: 'Широта',
                pt: 'Latitude',
                nl: 'Latitude',
                fr: 'Latitude',
                it: 'Latitudine',
                es: 'Latitud',
                pl: 'Latitudes',
                uk: 'Прованс',
                'zh-cn': '学历',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: { location: { lon: value }}}}); },
        },
        common: {
            name: {
                en: 'Longitude',
                de: 'Länge',
                ru: 'Долгота',
                pt: 'Longitude',
                nl: 'Longit',
                fr: 'Longitude',
                it: 'Longitudine',
                es: 'Longitud',
                pl: 'Długość',
                uk: 'Довгий',
                'zh-cn': '长 度',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Sys.SetConfig', params: { config: { debug: { mqtt: { enable: value }}}}}); },
        },
        common: {
            name: {
                en: 'Debug mode',
                de: 'Debug-Modus',
                ru: 'Режим Debug',
                pt: 'Modo de depuração',
                nl: 'Debug mode',
                fr: 'Mode Debug',
                it: 'Modalità Debug',
                es: 'Modo de depuración',
                pl: 'Tryb debugowania',
                uk: 'Режим Debug',
                'zh-cn': 'Dbug模式',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'WiFi.SetConfig', params: { config: { ap: { enable: value }}}}); },
        },
        common: {
            name: {
                en: 'Access point enabled',
                de: 'Access Point aktiviert',
                ru: 'Доступ к точке включен',
                pt: 'Ponto de acesso habilitado',
                nl: 'Toegangspunt in staat',
                fr: 'Point d \' accès activé',
                it: 'Punto di accesso abilitato',
                es: 'Punto de acceso habilitado',
                pl: 'Punkt dostępu umożliwiał',
                uk: 'Увімкнути точку доступу',
                'zh-cn': '进入点',
            },
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
                    self.adapter.log.warn(`[Mqtt.topicPrefix] ${self.getLogInfo()}: Configured mqtt topic prefix "${result}" and actual topic prefix "${self.getMqttPrefix()}" do not match. Please check configuration`);
                }

                return result;
            },
        },
        common: {
            name: {
                en: 'Topic prefix',
                de: 'Thema Präfix',
                ru: 'Тема префикса',
                pt: 'Prefixo de tópico',
                nl: 'Onderwerp voorvoegsel',
                fr: 'Préfixe du sujet',
                it: 'Prefisso tematico',
                es: 'Prefijo temático',
                pl: 'Przedrostek',
                uk: 'Тема префікса',
                'zh-cn': '主题前',
            },
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
                    self.adapter.log.warn(`[Mqtt.rpcNotifications] ${self.getLogInfo()}: "RPC Status Notifications" are disabled (see adapter documentation for details)`);
                }

                return result;
            },
        },
        common: {
            name: {
                en: 'RPC status notifications enabled',
                de: 'RPC-Statusmeldungen aktiviert',
                ru: 'Уведомления о состоянии RPC включены',
                pt: 'Notificações de status RPC habilitado',
                nl: 'RPC status melding',
                fr: 'Notifications de statut RPC activées',
                it: 'Notifiche di stato RPC abilitate',
                es: 'Se han habilitado notificaciones de la categoría RPC',
                pl: 'Statystyki RPC',
                uk: 'Повідомлення про статус РПК ввімкнено',
                'zh-cn': '方案执行情况通知',
            },
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
                    self.adapter.log.warn(`[Mqtt.statusNotifications] ${self.getLogInfo()}: "General Status Notifications" are disabled (see adapter documentation for details)`);
                }

                return result;
            },
        },
        common: {
            name: {
                en: 'Generic status notifications enabled',
                de: 'Generelle Statusmeldungen aktiviert',
                ru: 'Уведомления о генерическом статусе включены',
                pt: 'Notificações de status genéricas activadas',
                nl: 'Generische status melding',
                fr: 'Notifications d\'état générique activé',
                it: 'Notifiche di stato generiche abilitate',
                es: 'Se han habilitado notificaciones de estado genérico',
                pl: 'Statystyki genetyczne umożliwiły',
                uk: 'Увімкнути повідомлення про статус',
                'zh-cn': '基因身份通知使得',
            },
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
            name: {
                en: 'Client ID',
                de: 'Client-ID',
                ru: 'ID клиента',
                pt: 'ID do cliente',
                nl: 'Cliënt ID',
                fr: 'ID client',
                it: 'ID cliente',
                es: 'ID de cliente',
                pl: 'Klient Ident',
                uk: 'Клієнт',
                'zh-cn': '客户',
            },
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
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'Cloud.SetConfig', params: { config: { enable: value } }}); },
        },
        common: {
            name: {
                en: 'Cloud Connection',
                de: 'Cloud-Verbindung',
                ru: 'Облачное соединение',
                pt: 'Conexão de nuvem',
                nl: 'Cloud Connection',
                fr: 'Cloud Connection',
                it: 'Connessione cloud',
                es: 'Cloud Connection',
                pl: 'Cloud Connection',
                uk: 'Хмарне підключення',
                'zh-cn': 'Cloud Connection',
            },
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
