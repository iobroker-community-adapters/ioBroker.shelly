'use strict';

// const shellyHelperGen2 = require('../gen2-helper');
const shellyHelperVirtual = require('../virtual-helper');

/**
 * SHELLY_PBS_ST_ST1820 / st1820
 * Shelly LinkedGo smartes Heizungsthermostat
 *
 * https://shelly-api-docs.shelly.cloud/ - not available -
 * https://www.shelly.com/de/blogs/documentation/ - not available -
 *
 */

// NOTE: This is only a temporary basic implemention to aid gathering more information

const st1820 = {};

shellyHelperVirtual.addBoolean(st1820, 200, 'crw', {}); // Anti-freeze
shellyHelperVirtual.addBoolean(st1820, 201, 'crw', {}); // Child lock
shellyHelperVirtual.addBoolean(st1820, 202, 'crw', {}); // Enable thermostat

shellyHelperVirtual.addNumber(st1820, 200, 'cr', { unit: '%', min: 0, max: 100 }); // Current humidity
shellyHelperVirtual.addNumber(st1820, 201, 'cr', { unit: 'C/F' }); // Current temperature
shellyHelperVirtual.addNumber(st1820, 202, 'crw', { unit: 'C/F' }); // Target temperature

module.exports = {
    st1820: st1820,
};
