'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 1 / shellyplus1
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1
 */
const shellyplus1 = {

};

shellyHelper.addSwitchToGen2Device(shellyplus1, 0, false);

shellyHelper.addInputToGen2Device(shellyplus1, 0);

module.exports = {
    shellyplus1: shellyplus1
};
