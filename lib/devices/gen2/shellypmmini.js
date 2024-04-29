'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus PM Mini / shellypluspmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusPMMini
 */
const shellypmmini = {};

shellyHelperGen2.addPM1(shellypmmini, 0);

module.exports = {
    shellypmmini,
};
