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
const shellyStates = {};
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
  if (state && !state.ack) {
    adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
    objectHelper.handleStateChange(id, state);
  }
});


// *******************************************************************************
// Reads object makes an ID out of them
// { roller: { state1: true, state2: false}} 
// -> roller.state1 = true and roller.state2 = false
// *******************************************************************************
function obj2str(data, obj, str) {
  if (typeof data !== 'object') {
    // adapter.log.debug(str + ' = ' + data);
    obj[str] = data;
  } else {
    for (let i in data) {
      let val = data[i];
      if (str) {
        if (Array.isArray(data)) {
          if (data.length == 1) {
            obj2str(val, obj, str);
          } else {
            obj2str(val, obj, str + i);
          }
        } else {
          obj2str(val, obj, str + '.' + i);
        }
      } else {
        obj2str(val, obj, i);
      }
    }
  }
}

function createChannel(deviceId, state) {
  let arr = state.split('.');
  if (arr.length >= 2) {
    let channelId = deviceId + '.' + arr[0];
    adapter.log.debug("Creating Channel " + channelId);
    objectHelper.setOrUpdateObject(channelId, {
      type: 'channel',
      common: {
        name: 'Channel ' + arr[0]
      }
    }, ['name']);
  }
}

function createDevice(deviceId, description, ip) {

  adapter.log.debug("Creating device " + deviceId);
  objectHelper.setOrUpdateObject(deviceId, {
    type: 'device',
    common: {
      name: 'Device ' + deviceId
    },
    native: {}
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

}

function createShellyStates(deviceId, description, ip) {
  createDevice(deviceId, description, ip);
  if (deviceId.startsWith('SHSW-1')) {
    createShelly1States(deviceId);
  }
  if (deviceId.startsWith('SHSW-2')) {
    createShelly2States(deviceId);
  }
  objectHelper.processObjectQueue(() => { });
}

function updateShellyStates(deviceId) {
  if (deviceId.startsWith('SHSW-1')) {
    updateShelly1States(deviceId);
  }
  if (deviceId.startsWith('SHSW-2')) {
    updateShelly2States(deviceId);
  }
  objectHelper.processObjectQueue(() => { });
}


function createShelly1States(deviceId, callback) {

  let devices = datapoints.getObjectByName('shelly2');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let value;
    let controlFunction;

    createChannel(deviceId, i);

    if (i == 'Relay0.Switch' || i == 'Relay1.Switch') { // Implement all needed action stuff here based on the names
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = function (value) {
        let params = {};
        let timer = 0;
        let timerId = deviceId + '.Relay' + relayId + '.Timer';
        adapter.getState(timerId, (err, state) => {
          // if timer > 0 sec. call rest with timer paramater
          timer = state ? state.val : 0;
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
        });
      };
    }

    if (i == 'Relay0.AutoTimerOff' || i == 'Relay1.AutoTimerOff') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = function (value) {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug("Auto Timer off: " + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.AutoTimerOn' || i == 'Relay1.AutoTimerOn') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = function (value) {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug("Auto Timer off: " + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    adapter.log.debug("Creating State " + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShelly1States(deviceId, callback) {

  let devices = datapoints.getObjectByName('shelly2');

  // shelly.doGet('http://192.168.20.159/settings', {}, (data, error) => {
  // error = null;
  shelly.callDevice(deviceId, '/settings', (error, data) => {
    if (!error && data) {
      let ids = {};
      obj2str(data, ids);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let rollerValue;
        let rollerModus;
        let controlFunction;
        // historical mapping

        switch (id) {
          case 'relays0.ison':
            id = 'Relay0.Switch';
            break;
          case 'relays0.auto_on':
            id = 'Relay0.AutoTimerOn';
            break;
          case 'relays0.auto_off':
            id = 'Relay0.AutoTimerOff';
            break;
          case 'relays1.ison':
            id = 'Relay1.Switch';
            break;
          case 'relays1.auto_on':
            id = 'Relay1.AutoTimerOn';
            break;
          case 'relays1.auto_off':
            id = 'Relay1.AutoTimerOff';
            break;
          default:
        }

        if (shellyStates.hasOwnProperty(deviceId + '.' + id) && shellyStates[deviceId + '.' + id] == value) {
          continue;
        }
        shellyStates[deviceId + '.' + id] = value;

        if (devices.hasOwnProperty(id)) {
          let stateId = deviceId + '.' + id;
          let common = devices[id];
          // adapter.log.debug(i + ' = ' + stateId);
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
  });

  // shelly.doGet('http://192.168.20.159/status', {}, (data, error) => {
  // error = null;
  shelly.callDevice(deviceId, '/settings', (error, data) => {

    if (!error && data) {
      let ids = {};
      obj2str(data, ids);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let controlFunction;
        // historical mapping

        switch (id) {
          default:
        }

        if (shellyStates.hasOwnProperty(deviceId + '.' + id) && shellyStates[deviceId + '.' + id] == value) {
          continue;
        }
        shellyStates[deviceId + '.' + id] = value;

        if (devices.hasOwnProperty(id)) {
          let stateId = deviceId + '.' + id;
          let common = devices[id];
          // adapter.log.debug(i + ' = ' + stateId);
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
  });

}



function createShelly2States(deviceId, callback) {

  let devices = datapoints.getObjectByName('shelly2');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let value;
    let controlFunction;

    createChannel(deviceId, i);

    if (i == 'Relay0.Switch' || i == 'Relay1.Switch') { // Implement all needed action stuff here based on the names
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = function (value) {
        let params = {};
        let timer = 0;
        let timerId = deviceId + '.Relay' + relayId + '.Timer';
        adapter.getState(timerId, (err, state) => {
          // if timer > 0 sec. call rest with timer paramater
          timer = state ? state.val : 0;
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
        });
      };
    }

    if (i == 'Shutter.Open' || i == 'Shutter.Close' || i == 'Shutter.Pause') { // Implement all needed action stuff here based on the names
      const pos = i.substr(8);
      controlFunction = function (value) {
        let params = {};
        let duration = 0;
        let durationId = deviceId + '.Shutter.Duration';
        adapter.getState(durationId, (err, state) => {
          // if timer > 0 sec. call rest with timer paramater
          duration = state ? state.val : 0;
          if (pos == 'Close') {
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
          }
          if (pos == 'Open') {
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
          }
          if (pos == 'Pause') {
            params = {
              'go': 'stop'
            };
          }
          adapter.log.debug("Relay: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        });
      };
    }

    if (i == 'Shutter.State') { // Implement all needed action stuff here based on the names
      controlFunction = function (value) {
        let params = {};
        let duration = 0;
        let durationId = deviceId + '.Shutter.Duration';
        adapter.getState(durationId, (err, state) => {
          // if timer > 0 sec. call rest with timer paramater
          duration = state ? state.val : 0;
          if (duration > 0) {
            params = {
              'go': value,
              'duration': duration
            };
          } else {
            params = {
              'go': value
            };
          }
          adapter.log.debug("Relay: " + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        });
      };
    }

    if (i == 'Shutter.Position') { // Implement all needed action stuff here based on the names
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

    if (i == 'Relay0.AutoTimerOff' || i == 'Relay1.AutoTimerOff') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = function (value) {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug("Auto Timer off: " + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.AutoTimerOn' || i == 'Relay1.AutoTimerOn') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = function (value) {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug("Auto Timer off: " + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    adapter.log.debug("Creating State " + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShelly2States(deviceId, callback) {

  let devices = datapoints.getObjectByName('shelly2');

  // shelly.doGet('http://192.168.20.159/settings', {}, (data, error) => {
  // error = null;
  shelly.callDevice(deviceId, '/settings', (error, data) => {
    if (!error && data) {
      let ids = {};
      obj2str(data, ids);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let rollerValue;
        let rollerModus;
        let controlFunction;
        // historical mapping

        switch (id) {
          case 'relays0.ison':
            id = 'Relay0.Switch';
            rollerValue = ids['rollers.state'];
            rollerModus = ids['mode'];
            if (rollerModus == 'roller' && (rollerValue == 'stop' || rollerValue == 'close')) { value = false; }
            if (rollerModus == 'roller' && rollerValue == 'open') { value = true; }
            break;
          case 'relays0.auto_on':
            id = 'Relay0.AutoTimerOn';
            break;
          case 'relays0.auto_off':
            id = 'Relay0.AutoTimerOff';
            break;
          case 'relays1.ison':
            id = 'Relay1.Switch';
            rollerValue = ids['rollers.state'];
            rollerModus = ids['mode'];
            if (rollerModus == 'roller' && (rollerValue == 'stop' || rollerValue == 'open')) { value = false; }
            if (rollerModus == 'roller' && rollerValue == 'close') { value = true; }
            break;
          case 'relays1.auto_on':
            id = 'Relay1.AutoTimerOn';
            break;
          case 'relays1.auto_off':
            id = 'Relay1.AutoTimerOff';
            break;
          case 'rollers.state':
            // id = 'Shutter.Close';
            break;
          case 'rollers."maxtime':
            id = 'Shutter.Duration';
            break;
          case 'rollers.state':
            // id = 'Shutter.Open';
            break;
          case 'meters.power':
            id = 'Power';
            break;
          default:
        }

        if (shellyStates.hasOwnProperty(deviceId + '.' + id) && shellyStates[deviceId + '.' + id] == value) {
          continue;
        }
        shellyStates[deviceId + '.' + id] = value;

        if (devices.hasOwnProperty(id)) {
          let stateId = deviceId + '.' + id;
          let common = devices[id];
          // adapter.log.debug(i + ' = ' + stateId);
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
  });

  // shelly.doGet('http://192.168.20.159/status', {}, (data, error) => {
  // error = null;
  shelly.callDevice(deviceId, '/settings', (error, data) => {

    if (!error && data) {
      let ids = {};
      obj2str(data, ids);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let controlFunction;
        // historical mapping


        switch (id) {
          case 'rollers.current_pos': // in Status
            id = 'Shutter.Position';
            break;
          case 'rollers.state':
            id = 'Shutter.state';
            break;
          default:
        }

        if (shellyStates.hasOwnProperty(deviceId + '.' + id) && shellyStates[deviceId + '.' + id] == value) {
          continue;
        }
        shellyStates[deviceId + '.' + id] = value;

        if (devices.hasOwnProperty(id)) {
          let stateId = deviceId + '.' + id;
          let common = devices[id];
          // adapter.log.debug(i + ' = ' + stateId);
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
  });

}



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

  objectHelper.init(adapter);
  setConnected(false);

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

  // Test START
  /*
  createShellyStates('SHSW-2DUMMY', 'Test', '192.168.20.159');
  setInterval(() => {
    updateShellyStates('SHSW-2DUMMY');
    // objectHelper.processObjectQueue(() => { });
  }, 5 * 1000);
  adapter.subscribeStates('*');
  */
  // Test ENDE

  shelly.on('update-device-status', (deviceId, status) => {
    adapter.log.debug('Status update received for ' + deviceId + ': ' + JSON.stringify(status));

    if (!knownDevices[deviceId]) { // device unknown so far, new one in network, create it
      shelly.getDeviceDescription(deviceId, (err, deviceId, description, ip) => {
        createShellyStates(deviceId, description, ip);
        updateShellyStates(deviceId);
        objectHelper.processObjectQueue(() => {
          adapter.log.debug('Initialize device ' + deviceId + ' (' + Object.keys(knownDevices).length + ' now known)');
        }); // if device is added later, create all objects
        knownDevices[deviceId] = description;
      });
      return;
    }
    updateShellyStates(deviceId);
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


