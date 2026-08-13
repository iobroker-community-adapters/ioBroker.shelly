import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plus 1 PM Mini / shellyplus1pmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus1PM
 */
const shelly1pmmini: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1pmmini, 0, true);

shellyHelperGen2.addInput(shelly1pmmini, 0);

export { shelly1pmmini };
