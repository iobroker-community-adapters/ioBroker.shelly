'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 1 PM / shellypro1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro1PM
 */
const shellypro1pm = {};

shellyHelperGen2.addSwitch(shellypro1pm, 0, true);

shellyHelperGen2.addInput(shellypro1pm, 0);
shellyHelperGen2.addInput(shellypro1pm, 1);

module.exports = {
    shellypro1pm,
};
