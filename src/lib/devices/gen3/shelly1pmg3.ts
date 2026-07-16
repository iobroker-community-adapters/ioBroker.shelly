import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1 PM Gen 3 / shelly1pmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly1PMG3
 */
const shelly1pmg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1pmg3, 0, true);

shellyHelperGen2.addInput(shelly1pmg3, 0);

shellyHelperGen2.addPlusAddon(shelly1pmg3);

export { shelly1pmg3 };
