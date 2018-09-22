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
// use the following line instead above for the dummy data version!
//const Shelly = require(__dirname + '/node_modules/shelly-iot/index-dummy.js');
let shelly;

const knownDevices = {};
const sensorIoBrokerIDs = {};
const sensorIoBrokerParamer = {};
let isStopped = false;
let connected = null;


// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function(callback) {
  try {
    setConnected(false);
    if (shelly) {
      isStopped = true;
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
    isStopped = true;
    shelly.stopListening();
  }
  setConnected(false);
});

process.on('uncaughtException', function(err) {
  console.log('Exception: ' + err + '/' + err.toString());
  if (adapter && adapter.log) {
    adapter.log.warn('Exception: ' + err);
  }
  if (shelly) {
    isStopped = true;
    shelly.stopListening();
  }
  setConnected(false);
});


// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
  // Warning, state can be null if it was deleted
  adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
  objectHelper.handleStateChange(id, state);

});

function setConnected(isConnected) {
  if (connected !== isConnected) {
    connected = isConnected;
    adapter.setState('info.connection', connected, true, (err) => {
      // analyse if the state could be set (because of permissions)
      if (err) adapter.log.error('Can not update connected state: ' + err);
      else adapter.log.debug('connected set to ' + connected);
    });
  }
}

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
function getSenByMissingBlkID(blk, sen) {
  let arr = [];
  let cnt = 0;
  if (sen && blk) {
    sen.forEach(function(s) {
      let found = false;
      blk.forEach(function(b) {
        if (b.I == s.L) {
          found = true;
          return;
        }
      });
      if (found === false) {
        arr[++cnt] = s;
      }
    });
  }
  return arr;
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
  return deviceId + '#S#' + senId;
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
  return deviceId + '#A#' + actId;
}

function isObject(item) {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

// create sensor
function createSensorStates(deviceId, b, s, data) {

  let dp = datapoints.getSensor(s);
  if (dp) {
    let tmpId = b ? deviceId + '.' + b.D + '.' + dp.name : deviceId + '.' + dp.name; // Status ID in ioBroker
    let value = getStateBySenId(s.I, data); // Status for Sensor ID
    if (!sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)]) {
      sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)] = {
        id: tmpId,
        param: {},
        value: value
      }; // remember the link Shelly ID -> ioBroker ID
    }
    // SHSW-44#06231A#1.Relay0.W -> State
    let controlFunction;
    if (dp.write === true) { // check if it is allwoed to change datapoint (state)
      if (b && b.D.startsWith('Relay') && s.T === 'Switch') { // Implement all needed action stuff here based on the names
        const relayId = parseInt(b.D.substr(5), 10);
        controlFunction = function(value) {
          let params;
          // if timer > 0 sec. call rest with timer paramater
          if (sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)].param.timer > 0) {
            params = {
              'turn': (value === true || value === 1) ? 'on' : 'off',
              'timer': sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)].param.timer
            };
          } else {
            params = {
              'turn': (value === true || value === 1) ? 'on' : 'off'
            };
          }
          shelly.callDevice(deviceId, '/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
      }
    }
    if (dp.type === 'boolean') {
      value = !!value; // convert to boolean
    }
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
    }, value, controlFunction);

    // get pseudo datapoints for sensor. for this psuedo sensor they will no
    // data send by shelly devices
    let addp = datapoints.getDepSensor(s);
    addp.forEach(function(ddp) {
      tmpId = b ? deviceId + '.' + b.D + '.' + ddp.name : deviceId + '.' + ddp.name; // Status ID in ioBroker
      value = ddp.hasOwnProperty('def') ? ddp.def : undefined;
      controlFunction = undefined;
      // for timer set callback funtion
      if (b && b.D.startsWith('Relay') && s.T === 'Switch' && ddp.name == 'Timer') {
        controlFunction = function(value) {
          sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)].param.timer = value;
        };
      }
      objectHelper.setOrUpdateObject(tmpId, {
        type: 'state',
        common: {
          name: ddp.name,
          type: ddp.type,
          role: ddp.role,
          read: ddp.read,
          write: ddp.write,
          min: ddp.min,
          max: ddp.max,
          states: ddp.states,
          unit: ddp.unit
        }
      }, value, controlFunction);
    });

  }
}

function createDeviceStates(deviceId, description, ip, data) {
  knownDevices[deviceId] = description; // remember the device data
  adapter.log.debug('Create device object for ' + deviceId + ' if not exist');
  objectHelper.setOrUpdateObject(deviceId, {
    type: 'device',
    common: {
      name: 'Device ' + deviceId
    },
    native: {
      ip: ip
    }
  });
  adapter.log.debug('Create state object for ' + deviceId + '.online' + ' if not exist');
  objectHelper.setOrUpdateObject(deviceId + '.online', {
    type: 'state',
    common: {
      name: 'Device online status',
      type: 'boolean',
      role: 'indicator.reachable',
      read: true,
      write: false
    }
  }, true);
  adapter.log.debug('Create state object for ' + deviceId + '.hostname' + ' if not exist');
  objectHelper.setOrUpdateObject(deviceId + '.hostname', {
    type: 'state',
    common: {
      name: 'Device hostname',
      type: 'string',
      role: 'info.ip',
      read: true,
      write: false
    }
  }, ip);

  if (description) {
    let blk = description.blk || [];
    // Loop over block
    blk.forEach(function(b) {
      // Block ID:         b.I
      // Block Descrition: b.D
      let sen = getSenByBlkID(b.I, description.sen); // Sensoren for this Block
      let act = getActByBlkID(b.I, description.act); // Actions for this Block

      // Create Channel SHSW-44#06231A#1.Relay0 -> Channel
      objectHelper.setOrUpdateObject(deviceId + '.' + b.D, {
        type: 'channel',
        common: {
          name: b.D
        }
      });
      // Loop over sensor for a block device
      sen.forEach(function(s) {
        createSensorStates(deviceId, b, s, data);
      });
      // loop over action for block device
      act.forEach(function(a) {});
    });
    // looking for sensor with no link to a block device
    let sen = getSenByMissingBlkID(description.blk, description.sen) || [];
    // loop over sensor with no link to a block device
    sen.forEach(function(s) {
      createSensorStates(deviceId, null, s, data);
    });

    // 2 Relais => Shelly 2
    if (false && deviceId.startsWith('SHSW-2')) {
      let b = {
        'I': 999,
        'D': 'Shutter'
      };
      let s = {
        'I': 999,
        'T': 'Shutter',
        'D': 'Shutter',
        'L': 999
      };
      createSensorStates(deviceId, b, s, data);
    }

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
  // tranfer Array to Object
  let dataObj = statusArrayToObject(data);
  Object.keys(dataObj).forEach((id) => {
    let value = dataObj[id];
    if (sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, id)]) {
      let ioBrokerId = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, id)].id; // get ioBroker Id
      let oldValue = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, id)].value;
      const obj = objectHelper.getObject(ioBrokerId);
      if (ioBrokerId) {
        if (
          obj.common &&
          obj.common.type &&
          obj.common.type === 'boolean'
        ) {
          value = !!value; // convert to boolean
        }
        if (value != oldValue) {
          adapter.setState(ioBrokerId, {
            val: value,
            ack: true
          });
          sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, id)].value = value;
        }
      }
    }
  });
}

function initDevices(deviceIPs, callback) {
  if (!deviceIPs.length) {
    return callback && callback();
  }
  const device = deviceIPs.shift();
  if (!device.native || !device.native.ip) {
    return initDevices(deviceIPs, callback);
  }

  shelly.callDevice(device.native.ip, '/status', (err, data) => { // send REST call to devices IP to get status
    if (err) {
      adapter.log.info('Error on status check for ' + device._id + ' with IP ' + device.native.ip + ', consider offline ...');
      adapter.setState(device._id + '.online', false, true);
      return initDevices(deviceIPs, callback);
    }

    shelly.getDeviceStatus(device.native.ip, (err, deviceId, payload, ip) => {
      if (err) {
        adapter.log.info('Error on status request for ' + device._id + ' with IP ' + device.native.ip + ', consider offline ...');
        adapter.setState(device._id + '.online', false, true);
      } else {
        shelly.emit('update-device-status', deviceId, payload);
      }
      initDevices(deviceIPs, callback);
    });
  });
}

// main function
function main() {
  setConnected(false);
  objectHelper.init(adapter);

  const options = {
    logger: adapter.log.debug
  };

  shelly = new Shelly(options);

  shelly.on('update-device-status', (deviceId, status) => {
    adapter.log.debug('Status update received for ' + deviceId + ': ' + JSON.stringify(status));

    if (!knownDevices[deviceId]) { // device unknown so far, new one in network, create it
      shelly.getDeviceDescription(deviceId, (err, deviceId, description, ip) => {
        createDeviceStates(deviceId, description, ip, status);
        objectHelper.processObjectQueue(() => {
          adapter.log.debug('Initialize device ' + deviceId + ' (' + Object.keys(knownDevices).length + ' now known)');
        }); // if device is added later, create all objects
      });
      return;
    }

    updateDeviceStates(deviceId, status);
  });

  shelly.on('device-connection-status', (deviceId, connected) => {
    adapter.log.debug('Connection update received for ' + deviceId + ': ' + connected);

    if (knownDevices[deviceId]) {
      adapter.setState(deviceId + '.online', connected, true);
    }
  });

  shelly.on('error', (err) => {
    adapter.log.info('Error handling Shelly data: ' + err);
  });

  shelly.on('disconnect', () => {
    if (!isStopped) {
      setConnected(false);
      adapter.log.info('Reconnecting ...');
      setTimeout(() => {
        shelly.listen(() => {
          setConnected(true);
        });
      }, 2000);
    }
  });

  adapter.getDevices((err, devices) => {
    initDevices(devices, () => {
      shelly.listen(() => {
        setConnected(true);
        shelly.discoverDevices(() => {
          adapter.log.info('Listening for Shelly packets in the network');
          adapter.subscribeStates('*');
        });
      });
    });
  });
}
