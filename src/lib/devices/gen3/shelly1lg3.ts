import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1L Gen 3 / shelly1lg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly1LG3
 */
const shelly1lg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1lg3, 0, false);

shellyHelperGen2.addInput(shelly1lg3, 0);

shellyHelperGen2.addPlusAddon(shelly1lg3);

export { shelly1lg3 };
