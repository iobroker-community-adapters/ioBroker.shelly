import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly Cury / cury
 *
 * https://www.shelly.com/de/blogs/documentation/cury
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/ShellyCury
 */
const cury: DeviceDefinition = {};

shellyHelperGen2.addCury(cury, 0);

export { cury };
