'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Cury / cury
 *
 * https://www.shelly.com/de/blogs/documentation/cury
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/ShellyCury
 */
const cury = {};

shellyHelperGen2.addCury(cury, 0);

module.exports = {
    cury: cury,
};
