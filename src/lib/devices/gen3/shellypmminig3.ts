import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly PM Mini Gen 3 / shellypmminig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMiniPMG3
 */
const shellypmminig3: DeviceDefinition = {};

shellyHelperGen2.addPM1(shellypmminig3, 0);

export { shellypmminig3 };
