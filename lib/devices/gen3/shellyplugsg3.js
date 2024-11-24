'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plug S Gen3 / shellyplugsg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugSG3
 */
const shellyplugsg3 = {};

shellyHelperGen2.addSwitch(shellyplugsg3, 0, true);

module.exports = {
    shellyplugsg3,
};
