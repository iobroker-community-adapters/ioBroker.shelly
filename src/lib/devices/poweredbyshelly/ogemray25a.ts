import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Ogemray 25A / ogemray25a
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/Ogemray25A
 */
const ogemray25a: DeviceDefinition = {};

shellyHelperGen2.addSwitch(ogemray25a, 0, true);

shellyHelperGen2.addInput(ogemray25a, 0);

export { ogemray25a };
