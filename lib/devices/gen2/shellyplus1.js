/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 1 / shellyplus1
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1
 */
const shellyplus1 = {

};

shellyHelper.addSwitchToGen2Device(shellyplus1, 0);

shellyHelper.addInputToGen2Device(shellyplus1, 0);

module.exports = {
    shellyplus1: shellyplus1
};
