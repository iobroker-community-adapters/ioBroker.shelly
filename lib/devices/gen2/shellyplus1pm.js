'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 PM / shellyplus1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1PM
 */
const shellyplus1pm = {

};

shellyHelperGen2.addSwitchToGen2Device(shellyplus1pm, 0, true);

shellyHelperGen2.addInputToGen2Device(shellyplus1pm, 0);

module.exports = {
    shellyplus1pm,
};
