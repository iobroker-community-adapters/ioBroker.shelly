'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 2 / shellypro2
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro2
 */
const shellypro2 = {

};

shellyHelperGen2.addSwitch(shellypro2, 0, false);
shellyHelperGen2.addSwitch(shellypro2, 1, false);

shellyHelperGen2.addInput(shellypro2, 0);
shellyHelperGen2.addInput(shellypro2, 1);

module.exports = {
    shellypro2,
};
