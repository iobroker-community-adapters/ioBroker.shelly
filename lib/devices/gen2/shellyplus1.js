'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 / shellyplus1
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1
 */
const shellyplus1 = {

};

shellyHelperGen2.addSwitchToGen2Device(shellyplus1, 0, false);

shellyHelperGen2.addInputToGen2Device(shellyplus1, 0);

module.exports = {
    shellyplus1,
};
