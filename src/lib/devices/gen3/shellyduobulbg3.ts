import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Duo Bulb E27 Gen 3 / shellyduobulbg3 / S3BL-D010009AEU
 *
 * Tunable white bulb (2700 K - 6500 K) with power metering, uses the CCT component.
 *
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/CCT
 */
const shellyduobulbg3: DeviceDefinition = {};

shellyHelperGen2.addCCT(shellyduobulbg3, 0, true);

export { shellyduobulbg3 };
