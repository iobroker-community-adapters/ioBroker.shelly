'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Dimmer Gen 4 / shellydimmerg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyDimmerG4
 * https://kb.shelly.cloud/knowledge-base/shelly-dimmer-gen4
 */
const shellydimmerg4 = {};

shellyHelperGen2.addLight(shellydimmerg4, 0, true);

shellyHelperGen2.addInput(shellydimmerg4, 0);
shellyHelperGen2.addInput(shellydimmerg4, 1);

// add on not supported according to data at
//   https://www.shelly.com/de/products/shelly-plus-add-on
//   https://kb.shelly.cloud/knowledge-base/shelly-plus-add-on
//shellyHelperGen2.addPlusAddon(shellydimmerg4);

module.exports = {
    shellydimmerg4: shellydimmerg4,
};
