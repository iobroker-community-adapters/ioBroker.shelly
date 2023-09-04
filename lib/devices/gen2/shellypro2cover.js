'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro Dual Cover PM
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyProDualCoverPM
 */
const shellypro2cover = {

};

shellyHelperGen2.addInputToGen2Device(shellypro2cover, 0);
shellyHelperGen2.addInputToGen2Device(shellypro2cover, 1);
shellyHelperGen2.addInputToGen2Device(shellypro2cover, 2);
shellyHelperGen2.addInputToGen2Device(shellypro2cover, 3);

shellyHelperGen2.addCoverToGen2Device(shellypro2cover, 0);
shellyHelperGen2.addCoverToGen2Device(shellypro2cover, 1);

module.exports = {
    shellypro2cover,
};
