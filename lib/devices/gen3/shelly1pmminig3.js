'use strict';

const shellyHelperGen3 = require('../gen3-helper');

/**
 * Shelly Plus 1 PM Mini / shellyplus1pmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1PM
 */
const shelly1pmminig3 = {

};

shellyHelperGen3.addSwitchToGen2Device(shelly1pmminig3, 0, true);

shellyHelperGen3.addInputToGen2Device(shelly1pmminig3, 0);

module.exports = {
    shelly1pmminig3: shelly1pmminig3,
};
