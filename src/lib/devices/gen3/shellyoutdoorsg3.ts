import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Outdoor Plug S Gen3 / shellyoutdoorsg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyOutdoorPlugSG3
 */
const shellyoutdoorsg3: DeviceDefinition = {};

shellyHelperGen2.addSwitch(shellyoutdoorsg3, 0, true);

export { shellyoutdoorsg3 };
