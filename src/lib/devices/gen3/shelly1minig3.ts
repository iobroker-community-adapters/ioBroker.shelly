import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1 Mini Gen 3 / shelly1minig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1G3
 */
const shelly1minig3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1minig3, 0, false);

shellyHelperGen2.addInput(shelly1minig3, 0);

export { shelly1minig3 };
