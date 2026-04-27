'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Cury / shellycury
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/ShellyCury
 */
const shellycury = {};

shellyHelperGen2.addCury(shellycury, 0);

module.exports = {
    shellycury: shellycury,
};
