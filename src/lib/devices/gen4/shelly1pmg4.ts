import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly 1 PM Gen 4 / shelly1pmg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly1PMG4
 */
const shelly1pmg4: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1pmg4, 0, true);

shellyHelperGen2.addInput(shelly1pmg4, 0);

shellyHelperGen2.addPlusAddon(shelly1pmg4);

// Firmware bug: the switch output is reported outdated/inverted on the status topic
// right after a change (see issue #1706). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shelly1pmg4, 0);

export { shelly1pmg4 };
