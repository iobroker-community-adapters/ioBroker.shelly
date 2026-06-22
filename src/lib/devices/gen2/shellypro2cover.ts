import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Pro Dual Cover PM
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDualCoverPM
 */
const shellypro2cover: DeviceDefinition = {};

shellyHelperGen2.addInput(shellypro2cover, 0);
shellyHelperGen2.addInput(shellypro2cover, 1);
shellyHelperGen2.addInput(shellypro2cover, 2);
shellyHelperGen2.addInput(shellypro2cover, 3);

shellyHelperGen2.addCover(shellypro2cover, 0, true);
shellyHelperGen2.addCover(shellypro2cover, 1, true);

export { shellypro2cover };
