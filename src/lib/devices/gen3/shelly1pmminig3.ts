import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1 PM Mini Gen 3 / shelly1pmminig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1PMG3
 */
const shelly1pmminig3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1pmminig3, 0, true);

shellyHelperGen2.addInput(shelly1pmminig3, 0);

export { shelly1pmminig3 };
