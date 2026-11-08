import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';
import * as shellyHotfixesGen2 from '../gen2-hotfixes';

/**
 * Shelly Pro 1 PM / shellypro1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro1PM
 */
const shellypro1pm: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellypro1pm, 0, true);

// Firmware bug: the switch output is reported outdated on the status topic
// right after a change (see issue #1694). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro1pm, 0);

shellyHelperGen2.addInput(shellypro1pm, 0);
shellyHelperGen2.addInput(shellypro1pm, 1);

export { shellypro1pm };
