/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Pro 1 PM / shellypro1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro1PM
 */
const shellypro1pm = {

};

shellyHelper.addSwitchToGen2Device(shellypro1pm, 0, true);

shellyHelper.addInputToGen2Device(shellypro1pm, 0);
shellyHelper.addInputToGen2Device(shellypro1pm, 1);

module.exports = {
    shellypro1pm: shellypro1pm
};
