import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly I4 Gen4 / shellyi4g4
 * S4SN-0A24X
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyI4G4
 * https://kb.shelly.cloud/knowledge-base/shelly-i4-gen4
 */
const shellyi4g4: DeviceDefinition = {};

shellyHelperGen2.addInput(shellyi4g4, 0);
shellyHelperGen2.addInput(shellyi4g4, 1);
shellyHelperGen2.addInput(shellyi4g4, 2);
shellyHelperGen2.addInput(shellyi4g4, 3);

shellyHelperGen2.addPlusAddon(shellyi4g4);

export { shellyi4g4 };
