'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly EM Gen 3 / shellyemg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyEMG3/
 *
 * NOTE:
 * EM1Data is added twice for compatibility reasons. Shoudl be removed from EM1 with next major release.
 */
const shellyemg3 = {};

shellyHelperGen2.addEM1(shellyemg3, 0, true);
shellyHelperGen2.addEM1Data(shellyemg3, 0);

shellyHelperGen2.addEM1(shellyemg3, 1, true);
shellyHelperGen2.addEM1Data(shellyemg3, 1);

shellyHelperGen2.addSwitch(shellyemg3, 0, false);

module.exports = {
    shellyemg3,
};
