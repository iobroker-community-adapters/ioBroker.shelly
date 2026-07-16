import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro 1 PM / shellypro1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro1PM
 */
const shellypro1pm: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellypro1pm, 0, true);

shellyHelperGen2.addInput(shellypro1pm, 0);
shellyHelperGen2.addInput(shellypro1pm, 1);

export { shellypro1pm };
