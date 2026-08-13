import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plus 1 Mini / shelly1mini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus1
 */
const shelly1mini: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1mini, 0, false);

shellyHelperGen2.addInput(shelly1mini, 0);

export { shelly1mini };
