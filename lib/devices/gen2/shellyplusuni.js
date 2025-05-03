'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Plus Uni / shellyplusuni
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusUni
 */
const shellyplusuni = {};

shellyHelperGen2.addInput(shellyplusuni, 0);
shellyHelperGen2.addInput(shellyplusuni, 1);
shellyHelperGen2.addInput(shellyplusuni, 2);

shellyHelperGen2.addSwitch(shellyplusuni, 0, false);
shellyHelperGen2.addSwitch(shellyplusuni, 1, false);

shellyHelperGen2.addAnalogInputSensor(shellyplusuni, 100);

shellyHelperGen2.addHumiditySensor(shellyplusuni, 100);

shellyHelperGen2.addTemperatureSensor(shellyplusuni, 100);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 101);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 102);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 103);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 104);

shellyHelperGen2.addVoltmeterSensor(shellyplusuni, 100);

module.exports = {
    shellyplusuni,
};
