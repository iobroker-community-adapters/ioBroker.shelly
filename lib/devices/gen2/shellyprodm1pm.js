'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro Dimmer 1 PM / shellyprodm1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer1PM
 */
const shellyprodm1pm = {};

shellyHelperGen2.addLightToGen2Device(shellyprodm1pm, 0);

shellyHelperGen2.addInputToGen2Device(shellyprodm1pm, 0);
shellyHelperGen2.addInputToGen2Device(shellyprodm1pm, 1);

module.exports = {
    shellyprodm1pm,
};
