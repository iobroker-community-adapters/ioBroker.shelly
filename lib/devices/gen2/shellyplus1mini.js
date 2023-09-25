'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 Mini / shellyplus1mini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1
 */
const shellyplus1mini = {

};

shellyHelperGen2.addSwitchToGen2Device(shellyplus1mini, 0, false);

shellyHelperGen2.addInputToGen2Device(shellyplus1mini, 0);

module.exports = {
    shellyplus1mini,
};
