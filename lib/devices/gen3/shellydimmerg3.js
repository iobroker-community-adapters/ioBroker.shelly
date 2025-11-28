'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Dimmer Gen 3 / shellydimmerg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyDimmerG3
 */
const shellydimmerg3 = {};

shellyHelperGen2.addLight(shellydimmerg3, 0, true);

shellyHelperGen2.addInput(shellydimmerg3, 0);
shellyHelperGen2.addInput(shellydimmerg3, 1);

// add on not supported according to data at
//   https://www.shelly.com/de/products/shelly-plus-add-on
//   https://kb.shelly.cloud/knowledge-base/shelly-plus-add-on
//shellyHelperGen2.addPlusAddon(shellydimmerg3);

module.exports = {
    shellydimmerg3: shellydimmerg3,
};
