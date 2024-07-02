'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro EM 2x50 / shellyproem50
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProEM
 */
const shellyproem50 = {};

shellyHelperGen2.addEM1(shellyproem50, 0);
shellyHelperGen2.addEM1(shellyproem50, 1);

module.exports = {
    shellyproem50,
};
