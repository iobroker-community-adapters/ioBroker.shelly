import type { DeviceDefinition } from '../../deviceTypes';
import * as shellyHelperVirtual from '../virtual-helper';

/**
 * SHELLY_??? / neowatervalve
 * Neo Smart Water Valve NAS-WV02W
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyX/XT1/SmartWaterValve
 * https://www.shelly.com/de/products/neo-smart-water-valve-nas-wv02w
 * https://www.shelly.com/blogs/documentation/neo-smart-water-valve
 *
 * Component log see https://github.com/iobroker-community-adapters/ioBroker.shelly/issues/1322#issuecomment-4405971916
 *
 */

const neowatervalve: DeviceDefinition = {};

// boolean:200 - State (valve closed/open)
shellyHelperVirtual.addBoolean(neowatervalve, 200, 'crw', {});

// number:200 - Flow rate
shellyHelperVirtual.addNumber(neowatervalve, 200, 'cr', { unit: 'm3/min', min: 0, max: 0.075 });

// number:201 - Water pressure
shellyHelperVirtual.addNumber(neowatervalve, 201, 'cr', { unit: 'kPa', min: 0, max: 1350 });

// number:202 - Water temperature
shellyHelperVirtual.addNumber(neowatervalve, 202, 'cr', { unit: '°C', min: -25, max: 80 });

export { neowatervalve };
