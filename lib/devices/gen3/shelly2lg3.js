'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 2L Gen 3 / shelly2lg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly2LG3
 */
const shelly2lg3 = {};

shellyHelperGen2.addSwitch(shelly2lg3, 0, false);
shellyHelperGen2.addSwitch(shelly2lg3, 1, false);

shellyHelperGen2.addInput(shelly2lg3, 0);
shellyHelperGen2.addInput(shelly2lg3, 1);

shellyHelperGen2.addPlusAddon(shelly2lg3);

module.exports = {
    shelly2lg3: shelly2lg3,
};
