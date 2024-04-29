'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 Mini Gen 3 / shelly1minig3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1G3
 */
const shelly1minig3 = {};

shellyHelperGen2.addSwitch(shelly1minig3, 0, false);

shellyHelperGen2.addInput(shelly1minig3, 0);

module.exports = {
    shelly1minig3: shelly1minig3,
};
