/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const utils = require('@iobroker/adapter-core');
const objectHelper = require('@apollon/iobroker-tools').objectHelper; // Get common adapter utils
const mqttServer = require(__dirname + '/lib/mqtt');
const coapServer = require(__dirname + '/lib/coap');
const adapterName = require('./package.json').name.split('.').pop();
const ping = require('ping');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const colorconv = require(__dirname + '/lib/colorconv');

/*
let r = 117;
let g = 255;
let b = 177;
*/
let r = 117;
let g = 255;
let b = 177;
let c1 = colorconv.rgbToHsl(r,g,b);
let c2 = colorconv.rgbToHsv(r,g,b);
let h1 = c1[0];
let s1 = c1[1];
let l1 = c1[2];
let h2 = c2[0];
let s2 = c2[1];
let v2 = c2[2];

let c3 = colorconv.hsvToRgb(h2,s2,v2);
let c4 = colorconv.hslToRgb(h1,s1,l1);

let adapter;

function decrypt(key, value) {
  let result = '';
  for (let i = 0; i < value.length; ++i) {
    result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
  }
  return result;
}

function startAdapter(options) {
  options = options || {};
  options.name = adapterName;
  adapter = new utils.Adapter(options);

  adapter.on('unload', (callback) => {
    try {
      adapter.log.info('Closing Adapter');
      callback();
    } catch (e) {
      // adapter.log.error('Error');
      callback();
    }
  });

  adapter.on('message', (msg) => {
    adapter.sendTo(msg.from, msg.command, 'Execute command ' + msg.command, msg.callback);
  });

  adapter.on('stateChange', (id, state) => {
    // Warning, state can be null if it was deleted
    if (state && !state.ack) {
      let stateId = id.replace(adapter.namespace + '.', '');
      adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
      adapter.log.debug('stateChange ' + id + ' = ' + state.val);
      objectHelper.handleStateChange(id, state);
      if(stateId  === 'info.update') {
        eventEmitter.emit('onFirmwareUpdate');
      }
    }
  });

  adapter.on('ready', async () => {
    try {
      await migrateconfig();
      await encryptPasswords();
      await main();
    } catch (error) {
      // ...
    }
  });

  return adapter;
}

process.on('SIGINT', () => {
  adapter.terminate ? adapter.terminate() : process.exit();
});

process.on('uncaughtException', (err) => {
  console.log('Exception: ' + err + '/' + err.toString());
  console.log(err.message);
  console.log(err.stack);
  if (adapter && adapter.log) {
    adapter.log.error('Exception: ' + err);
    adapter.log.error('Exception: ' + err.message);
    adapter.log.error('Exception: ' + err.stack);
  }
  process.exit();
  // adapter.terminate ? adapter.terminate() : process.exit();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAllDevices() {
  let ids = [];
  try {
    let objs = await adapter.getAdapterObjectsAsync();
    for (let id in objs) {
      let obj = objs[id];
      if (id && id.endsWith('.online') && obj && obj.type === 'state') {
        ids.push(id);
      }
    }
  } catch (error) { /* */ }
  return ids;
}

async function onlineCheck() {
  try {
    let idsOnline = await getAllDevices();
    for (let i in idsOnline) {
      let idOnline = idsOnline[i];
      let idParent = idOnline.split('.').slice(0, -1).join('.');
      let idHostname = idParent + '.hostname';
      let stateHostaname = await adapter.getStateAsync(idHostname);
      let valHostname = stateHostaname ? stateHostaname.val : undefined;
      if (valHostname) {
        ping.sys.probe(valHostname, async (isAlive) => {
          let hostname = valHostname;
          let oldState = await adapter.getStateAsync(idOnline);
          let oldValue = oldState && oldState.val ? oldState.val === 'true' || oldState.val === true : false;
          if (oldValue != isAlive)
            await adapter.setStateAsync(idOnline, { val: isAlive, ack: true });

        });
      }
    }
  } catch (error) { /* */ }
  await sleep(60 * 1000);
  await onlineCheck();
}

async function encryptPasswords() {
  return new Promise((resolve, reject) => {
    adapter.getForeignObject('system.config', (err, obj) => {
      if (err) reject(err);
      if (adapter.config.mqttpassword) {
        if (obj && obj.native && obj.native.secret) {
          //noinspection JSUnresolvedVariable
          adapter.config.mqttpassword = decrypt(obj.native.secret, adapter.config.mqttpassword);
        } else {
          //noinspection JSUnresolvedVariable
          adapter.config.mqttpassword = decrypt('Zgfr56gFe87jJOM', adapter.config.mqttpassword);
        }
      }
      if (adapter.config.httppassword) {
        if (obj && obj.native && obj.native.secret) {
          //noinspection JSUnresolvedVariable
          adapter.config.httppassword = decrypt(obj.native.secret, adapter.config.httppassword);
        } else {
          //noinspection JSUnresolvedVariable
          adapter.config.httppassword = decrypt('Zgfr56gFe87jJOM', adapter.config.httppassword);
        }
      }
      adapter.config.polltime = 5;
      resolve();
    });
  });
}

async function migrateconfig() {
  let native = {};
  if (adapter.config.http_username) {
    native.httpusername = adapter.config.http_username;
    native.http_username = '';
  }
  if (adapter.config.http_password) {
    native.httppassword = adapter.config.http_password;
    native.http_password = '';
  }
  if (adapter.config.user) {
    native.mqttusername = adapter.config.user;
    native.user = '';
  }
  if (adapter.config.password) {
    native.mqttpassword = adapter.config.password;
    native.password = '';
  }
  if (Object.keys(native).length) {
    adapter.log.info('Migrate some data from old Shelly Adapter version. Restarting Shelly Adapter now!');
    await adapter.extendForeignObjectAsync('system.adapter.' + adapter.namespace, { native: native });
  }
}

async function main() {
  onlineCheck();
  adapter.setState('info.connection', { val: true, ack: true });
  adapter.subscribeStates('*');
  objectHelper.init(adapter);
  let protocol = adapter.config.protocol || 'coap';
  setTimeout(() => {
    if (protocol === 'both' || protocol === 'mqtt') {
      adapter.log.info('Starting Shelly adapter in MQTT modus. Listening on ' + adapter.config.bind + ':' + adapter.config.port);
      if (!adapter.config.mqttusername || adapter.config.mqttusername.length === 0) { adapter.log.error('MQTT Username is missing!'); }
      if (!adapter.config.mqttpassword || adapter.config.mqttpassword.length === 0) { adapter.log.error('MQTT Password is missing!'); }
      let serverMqtt = new mqttServer.MQTTServer(adapter, objectHelper, eventEmitter);
      serverMqtt.listen();
    }
  });
  setTimeout(() => {
    if (protocol === 'both' || protocol === 'coap') {
      adapter.log.info('Starting Shelly adapter in CoAP modus.');
      let serverCoap = new coapServer.CoAPServer(adapter, objectHelper, eventEmitter);
      serverCoap.listen();
    }
  });
}

// If started as allInOne mode => return function to create instance
if (typeof module !== 'undefined' && module.parent) {
  module.exports = startAdapter;
} else {
  // or start the instance directly
  startAdapter();
}
