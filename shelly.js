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
let isStopped = false;
let connected = null;

function decrypt(key, value) {
  let result = '';
  for (let i = 0; i < value.length; ++i) {
    result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
  }
  return result;
}


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
  // main();
  adapter.getForeignObject('system.config', (err, obj) => {

    if (adapter.config.password) {
      if (obj && obj.native && obj.native.secret) {
        //noinspection JSUnresolvedVariable
        adapter.config.password = decrypt(obj.native.secret, adapter.config.password);
      } else {
        //noinspection JSUnresolvedVariable
        adapter.config.password = decrypt('Zgfr56gFe87jJOM', adapter.config.password);
      }
    }
    main();
  });
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
          let timer = 0;
          if (sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'switchtimer' + s.I)] &&
            sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'switchtimer' + s.I)].param) {
            timer = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'switchtimer' + s.I)].param.timer;
          }
          // if timer > 0 sec. call rest with timer paramater
          if (timer > 0) {
            params = {
              'turn': (value === true || value === 1) ? 'on' : 'off',
              'timer': timer
            };
          } else {
            params = {
              'turn': (value === true || value === 1) ? 'on' : 'off'
            };
          }
          adapter.log.debug("Relay: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
      }
      if (b && b.D.startsWith('Relay') && s.T === 'SwitchTimer') {
        controlFunction = function(value) {
          sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)].param.timer = value || 0;
        };
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterUp') {
        controlFunction = function(value) {
          let params = {};
          let duration = 0;
          if (sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'rollerduration')] &&
            sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'rollerduration')].param) {
            duration = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'rollerduration')].param.duration;
          }
          if (duration > 0) {
            params = {
              'go': (value === true || value === 1) ? 'open' : 'stop',
              'duration': duration
            };
          } else {
            params = {
              'go': (value === true || value === 1) ? 'open' : 'stop'
            };
          }
          adapter.log.debug("RollerUp: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        };
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterDown') {
        controlFunction = function(value) {
          let params = {};
          let duration = 0;
          if (sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'rollerduration')] &&
            sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'rollerduration')].param) {
            duration = sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, 'rollerduration')].param.duration;
          }
          if (duration > 0) {
            params = {
              'go': (value === true || value === 1) ? 'close' : 'stop',
              'duration': duration
            };
          } else {
            params = {
              'go': (value === true || value === 1) ? 'close' : 'stop'
            };
          }
          adapter.log.debug("RollerDown: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        };
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterStop') {
        controlFunction = function(value) {
          let params = {
            'go': 'stop'
          };
          adapter.log.debug("RollerStop: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        };
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterDuration') {
        controlFunction = function(value) {
          sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, s.I)].param.duration = value || 0;
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
  }, ['name']);
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

        // Create Timer for Switch
        if (b && b.D.startsWith('Relay') && s.T === 'Switch') {
          s = {
            'I': 'switchtimer' + s.I,
            'T': 'SwitchTimer',
            'D': 'Timer',
            'L': b.I
          };
          createSensorStates(deviceId, b, s, data);
        }

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

    // for shelly2 the roller/shuter pseudo states will be added
    if (deviceId.startsWith('SHSW-2')) {
      let b, s;

      shelly.callDevice(deviceId, '/roller/0', (error, data) => {
        // let str = error && Buffer.isBuffer(error) ? error.toString('utf8') : error;
        if (!error && data) {
          b = {
            'I': 'roller', // Pseudo ID
            'D': 'Shutter'
          };
          // Dummy Sensor for roller/shuter way up
          s = {
            'I': 'rollerup', //id
            'T': 'ShutterUp',
            'D': 'Shutter',
            'L': 'roller' // link to b.I
          };
          createSensorStates(deviceId, b, s, data);
          // Dummy Sensor for roller/shuter way down
          s = {
            'I': 'rollerdown',
            'T': 'ShutterDown',
            'D': 'Shutter',
            'L': 'roller'
          };
          createSensorStates(deviceId, b, s, data);
          // Stop shutter
          s = {
            'I': 'rollerstop',
            'T': 'ShutterStop',
            'D': 'Shutter',
            'L': 'roller'
          };
          createSensorStates(deviceId, b, s, data);
          // duration, how long up and down is on
          s = {
            'I': 'rollerduration',
            'T': 'ShutterDuration',
            'D': 'Duration',
            'L': 'roller'
          };
          createSensorStates(deviceId, b, s, data);
        }
      });
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

// update Shuter
function updateShutter(deviceId) {

  let valRelay0, valRelay1, valSwitch, senSwitch, value;
  let valSwitchDown, senSwitchDown, valSwitchUp, senSwitchUp;
  for (let prop in sensorIoBrokerIDs) {
    if (prop.startsWith(deviceId)) {
      let ioBrokerId = sensorIoBrokerIDs[prop].id; // get ioBroker Id
      if (ioBrokerId.endsWith('Relay0.Switch')) {
        valRelay0 = sensorIoBrokerIDs[prop].value;
      }
      if (ioBrokerId.endsWith('Relay1.Switch')) {
        valRelay1 = sensorIoBrokerIDs[prop].value;
      }
      if (ioBrokerId.endsWith('Shutter.Close')) {
        valSwitchDown = sensorIoBrokerIDs[prop].value;
        senSwitchDown = sensorIoBrokerIDs[prop];
      }
      if (ioBrokerId.endsWith('Shutter.Open')) {
        valSwitchUp = sensorIoBrokerIDs[prop].value;
        senSwitchUp = sensorIoBrokerIDs[prop];
      }
      if (ioBrokerId.endsWith('Shutter.Pause')) {
        /*
        valSwitchUp  = sensorIoBrokerIDs[prop].value;
        senSwitchUp   = sensorIoBrokerIDs[prop];
        valSwitchDown = sensorIoBrokerIDs[prop].value;
        senSwitchDown = sensorIoBrokerIDs[prop];
        */
      }
    }
  }
  if (senSwitchUp && senSwitchDown) {
    value = (valRelay0 === true || valRelay0 === 1) ? true : false;
    if (value != valSwitchUp) {
      adapter.setState(senSwitchUp.id, {
        val: value,
        ack: true
      });
      senSwitchUp.value = value;
    }
    value = (valRelay1 === true || valRelay1 === 1) ? true : false;
    if (value != valSwitchDown) {
      adapter.setState(senSwitchDown.id, {
        val: value,
        ack: true
      });
      senSwitchDown.value = value;
    }
  }
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
          // enter only if device == Shelly2
          if (deviceId.startsWith('SHSW-2')) {
            // updateShutter(deviceId);
          }

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

  let options = {};

  if (adapter.config.user && adapter.config.password) {
    options = {
      logger: adapter.log.debug,
      user: adapter.config.user,
      password: adapter.config.password
    };
  } else {
    options = {
      logger: adapter.log.debug,
    };
  }

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
