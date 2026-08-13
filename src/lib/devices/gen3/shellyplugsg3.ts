import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plug S Gen3 / shellyplugsg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugSG3
 */
const shellyplugsg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellyplugsg3, 0, true);
//shellyHelperGen2.addPlugsUI(shellyplugsg3);

export { shellyplugsg3 };
