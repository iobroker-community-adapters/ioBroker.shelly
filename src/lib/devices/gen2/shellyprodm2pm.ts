import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro Dimmer 2 PM / shellyprodm2pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer2PM/
 */
const shellyprodm2pm: DeviceDefinition = {};

shellyHelperGen2.addLight(shellyprodm2pm, 0, true);
shellyHelperGen2.addLight(shellyprodm2pm, 1, true);

shellyHelperGen2.addInput(shellyprodm2pm, 0);
shellyHelperGen2.addInput(shellyprodm2pm, 1);
shellyHelperGen2.addInput(shellyprodm2pm, 2);
shellyHelperGen2.addInput(shellyprodm2pm, 3);

export { shellyprodm2pm };
