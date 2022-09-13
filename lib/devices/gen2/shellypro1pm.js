'use strict';

const shellyHelperGen2 = require(__dirname + '/../gen2-helper');

/**
 * Shelly Pro 1 PM / shellypro1pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro1PM
 */
const shellypro1pm = {

};

shellyHelperGen2.addSwitchToGen2Device(shellypro1pm, 0, true);

shellyHelperGen2.addInputToGen2Device(shellypro1pm, 0);
shellyHelperGen2.addInputToGen2Device(shellypro1pm, 1);

module.exports = {
    shellypro1pm: shellypro1pm,
};
