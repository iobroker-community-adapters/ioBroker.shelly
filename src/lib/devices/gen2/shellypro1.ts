import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro 1 / shellypro1
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro1
 */
const shellypro1: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellypro1, 0, false);

shellyHelperGen2.addInput(shellypro1, 0);
shellyHelperGen2.addInput(shellypro1, 1);

export { shellypro1 };
