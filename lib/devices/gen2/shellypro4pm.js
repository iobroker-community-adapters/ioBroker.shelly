/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Pro 4 PM / shellypro4pm
 * 
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro4PM
 */
const shellypro4pm = {
    
};

shellyHelper.addSwitchToGen2Device(shellypro4pm, 0, true);
shellyHelper.addSwitchToGen2Device(shellypro4pm, 1, true);
shellyHelper.addSwitchToGen2Device(shellypro4pm, 2, true);
shellyHelper.addSwitchToGen2Device(shellypro4pm, 3, true);

shellyHelper.addInputToGen2Device(shellypro4pm, 0);
shellyHelper.addInputToGen2Device(shellypro4pm, 1);
shellyHelper.addInputToGen2Device(shellypro4pm, 2);
shellyHelper.addInputToGen2Device(shellypro4pm, 3);

module.exports = {
    shellypro4pm: shellypro4pm
};
