import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperGen2 from '../gen2-helper';

/**
 * Shelly EM Gen 4 / shellyemg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyEMG4
 * https://kb.shelly.cloud/knowledge-base/shelly-em-gen4
 *
 */
const shellyemg4: DeviceDefinition = {};

shellyHelperGen2.addEM1(shellyemg4, 0, false);
shellyHelperGen2.addEM1Data(shellyemg4, 0);

shellyHelperGen2.addEM1(shellyemg4, 1, false);
shellyHelperGen2.addEM1Data(shellyemg4, 1);

shellyHelperGen2.addSwitch(shellyemg4, 0, false);

export { shellyemg4 };
