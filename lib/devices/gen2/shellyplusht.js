'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus H&T / shellyplusht
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusHT
 */
const shellyplusht = {
    'HTUI.DisplayUnit': {
        mqtt: {
            http_publish: '/rpc/HT_UI.GetConfig',
            http_publish_funct: value => value ? JSON.parse(value).temperature_unit : undefined,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => { return JSON.stringify({ id: self.getNextMsgId(), src: 'iobroker', method: 'HT_UI.SetConfig', params: { config: { temperature_unit: value } }}); },
        },
        common: {
            name: {
                en: 'Unit on display',
                de: 'Anzeigeeinheit',
                ru: 'Блок на дисплее',
                pt: 'Unidade em exposição',
                nl: 'Eenheid vertoont',
                fr: 'Unité sur écran',
                it: 'Unità sul display',
                es: 'Unidad en pantalla',
                pl: 'Jednostkowy wyświetlacz',
                'zh-cn': '展示股',
            },
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                'C': 'Celsius',
                'F': 'Fahrenheit',
            },
        },
    },
};

shellyHelperGen2.addDevicePowerToGen2Device(shellyplusht, 0, true);

shellyHelperGen2.addTemperatureSensorToGen2Device(shellyplusht, 0);

shellyHelperGen2.addHumiditySensorToGen2Device(shellyplusht, 0);

module.exports = {
    shellyplusht,
};
