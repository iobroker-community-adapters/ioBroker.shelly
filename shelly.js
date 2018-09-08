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
const datapoints = require(__dirname + '/lib/datapoints'); // Get common adapter utils
const Shelly = require('shelly-iot');
let shelly;

const knownDevices = {};
const sensorIoBrokerIDs = {};

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function(callback) {
  try {
    if (shelly) {
      shelly.stopListening(callback);
      return;
    }
    // adapter.log.info('cleaned everything up...');
    callback();
  } catch (e) {
    callback();
  }
});

process.on('SIGINT', function() {
  if (shelly) {
    shelly.stopListening();
  }
});
process.on('uncaughtException', function(err) {
  if (adapter && adapter.log) {
    adapter.log.warn('Exception: ' + err);
  }
  if (shelly) {
    shelly.stopListening();
  }
});


// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
  // Warning, state can be null if it was deleted
  adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

  objectHelper.handeStateChange(id, state);
});


// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function() {
  main();
});


// get Value by Sensor ID
function getStateBySenId(sid, data) {
  if (data && data.G) {
    for (let i in data.G) {
      let g = data.G[i];
      let senId = g[1]; // Sensor ID
      let senValue = g[2]; // Value
      if (sid == senId) {
        return senValue;
      }
    }
  }
  return undefined;
}

// array with all sen for a block ID
function getSenByBlkID(blockId, sen) {
  let arr = [];
  let cnt = 0;
  if (sen) {
    sen.forEach(function(s) {
      if (blockId == s.L) {
        arr[++cnt] = s;
      }
    });
  }
  return arr;
}

// array with all actions for a block ID
function getActByBlkID(blockId, act) {
  let arr = [];
  let cnt = 0;
  if (act) {
    act.forEach(function(a) {
      if (blockId == a.L) {
        arr[++cnt] = a;
      }
    });
  }
  return arr;
}


function getDeviceIdSenIdfromIoBrokerId(ioBrokerId) {
  const regex = /(.+)#S#(.+)/gm;
  let m;
  if ((m = regex.exec(ioBrokerId)) !== null) {
    return {
      id: m[1],
      senId: m[1]
    };
  } else {
    return {};
  }
}

function getIoBrokerIdfromDeviceIdSenId(deviceId, senId) {
  return deviceId + '#S#' + senId
}

function getDeviceIdActIdfromIoBrokerId(ioBrokerId) {
  const regex = /(.+)#A#(.+)/gm;
  let m;
  if ((m = regex.exec(ioBrokerId)) !== null) {
    return {
      id: m[1],
      actId: m[1]
    };
  } else {
    return {};
  }
}

function getIoBrokerIdfromDeviceIdActId(deviceId, actId) {
  return deviceId + '#A#' + actId
}

function createDeviceStates(deviceId, description, data) {
  knownDevices[deviceId] = description; // remember the device data

  adapter.log.info('Create states for ' + deviceId);
  objectHelper.setOrUpdateObject(deviceId, {
    type: 'device',
    common: {
      name: 'Device ' + deviceId
    }
  });

  if (description && description.description) {

    let blk = description.description.blk || [];
    // Loop over block
    blk.forEach(function(b) {
      // Block ID:         b.I
      // Block Descrition: b.D
      let sen = getSenByBlkID(b.I, description.description.sen); // Sensoren for this Block
      let act = getActByBlkID(b.I, description.description.act); // Actions for this Block
      // Create Channel SHSW-44#06231A#1.Relay0 -> Channel
      objectHelper.setOrUpdateObject(deviceId + '.' + b.D, {
        type: 'channel',
        common: {
          name: b.D
        }
      });
      // Loop over sensor
      sen.forEach(function(s) {
        // Sensor ID:               s.I
        // Sensor Descrition:       s.D
        // Sensor Type:             s.T
        // Sensor Role:             s.R
        // Sensor Link to Block ID: s.L
        let dp = datapoints.getSensor(s);
        if (dp) {
          let tmpId = deviceId + '.' + b.D + '.' + dp.name; // Status ID in ioBroker
          let value = getStateBySenId(s.I, data); // Status for Sensor ID
          sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)] = tmpId; // remember the link Shelly ID -> ioBroker ID
          // SHSW-44#06231A#1.Relay0.W -> State
          objectHelper.setOrUpdateObject(tmpId, {
            type: 'state',
            common: {
              name: dp.name,
              type: dp.type,
              role: dp.role,
              read: dp.read,
              write: dp.write,
              min: dp.min,
              max: dp.max,
              states: dp.states,
              unit: dp.unit
            }
          }, value);
        }
      });

      act.forEach(function(a) {});

    });

    // SHSW-44#06231A#1.Relay0 -> Channel
    //objectHelper.setOrUpdateObject(deviceId + '.' + 'Relay0', {type: 'channel', common: {name: 'Relay0'}});
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

      und am besten in einem extra array/objekt merken welches device und "ID" welcher Statename ist das dues in updateDeviceStates nutzen knnst

      Und bei den States die später änderbar sind kann bei dem "setorUpdateObject" noch ein callback als letzter Parameter mitgegeben werden:

      objectHelper.setOrUpdateObject(deviceId + '.' + 'Relay0', {type: 'state', common: {name: '...', type:'...', role'...''}}, value, (value) => {
          // Code that should be executed for state change here
      });

    */

  }

}


// transfer Status array to an object
function statusArrayToObject(data) {

  let obj = {};
  if (data && data.G) {
    data.G.forEach(function(g) {
      obj[g[1]] = g[2]; // id = val
    });
  }
  return obj;
}


// Update Status
function updateDeviceStates(deviceId, data) {

  if (data && data.G) {
    data.G.forEach(function(g) {
      let senId = g[1]; // Id
      let senValue = g[2]; // Value
      let ioBrokerId = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, senId)]; // get ioBroker Id
      if (ioBrokerId) {
        adapter.setState(ioBrokerId, {
          val: senValue,
          ack: true
        });
      }
    });

    /*
    // tranfer Array to Object
    let dataObj = statusArrayToObject(data);
    Object.entries(dataObj).forEach(([id, value]) => {
      let ioBrokerId = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, id)]; // get ioBroker Id
      if (ioBrokerId) {
        adapter.setState(ioBrokerId, {
          val: value,
          ack: true
        });
      }
    });
    */
  }
}

function initDone() {
  objectHelper.processObjectQueue(() => {
    adapter.subscribeStates('*');
    adapter.log.info('initialization done');
  });
}

// main function
function main() {
  objectHelper.init(adapter);
  const options = {
    logger: adapter.log.info
  };

  shelly = new Shelly(options);

  shelly.on('update-device-status', (deviceId, status) => {
    adapter.log.info('Status update received for ' + deviceId + ': ' + JSON.stringify(status));

    if (!knownDevices[deviceId]) { // device unknown so far, new one in network, create it
      shelly.getDeviceDescription(deviceId, (err, description) => {
        createDeviceStates(deviceId, description, status);
        objectHelper.processObjectQueue();
      });
      return;
    }

    updateDeviceStates(deviceId, status);
  });

  /*
    shelly.discoverDevices((err, desc) => {

      if (!err) {
        objectHelper.processObjectQueue(() => {
          adapter.subscribeStates('*');
          adapter.log.info('initialization done');
        });
      }

      for (let deviceId in desc) {
        if (!desc.hasOwnProperty(deviceId)) continue;

        adapter.log.info('Discovered ' + deviceId + ': ' + JSON.stringify(desc[deviceId]));

        shelly.getDeviceStatus(deviceId, (err, data) => {
          if (!err && data) {
            createDeviceStates(deviceId, desc[deviceId], data);
          }
        });
      }
    });
  */

  shelly.discoverDevices((err, desc) => {

    if (err) {
      //Error colorhandling
      adapter.log.error(err);
      initDone();
      return;
    }

    let deviceCounter = 0;
    for (let deviceId in desc) {
      if (!desc.hasOwnProperty(deviceId)) continue;

      adapter.log.info('Discovered ' + deviceId + ': ' + JSON.stringify(desc[deviceId]));
      deviceCounter++;

      shelly.getDeviceStatus(deviceId, (err, data) => {
        if (!err && data) {
          // if we got a description, process it and create all objects in queue
          createDeviceStates(deviceId, desc[deviceId], data);
        } else {
          // else log the error
          adapter.log.error(err);
        }
        if (!--deviceCounter) { // all requests came with an answer or error, we are done
          initDone();
        }

      });
    }
    // if no devices were found, we still are ok because we add them when they come later
    if (!deviceCounter) initDone();
  });

}
