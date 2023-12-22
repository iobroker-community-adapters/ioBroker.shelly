'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Wall Display / shellywalldisplay
 */
const shellywalldisplay = {};

shellyHelperGen2.addSwitchToGen2Device(shellywalldisplay, 0, false);
shellyHelperGen2.addInputToGen2Device(shellywalldisplay, 0);
shellyHelperGen2.addHumiditySensorToGen2Device(shellywalldisplay, 0);
shellyHelperGen2.addTemperatureSensorToGen2Device(shellywalldisplay, 0);
shellyHelperGen2.addIlluminanceSensorToGen2Device(shellywalldisplay, 0);

module.exports = {
    shellywalldisplay,
};
