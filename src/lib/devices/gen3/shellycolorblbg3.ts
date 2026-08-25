import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Multicolor Bulb E27 Gen 3 / shellycolorblbg3 / S3BL-C010007AEU
 *
 * RGB + tunable white bulb (2700 K - 6500 K) with power metering, uses the RGBCCT component.
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyRGBCCTBulbG3
 * https://kb.shelly.cloud/knowledge-base/shelly-multicolor-bulb-e27-gen3
 *
 */
const shellycolorblbg3: DeviceDefinition = {};

shellyHelperGen2.addRGBCCT(shellycolorblbg3, 0, true);

export { shellycolorblbg3 };
