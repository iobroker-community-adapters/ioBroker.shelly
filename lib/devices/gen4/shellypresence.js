'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Presence Gen 4 / shellypresence
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyPresenceG4/
 */
const shellypresence = {};

shellyHelperGen2.addIlluminance(shellypresence, 0);

shellyHelperGen2.addPresence(shellypresence);

shellyHelperGen2.addPresenceZone(shellypresence, 200);

module.exports = {
    shellypresence: shellypresence,
};
