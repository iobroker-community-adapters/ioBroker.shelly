import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plus 0-10V Dimmer / shellyplus010v
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus10V
 */
const shellyplus010v: DeviceDefinition = {};

shellyHelperGen2.addLight(shellyplus010v, 0, false);

shellyHelperGen2.addInput(shellyplus010v, 0);
shellyHelperGen2.addInput(shellyplus010v, 1);

shellyHelperGen2.addPlusAddon(shellyplus010v);

export { shellyplus010v };
