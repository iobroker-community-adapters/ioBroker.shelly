'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Pill / shellypill
 *
 * https://shelly-api-docs.shelly.cloud/gen3/Devices/Gen3/ShellyPill ??? not yet available ???
 *
 * NOTE: Due to missing documentation this implemenation is very heuristic currently
 */
const shellypill = {};

shellyHelperGen2.addInput(shellypill, 200);
shellyHelperGen2.addInput(shellypill, 201);

shellyHelperGen2.addAnalogInput(shellypill, 200);
// as ranges are device specific, lets add the translation locally
// shellypill[`Input100.Range`].common.states = {
//     0: '0 - 15 VDC',
//     1: '0 - 30 VDC',
// };

shellyHelperGen2.addSwitch(shellypill, 200, false);
shellyHelperGen2.addSwitch(shellypill, 201, false);
shellyHelperGen2.addSwitch(shellypill, 202, false);

shellyHelperGen2.addHumiditySensor(shellypill, 200);

shellyHelperGen2.addTemperatureSensor(shellypill, 200);
shellyHelperGen2.addTemperatureSensor(shellypill, 201);
shellyHelperGen2.addTemperatureSensor(shellypill, 202);
shellyHelperGen2.addTemperatureSensor(shellypill, 203);
shellyHelperGen2.addTemperatureSensor(shellypill, 204);

shellyHelperGen2.addVoltmeterSensor(shellypill, 200);
// as ranges are device specific, lets add the translation locally
// shellypill[`Voltmeter100.Range`].common.states = {
//     0: '0 - 15 VDC',
//     1: '0 - 30 VDC',
// };

module.exports = {
    shellypill,
};
