import type { DeviceDefinition } from '../deviceTypes';

/**
 * Hotfixes for individual Gen2+ Shelly device models.
 *
 * This module collects workarounds for confirmed firmware bugs of SPECIFIC Shelly devices.
 * It must NOT hold generic device logic - that belongs into `gen2-helper.ts`. Each function
 * here is applied explicitly from the affected device module (e.g. `gen3/shelly1lg3.ts`) so
 * that a single fix can be reused for several devices without duplicating the code, while
 * leaving all other devices untouched.
 */

/**
 * Fixes a firmware bug where the switch output reported on the `status/switch:<id>` MQTT topic
 * is outdated/inverted right after a state change (e.g. Shelly 1L Gen3, see issue #1318).
 *
 * The `events/rpc` NotifyStatus message carries the CORRECT value, so `Relay<id>.Switch` is
 * derived from that message instead of the status topic. As NotifyStatus is only emitted on
 * change, an `http_publish` (Switch.GetStatus) is added to (re)seed the correct value on
 * connection and at the regular poll interval.
 *
 * Must be called AFTER `addSwitch()` created the `Relay<id>.Switch` state.
 *
 * @param deviceObj - the device definition the fix is applied to
 * @param switchId - id of the affected switch/relay (default 0)
 */
export function fixMqttOutdatedSwitchStatus(deviceObj: DeviceDefinition, switchId = 0): void {
    const state = deviceObj[`Relay${switchId}.Switch`];
    if (!state?.mqtt) {
        return;
    }

    state.mqtt.mqtt_publish = '<mqttprefix>/events/rpc';
    state.mqtt.mqtt_publish_funct = value => {
        const valueObj = JSON.parse(value);
        if (
            valueObj?.method === 'NotifyStatus' &&
            typeof valueObj?.params?.[`switch:${switchId}`]?.output === 'boolean'
        ) {
            return valueObj.params[`switch:${switchId}`].output;
        }
        return undefined;
    };
    state.mqtt.http_publish = `/rpc/Switch.GetStatus?id=${switchId}`;
    state.mqtt.http_publish_funct = value => (value ? JSON.parse(value).output : undefined);
}
