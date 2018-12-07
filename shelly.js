/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

// you have to require the utils module and call adapter function
const dns = require('dns');
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
adapter.on('unload', function (callback) {
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

process.on('SIGINT', function () {
  if (shelly) {
    isStopped = true;
    shelly.stopListening();
  }
  setConnected(false);
});

process.on('uncaughtException', function (err) {
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
adapter.on('stateChange', function (id, state) {
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
adapter.on('ready', function () {
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


// get values from array SensorIoBrokerIDs
function getSensorIoBrokerIDsByDSId(id) {
  return sensorIoBrokerIDs[id] || null;
}

// set values for sensorIoBrokerIDs  array
function setSensorIoBrokerIDsByDSId(id, value) {
  let val = getSensorIoBrokerIDsByDSId(id);
  if (val) {
    // merge objects
    sensorIoBrokerIDs[id] = Object.assign(val, value);
  } else if (value) {
    // new object
    sensorIoBrokerIDs[id] = value;
  } else {
    // empty object
    sensorIoBrokerIDs[id] = {};
  }
}

// get values from array SensorIoBrokerIDs
function getSensorIoBrokerIDs(deviceId, sensorId) {
  let id = getIoBrokerIdfromDeviceIdSenId(deviceId, sensorId);
  return getSensorIoBrokerIDsByDSId(id);
}

// set values for sensorIoBrokerIDs  array
function setSensorIoBrokerIDs(deviceId, sensorId, value) {
  let id = getIoBrokerIdfromDeviceIdSenId(deviceId, sensorId);
  setSensorIoBrokerIDsByDSId(id, value);
}


function delOldObjects(deviceId) {
  if (deviceId.startsWith('SHSW-2')) {
    shelly.callDevice(deviceId, '/roller/0', (error, data) => {
      let channel;
      //roller Modus
      if (!error && data) {
        // Shutter Modus, we delete Relay
        channel = adapter.namespace + '.' + deviceId + '.' + 'Relay';
      } else {
        // relay modus, we delete Shutter
        channel = adapter.namespace + '.' + deviceId + '.' + 'Shutter';
      }
      adapter.getAdapterObjects(function (obj) {
        for (let id in obj) {
          let o = obj[id];
          if (id.startsWith(channel)) {
            adapter.delObject(id, function () {
              adapter.log.debug("Delete old object " + id);
            });
          }
        }
      });
    });
  }
}

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
    sen.forEach(function (s) {
      let found = false;
      blk.forEach(function (b) {
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
    sen.forEach(function (s) {
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
    act.forEach(function (a) {
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
    let tmpId;
    if (dp.id) {
      tmpId = b ? deviceId + '.' + b.D + '.' + dp.id : deviceId + '.' + dp.id; // Status ID in ioBroker

    } else {
      tmpId = b ? deviceId + '.' + b.D + '.' + dp.name : deviceId + '.' + dp.name; // Status ID in ioBroker
    }
    let value = getStateBySenId(s.I, data); // Status for Sensor ID
    if (!getSensorIoBrokerIDs(deviceId, s.I)) {
      setSensorIoBrokerIDs(deviceId, s.I, {
        id: tmpId,
        param: {},
        value: value
      });
    }

    // SHSW-44#06231A#1.Relay0.W -> State
    let controlFunction;
    if (dp.write === true) { // check if it is allwoed to change datapoint (state)
      if (b && b.D.startsWith('Relay') && s.T === 'Switch') { // Implement all needed action stuff here based on the names
        const relayId = parseInt(b.D.substr(5), 10);
        controlFunction = function (value) {
          let params;
          let timer = 0;
          let sensorIoBrokerID = getSensorIoBrokerIDs(deviceId, 'switchtimer' + s.I);
          if (sensorIoBrokerID) {
            timer = sensorIoBrokerID.value;
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
        controlFunction = function (value) {
          setSensorIoBrokerIDs(deviceId, s.I, {
            value: value || 0
          });
          let sen = getSensorIoBrokerIDs(deviceId, s.I);
          if (sen && sen.id) {
            adapter.setState(sen.id, {
              val: value || 0,
              ack: true
            });
          }
        }
        // call once at start
        let sen = getSensorIoBrokerIDs(deviceId, s.I);
        adapter.getState(sen.id, function (err, state) {
          if (!err && state) {
            controlFunction(state.val);
          } else {
            controlFunction(value || 0);
          }
        });
      }
      if (b && b.D.startsWith('Relay') && s.T === 'AutoTimerOn') {
        const relayId = parseInt(b.D.substr(5), 10);
        let turn = 0;
        let sensorIoBrokerID;
        for (let i in sensorIoBrokerIDs) {
          if (sensorIoBrokerIDs[i].id == deviceId + '.' + b.D + '.Switch') {
            sensorIoBrokerID = sensorIoBrokerIDs[i];
            break;
          }
        }
        if (sensorIoBrokerID) {
          turn = sensorIoBrokerID.value;
        }
        controlFunction = function (value) {
          setSensorIoBrokerIDs(deviceId, s.I, {
            value: value || 0
          });
          let sen = getSensorIoBrokerIDs(deviceId, s.I);
          if (sen && sen.id) {
            adapter.setState(sen.id, {
              val: value || 0,
              ack: true
            });
          }
          let params;
          params = {
            'auto_on': value
          };
          adapter.log.debug("Auto Timer on: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
        // call once at start
        let sen = getSensorIoBrokerIDs(deviceId, s.I);
        adapter.getState(sen.id, function (err, state) {
          if (!err && state) {
            controlFunction(state.val);
          } else {
            controlFunction(value || 0);
          }
        });
      }
      if (b && b.D.startsWith('Relay') && s.T === 'AutoTimerOff') {
        const relayId = parseInt(b.D.substr(5), 10);
        let turn = 0;
        let sensorIoBrokerID;
        for (let i in sensorIoBrokerIDs) {
          if (sensorIoBrokerIDs[i].id == deviceId + '.' + b.D + '.Switch') {
            sensorIoBrokerID = sensorIoBrokerIDs[i];
            break;
          }
        }
        if (sensorIoBrokerID) {
          turn = sensorIoBrokerID.value;
        }
        controlFunction = function (value) {
          setSensorIoBrokerIDs(deviceId, s.I, {
            value: value || 0
          });
          let sen = getSensorIoBrokerIDs(deviceId, s.I);
          if (sen && sen.id) {
            adapter.setState(sen.id, {
              val: value || 0,
              ack: true
            });
          }
          let params;
          params = {
            'auto_off': value
          };
          adapter.log.debug("Auto Timer off: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
        // call once at start
        let sen = getSensorIoBrokerIDs(deviceId, s.I);
        adapter.getState(sen.id, function (err, state) {
          if (!err && state) {
            controlFunction(state.val);
          } else {
            controlFunction(value || 0);
          }
        });
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterUp') {
        controlFunction = function (value) {
          if (value === true || value === 1) {
            // only do something if value is true
            let params = {};
            let duration = 0;
            let sensorIoBrokerID = getSensorIoBrokerIDs(deviceId, 'rollerduration');
            if (sensorIoBrokerID) {
              duration = sensorIoBrokerID.value;
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
            let sen = getSensorIoBrokerIDs(deviceId, s.I);
            if (sen && sen.id) {
              setSensorIoBrokerIDs(deviceId, s.I, {
                value: false
              });
              adapter.setState(sen.id, {
                val: false,
                ack: true
              });
              adapter.log.debug("RollerUp: " + JSON.stringify(params));
              shelly.callDevice(deviceId, '/roller/0', params);
            }
          }
        }
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterDown') {
        controlFunction = function (value) {
          // only do something if value is true
          if (value === true || value === 1) {
            let params = {};
            let duration = 0;
            let sensorIoBrokerID = getSensorIoBrokerIDs(deviceId, 'rollerduration');
            if (sensorIoBrokerID) {
              duration = sensorIoBrokerID.value;
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
            let sen = getSensorIoBrokerIDs(deviceId, s.I);
            if (sen && sen.id) {
              setSensorIoBrokerIDs(deviceId, s.I, {
                value: false
              });
              adapter.setState(sen.id, {
                val: false,
                ack: true
              });
              adapter.log.debug("RollerDown: " + JSON.stringify(params));
              shelly.callDevice(deviceId, '/roller/0', params);
            }
          }
        }
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterPosition') {
        controlFunction = function (value) {
          let params;
          let position = value;
          params = {
            'go': 'to_pos',
            'roller_pos': position 
          };
          adapter.log.debug("RollerPosition: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        };
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterStop') {
        controlFunction = function (value) {
          if (value === true || value === 1) {
            // only do something if value is true
            let params = {
              'go': 'stop'
            };
            // updateShutter(deviceId);
            let sen = getSensorIoBrokerIDs(deviceId, s.I);
            if (sen && sen.id) {
              setSensorIoBrokerIDs(deviceId, s.I, {
                value: false
              });
              adapter.setState(sen.id, {
                val: false,
                ack: true
              });
            }
            adapter.log.debug("RollerStop: " + JSON.stringify(params));
            shelly.callDevice(deviceId, '/roller/0', params);
          }
        }
      }
      if (b && b.D.startsWith('Shutter') && s.T === 'ShutterDuration') {
        controlFunction = function (value) {
          setSensorIoBrokerIDs(deviceId, s.I, {
            value: value || 0
          });
          let sen = getSensorIoBrokerIDs(deviceId, s.I);
          if (sen && sen.id) {
            adapter.setState(sen.id, {
              val: value || 0,
              ack: true
            });
          }
        }
        // call at start once
        controlFunction(value || 0);
      }
      if (b && b.D.startsWith('RGBW') && s.T === 'Red') { // Implement all needed action stuff here based on the names
        const relayId = b.I;
        controlFunction = function (value) {
          let params;
          params = {
            'red': value
          };
          adapter.log.debug("RGBW Red: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/light/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
      }
      if (b && b.D.startsWith('RGBW') && s.T === 'Green') { // Implement all needed action stuff here based on the names
        const relayId = b.I;
        controlFunction = function (value) {
          let params;
          params = {
            'green': value
          };
          adapter.log.debug("RGBW Green: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/light/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
      }
      if (b && b.D.startsWith('RGBW') && s.T === 'Blue') { // Implement all needed action stuff here based on the names
        const relayId = b.I;
        controlFunction = function (value) {
          let params;
          params = {
            'blue': value
          };
          adapter.log.debug("RGBW Blue: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/light/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
      }
      if (b && b.D.startsWith('RGBW') && s.T === 'White') { // Implement all needed action stuff here based on the names
        const relayId = b.I;
        controlFunction = function (value) {
          let params;
          params = {
            'white': value
          };
          adapter.log.debug("RGBW White: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/light/' + relayId, params); // send REST call to devices IP with the given path and parameters
        };
      }
      if (b && b.D.startsWith('RGBW') && s.T === 'VSwitch') { // Implement all needed action stuff here based on the names
        const relayId = b.I;
        controlFunction = function (value) {
          let params;
          params = {
            'turn': (value === true || value === 1) ? 'on' : 'off'
          };
          adapter.log.debug("RGBW Switch: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/light/' + relayId, params); // send REST call to devices IP with the given path and parameters
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
    }, ['name'], value, controlFunction);
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

  // get hostname for ip adresss
  dns.reverse(ip, function (err, hostnames) {
    let hostname = (!err && hostnames.length > 0) ? hostnames[0] : ip;
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
    }, hostname);
  });

  if (description) {
    let blk = description.blk || [];
    // Loop over block
    blk.forEach(function (b) {
      // Block ID:         b.I
      // Block Descrition: b.D

      // Workaround, because, the block ID is wrong
      if (b.D == 'RGBW' && b.I == 1) {
        b.I = 0;
      }

      let sen = getSenByBlkID(b.I, description.sen); // Sensoren for this Block
      let act = getActByBlkID(b.I, description.act); // Actions for this Block

      // Create Channel SHSW-44#06231A#1.Relay0 -> Channel
      objectHelper.setOrUpdateObject(deviceId + '.' + b.D, {
        type: 'channel',
        common: {
          name: b.D
        }
      }, ['name']);


      // Loop over sensor for a block device
      sen.forEach(function (s) {
        createSensorStates(deviceId, b, s, data);

        // Create Timer for Switch
        if (b && b.D.startsWith('Relay') && s.T === 'Switch') {
          /*
          setSensorIoBrokerIDs(deviceId, s.I, {
            sidTimer: 'switchtimer' + s.I
          });
          */

          let sI = s.I;

          s = {
            'I': 'switchtimer' + sI,
            'T': 'SwitchTimer',
            'D': 'Timer',
            'L': b.I
          };
          createSensorStates(deviceId, b, s, data);

          s = {
            'I': 'autotimeron' + sI,
            'T': 'AutoTimerOn',
            'D': 'Auto Timer On',
            'L': b.I
          };
          createSensorStates(deviceId, b, s, data);

          s = {
            'I': 'autotimeroff' + sI,
            'T': 'AutoTimerOff',
            'D': 'Auto Timer Off',
            'L': b.I
          };
          createSensorStates(deviceId, b, s, data);

        }

      });
      // loop over action for block device
      act.forEach(function (a) { });
    });
    // looking for sensor with no link to a block device
    let sen = getSenByMissingBlkID(description.blk, description.sen) || [];
    // loop over sensor with no link to a block device
    sen.forEach(function (s) {
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
          // Create Channel SHSW-44#06231A#1.Relay0 -> Channel
          objectHelper.setOrUpdateObject(deviceId + '.' + b.D, {
            type: 'channel',
            common: {
              name: b.D
            }
          }, ['name']);
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
           // Shutterpostion 
          s = {
            'I': 'rollerposition',
            'T': 'ShutterPosition',
            'D': 'Position',
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
    data.G.forEach(function (g) {
      obj[g[1]] = g[2]; // id = val
    });
  }
  return obj;
}

// update Shuter
function updateShutter(deviceId) {

  let valRelay0, valRelay1, valSwitch, senSwitch, value;
  let valSwitchDown, senSwitchDown, valSwitchUp, senSwitchUp;
  let valSwitchPause, senSwitchPause;
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
        valSwitchPause = sensorIoBrokerIDs[prop].value;
        senSwitchPause = sensorIoBrokerIDs[prop];
      }
    }
  }
  if (senSwitchUp && senSwitchDown && senSwitchPause) {
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
    value = (valRelay0 === true || valRelay0 === 1) || (valRelay1 === true || valRelay1 === 1) ? true : false;
    if (value === false && value != valSwitchPause) {
      adapter.setState(senSwitchPause.id, {
        val: value,
        ack: true
      });
    }
    senSwitchPause.value = value;
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
          oldValue = !!oldValue;
        }
        if (value != oldValue) {
          adapter.setState(ioBrokerId, {
            val: value,
            ack: true
          });
          sensorIoBrokerIDs[getIoBrokerIdfromDeviceIdSenId(deviceId, id)].value = value;
          // enter only if device == Shelly2 and the shutter objects are switches and not buttons
          if (deviceId.startsWith('SHSW-2')) {
            updateShutter(deviceId);
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


