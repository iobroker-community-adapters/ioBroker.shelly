'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 0-10V Dimmer Gen 3 / shelly0110dimg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlus10V
 */
const shelly0110dimg3 = {};

shellyHelperGen2.addLight(shelly0110dimg3, 0);

shellyHelperGen2.addInput(shelly0110dimg3, 0);
shellyHelperGen2.addInput(shelly0110dimg3, 1);

shellyHelperGen2.addPlusAddon(shelly0110dimg3);

module.exports = {
    shelly0110dimg3: shelly0110dimg3,
};

