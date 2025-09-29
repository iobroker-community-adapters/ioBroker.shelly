'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Power Strip Gen 4 / shellypstripg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyPowerStripG4
 * https://www.shelly.com/de/blogs/documentation/shelly-power-strip-gen4
 */
const shellypstripg4 = {};

shellyHelperGen2.addSwitch(shellypstripg4, 0, true);
shellyHelperGen2.addSwitch(shellypstripg4, 1, true);
shellyHelperGen2.addSwitch(shellypstripg4, 2, true);
shellyHelperGen2.addSwitch(shellypstripg4, 3, true);

// shellyHelperGen2.addPowerstripUI(shellypstripg4, 0); ### not yet implemented ###

module.exports = {
    shellypstripg4: shellypstripg4,
};
