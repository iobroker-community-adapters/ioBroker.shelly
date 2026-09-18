import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1L Gen 3 / shelly1lg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly1LG3
 */
const shelly1lg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1lg3, 0, false);

// Workaround for a Shelly 1L Gen3 firmware bug (see issue #1318):
// After a state change the device publishes the `output` value INVERTED on the
// `<mqttprefix>/status/switch:0` topic, while the `<mqttprefix>/events/rpc`
// NotifyStatus message carries the CORRECT value. Therefore Relay0.Switch is
// derived from the NotifyStatus message instead of the status topic. Since
// NotifyStatus is only emitted on change, an http_publish (Switch.GetStatus) is
// added to (re)seed the correct value on connection and at regular poll intervals.
shelly1lg3['Relay0.Switch'].mqtt!.mqtt_publish = '<mqttprefix>/events/rpc';
shelly1lg3['Relay0.Switch'].mqtt!.mqtt_publish_funct = value => {
    const valueObj = JSON.parse(value);
    if (valueObj?.method === 'NotifyStatus' && typeof valueObj?.params?.['switch:0']?.output === 'boolean') {
        return valueObj.params['switch:0'].output;
    }
    return undefined;
};
shelly1lg3['Relay0.Switch'].mqtt!.http_publish = '/rpc/Switch.GetStatus?id=0';
shelly1lg3['Relay0.Switch'].mqtt!.http_publish_funct = value => (value ? JSON.parse(value).output : undefined);

shellyHelperGen2.addInput(shelly1lg3, 0);

shellyHelperGen2.addPlusAddon(shelly1lg3);

export { shelly1lg3 };
