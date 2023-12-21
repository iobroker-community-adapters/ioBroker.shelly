'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Wall Display / shellywalldisplay
 *
 * Aktuell keine Dokumentation vorhanden
 */
const shellywalldisplay = {

};

shellyHelperGen2.addWallDisplay(shellywalldisplay, 0, true);
shellyHelperGen2.addHumiditySensorToGen2Device(shellywalldisplay,0)
shellyHelperGen2.addTemperatureSensorToGen2Device(shellywalldisplay,0)
shellyHelperGen2.addIlluminanceSensorToGen2Device(shellywalldisplay,0)

module.exports = {
    shellywalldisplay,
};
