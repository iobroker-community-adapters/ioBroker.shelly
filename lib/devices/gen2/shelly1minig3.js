'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 Mini (Gen 3) / shelly1mini1g3
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1G3
 */
const shelly1minig3 = {

};

shellyHelperGen2.addSwitchToGen2Device(shelly1minig3, 0, false);

shellyHelperGen2.addInputToGen2Device(shelly1minig3, 0);

module.exports = {
    shelly1minig3,
};
