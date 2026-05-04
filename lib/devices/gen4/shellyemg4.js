'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly EM Gen 4 / shellyemg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyEMG4
 *
 * NOTE:
 * EM1Data is added twice for compatibility reasons. Should be removed from EM1 with next major release.
 */
const shellyemg4 = {};

shellyHelperGen2.addEM1(shellyemg4, 0, true);
shellyHelperGen2.addEM1Data(shellyemg4, 0);

shellyHelperGen2.addEM1(shellyemg4, 1, true);
shellyHelperGen2.addEM1Data(shellyemg4, 1);

shellyHelperGen2.addSwitch(shellyemg4, 0, false);

module.exports = {
    shellyemg4,
};
