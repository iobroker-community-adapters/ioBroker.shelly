'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 PM Gen 3 / shelly1pmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly1PMG3
 */
const shelly1pmg3 = {};

shellyHelperGen2.addSwitch(shelly1pmg3, 0, true);

shellyHelperGen2.addInput(shelly1pmg3, 0);

module.exports = {
    shelly1pmg3: shelly1pmg3,
};
