import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly 1L Gen 3 / shelly1lg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly1LG3
 */
const shelly1lg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1lg3, 0, false);

// Firmware bug: the switch output is reported outdated/inverted on the status topic
// right after a change (see issue #1318). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shelly1lg3, 0);

shellyHelperGen2.addInput(shelly1lg3, 0);

shellyHelperGen2.addPlusAddon(shelly1lg3);

export { shelly1lg3 };
