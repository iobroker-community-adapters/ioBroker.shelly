'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus Plug S / shellyplusplugs
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusPlugS
 */
const shellyplusplugs = {};

shellyHelperGen2.addSwitch(shellyplusplugs, 0, true);

module.exports = {
    shellyplusplugs,
};
