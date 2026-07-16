import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plus 1 / shellyplus1
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus1
 */
const shellyplus1: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellyplus1, 0, false);

shellyHelperGen2.addInput(shellyplus1, 0);

shellyHelperGen2.addPlusAddon(shellyplus1);

export { shellyplus1 };
