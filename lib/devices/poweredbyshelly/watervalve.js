'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Frankever Smart Water Valve Controller
 *
 * https://shelly-api-docs.shelly.cloud/ - not available -
 * https://www.shelly.com/de/blogs/documentation/frankever-smart-water-valve
 *
 */

// NOTE: This is only a temporary basic implementation to aid gathering more information

const watervalve = {};

shellyHelperGen2.addTemperatureSensor(watervalve, 100);
shellyHelperGen2.addNumber(watervalve, 200);

module.exports = {
    watervalve,
};
