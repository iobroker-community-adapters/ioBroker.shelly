'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus 1 PM Mini / shellyplus1pmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1PM
 */
const shellyplus1pmmini = {

};

shellyHelperGen2.addSwitchToGen2Device(shellyplus1pmmini, 0, true);

shellyHelperGen2.addInputToGen2Device(shellyplus1pmmini, 0);

module.exports = {
    shellyplus1pmmini,
};
