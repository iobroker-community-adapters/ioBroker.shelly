'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 PM Mini Gen 4 / shelly1pmminig4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyMini1PMG4
 */
const shelly1pmminig4 = {};

shellyHelperGen2.addSwitch(shelly1pmminig4, 0, true);

shellyHelperGen2.addInput(shelly1pmminig4, 0);

module.exports = {
    shelly1pmminig4: shelly1pmminig4,
};
