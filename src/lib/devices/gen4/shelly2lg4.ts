import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 2L Gen 4 / shelly2lg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly2LG4
 */
const shelly2lg4: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly2lg4, 0, false);
shellyHelperGen2.addSwitch(shelly2lg4, 1, false);

shellyHelperGen2.addInput(shelly2lg4, 0);
shellyHelperGen2.addInput(shelly2lg4, 1);

shellyHelperGen2.addPlusAddon(shelly2lg4);

export { shelly2lg4 };
