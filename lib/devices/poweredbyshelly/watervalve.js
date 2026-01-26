'use strict';

const shellyHelperGen2 = require('../gen2-helper');
//const shellyHelperVirtual = require('../virtual-helper');

/**
 * SHELLY_??? / watervalve
 * Frankever Smart Water Valve FK-V02T
 *
 * https://shelly-api-docs.shelly.cloud/ - not available -
 * https://www.shelly.com/de/products/frankever-smart-water-valve-fk-v02t
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyX/XT1/SmartWaterValve
 * 
 * Component log see https://github.com/iobroker-community-adapters/ioBroker.shelly/issues/1191#issuecomment-3796990498
 *
 */


const watervalve = {};

shellyHelperGen2.addTemperatureSensor(watervalve, 100);

//shellyHelperVirtual.addBoolean(watervalve, 200);

module.exports = {
    watervalve: watervalve,
};
