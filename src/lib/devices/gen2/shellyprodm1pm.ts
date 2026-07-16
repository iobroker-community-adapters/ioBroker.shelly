import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro Dimmer 1 PM / shellyprodm1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer1PM
 */
const shellyprodm1pm: DeviceDefinition = {};

shellyHelperGen2.addLight(shellyprodm1pm, 0, true);

shellyHelperGen2.addInput(shellyprodm1pm, 0);
shellyHelperGen2.addInput(shellyprodm1pm, 1);

export { shellyprodm1pm };
