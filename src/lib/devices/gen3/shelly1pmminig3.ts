import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly 1 PM Mini Gen 3 / shelly1pmminig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1PMG3
 */
const shelly1pmminig3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1pmminig3, 0, true);

// Firmware bug: the switch output is reported outdated/inverted on the status topic
// right after a change (see issue #1318). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shelly1pmminig3, 0);

shellyHelperGen2.addInput(shelly1pmminig3, 0);

export { shelly1pmminig3 };
