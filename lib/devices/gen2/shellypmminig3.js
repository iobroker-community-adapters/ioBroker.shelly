'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus PM Mini / shellypluspmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyMiniPMG3
 */
const shellypmminig3 = {

};

shellyHelperGen2.addPM1ToGen2Device(shellypmminig3, 0, true);


module.exports = {
    shellypmminig3,
};
