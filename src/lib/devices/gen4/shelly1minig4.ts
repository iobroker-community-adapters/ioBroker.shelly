import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly 1 Mini Gen 4 / shelly1minig4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyMini1G4
 */
const shelly1minig4: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shelly1minig4, 0, false);

shellyHelperGen2.addInput(shelly1minig4, 0);

export { shelly1minig4 };
