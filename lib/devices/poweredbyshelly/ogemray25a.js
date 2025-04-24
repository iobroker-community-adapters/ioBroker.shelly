'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 1 Gen 3 / shelly1g3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/Ogemray25A
 */
const ogemray25a = {};

shellyHelperGen2.addSwitch(ogemray25a, 0, true);

shellyHelperGen2.addInput(ogemray25a, 0);

module.exports = {
    shelly1g3: ogemray25a,
};
