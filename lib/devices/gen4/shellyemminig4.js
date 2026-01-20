'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly EM Mini Gen 4 / shellyemminig4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyMiniEMG4
 *
 * NOTE:
 * EM1Data is added twice for compatibility reasons. Shoudl be removed from EM1 with next major release.
 */
const shellyemminig4 = {};

shellyHelperGen2.addEM1(shellyemminig4, 0, false);
shellyHelperGen2.addEM1Data(shellyemminig4, 0);

module.exports = {
    shellyemminig4,
};
