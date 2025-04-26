'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Ogemray 25A / ogemray25a
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/Ogemray25A
 */
const ogemray25a = {};

shellyHelperGen2.addSwitch(ogemray25a, 0, true);

shellyHelperGen2.addInput(ogemray25a, 0);

module.exports = {
    ogemray25a,
};
