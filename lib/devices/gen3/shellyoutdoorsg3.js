'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Outdoor Plug S Gen3 / shellyoutdoorsg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyOutdoorPlugSG3
 */
const shellyoutdoorsg3 = {};

shellyHelperGen2.addSwitch(shellyoutdoorsg3, 0, true);

module.exports = {
    shellyoutdoorsg3,
};
