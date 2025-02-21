'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 3 EM / shellypro3em63
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro3EM
 */
const shellypro3em63 = {};

shellyHelperGen2.addEnergyMeter(shellypro3em63, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEnergyMeterData(shellypro3em63, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMTemperatureSensor(shellypro3em63);
shellyHelperGen2.addProOutputAddon(shellypro3em63);

module.exports = {
    shellypro3em63,
};
