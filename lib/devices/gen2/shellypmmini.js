'use strict';

const shellyHelperGen2 = require(__dirname + '/../gen2-helper');

/**
 * Shelly Plus PM Mini / shellypluspmmini
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusPMMini
 */
const shellypmmini = {

};

shellyHelperGen2.addPM1ToGen2Device(shellypmmini, 0, true);


module.exports = {
    shellypmmini: shellypmmini,
};
