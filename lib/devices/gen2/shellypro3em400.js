'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 3 EM / shellypro3em400
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro3EM
 */
const shellypro3em400 = {};

shellyHelperGen2.addEM(shellypro3em400, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMData(shellypro3em400, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMTemperatureSensor(shellypro3em400);
shellyHelperGen2.addProOutputAddon(shellypro3em400);

module.exports = {
    shellypro3em400,
};
