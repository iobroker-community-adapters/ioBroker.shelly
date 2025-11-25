'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plug PM Gen3 / shellyplugpmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugPMG3
 */
const shellyplugpmg3 = {};

shellyHelperGen2.addPM1(shellyplugpmg3, 0);

module.exports = {
    shellyplugpmg3,
};
