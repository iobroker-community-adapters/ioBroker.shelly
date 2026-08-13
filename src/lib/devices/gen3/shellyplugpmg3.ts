import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plug PM Gen3 / shellyplugpmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugPMG3
 */
const shellyplugpmg3: DeviceDefinition = {};

shellyHelperGen2.addPM1(shellyplugpmg3, 0);
//shellyHelperGen2.addPlugpmUI(shellyplugpmg3);

export { shellyplugpmg3 };
