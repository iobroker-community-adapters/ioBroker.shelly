/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

// you have to require the utils module and call adapter function
const utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const adapter = new utils.Adapter('shelly');
const objectHelper = require(__dirname + '/lib/objectHelper'); // Get common adapter utils
objectHelper.init(adapter);
const Shelly = require('shelly-iot');
let shelly;

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function(callback) {
  try {
      // adapter.log.info('cleaned everything up...');
      callback();
  } catch (e) {
      callback();
  }
});

// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

});


// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function() {
    main();
});


function createDeviceStates(deviceId, description, data) {
    objectHelper.setOrUpdateObject(deviceId, {type: 'device', common: {name: 'Device ' + deviceId}});
    /*
      Weiter vllt:
      deviceId.block-name als "Channel" und danndarunter .status, Also:
      SHSW-44#06231A#1 -> device
      objectHelper.setOrUpdateObject(deviceId, {type: 'device', common: {name: 'Device ' + deviceId}});

      SHSW-44#06231A#1.Relay0 -> Channel
      objectHelper.setOrUpdateObject(deviceId + '.' + 'Relay0', {type: 'channel', common: {name: 'Relay0'}});

      SHSW-44#06231A#1.Relay0.W -> State
      objectHelper.setOrUpdateObject(deviceId + '.' + 'Relay0', {type: 'state', common: {name: '...', type:'...', role'...''}}, value);
      SHSW-44#06231A#1.Relay0.Switch -> State

      und am besten in einem extra array merken welches device und "ID" welcher Statename ist das dues in updateDeviceStates nutzen knnst
    */
}

function updateDeviceStates(deviceId, data) {
    // Viele
    // adapter.setState hier :-)
}

// main function
function main() {
    const options = {
        logger: adapter.log.info
    };

    shelly = new Shelly(options);

    shelly.on('update-device-status', (deviceId, status) => {
        adapter.log.info('Status update received for ' + deviceId + ': ' + JSON.stringify(status));
        updateDeviceStates(deviceId, status);
    });

    shelly.discoverDevices((err, desc) => {
        if (err) {
            //Error colorhandling
            return;
        }
        let deviceCounter = 0;
        for (let deviceId in desc) {
            if (!desc.hasOwnProperty(deviceId)) continue;

            adapter.log.info('Discovered ' + deviceId + ': ' + JSON.stringify(desc[deviceId]));
            deviceCounter++;

            shelly.getDeviceStatus(deviceId, (err, data) => {
                if (err) {
                    //Error colorhandling
                    return;
                }
                createDeviceStates(deviceId, desc[deviceId], data);
                if (!--deviceCounter) { // we have created everything initially

                    objectHelper.processObjectQueue(() => {
                        adapter.subscribeStates('*');
                    });
                }

            });
            // now call a function to parse the description data and create all objects
        }
    });

}
