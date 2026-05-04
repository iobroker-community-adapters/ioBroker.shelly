'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * HiluX DS8 by Shelly / hiluxds8
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/HiluXDS8 (not available)
 */
const hiluxds8 = {};

shellyHelperGen2.addCCT(hiluxds8, 0, false);

module.exports = {
    hiluxds8: hiluxds8,
};
