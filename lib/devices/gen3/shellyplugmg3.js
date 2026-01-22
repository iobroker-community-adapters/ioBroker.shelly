'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plug M Gen3 / shellyplugmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyPlugMG3/
 * https://kb.shelly.cloud/knowledge-base/shelly-plug-m-gen3
 */
const shellyplugmg3 = {};

shellyHelperGen2.addSwitch(shellyplugmg3, 0, true);

module.exports = {
    shellyplugmg3,
};
