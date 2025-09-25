'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Power Strip Gen 4 / shellypstripg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/Shelly1G4
 */
const shellypstripg4 = {};

shellyHelperGen2.addSwitch(shellypstripg4, 0, true);
shellyHelperGen2.addSwitch(shellypstripg4, 1, true);
shellyHelperGen2.addSwitch(shellypstripg4, 2, true);
shellyHelperGen2.addSwitch(shellypstripg4, 3, true);

shellyHelperGen2.addInput(shellypstripg4, 0);
shellyHelperGen2.addInput(shellypstripg4, 1);
shellyHelperGen2.addInput(shellypstripg4, 2);
shellyHelperGen2.addInput(shellypstripg4, 3);

//shellyHelperGen2.addPlusAddon(shellypstripg4);

module.exports = {
    shellypstripg4: shellypstripg4,
};
