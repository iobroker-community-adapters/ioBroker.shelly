import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1 Gen 4 / shelly1g4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly1G4
 */
const shelly1g4: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1g4, 0, false);

shellyHelperGen2.addInput(shelly1g4, 0);

shellyHelperGen2.addPlusAddon(shelly1g4);

export { shelly1g4 };
