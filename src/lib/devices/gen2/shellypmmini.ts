import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plus PM Mini / shellypluspmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusPMMini
 */
const shellypmmini: DeviceDefinition = {};

shellyHelperGen2.addPM1(shellypmmini, 0);

export { shellypmmini };
