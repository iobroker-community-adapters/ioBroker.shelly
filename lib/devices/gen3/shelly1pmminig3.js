"use strict";

const shellyHelperGen3 = require("../gen3-helper");

/**
 * Shelly 1 PM Mini (Gen 3) / shellyplus1pmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMini1PMG3/
 */
const shelly1pmminig3 = {};

shellyHelperGen3.addSwitchToGen3Device(shelly1pmminig3, 0, true);

shellyHelperGen3.addInputToGen3Device(shelly1pmminig3, 0);

module.exports = {
  shelly1pmminig3,
};
