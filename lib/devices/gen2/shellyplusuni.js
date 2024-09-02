'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus Uni / shellyplusuni
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusUni
 */
const shellyplusuni = {};

shellyHelperGen2.addInput(shellyplusuni, 0);
shellyHelperGen2.addInput(shellyplusuni, 1);
shellyHelperGen2.addInput(shellyplusuni, 2);

shellyHelperGen2.addSwitch(shellyplusuni, 0, false);
shellyHelperGen2.addSwitch(shellyplusuni, 1, false);

module.exports = {
    shellyplusuni,
};
