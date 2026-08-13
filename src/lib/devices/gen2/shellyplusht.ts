import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plus H&T / shellyplusht
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusHT
 */
const shellyplusht: DeviceDefinition = {
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

shellyHelperGen2.addDevicePower(shellyplusht, 0, true);

shellyHelperGen2.addTemperatureSensor(shellyplusht, 0);

shellyHelperGen2.addHumiditySensor(shellyplusht, 0);

export { shellyplusht };
