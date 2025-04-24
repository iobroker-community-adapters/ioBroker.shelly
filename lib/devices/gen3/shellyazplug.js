'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plug AZ Gen3 / shellyazplug
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyAZPlug
 */
const shellyazplug = {};

shellyHelperGen2.addSwitch(shellyazplug, 0, true);

module.exports = {
    shellyazplug,
};
