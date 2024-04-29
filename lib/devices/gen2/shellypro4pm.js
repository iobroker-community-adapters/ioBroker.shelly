'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 4 PM / shellypro4pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro4PM
 */
const shellypro4pm = {

};

shellyHelperGen2.addSwitch(shellypro4pm, 0, true);
shellyHelperGen2.addSwitch(shellypro4pm, 1, true);
shellyHelperGen2.addSwitch(shellypro4pm, 2, true);
shellyHelperGen2.addSwitch(shellypro4pm, 3, true);

shellyHelperGen2.addInput(shellypro4pm, 0);
shellyHelperGen2.addInput(shellypro4pm, 1);
shellyHelperGen2.addInput(shellypro4pm, 2);
shellyHelperGen2.addInput(shellypro4pm, 3);

module.exports = {
    shellypro4pm,
};
