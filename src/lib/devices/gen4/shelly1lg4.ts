import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1L Gen 4 / shelly1lg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly1LG4
 */
const shelly1lg4: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1lg4, 0, false);

shellyHelperGen2.addInput(shelly1lg4, 0);

shellyHelperGen2.addPlusAddon(shelly1lg4);

export { shelly1lg4 };
