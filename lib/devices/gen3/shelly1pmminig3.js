'use strict';

const shellyHelperGen3 = require('../gen3-helper');

/**
 * Shelly 1 PM Mini Gen 3/ shelly1pmminig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1PMG3
 */
const shelly1pmminig3 = {
    'hostname': {
        coap: {},
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

shellyHelperGen3.addSwitchToGen3Device(shelly1pmminig3, 0, true);

shellyHelperGen3.addInputToGen3Device(shelly1pmminig3, 0);

module.exports = {
    shelly1pmminig3: shelly1pmminig3,
};
