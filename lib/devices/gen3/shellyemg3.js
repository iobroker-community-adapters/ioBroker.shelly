'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly EM Gen 3 / shellyemg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyEMG3/
 */
const shellyemg3 = {};

shellyHelperGen2.addEM1(shellyemg3, 0, true);
shellyHelperGen2.addEM1(shellyemg3, 1, true);

shellyHelperGen2.addSwitch(shellyemg3, 0, false);

module.exports = {
    shellyemg3,
};
