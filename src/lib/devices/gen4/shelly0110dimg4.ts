import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Dimmer 0/1-10V PM Gen 4 / shelly0110dimg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyDimmer0110VPMG4
 * https://kb.shelly.cloud/knowledge-base/shelly-dimmer-0-1-10v-pm-gen4
 */
const shelly0110dimg4: DeviceDefinition = {};

shellyHelperGen2.addLight(shelly0110dimg4, 0, true);

shellyHelperGen2.addInput(shelly0110dimg4, 0);
shellyHelperGen2.addInput(shelly0110dimg4, 1);

export { shelly0110dimg4 };
