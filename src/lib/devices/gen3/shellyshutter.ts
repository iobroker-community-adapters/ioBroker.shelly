import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Shutter / shellyshutter
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyShutter
 */
const shellyshutter: DeviceDefinition = {};

shellyHelperGen2.addInput(shellyshutter, 0);
shellyHelperGen2.addInput(shellyshutter, 1);

shellyHelperGen2.addCover(shellyshutter, 0, true);

shellyHelperGen2.addPlusAddon(shellyshutter);

export { shellyshutter };
