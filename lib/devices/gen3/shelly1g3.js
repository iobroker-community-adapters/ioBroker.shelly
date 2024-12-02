'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 Gen 3 / shelly1g3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly1G3
 */
const shelly1g3 = {};

shellyHelperGen2.addSwitch(shelly1g3, 0, false);

shellyHelperGen2.addInput(shelly1g3, 0);

shellyHelperGen2.addPlusAddon(shelly1g3);

module.exports = {
    shelly1g3: shelly1g3,
};
