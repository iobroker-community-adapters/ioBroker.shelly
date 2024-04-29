'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 3 / shellypro3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro3
 */
const shellypro3 = {};

shellyHelperGen2.addSwitch(shellypro3, 0, false);
shellyHelperGen2.addSwitch(shellypro3, 1, false);
shellyHelperGen2.addSwitch(shellypro3, 2, false);

shellyHelperGen2.addInput(shellypro3, 0);
shellyHelperGen2.addInput(shellypro3, 1);
shellyHelperGen2.addInput(shellypro3, 2);

module.exports = {
    shellypro3,
};
