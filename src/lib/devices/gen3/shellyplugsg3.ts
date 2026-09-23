import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly Plug S Gen3 / shellyplugsg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugSG3
 */
const shellyplugsg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellyplugsg3, 0, true);
shellyHelperGen2.addPlugsUI(shellyplugsg3);

// Firmware bug: the switch output is reported outdated/inverted on the status topic
// right after a change (see issue #1318). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellyplugsg3, 0);

export { shellyplugsg3 };
