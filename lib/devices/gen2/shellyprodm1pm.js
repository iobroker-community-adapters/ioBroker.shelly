'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro Dimmer 1 PM / shellyprodm1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer1PM
 */
const shellyprodm1pm = {};

shellyHelperGen2.addLight(shellyprodm1pm, 0, true);

shellyHelperGen2.addInput(shellyprodm1pm, 0);
shellyHelperGen2.addInput(shellyprodm1pm, 1);

module.exports = {
    shellyprodm1pm,
};
