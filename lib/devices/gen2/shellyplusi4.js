'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus I4 / shellyplusi4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusI4
 */
const shellyplusi4 = {};

shellyHelperGen2.addInputToGen2Device(shellyplusi4, 0);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 1);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 2);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 3);

shellyHelperGen2.addPlusAddon(shellyplusi4);

module.exports = {
    shellyplusi4,
};
