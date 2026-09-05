import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly AZ H&T / shellyazht
 *
 * Humidity & Temperature Smart Sensor (uses the same API as Shelly H&T Gen3)
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyHTG3
 * https://kb.shelly.cloud/knowledge-base/shelly-az-h-t
 */
const shellyazht: DeviceDefinition = {
    'HTUI.DisplayUnit': {
        mqtt: {
            http_publish: '/rpc/HT_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).temperature_unit : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'HT_UI.SetConfig',
                    params: { config: { temperature_unit: value } },
                });
            },
        },
        common: {
            name: 'Unit on display',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                C: 'Celsius',
                F: 'Fahrenheit',
            },
        },
    },
};

shellyHelperGen2.addDevicePower(shellyazht, 0, true);

shellyHelperGen2.addTemperatureSensor(shellyazht, 0);

shellyHelperGen2.addHumiditySensor(shellyazht, 0);

export { shellyazht };
