/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Plus I4 / shellyplusi4
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusI4
 */
const shellyplusi4 = {
    
};

shellyHelper.addInputToGen2Device(shellyplusi4, 0);
shellyHelper.addInputToGen2Device(shellyplusi4, 1);
shellyHelper.addInputToGen2Device(shellyplusi4, 2);
shellyHelper.addInputToGen2Device(shellyplusi4, 3);

module.exports = {
    shellyplusi4: shellyplusi4
};
