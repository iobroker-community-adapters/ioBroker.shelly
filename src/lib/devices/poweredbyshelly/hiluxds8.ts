import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * HiluX DS8 by Shelly / hiluxds8
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/HiluXDS8 (not available)
 */
const hiluxds8: DeviceDefinition = {};

shellyHelperGen2.addCCT(hiluxds8, 0, false);

export { hiluxds8 };
