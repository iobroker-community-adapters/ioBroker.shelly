'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pro 3 EM / shellypro3em
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro3EM
 */
const shellypro3em = {};

shellyHelperGen2.addEM(shellypro3em, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMData(shellypro3em, 0, ['a', 'b', 'c']);

shellyHelperGen2.addProOutputAddon(shellypro3em);

module.exports = {
    shellypro3em,
};
