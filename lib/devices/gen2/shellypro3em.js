'use strict';

const shellyHelperGen2 = require(__dirname + '/../gen2-helper');

/**
 * Shelly Pro 3 EM / shellypro3em
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro3EM
 */
const shellypro3em = {

};

shellyHelperGen2.addEnergyMeterToGen2Device(shellypro3em, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEnergyMeterDataToGen2Device(shellypro3em, 0, ['a', 'b', 'c']);

module.exports = {
    shellypro3em: shellypro3em,
};
