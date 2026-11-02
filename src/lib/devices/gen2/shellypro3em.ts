import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro 3 EM / shellypro3em
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro3EM
 *
 * Note: The temperature:0 component (internal device temperature sensor) is not listed on the device
 * page above, but the device publishes it over MQTT. The component itself is documented at
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Temperature
 */
const shellypro3em: DeviceDefinition = {
    'Sys.deviceMode': {
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).device.profile : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Shelly.SetProfile',
                    params: { name: value },
                });
            },
        },
        common: {
            name: 'Mode / Profile',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                triphase: 'triphase ',
                monophase: 'monophase',
            },
        },
    },
};

shellyHelperGen2.addEM(shellypro3em, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMData(shellypro3em, 0, ['a', 'b', 'c']);

shellyHelperGen2.addEM1(shellypro3em, 0, false);
shellyHelperGen2.addEM1(shellypro3em, 1, false);
shellyHelperGen2.addEM1(shellypro3em, 2, false);
shellyHelperGen2.addEM1Data(shellypro3em, 0);
shellyHelperGen2.addEM1Data(shellypro3em, 1);
shellyHelperGen2.addEM1Data(shellypro3em, 2);

shellyHelperGen2.addProOutputAddon(shellypro3em);

// temperature:0 is not listed on the device page but is published by the device over MQTT
// https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Temperature
shellyHelperGen2.addTemperatureSensor(shellypro3em, 0);

export { shellypro3em };
