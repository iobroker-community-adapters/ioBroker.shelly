'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 PM Gen 4 / shelly1pmg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly1PMG4
 */
const shelly1pmg4 = {};

shellyHelperGen2.addSwitch(shelly1pmg4, 0, true);

shellyHelperGen2.addInput(shelly1pmg4, 0);

shellyHelperGen2.addPlusAddon(shelly1pmg4);

module.exports = {
    shelly1pmg4,
};
