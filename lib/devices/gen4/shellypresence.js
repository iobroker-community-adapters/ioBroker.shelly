'use strict';

const shellyHelperGen2 = require('../gen2-helper');

/**
 * Shelly Presence Gen 4 / shellypresence
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyPresenceG4/
 */
const shellypresence = {};

shellyHelperGen2.addIlluminanceSensor(shellypresence, 0);

shellyHelperGen2.addPresence(shellypresence);

shellyHelperGen2.addPresenceZone(shellypresence, 200);
shellyHelperGen2.addPresenceZone(shellypresence, 201);
shellyHelperGen2.addPresenceZone(shellypresence, 202);
shellyHelperGen2.addPresenceZone(shellypresence, 203);
shellyHelperGen2.addPresenceZone(shellypresence, 204);
shellyHelperGen2.addPresenceZone(shellypresence, 205);
shellyHelperGen2.addPresenceZone(shellypresence, 206);
shellyHelperGen2.addPresenceZone(shellypresence, 207);
shellyHelperGen2.addPresenceZone(shellypresence, 208);
shellyHelperGen2.addPresenceZone(shellypresence, 209);

module.exports = {
    shellypresence: shellypresence,
};
