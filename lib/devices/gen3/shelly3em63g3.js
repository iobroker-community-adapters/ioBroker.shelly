'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly 3EM / shelly3emg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly3EMG3
 */
const shelly3em63g3 = {};

shellyHelperGen2.addEM(shelly3em63g3, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMData(shelly3em63g3, 0, ['a', 'b', 'c']);
shellyHelperGen2.addEMTemperatureSensor(shelly3em63g3);

module.exports = {
    shelly3em63g3: shelly3em63g3,
};
