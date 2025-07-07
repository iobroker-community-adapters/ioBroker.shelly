'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Shutter / shellyshutter
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyShutter
 */
const shellyshutter = {};

shellyHelperGen2.addInput(shellyshutter, 0);
shellyHelperGen2.addInput(shellyshutter, 1);

shellyHelperGen2.addCover(shellyshutter, 0);

shellyHelperGen2.addPlusAddon(shellyshutter);

module.exports = {
    shellyshutter: shellyshutter,
};
