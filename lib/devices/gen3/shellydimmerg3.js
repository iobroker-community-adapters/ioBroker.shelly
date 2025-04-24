'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Dimmer Gen 3 / shellydimmerg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyDimmerG3
 */
const shellydimmerg3 = {};

shellyHelperGen2.addLight(shellydimmerg3, 0, false);

shellyHelperGen2.addInput(shellydimmerg3, 0);
shellyHelperGen2.addInput(shellydimmerg3, 1);

shellyHelperGen2.addPlusAddon(shellydimmerg3);

module.exports = {
    shellydimmerg3: shellydimmerg3,
};
