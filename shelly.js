/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

// you have to require the utils module and call adapter function
const dns = require('dns');
const utils = require('@iobroker/adapter-core');
// const adapter = new utils.Adapter('shelly');
const objectHelper = require('@apollon/iobroker-tools').objectHelper; // Get common adapter utils
const datapoints = require(__dirname + '/lib/datapoints'); // Get common adapter utils
const Shelly = require('shelly-iot');
const adapterName = require('./package.json').name.split('.').pop();

let shelly;
let knownDevices = {};
let shellyStates = {};
let isStopped = false;
let connected = null;
let adapter;


function startAdapter(options) {
  options = options || {};
  options.name = adapterName;
  adapter = new utils.Adapter(options);

  // is called when adapter shuts down - callback has to be called under any circumstances!
  adapter.on('unload', (callback) => {
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


  // is called if a subscribed state changes
  adapter.on('stateChange', (id, state) => {
    // Warning, state can be null if it was deleted
    if (state && !state.ack) {
      let stateId = id.replace(adapter.namespace + '.', '');
      if (shellyStates.hasOwnProperty(stateId)) {
        delete shellyStates[stateId];
      }
      adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
      objectHelper.handleStateChange(id, state);
    }
  });


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

  return adapter;
}

process.on('SIGINT', () => {
  if (shelly) {
    isStopped = true;
    shelly.stopListening();
  }
  setConnected(false);
  adapter.terminate ? adapter.terminate() : process.exit();
});

process.on('uncaughtException', (err) => {
  console.log('Exception: ' + err + '/' + err.toString());
  if (adapter && adapter.log) {
    adapter.log.warn('Exception: ' + err);
  }
  if (shelly) {
    isStopped = true;
    shelly.stopListening();
  }
  setConnected(false);
  adapter.terminate ? adapter.terminate() : process.exit();
});


function decrypt(key, value) {
  let result = '';
  for (let i = 0; i < value.length; ++i) {
    result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
  }
  return result;
}

function setOnlineStatus(deviceId, value) {
  let stateId = deviceId + '.online';
  if (shellyStates[stateId] !== value) {
    shellyStates[stateId] = value;
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state'
    }, ['name'], value);
  }
}


function getDeviceIdFromIoBrokerId(iobrokerId) {
  let deviceId;
  if (iobrokerId) {
    const res = iobrokerId.replace(adapter.namespace + '.', '');
    const arr = res.split('.');
    deviceId = arr[0];
  }
  return deviceId;
}

// *******************************************************************************
// Reads object makes an ID out of them
// { roller: { state1: true, state2: false}} 
// -> roller.state1 = true and roller.state2 = false
// *******************************************************************************
function getIoBrokerStatesFromObj(data) {

  let obj = {};

  function _obj2str(data, obj, str) {
    if (typeof data !== 'object') {
      // adapter.log.debug(str + ' = ' + data);
      obj[str] = data;
    } else {
      for (let i in data) {
        let val = data[i];
        if (str) {
          if (Array.isArray(data)) {
            if (data.length == 1) {
              _obj2str(val, obj, str);
            } else {
              _obj2str(val, obj, str + i);
            }
          } else {
            _obj2str(val, obj, str + '.' + i);
          }
        } else {
          _obj2str(val, obj, i);
        }
      }
    }
  }

  if (data) {
    _obj2str(data, obj);
  } else {
    return null;
  }

  return obj;

}


function createChannel(deviceId, state) {
  let arr = state.split('.');
  if (arr.length >= 2) {
    let channelId = deviceId + '.' + arr[0];
    adapter.log.debug('Creating Channel ' + channelId);
    objectHelper.setOrUpdateObject(channelId, {
      type: 'channel',
      common: {
        name: 'Channel ' + arr[0]
      }
    }, ['name']);
  }
}

function createDevice(deviceId, description, ip) {
  adapter.log.debug('Creating device ' + deviceId);
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

  try {
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
      }, ['name'], hostname);
    });
  } catch (err) {
    let hostname = ip || '';
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
    }, ['name'], hostname);
  }
}

function createShellyStates(deviceId, description, ip, status, callback) {

  if (typeof status === 'function') {
    callback = status;
    status = undefined;
  }

  adapter.log.debug('Create Shelly States for ' + deviceId);
  if (deviceId && typeof deviceId === 'string') {
    createDevice(deviceId, description, ip);
    if (deviceId.startsWith('SHSW-1')) {
      createShelly1States(deviceId);
    } else if (deviceId.startsWith('SHSW-2')) {
      createShelly2States(deviceId);
    } else if (deviceId.startsWith('SHSW-4')) {
      createShelly4States(deviceId);
    } else if (deviceId.startsWith('SHPLG-1')) {
      createShellyPlugStates(deviceId);
    } else if (deviceId.startsWith('SHRGBWW') || deviceId.startsWith('SHBLB') || deviceId.startsWith(' SH2LED')) {
      createShellyRGBWWStates(deviceId);
    } else if (deviceId.startsWith('SHHT')) {
      createShellyHTStates(deviceId);
    } else {
      displaySettings(deviceId);
      callback && callback();
    }
  } else {
    callback && callback();
  }
}

function updateShellyStates(deviceId, status, callback) {

  let now = Date.now();
  let sec = (now - knownDevices[deviceId].ts) / 1000; // seconds
  let timeout = adapter.config.timeout || 0.25; // seconds

  if (typeof status === 'function') {
    callback = status;
    status = undefined;
  }

  // wir pollen maximal jede Sekunde den neuen Status
  if (sec < timeout) {
    return callback && callback();
  }
  knownDevices[deviceId].ts = now;

  adapter.log.debug('Update Shelly States for ' + deviceId);
  if (deviceId && typeof deviceId === 'string') {
    if (deviceId.startsWith('SHSW-1')) {
      updateShelly1States(deviceId, status, callback);
    } else if (deviceId.startsWith('SHSW-2')) {
      updateShelly2States(deviceId, status, callback);
    } else if (deviceId.startsWith('SHSW-4')) {
      updateShelly4States(deviceId, status, callback);
    } else if (deviceId.startsWith('SHPLG-1')) {
      updateShellyPlugStates(deviceId, callback);
    } else if (deviceId.startsWith('SHRGBWW') || deviceId.startsWith('SHBLB') || deviceId.startsWith(' SH2LED')) {
      updateShellyRGBWWStates(deviceId, callback);
    } else if (deviceId.startsWith('SHHT')) {
      updateShellyHTStates(deviceId, status, callback);
    } else {
      callback && callback();
    }
  } else {
    callback && callback();
  }
}


// *******************************************************************************
// Shelly 1
// *******************************************************************************
function createShelly1States(deviceId) {

  let devices = datapoints.getObjectByName('shelly1');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let controlFunction;
    let value;

    createChannel(deviceId, i);

    if (i == 'Relay0.Switch' || i == 'Relay1.Switch') { // Implement all needed action stuff here based on the names
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
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
          adapter.log.debug('Relay: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        });
      };
    }

    if (i == 'Relay0.AutoTimerOff' || i == 'Relay1.AutoTimerOff') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.AutoTimerOn' || i == 'Relay1.AutoTimerOn') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.Timer' || i == 'Relay1.Timer') {
      value = 0;
    }

    adapter.log.debug('Creating State ' + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShelly1States(deviceId, status, callback) {

  let devices = datapoints.getObjectByName('shelly1');
  let parameter = {};

  // get status from CoAP Message
  if (status) {
    let ids = getIoBrokerStatesFromObj(status);
    for (let i in ids) {
      let id = i;
      let value = ids[i];
      let controlFunction;
      // historical mapping

      switch (id) {
        case 'G2':
          id = 'Relay0.Switch';
          value = value === 1 || value === true ? true : false;
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
        objectHelper.setOrUpdateObject(stateId, {
          type: 'state',
          common: common
        }, ['name'], value, controlFunction);
      }
    }
    // return callback && callback();
  }

  shelly.callDevice(deviceId, '/settings', parameter, (error, data) => {
    if (!error && data) {
      let ids = getIoBrokerStatesFromObj(data);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let controlFunction;
        // historical mapping

        switch (id) {
          case 'relays.ison':
            id = 'Relay0.Switch';
            break;
          case 'relays.auto_on':
            id = 'Relay0.AutoTimerOn';
            break;
          case 'relays.auto_off':
            id = 'Relay0.AutoTimerOff';
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
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }

    shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
      if (!error && data) {
        if(deviceId == 'SHSW-1#056EE0#1') {
          let a = 1;
        }
        let ids = getIoBrokerStatesFromObj(data);
        for (let i in ids) {
          let id = i;
          let value = ids[i];
          let controlFunction;
          // historical mapping
          switch (id) {
            case 'wifi_sta.rssi':
              id = 'rssi';
              break;
            case 'update.has_update':
              id = 'update';
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
        setOnlineStatus(deviceId, true);
      } else {
        setOnlineStatus(deviceId, false);
      }
      callback && callback();
    });
  });

}


// *******************************************************************************
// Shelly 2
// *******************************************************************************
function createShelly2States(deviceId) {

  let devices = datapoints.getObjectByName('shelly2');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let value;
    let controlFunction;

    createChannel(deviceId, i);

    if (i == 'Relay0.Switch' || i == 'Relay1.Switch') { // Implement all needed action stuff here based on the names
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
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
          adapter.log.debug('Relay: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        });
      };
    }

    if (i == 'Shutter.Open' || i == 'Shutter.Close' || i == 'Shutter.Pause') { // Implement all needed action stuff here based on the names
      const pos = i.substr(8);
      controlFunction = (value) => {
        let params = {};
        let duration = 0;
        let durationId = deviceId + '.Shutter.Duration';
        adapter.getState(durationId, (err, state) => {
          // if duration > 0 sec. call rest with timer paramater
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
          adapter.log.debug('Relay: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        });
      };
    }

    if (i == 'Shutter.state') { // Implement all needed action stuff here based on the names
      controlFunction = (value) => {
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
          adapter.log.debug('Relay: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/roller/0', params);
        });
      };
    }

    if (i == 'Shutter.Position') { // Implement all needed action stuff here based on the names
      controlFunction = (value) => {
        let params;
        let position = value;
        params = {
          'go': 'to_pos',
          'roller_pos': position
        };
        adapter.log.debug('RollerPosition: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/roller/0', params);
      };
    }

    if (i == 'Relay0.AutoTimerOff' || i == 'Relay1.AutoTimerOff') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.AutoTimerOn' || i == 'Relay1.AutoTimerOn') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'mode') {
      controlFunction = (value) => {
        let params;
        params = {
          'mode': value
        };
        adapter.log.debug('Modus: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings', params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.Timer' || i == 'Relay1.Timer') {
      value = 0;
    }

    if (i == 'Shutter.Duration') {
      value = 0;
    }

    adapter.log.debug('Creating State ' + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShelly2States(deviceId, status, callback) {

  let devices = datapoints.getObjectByName('shelly2');
  let parameter = {};

  // CoAP Messages - switches on/on
  // if (status &&  knownDevices[deviceId].mode === 'relay') {
  if (status) {
    let ids = getIoBrokerStatesFromObj(status);
    for (let i in ids) {
      let id = i;
      let value = ids[i];
      let controlFunction;
      // historical mapping

      switch (id) {
        case 'G02':
          id = 'Relay0.Switch';
          value = value === 1 || value === true ? true : false;
          break;
        case 'G12':
          id = 'Relay1.Switch';
          value = value === 1 || value === true ? true : false;
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
        objectHelper.setOrUpdateObject(stateId, {
          type: 'state',
          common: common
        }, ['name'], value, controlFunction);
      }
    }
    // return callback && callback();
  }

  // http request to getting status
  shelly.callDevice(deviceId, '/settings', parameter, (error, data) => {
    if (!error && data) {
      let ids = getIoBrokerStatesFromObj(data);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let rollerValue = ids['rollers.state'];
        let rollerModus = ids['mode'];
        let controlFunction;
        // historical mapping

        knownDevices[deviceId].mode = rollerModus;

        switch (id) {
          case 'relays0.ison':
            id = 'Relay0.Switch';
            // rollerValue = ids['rollers.state'];
            // rollerModus = ids['mode'];
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
            // rollerValue = ids['rollers.state'];
            // rollerModus = ids['mode'];
            if (rollerModus == 'roller' && (rollerValue == 'stop' || rollerValue == 'open')) { value = false; }
            if (rollerModus == 'roller' && rollerValue == 'close') { value = true; }
            break;
          case 'relays1.auto_on':
            id = 'Relay1.AutoTimerOn';
            break;
          case 'relays1.auto_off':
            id = 'Relay1.AutoTimerOff';
            break;
          case 'rollers.maxtime':
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
      setOnlineStatus(deviceId, true);
    } else {
      setOnlineStatus(deviceId, false);
    }

    shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
      if (!error && data) {
        let ids = getIoBrokerStatesFromObj(data);
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
            case 'wifi_sta.rssi':
              id = 'rssi';
              break;
            case 'update.has_update':
              id = 'update';
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
        setOnlineStatus(deviceId, true);
      } else {
        setOnlineStatus(deviceId, false);
      }
      callback && callback();
    });
  });
}

// *******************************************************************************
// Shelly 4
// *******************************************************************************
function createShelly4States(deviceId) {

  let devices = datapoints.getObjectByName('shelly4');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let controlFunction;
    let value;

    createChannel(deviceId, i);

    if (i == 'Relay0.Switch' || i == 'Relay1.Switch' || i == 'Relay2.Switch' || i == 'Relay3.Switch') { // Implement all needed action stuff here based on the names
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
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
          adapter.log.debug('Relay: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        });
      };
    }

    if (i == 'Relay0.AutoTimerOff' || i == 'Relay1.AutoTimerOff' || i == 'Relay2.AutoTimerOff' || i == 'Relay3.AutoTimerOff') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.AutoTimerOn' || i == 'Relay1.AutoTimerOn' || i == 'Relay2.AutoTimerOn' || i == 'Relay3.AutoTimerOn') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.Timer' || i == 'Relay1.Timer' || i == 'Relay2.Timer' || i == 'Relay3.Timer') {
      value = 0;
    }

    adapter.log.debug('Creating State ' + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShelly4States(deviceId, status, callback) {

  let devices = datapoints.getObjectByName('shelly4');
  let parameter = {};

  // CoAP Messages - switches on/on
  let ids = getIoBrokerStatesFromObj(status);
  for (let i in ids) {
    let id = i;
    let value = ids[i];
    let controlFunction;
    // historical mapping

    switch (id) {
      case 'G12':
        id = 'Relay0.Switch';
        value = value === 1 || value === true ? true : false;
        break;
      case 'G32':
        id = 'Relay1.Switch';
        value = value === 1 || value === true ? true : false;
        break;
      case 'G52':
        id = 'Relay2.Switch';
        value = value === 1 || value === true ? true : false;
        break;
      case 'G72':
        id = 'Relay3.Switch';
        value = value === 1 || value === true ? true : false;
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
      objectHelper.setOrUpdateObject(stateId, {
        type: 'state',
        common: common
      }, ['name'], value, controlFunction);
    }
  }

  shelly.callDevice(deviceId, '/settings', parameter, (error, data) => {
    if (!error && data) {
      let ids = getIoBrokerStatesFromObj(data);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
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
          case 'meters0.power':
            id = 'Relay0.Power';
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
          case 'meters1.power':
            id = 'Relay1.Power';
            break;
          case 'relays2.ison':
            id = 'Relay2.Switch';
            break;
          case 'relays2.auto_on':
            id = 'Relay2.AutoTimerOn';
            break;
          case 'relays2.auto_off':
            id = 'Relay2.AutoTimerOff';
            break;
          case 'meters2.power':
            id = 'Relay2.Power';
            break;
          case 'relays3.ison':
            id = 'Relay3.Switch';
            break;
          case 'relays3.auto_on':
            id = 'Relay3.AutoTimerOn';
            break;
          case 'relays3.auto_off':
            id = 'Relay3.AutoTimerOff';
            break;
          case 'meters3.power':
            id = 'Relay3.Power';
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
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
    shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
      if (!error && data) {
        let ids = getIoBrokerStatesFromObj(data);
        for (let i in ids) {
          let id = i;
          let value = ids[i];
          let controlFunction;
          // historical mapping
          switch (id) {
            case 'wifi_sta.rssi':
              id = 'rssi';
              break;
            case 'update.has_update':
              id = 'update';
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
        setOnlineStatus(deviceId, true);
      } else {
        setOnlineStatus(deviceId, false);
      }
      callback && callback();
    });

  });

}


// *******************************************************************************
// Shelly Plug
// *******************************************************************************
function createShellyPlugStates(deviceId) {

  let devices = datapoints.getObjectByName('shplg1');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let controlFunction;
    let value;

    createChannel(deviceId, i);

    if (i == 'Relay0.Switch') { // Implement all needed action stuff here based on the names
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
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
          adapter.log.debug('Relay: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
        });
      };
    }

    if (i == 'Relay0.AutoTimerOff') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.AutoTimerOn') {
      const relayId = parseInt(i.substr(5), 10);
      controlFunction = (value) => {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/relay/' + relayId, params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'Relay0.Timer') {
      value = 0;
    }

    adapter.log.debug('Creating State ' + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShellyPlugStates(deviceId, callback) {

  let devices = datapoints.getObjectByName('shplg1');
  let parameter = {};

  shelly.callDevice(deviceId, '/settings', parameter, (error, data) => {
    if (!error && data) {
      let ids = getIoBrokerStatesFromObj(data);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let controlFunction;
        // historical mapping

        switch (id) {
          case 'relays.ison':
            id = 'Relay0.Switch';
            break;
          case 'relays.auto_on':
            id = 'Relay0.AutoTimerOn';
            break;
          case 'relays.auto_off':
            id = 'Relay0.AutoTimerOff';
            break;
          case 'meters.power':
            id = 'Relay0.Power';
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
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
    shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
      if (!error && data) {
        let ids = getIoBrokerStatesFromObj(data);
        for (let i in ids) {
          let id = i;
          let value = ids[i];
          let controlFunction;
          // historical mapping
          switch (id) {
            case 'wifi_sta.rssi':
              id = 'rssi';
              break;
            case 'update.has_update':
              id = 'update';
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
        setOnlineStatus(deviceId, true);
      } else {
        setOnlineStatus(deviceId, false);
      }
      callback && callback();
    });
    // callback && callback();
  });

}


// *******************************************************************************
// Shelly RGBWW
// *******************************************************************************
function createShellyRGBWWStates(deviceId) {

  let devices = datapoints.getObjectByName('shellyrgbww');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let controlFunction;
    let value;

    createChannel(deviceId, i);

    if (i == 'lights.Switch') { // Implement all needed action stuff here based on the names
      controlFunction = (value) => {
        let params = {};
        let timer = 0;
        let timerId = deviceId + '.lights.Timer';
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
          adapter.log.debug('Lights Switch: ' + JSON.stringify(params));
          shelly.callDevice(deviceId, '/light/0', params); // send REST call to devices IP with the given path and parameters
        });
      };
    }

    if (i == 'lights.red' || i == 'lights.green' || i == 'lights.blue' || i == 'lights.white' || i == 'lights.gain' || i == 'lights.temp' || i == 'lights.brightness' || i == 'lights.effect') { // Implement all needed action stuff here based on the names
      let id = i.replace('lights.', '');
      controlFunction = (value) => {
        let params = {};
        params[id] = value;
        adapter.log.debug('Set Colors: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/light/0', params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'lights.AutoTimerOff') {
      controlFunction = (value) => {
        let params;
        params = {
          'auto_off': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/light/0', params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'lights.AutoTimerOn') {
      controlFunction = (value) => {
        let params;
        params = {
          'auto_on': value
        };
        adapter.log.debug('Auto Timer off: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings/light/0', params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'mode') {
      controlFunction = (value) => {
        let params;
        params = {
          'mode': value
        };
        adapter.log.debug('Modus: ' + JSON.stringify(params));
        shelly.callDevice(deviceId, '/settings', params); // send REST call to devices IP with the given path and parameters
      };
    }

    if (i == 'lights.Timer') {
      value = 0;
    }

    adapter.log.debug('Creating State ' + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShellyRGBWWStates(deviceId, callback) {

  let devices = datapoints.getObjectByName('shellyrgbww');
  let parameter = {};

  shelly.callDevice(deviceId, '/settings', parameter, (error, data) => {
    if (!error && data) {
      let ids = getIoBrokerStatesFromObj(data);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let controlFunction;
        // historical mapping

        switch (id) {
          case 'lights.ison':
            id = 'lights.Switch';
            break;
          case 'lights.auto_on':
            id = 'lights.AutoTimerOn';
            break;
          case 'lights.auto_off':
            id = 'lights.AutoTimerOff';
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
          objectHelper.setOrUpdateObject(stateId, {
            type: 'state',
            common: common
          }, ['name'], value, controlFunction);
        }

      }
    }
    shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
      if (!error && data) {
        let ids = getIoBrokerStatesFromObj(data);
        for (let i in ids) {
          let id = i;
          let value = ids[i];
          let controlFunction;
          // historical mapping
          switch (id) {
            case 'wifi_sta.rssi':
              id = 'rssi';
              break;
            case 'update.has_update':
              id = 'update';
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
        setOnlineStatus(deviceId, true);
      } else {
        setOnlineStatus(deviceId, false);
      }
      callback && callback();
    });
    // callback && callback();
  });

}

// *******************************************************************************
// Shelly H&T
// *******************************************************************************
function createShellyHTStates(deviceId) {

  let devices = datapoints.getObjectByName('shellyht');

  for (let i in devices) {
    let common = devices[i];
    let stateId = deviceId + '.' + i;
    let controlFunction;
    let value;

    createChannel(deviceId, i);

    adapter.log.debug('Creating State ' + stateId);
    objectHelper.setOrUpdateObject(stateId, {
      type: 'state',
      common: common
    }, ['name'], value, controlFunction);
  }

}

function updateShellyHTStates(deviceId, status, callback) {

  let devices = datapoints.getObjectByName('shellyht');
  let ids = getIoBrokerStatesFromObj(status);
  let parameter = {};

  for (let i in ids) {
    let id = i;
    let value = ids[i];
    let controlFunction;
    // historical mapping

    switch (id) {
      case 'G02':
        id = 'tmp.value';
        break;
      case 'G12':
        id = 'hum.value';
        value = value / 2;
        break;
      case 'G22':
        id = 'bat.value';
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
      objectHelper.setOrUpdateObject(stateId, {
        type: 'state',
        common: common
      }, ['name'], value, controlFunction);
    }

  }

  shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
    if (!error && data) {
      let ids = getIoBrokerStatesFromObj(data);
      for (let i in ids) {
        let id = i;
        let value = ids[i];
        let controlFunction;
        // historical mapping
        switch (id) {
          case 'wifi_sta.rssi':
            id = 'rssi';
            break;
          case 'update.has_update':
            id = 'update';
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
    callback && callback();
  });
  // callback && callback();
}


// *******************************************************************************
// Display Settings
// *******************************************************************************
function displaySettings(deviceId) {
  let parameter = {};

  shelly.callDevice(deviceId, '/settings', parameter, (error, data) => {
    if (!error && data) {
      adapter.log.debug('New Device Settings for ' + deviceId + ' : ' + JSON.stringify(data));
    }
  });

  shelly.callDevice(deviceId, '/status', parameter, (error, data) => {
    if (!error && data) {
      adapter.log.debug('New Device Status for ' + deviceId + ' : ' + JSON.stringify(data));
    }
  });
}


// *******************************************************************************
// 
// *******************************************************************************
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

// Polling Status every x seconds
function pollStates(deviceId) {
  let polltime = adapter.config.polltime || 10;
  updateShellyStates(deviceId, () => {
    objectHelper.processObjectQueue(() => {
      setTimeout(pollStates, polltime * 1000, deviceId);
    });
  });
}

// main function
function main() {

  adapter.log.info('Starting ' + adapter.namespace + ' in version ' + adapter.version);
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

  shelly.on('update-device-status', (deviceId, status) => {
    adapter.log.debug('Status update received for ' + deviceId + ': ' + JSON.stringify(status));
    if (deviceId && typeof deviceId === 'string') {
      if (!knownDevices[deviceId]) { // device unknown so far, new one in network, create it
        shelly.getDeviceDescription(deviceId, (err, deviceId, description, ip) => {
          knownDevices[deviceId] = {
            ts: 0,
            mode: undefined
          };
          createShellyStates(deviceId, description, ip, status);
          updateShellyStates(deviceId, status);
          if (!deviceId.startsWith('SHHT')) {
            pollStates(deviceId);
          }
          objectHelper.processObjectQueue(() => {
            adapter.log.debug('Initialize device ' + deviceId + ' (' + Object.keys(knownDevices).length + ' now known)');
          }); // if device is added later, create all objects
        });
        return;
      }
      updateShellyStates(deviceId, status);
      objectHelper.processObjectQueue(() => { });
    } else {
      adapter.log.debug('Device Id is missing ' + deviceId);
    }
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


// If started as allInOne mode => return function to create instance
if (typeof module !== 'undefined' && module.parent) {
  module.exports = startAdapter;
} else {
  // or start the instance directly
  startAdapter();
}