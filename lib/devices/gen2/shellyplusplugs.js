'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus Plug S / shellyplusplugs
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusPlugS
 */
const shellyplusplugs = {
    'hostname': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/wifi`,
            mqtt_publish_funct: value => JSON.parse(value).sta_ip,
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
};

shellyHelperGen2.addSwitchToGen2Device(shellyplusplugs, 0, true);

module.exports = {
    shellyplusplugs,
};
