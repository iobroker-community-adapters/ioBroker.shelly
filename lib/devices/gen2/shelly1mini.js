'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 Mini / shelly1mini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus1
 */
const shelly1mini = {};

shellyHelperGen2.addSwitch(shelly1mini, 0, false);

shellyHelperGen2.addInput(shelly1mini, 0);

module.exports = {
    shelly1mini,
};
