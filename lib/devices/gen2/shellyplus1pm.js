/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus 1 PM / shellyplus1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1PM
 */
const shellyplus1pm = {

};

shellyHelper.addSwitchToGen2Device(shellyplus1pm, 0, true);

shellyHelper.addInputToGen2Device(shellyplus1pm, 0);

module.exports = {
    shellyplus1pm: shellyplus1pm
};
