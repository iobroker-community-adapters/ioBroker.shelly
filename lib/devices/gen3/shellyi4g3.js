'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly I4 / I4DC Gen3 / shellyi4g3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyI4G3
 */
const shellyi4g3 = {};

shellyHelperGen2.addInput(shellyi4g3, 0);
shellyHelperGen2.addInput(shellyi4g3, 1);
shellyHelperGen2.addInput(shellyi4g3, 2);
shellyHelperGen2.addInput(shellyi4g3, 3);

shellyHelperGen2.addPlusAddon(shellyi4g3);

module.exports = {
    shellyi4g3,
};
