'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 Gen 4 / shelly1g4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly1G4
 */
const shelly1g4 = {};

shellyHelperGen2.addSwitch(shelly1g4, 0, false);

shellyHelperGen2.addInput(shelly1g4, 0);

shellyHelperGen2.addPlusAddon(shelly1g4);

module.exports = {
    shelly1g4: shelly1g4,
};
