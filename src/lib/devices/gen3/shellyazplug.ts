import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plug AZ Gen3 / shellyazplug
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyAZPlug
 */
const shellyazplug: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellyazplug, 0, true);
//shellyHelperGen2.addPlugsUI(shellyazplug);

export { shellyazplug };
