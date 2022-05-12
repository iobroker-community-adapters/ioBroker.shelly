/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Pro 2 / shellypro2
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro2
 */
const shellypro2 = {

};

shellyHelper.addSwitchToGen2Device(shellypro2, 0);
shellyHelper.addSwitchToGen2Device(shellypro2, 1);

shellyHelper.addInputToGen2Device(shellypro2, 0);
shellyHelper.addInputToGen2Device(shellypro2, 1);

module.exports = {
    shellypro2: shellypro2
};
