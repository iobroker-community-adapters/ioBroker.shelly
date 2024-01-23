'use strict';

const shellyHelperGen3 = require('../gen3-helper');

/**
 * Shelly 1 Mini (Gen 3) / shelly1mini1g3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1G3
 */
const shelly1mini = {

};

shellyHelperGen3.addSwitchToGen3Device(shellymini1g3, 0, false);

shellyHelperGen3.addInputToGen3Device(shellymini1g3, 0);

module.exports = {
    shelly1mini1g3,
};
