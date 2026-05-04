'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * HiluX DS8 by Shelly / hiluxds8
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/PoweredByShelly/HiluXDS8
 */
const hiluxds8 = {};

shellyHelperGen2.addCCT(hiluxds8, 0, false);
shellyHelperGen2.addCCT(hiluxds8, 1, false);
shellyHelperGen2.addCCT(hiluxds8, 2, false);
shellyHelperGen2.addCCT(hiluxds8, 3, false);
shellyHelperGen2.addCCT(hiluxds8, 4, false);
shellyHelperGen2.addCCT(hiluxds8, 5, false);
shellyHelperGen2.addCCT(hiluxds8, 6, false);
shellyHelperGen2.addCCT(hiluxds8, 7, false);

module.exports = {
    hiluxds8: hiluxds8,
};
