import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly Pro 4 PM / shellypro4pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro4PM
 */
const shellypro4pm: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellypro4pm, 0, true);
shellyHelperGen2.addSwitch(shellypro4pm, 1, true);
shellyHelperGen2.addSwitch(shellypro4pm, 2, true);
shellyHelperGen2.addSwitch(shellypro4pm, 3, true);

// Firmware bug: the switch output is reported outdated on the status topic
// right after a change (see issue #1640). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 0);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 1);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 2);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 3);

shellyHelperGen2.addInput(shellypro4pm, 0);
shellyHelperGen2.addInput(shellypro4pm, 1);
shellyHelperGen2.addInput(shellypro4pm, 2);
shellyHelperGen2.addInput(shellypro4pm, 3);

export { shellypro4pm };
