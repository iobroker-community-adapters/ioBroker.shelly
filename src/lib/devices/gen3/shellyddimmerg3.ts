import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Dali Dimmer Gen 3 / shellyddimmerg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyDDimmerG3
 */
const shellyddimmerg3: DeviceDefinition = {};

shellyHelperGen2.addLight(shellyddimmerg3, 0, false);

shellyHelperGen2.addInput(shellyddimmerg3, 0);
shellyHelperGen2.addInput(shellyddimmerg3, 1);

shellyHelperGen2.addPlusAddon(shellyddimmerg3);

export { shellyddimmerg3 };
