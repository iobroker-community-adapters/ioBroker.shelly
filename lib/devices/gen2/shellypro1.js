'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 1 / shellypro1
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro1
 */
const shellypro1 = {

};

shellyHelperGen2.addSwitchToGen2Device(shellypro1, 0, false);

shellyHelperGen2.addInputToGen2Device(shellypro1, 0);
shellyHelperGen2.addInputToGen2Device(shellypro1, 1);

module.exports = {
    shellypro1,
};
