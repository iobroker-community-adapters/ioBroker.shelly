'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly PM Mini Gen 3 / shellypmminig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMiniPMG3
 */
const shellypmminig3 = {};

shellyHelperGen2.addPM1(shellypmminig3, 0);

module.exports = {
    shellypmminig3: shellypmminig3,
};
