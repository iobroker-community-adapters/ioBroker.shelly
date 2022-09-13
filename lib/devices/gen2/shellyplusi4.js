'use strict';

const shellyHelperGen2 = require(__dirname + '/../gen2-helper');

/**
 * Shelly Plus I4 / shellyplusi4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusI4
 */
const shellyplusi4 = {

};

shellyHelperGen2.addInputToGen2Device(shellyplusi4, 0);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 1);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 2);
shellyHelperGen2.addInputToGen2Device(shellyplusi4, 3);

module.exports = {
    shellyplusi4: shellyplusi4,
};
