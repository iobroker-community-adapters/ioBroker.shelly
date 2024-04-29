'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 PM Mini / shellyplus1pmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus1PM
 */
const shelly1pmmini = {};

shellyHelperGen2.addSwitch(shelly1pmmini, 0, true);

shellyHelperGen2.addInput(shelly1pmmini, 0);

module.exports = {
    shelly1pmmini,
};
