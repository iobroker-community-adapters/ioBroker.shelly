'use strict';

const shellyHelperGen2 = require(__dirname + '/../gen2-helper');

/**
 * Shelly Pro 4 PM / shellypro4pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro4PM
 */
const shellypro4pm = {

};

shellyHelperGen2.addSwitchToGen2Device(shellypro4pm, 0, true);
shellyHelperGen2.addSwitchToGen2Device(shellypro4pm, 1, true);
shellyHelperGen2.addSwitchToGen2Device(shellypro4pm, 2, true);
shellyHelperGen2.addSwitchToGen2Device(shellypro4pm, 3, true);

shellyHelperGen2.addInputToGen2Device(shellypro4pm, 0);
shellyHelperGen2.addInputToGen2Device(shellypro4pm, 1);
shellyHelperGen2.addInputToGen2Device(shellypro4pm, 2);
shellyHelperGen2.addInputToGen2Device(shellypro4pm, 3);

module.exports = {
    shellypro4pm: shellypro4pm
};
