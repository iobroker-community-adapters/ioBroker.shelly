import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly 1 PM Mini Gen 4 / shelly1pmminig4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyMini1PMG4
 */
const shelly1pmminig4: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1pmminig4, 0, true);

shellyHelperGen2.addInput(shelly1pmminig4, 0);

// Firmware bug: the switch output is reported outdated/inverted on the status topic
// right after a change (see issue #1706). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shelly1pmminig4, 0);

export { shelly1pmminig4 };
