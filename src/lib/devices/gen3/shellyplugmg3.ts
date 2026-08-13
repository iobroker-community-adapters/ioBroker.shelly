import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Plug M Gen3 / shellyplugmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugMG3/
 * https://kb.shelly.cloud/knowledge-base/shelly-plug-m-gen3
 */
const shellyplugmg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellyplugmg3, 0, true);
//shellyHelperGen2.addPlugsUI(shellyplugmg3);

export { shellyplugmg3 };
