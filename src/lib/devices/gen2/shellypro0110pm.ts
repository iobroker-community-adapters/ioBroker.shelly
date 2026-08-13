import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro Dimmer 0/1-10V PM / shellypro0110pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer0110VPM
 */
const shellypro0110pm: DeviceDefinition = {};

shellyHelperGen2.addLight(shellypro0110pm, 0, true);

shellyHelperGen2.addInput(shellypro0110pm, 0);
shellyHelperGen2.addInput(shellypro0110pm, 1);

export { shellypro0110pm };
