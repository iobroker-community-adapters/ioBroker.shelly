import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

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

shellyHelperGen2.addInput(shellypro4pm, 0);
shellyHelperGen2.addInput(shellypro4pm, 1);
shellyHelperGen2.addInput(shellypro4pm, 2);
shellyHelperGen2.addInput(shellypro4pm, 3);

export { shellypro4pm };
