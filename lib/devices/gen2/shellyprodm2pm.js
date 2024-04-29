'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro Dimmer 2 PM / shellyprodm2pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer2PM/
 */
const shellyprodm2pm = {};

shellyHelperGen2.addLight(shellyprodm2pm, 0);
shellyHelperGen2.addLight(shellyprodm2pm, 1);

shellyHelperGen2.addInput(shellyprodm2pm, 0);
shellyHelperGen2.addInput(shellyprodm2pm, 1);
shellyHelperGen2.addInput(shellyprodm2pm, 2);
shellyHelperGen2.addInput(shellyprodm2pm, 3);

module.exports = {
    shellyprodm2pm,
};
