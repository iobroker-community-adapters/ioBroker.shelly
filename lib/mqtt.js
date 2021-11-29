/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';


const mqtt = require('mqtt-connection');
const ping = require('ping');
const tcpp = require('tcp-ping');
const net = require('net');
const request = require('request');
const datapoints = require(__dirname + '/datapoints');

/**
 * wait x miliseconds
 * @param {number} ms - milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * checks if  funcito is an asynchron function
 * @param {function} funct - function
 */
function isAsync(funct) {
  if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
  return undefined;
}

/**
 * ping host
 * @param {string} host - hostname or ip-address
 */
function pingAsyncOld(host) {
  return new Promise((resolve, reject) => {
    ping.sys.probe(host, (isAlive) => {
      if (isAlive) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Ping host with tcp
 * @param {*} host - hostname like www.google.de or 192.168.20.1
 * @param {*} port - 80 or 443
 */
function pingAsync(host, port) {
  if (!port) port = 80;
  return new Promise((resolve, reject) => {
    tcpp.probe(host, port, (error, isAlive) => {
      resolve(isAlive);
    });
  });
}

/**
 * http request asynchron
 * @param {string} url - url
 */
function requestAsync(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, res, body) => {
      if (!error && body) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

/**
 * search pattern in an object and replace the text with an text
 * @param {object} source - object
 * @param {regex} pattern - search text
 * @param {string} replacement - replacement text
 */
function recursiveSubStringReplace(source, pattern, replacement) {
  function recursiveReplace(objSource) {
    switch (typeof objSource) {
      case 'string':
        return objSource.replace(pattern, replacement);
      case 'object':
        if (objSource === null) {
          return null;
        }
        Object.keys(objSource).forEach(function (property) {
          objSource[property] = recursiveReplace(objSource[property]);
        });
        return objSource;
      default:
        return objSource;
    }
  }
  return recursiveReplace(source);
}

class MQTTClient {
  constructor(adapter, objectHelper, eventEmitter, stream) {
    this.active = true;
    this.adapter = adapter;
    this.objectHelper = objectHelper;
    this.eventEmitter = eventEmitter;
    this.packet;
    this.qos = {};
    this.messageIds = [];
    this.messageId = 1;
    this.states = {};
    this.stream = stream;
    this.client;
    this.device = {};
    this.http = {};
    this.auth;
    this.ip;
    this.id;
    this.devicename;
    this.devicetype;
    this.deviceid;
    this.serialid;
    this.mqttprefix;
    this.deviceexist;
    this.devicegen;
    this.httptimeout = 5 * 1000;
    if (this.adapter.config.httpusername && this.adapter.config.httppassword && this.adapter.config.httpusername.length > 0 && this.adapter.config.httppassword.length > 0)
      this.auth = 'Basic ' + Buffer.from(this.adapter.config.httpusername + ':' + this.adapter.config.httppassword).toString('base64');
    this.start();
  }

  /**
   * to get sure, thatan instance will be start more than one, we check for running instances
   * if an instance run with same name (shellyswitch-12345), we destroy the old instance
   * @param {object} self - my instance
   */
  static _registerRun(self) {
    if (self) {
      if (!this.clientlist) this.clientlist = {};
      let name = self.getId();
      if (name && this.clientlist[name]) this.clientlist[name].destroy();
      this.clientlist[name] = self;
    }
  }

  /**
   * Get IP of device back. For example
   * 192.168.1.2
   */
  getIP() {
    if (!this.ip) {
      if (this.stream && this.stream.remoteAddress) this.ip = this.stream.remoteAddress;
    }
    return this.ip;
  }

  /**
   * Get the ID of the Shelly Device. For example: shellyplug-s-12345
   */
  getId() {
    if (!this.id) {
      if (this.packet && this.packet.clientId) this.id = this.packet.clientId;
    }
    return this.id;
  }

  /**
   * Get the Shelly Device type with the serialnumber of the device back.
   * Device type could be for example SHRGBW2. The serial number of the
   * device like 1234 will be added
   * Example: SHRGBW2#1234#1
   */
  getDeviceName() {
    if (!this.devicename) {
      this.devicename = this.getDeviceType() + '#' + this.getSerialId() + '#1';
    }
    return this.devicename;
  }

  /**
   * Get the Shelly Device type without serialnumber of the device back.
   * Example: SHRGBW2
   */
  getDeviceType() {
    if (!this.devicetype) {
      let deviceid = this.getDeviceId();
      this.devicetype = datapoints.getDeviceNameForMQTT(deviceid);
    }
    return this.devicetype;
  }

  /**
   * Get the deviceid back without serial number.
   * For example, you get shellyplug-s for shellyplug-s-12345 back
   */
  getDeviceId() {
    if (!this.deviceid) {
      let id = this.getId();
      if (id) {
        id = id.replace(/(.+?)\/(.+?)\/(.*)/, '$2');
        this.deviceid = id.replace(/(.+)-(.+)/, '$1');
      }
    }
    return this.deviceid;
  }

  /**
   * get the Polltime for a device
   */
  getPolltime() {
    if (this.adapter.config.polltime == 0) return 0;
    let deviceid = this.getDeviceId();
    let polltime = undefined;
    if (deviceid) {
      polltime = datapoints.getPolltime(deviceid);
      if (polltime === undefined) polltime = this.adapter.config.polltime || 0;
      if (this.adapter.config.polltime > polltime) polltime = this.adapter.config.polltime;
      return polltime;
    }
    return this.adapter.config.polltime;
  }

  async onlineCheck(stop) {
    let deviceId = this.getDeviceName();
    let polltime = this.getPolltime();
    clearTimeout(this.onlinehandle);
    try {
      if (stop === 'stop') {
        await this.adapter.setStateAsync(deviceId + '.online', {val: false, ack: true});
      } else {
        this.onlinehandle = setTimeout(async () => {
          await this.adapter.setStateAsync(deviceId + '.online', {val: false, ack: true});
        }, (polltime * 1000) + 10 * 1000);
        let state = await this.adapter.getStateAsync(deviceId + '.online');
        if (state && state.val === false) await this.adapter.setStateAsync(deviceId + '.online', {val: true, ack: true});
      }
    } catch (err) {
      // Ignore
    }
  }


  /**
   * Get the serialid back without devicename.
   * For example, you get 12345 for shellyplug-s-12345 back
   */
  getSerialId() {
    if (!this.serialid) {
      let id = this.getId();
      if (id) {
        id = id.replace(/(.+?)\/(.+?)\/(.*)/, '$2');
        this.serialid = id.replace(/(.+)-(.+)/, '$2');
      }
    }
    return this.serialid;
  }

  /**
    * Checks if Shelly device type in the configuration exist. If missing
    * you have to add a configuration in the ./lib/devices direcotory
    */
  deviceExist() {
    if (this.deviceexist === undefined) {
      let deviceid = this.getDeviceId();
      this.deviceexist = datapoints.getDeviceNameForMQTT(deviceid) ? true : false;
    }
    return this.deviceexist;
  }

  /**
    * Checks if Shelly supports rcp api
    * you have to add a configuration in the ./lib/devices direcotory
    */
  getDeviceGen() {
    if (this.devicegen === undefined) {
      let deviceid = this.getDeviceId();
      this.devicegen = datapoints.getDeviceGen(deviceid);
    }
    return this.devicegen;
  }

  /**
   * Returns a string for Logging with the IP address and name of Shelly Device and type
   */
  getName() {
    let name = this.getDeviceName(); // SHRGBW2#1234#1
    let ip = this.getIP(); // 192.168.11.1
    let deviceid = this.getDeviceId(); // shellyplug-s-12345
    let id = this.getId(); // shellyplug-s-12345
    return ip + ' (' + deviceid + ' / ' + id + ' / ' + name + ')';
  }

  /**
   * Cleanup, destroy this object
   */
  destroy() {
    if (this.active) {
      this.adapter.log.debug('Destroy ' + this.getName());
      this.active = false;
      clearTimeout(this.timerid);
      clearTimeout(this.autoupdateid);
      for (let messageId in this.qos) {
        if (this.qos[messageId].resendid) clearTimeout(this.qos[messageId].resendid);
      }
      this.qos = {};
      this.messageId = 1;
      this.states = {};
      this.device = {};
      this.http = {};
      this.ip = undefined;
      this.id = undefined;
      this.devicename = undefined;
      this.devicetype = undefined;
      this.deviceid = undefined;
      this.serialid = undefined;
      this.deviceexist = undefined;
      this.devicegen = undefined;
      this.mqttprefix = undefined;
      this.onlineCheck('stop');
      if (this.client) {
        this.client.removeAllListeners();
        this.client.destroy();
      }
    }
  }

  /**
   * Sends MQTT Messages, for example to change a state
   * @param {*} topic
   * @param {*} state
   * @param {*} qos
   * @param {*} dup
   * @param {*} retain
   * @param {function} cb
   */
  sendState2Client(topic, state, qos, dup, retain, cb) {
    if (typeof qos === 'function') {
      cb = qos;
      dup = false;
      qos = undefined;
    }
    if (typeof dup === 'function') {
      cb = dup;
      dup = false;
      retain = undefined;
    }
    if (typeof retain === 'function') {
      cb = retain;
      retain = undefined;
    }
    qos = qos ? Number.parseInt(qos) : 0;
    this.messageId &= 0xFFFFFFFF;
    this.messageId++;
    this.adapter.log.debug('Send state to ' + this.getName() + ' : ' + topic + ' = ' + state + ' (' + this.messageId + ')');
    this.client.publish({ topic: topic, payload: state, qos: qos, retain: retain, messageId: this.messageId }, cb);
    // if qos > 0 recognize message
    if (qos > 0) {
      this.deleteResendState2ClientFromTopic(topic);
      this.resendState2Client('publish', this.messageId, { topic: topic, payload: state, qos: qos, dup: true, retain: retain, messageId: this.messageId });
    }
  }


  resendState2Client(cmd, messageId, message) {
    let retaintime = 5 * 1000;
    if (!this.qos[messageId] || this.qos[messageId].cmd !== cmd || this.qos[messageId].message !== message) {
      this.qos[messageId] = {
        ts: Date.now(),
        cmd: cmd,
        count: 0,
        message: message
      };
    }
    if (this.qos[messageId] && this.qos[messageId].count < 10) {
      clearTimeout(this.qos[messageId].resendid);
      this.qos[messageId].resendid = setTimeout(() => {
        if (this.qos[messageId]) {
          let ts = Date.now();
          this.qos[messageId].count++;
          this.qos[messageId].ts = ts;
          switch (this.qos[messageId].cmd) {
            case 'publish':
              this.client.publish(this.qos[messageId].message);
              break;
            case 'pubrel':
              this.client.pubrel({ messageId: messageId });
              break;
            case 'pubrec':
              this.client.pubrec({ messageId: messageId });
              break;
            case 'pubcomp':
              this.client.pubcomp({ messageId: messageId });
              break;
            default:
              break;
          }
          this.resendState2Client(cmd, messageId, message);
        }
      }, retaintime);
    }
  }

  deleteResendState2Client(messageId) {
    if (this.qos[messageId]) {
      clearTimeout(this.qos[messageId].resendid);
      delete this.qos[messageId];
    }
  }

  deleteResendState2ClientFromTopic(topic) {
    for (let messageId in this.qos) {
      if (this.qos[messageId].message && this.qos[messageId].cmd === 'publish' && this.qos[messageId].message.topic === topic) {
        clearTimeout(this.qos[messageId].resendid);
        delete this.qos[messageId];
      }
    }
  }

  getResendState2Client(messageId) {
    return this.qos[messageId];
  }

  /**
   * delete old states in objects unter shelly.X.
   * For example if the configuration for the device change
   */
  async deleteOldStates() {
    let id = this.adapter.namespace + '.' + this.getDeviceName();
    let obj = await this.adapter.getAdapterObjectsAsync();
    let dps = datapoints.getAll('mqtt');
    let deviceid = this.getDeviceId();
    dps = dps[deviceid];
    if (dps) {
      for (let i in obj) {
        let tmpid = obj[i];
        if (!tmpid) continue;
        let stateid = tmpid._id.replace(id + '.', '');
        if (tmpid.type === 'state' && tmpid._id.startsWith(id)) {
          if (!dps[stateid]) {
            try {
              await this.adapter.delObjectAsync(tmpid._id);
              delete obj[tmpid._id];
              this.adapter.log.info('Delete old state: ' + tmpid._id);
            } catch (error) {
              this.adapter.log.error('Could not delete old state: ' + tmpid._id);
            }
          }
        }
      }
    }
    // delete empty channels
    for (let i in obj) {
      let tmpidi = obj[i];
      if (tmpidi && tmpidi.type && tmpidi._id && tmpidi.type === 'channel') {
        let found = false;
        for (let j in obj) {
          let tmpidj = obj[j];
          if (!tmpidj) {
            continue;
          }
          if (tmpidj && tmpidj.type && tmpidj._id && tmpidj.type === 'state' && tmpidj._id.startsWith(tmpidi._id)) {
            found = true;
            break;
          }
        }
        if (found === false) {
          try {
            await this.adapter.delObjectAsync(tmpidi._id);
            delete obj[tmpidi._id];
            this.adapter.log.info('Delete old channel: ' + tmpidi._id);
          } catch (error) {
            this.adapter.log.error('Could not delete old channel: ' + tmpidi._id);
          }
        }
      }
    }
  }

  /**
   * Create objects unter shelly.0 for a new shelly device
   * The Shelly device has to exist in the ./lib/devices/ directory
   */
  createObjects() {
    if (Object.keys(this.device).length === 0) {
      let deviceid = this.getDeviceId();
      let devices = datapoints.getDeviceByType(deviceid, 'mqtt');
      if (devices) {
        devices = recursiveSubStringReplace(devices, new RegExp('<mqttprefix>', 'g'), this.mqttprefix);
        // devices = recursiveSubStringReplace(devices, new RegExp('<devicetype>', 'g'), deviceid);
        // devices = recursiveSubStringReplace(devices, new RegExp('<deviceid>', 'g'), this.getSerialId());
        for (let j in devices) {
          let statename = j;
          let state = devices[statename];
          state.state = statename;
          let deviceid = this.getDeviceName();
          if (!this.states[deviceid] || this.states[deviceid] !== deviceid) {
            this.states[deviceid] = deviceid;
            this.objectHelper.setOrUpdateObject(deviceid, {
              type: 'device',
              common: {
                name: 'Device ' + deviceid
              },
              native: {}
            }, ['name']);
          }
          let channel = statename.split('.').slice(0, 1).join();
          if (channel !== statename) {
            let channelid = deviceid + '.' + channel;
            if (!this.states[channelid] || this.states[channelid] !== channelid) {
              this.states[channelid] = channelid;
              this.objectHelper.setOrUpdateObject(channelid, {
                type: 'channel',
                common: {
                  name: 'Channel ' + channel
                }
              }, ['name']);
            }
          }
          let stateid = deviceid + '.' + statename;
          let controlFunction;
          if (state.mqtt && state.mqtt.mqtt_cmd) {
            controlFunction = async (value) => {
              let cmd = state.mqtt.mqtt_cmd;
              if (state.mqtt && state.mqtt.mqtt_cmd_funct) {
                try {
                  value = isAsync(state.mqtt.mqtt_cmd_funct) ? await state.mqtt.mqtt_cmd_funct(value, this) : state.mqtt.mqtt_cmd_funct(value, this);
                } catch (error) {
                  this.adapter.log.error('Error in function state.mqtt.mqtt_cmd_funct for state ' + stateid + ' for ' + this.getName() + ' (' + error + ')');
                }
              }
              this.sendState2Client(cmd, value, this.adapter.config.qos);
              delete this.states[stateid];
            };
          } else if (state.mqtt && state.mqtt.http_cmd) {
            controlFunction = async (value) => {
              if (state.mqtt && state.mqtt.http_cmd_funct) {
                try {
                  value = isAsync(state.mqtt.http_cmd_funct) ? await state.mqtt.http_cmd_funct(value, this) : state.mqtt.http_cmd_funct(value, this);
                } catch (error) {
                  this.adapter.log.error('Error in function state.mqtt.http_cmd_funct for state ' + stateid + ' for ' + this.getName() + ' (' + error + ')');
                }
              }
              let body;
              let params;
              try {
                if (this.auth) {
                  params = {
                    url: 'http://' + this.getIP() + state.mqtt.http_cmd,
                    timeout: this.httptimeout,
                    qs: value,
                    headers: {
                      'Authorization': this.auth
                    }
                  };
                } else {
                  params = {
                    url: 'http://' + this.getIP() + state.mqtt.http_cmd,
                    timeout: this.httptimeout,
                    qs: value
                  };
                }
                this.adapter.log.debug('Call url ' + JSON.stringify(params) + '  for ' + this.getName());
                body = await requestAsync(params);
                // this.adapter.log.debug('Create Object body : ' + body);
              } catch (error) {
                if (body && body === '401 Unauthorized') {
                  this.adapter.log.error('Wrong http username or http password! Please enter the user credential from restricted login for ' + this.getName());
                } else {
                  this.adapter.log.error('Error in function state.mqtt.http_cmd for state ' + stateid + ' and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
                }
              }
              delete this.states[stateid];
            };
          }
          if (state.mqtt.http_publish && !state.mqtt.mqtt_publish) {
            if (!this.http[state.mqtt.http_publish]) this.http[state.mqtt.http_publish] = [];
            this.http[state.mqtt.http_publish].push(statename);
          }
          let value;
          if (state.mqtt.mqtt_init_value) value = state.mqtt.mqtt_init_value;
          this.objectHelper.setOrUpdateObject(stateid, {
            type: 'state',
            common: state.common
          }, ['name'], value, controlFunction);
        }
        this.device = devices;
      }
      this.objectHelper.processObjectQueue(() => { });
    }
  }

  getDevices(topic) {
    let states = [];
    for (let i in this.device) {
      let state = this.device[i];
      if (state.mqtt && state.mqtt.mqtt_publish && topic === state.mqtt.mqtt_publish) states.push(state);
      // if (state.mqtt && state.mqtt.mqtt_cmd && topic === state.mqtt.mqtt_cmd) states.push(state);
    }
    return states;
  }

  /**
   * State changes from device will be saved in the ioBroker states
   * @param {object} payload - object can be ervery type of value
   */
  async createIoBrokerState(topic, payload) {
    this.adapter.log.debug('MQTT Message for ' + this.getId() + ' : ' + topic + ' / ' + JSON.stringify(payload));
    let dps = this.getDevices(topic);
    for (let i in dps) {
      let dp = dps[i];
      let deviceid = this.getDeviceName();
      let stateid = deviceid + '.' + dp.state;
      let value = payload.toString();
      this.adapter.log.debug('Create State : ' + stateid + ', Payload: ' + JSON.stringify(payload) + ' for ' + this.getId());
      this.adapter.log.debug('Create State : ' + stateid + ', Payload: ' + payload.toString() + ' for ' + this.getId());
      try {
        if (dp.mqtt && dp.mqtt.mqtt_publish === topic) {
          if (dp.mqtt && dp.mqtt.mqtt_publish_funct)
            value = isAsync(dp.mqtt.mqtt_publish_funct) ? await dp.mqtt.mqtt_publish_funct(value, this) : dp.mqtt.mqtt_publish_funct(value, this);
          if (dp.common.type === 'boolean' && value === 'false') value = false;
          if (dp.common.type === 'boolean' && value === 'true') value = true;
          if (dp.common.type === 'number' && value !== undefined) value = Number(value);
          // this.adapter.log.debug('createIoBrokerState(), State : ' + stateid + ', Value: ' + JSON.stringify(value));
          if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value || this.adapter.config.updateUnchangedObjects)) {
            this.adapter.log.debug('State change : ' + stateid + ', Value: ' + JSON.stringify(value) + ' for ' + this.getName());
            this.adapter.log.debug('MQTT Message for ' + this.getId() + ' : ' + topic + ' = ' + value);
            this.states[stateid] = value;
            this.objectHelper.setOrUpdateObject(stateid, {
              type: 'state',
              common: dp.common
            }, ['name'], value);
          }
        }
      } catch (error) {
        this.adapter.log.error('Error ' + error + ' in function dp.mqtt.mqtt_publish_funct for state ' + stateid + ' for ' + this.getName());
      }
    }
    this.objectHelper.processObjectQueue(() => { });
    await this.onlineCheck();
  }

  /**
   * Missting data in MQTT will be pulled by http
   */
  async httpIoBrokerState() {
    // Test - to delete after a while
    if (!this.httpIoBrokerStateTime || Date.now() >= (this.httpIoBrokerStateTime + (1000 * 60 * 10))) {
      this.httpIoBrokerStateTime = Date.now();
      // this.adapter.log.info('httpIoBrokerState() still running on ' + this.getName() + ' for ' + JSON.stringify(this.http));
    }
    let alive = await pingAsync(this.getIP());
    if (alive === false) {
      this.timerid = setTimeout(async () => await this.httpIoBrokerState(), 100);
      return;
    }
    let polltime = this.getPolltime();
    for (let i in this.http) {
      let params;
      let states = this.http[i];
      try {
        if (this.auth) {
          params = {
            url: 'http://' + this.getIP() + i,
            timeout: this.httptimeout,
            headers: {
              'Authorization': this.auth
            }
          };
        } else {
          params = {
            url: 'http://' + this.getIP() + i,
            timeout: this.httptimeout
          };
        }
        this.adapter.log.debug('http request' + JSON.stringify(params) + ' for ' + this.getName());
        let body = await requestAsync(params);
        for (let j in states) {
          let state = this.device[states[j]];
          if (state && state.state) {
            let deviceid = this.getDeviceName();
            let stateid = deviceid + '.' + state.state;
            let value = body;
            try {
              if (state.mqtt && state.mqtt.http_publish_funct)
                value = isAsync(state.mqtt.http_publish_funct) ? await state.mqtt.http_publish_funct(value, this) : state.mqtt.http_publish_funct(value, this);
              if (state.common.type === 'boolean' && value === 'false') value = false;
              if (state.common.type === 'boolean' && value === 'true') value = true;
              if (state.common.type === 'number' && value !== undefined) value = Number(value);
              if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value || this.adapter.config.updateUnchangedObjects)) {
                this.adapter.log.debug('Set http state ' + stateid + ', Value: ' + JSON.stringify(value) + ' for ' + this.getName());
                this.states[stateid] = value;
                this.objectHelper.setOrUpdateObject(stateid, {
                  type: 'state',
                  common: state.common
                }, ['name'], value);
              }
            } catch (error) {
              if (error.name && error.name.startsWith('TypeError')) {
                this.adapter.log.debug('Could not find property for state ' + stateid + ' and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
              } else {
                if (polltime > 0 && polltime < 60) polltime = 60;
                if (body && body === '401 Unauthorized') {
                  this.adapter.log.error('Wrong http username or http password! Please enter the user credential from restricted login for ' + this.getName());
                  break;
                } else {
                  this.adapter.log.error('Error in function httpIoBrokerState for state ' + stateid + ' and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
                }
              }
            }
          }
        }
        this.objectHelper.processObjectQueue(() => { });
      } catch (error) {
        //
      }
    }
    if (this.http && Object.keys(this.http).length > 0 && polltime > 0) {
      this.timerid = setTimeout(async () => await this.httpIoBrokerState(), polltime * 1000);
    }
    await this.onlineCheck();
  }

  /*
  async firmwareUpdatePolling() {
    if (this.adapter.config.autoupdate) {
      await this.firmwareUpdate(true);
      this.autoupdateid = setTimeout(async () => await this.firmwareUpdatePolling(), 60 * 1000);
    }
  }
  */

  async firmwareUpdate(update) {
    if (!update) return;
    this.adapter.log.debug('Calling function firmwareUpdate');
    let params;
    try {
      if (this.auth) {
        params = {
          url: 'http://' + this.getIP() + '/ota?update=true',
          timeout: this.httptimeout,
          headers: {
            'Authorization': this.auth
          }
        };
      } else {
        params = {
          url: 'http://' + this.getIP() + '/ota?update=true',
          timeout: this.httptimeout
        };
      }
      this.adapter.log.debug('Call url ' + JSON.stringify(params) + ' for ' + this.getName());
      let body = await requestAsync(params);
      // this.adapter.log.info('Executing Firmwareupdate for ' + this.getName());
    } catch (error) {
      this.adapter.log.error('Error in function firmwareUpdate and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
    }
  }


  start() {
    this.client = mqtt(this.stream);
    this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate(true));
    // this.firmwareUpdatePolling();
    this.listener();
  }


  async setMqttPrefixHttp() {
    let body;
    let params;

    if (this.mqttprefix) {
      return this.mqttprefix;
    }

    try {
      if (this.getDeviceGen() == 1) {
        if (this.auth) {
          params = {
            url: 'http://' + this.getIP() + '/settings',
            timeout: this.httptimeout,
            headers: {
              'Authorization': this.auth
            }
          };
        } else {
          params = {
            url: 'http://' + this.getIP() + '/settings',
            timeout: this.httptimeout,
          };
        }
      }
      this.adapter.log.debug('Call url ' + JSON.stringify(params) + '  for ' + this.getName());
      body = await requestAsync(params);
      if (body) {
        let settings = JSON.parse(body);
        this.mqttprefix = settings.mqtt.id;
        return this.mqttprefix;
      }
    } catch (error) {
      if (body && body === '401 Unauthorized') {
        this.adapter.log.error('Wrong http username or http password! Please enter the user credential from restricted login for ' + this.getName());
      } else {
        this.adapter.log.error('Error in function setMqttPrefixHttp() for request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
      }
    }
    return undefined;
  }

  setMqttPrefixByWill(topic) {
    // "shellies/huhu-shellybutton1-A4CF12F454A3/online"
    if (this.mqttprefix) {
      return this.mqttprefix;
    } else {
      if (topic) {
        let arr = topic.split('/');
        if (arr[0] === 'shellies') {
          this.mqttprefix = arr[1];
          return this.mqttprefix;
        }
      }
      return undefined;
    }
  }


  listener() {
    // client connected
    this.client.on('connect', async (packet) => {
      this.packet = packet;
      this.adapter.log.debug('client connected: ' + JSON.stringify(packet));
      if (this.deviceExist()) {
        if (packet.username === this.adapter.config.mqttusername && packet.password !== undefined && packet.password.toString() === this.adapter.config.mqttpassword) {
          // check for existing instances
          MQTTClient._registerRun(this);
          let polltime = this.getPolltime();
          if (polltime > 0) {
            this.adapter.log.info('Shelly device ' + this.getName() + ' with MQTT connected! Polltime set to ' + polltime + ' sec.');
          } else {
            this.adapter.log.info('Shelly device ' + this.getName() + ' with MQTT connected! No polling');
          }
          // Letzer Wille speichern
          if (packet.will) {
            this.will = packet.will;
          }
          if (this.will && this.will.topic) {
            this.setMqttPrefixByWill(this.will.topic);
          } else {
            await this.setMqttPrefixHttp();
          }
          this.deleteOldStates();
          this.createObjects();
          this.httpIoBrokerState();
          this.client.connack({ returnCode: 0 });
          // this.client.connack({ returnCode: 0, sessionPresent });
        } else {
          this.adapter.log.error('Wrong MQTT authentification for : ' + this.getName());
          this.client.connack({ returnCode: 4 });
        }
      } else {
        this.adapter.log.error('Shelly Device unknown, configuration for Shelly device ' + this.getName() + ' for MQTT does not exist!');
        this.client.connack({ returnCode: 4 });
      }
    });
    this.client.on('close', (status) => {
      this.adapter.log.info('Close Client: ' + this.getName() + ' (' + status + ')');
      this.destroy();
    });
    this.client.on('error', (error) => {
      // this.adapter.log.info('Error Client : ' + this.getName() + ' (' + error + ')');
      // this.destroy();
    });
    this.client.on('disconnect', () => {
      this.adapter.log.info('Client Disconnect : ' + this.getName());
      this.destroy();
    });
    this.client.on('timeout', () => {
      this.adapter.log.info('Client Timeout : ' + this.getName());
      // this.destroy();
    });
    this.client.on('publish', (packet) => {
      // this.adapter.log.debug('Publish packet for ' + this.getName() + ' : ' + JSON.stringify(packet));
      if (packet.payload) this.adapter.log.debug('Publish ' + this.getName() + ' payload: ' + packet.topic + ' = ' + packet.payload.toString());
      // the ip address in docker container ist sometimes in stream.remoteAddress. We replace it, with the announce address
      if (packet.topic === 'shellies/announce' && packet.payload) {
        try {
          let ip = JSON.parse(packet.payload).ip;
          if (ip) this.ip = ip;
        } catch (error) {
          // we do not change anything
        }
      }
      this.createIoBrokerState(packet.topic, packet.payload);
      switch (packet.qos) {
        case 1:
          this.client.puback({ messageId: packet.messageId });
          break;
        case 2:
          this.client.pubrec({ messageId: packet.messageId });
          this.resendState2Client('pubrec', packet.messageId);
          break;
        default:
          break;
      }
    });
    // this.client pinged
    this.client.on('pingreq', () => {
      // send a pingresp
      this.client.pingresp();
    });
    // response for QoS2
    this.client.on('pubrec', (packet) => {
      let qosmsg = this.getResendState2Client(packet.messageId);
      if (qosmsg && qosmsg.cmd === 'publish') {
        this.client.pubrel({ messageId: packet.messageId });
        this.resendState2Client('pubrel', packet.messageId);
      } else {
        this.adapter.log.warn('Client ' + this.getName() + ' received pubrec for unknown messageId ' + packet.messageId);
      }
    });
    // response for QoS2
    this.client.on('pubcomp', (packet) => {
      let qosmsg = this.getResendState2Client(packet.messageId);
      if (qosmsg && qosmsg.cmd === 'pubrec') {
        this.deleteResendState2Client(packet.messageId);
      } else {
        this.adapter.log.warn('Client ' + this.getName() + ' received pubcomp for unknown messageId ' + packet.messageId);
      }
    });
    // response for QoS2
    this.client.on('pubrel', (packet) => {
      let qosmsg = this.getResendState2Client(packet.messageId);
      if (qosmsg && qosmsg.cmd === 'pubrec') {
        this.deleteResendState2Client(packet.messageId);
        this.client.pubcomp({ messageId: packet.messageId });
      } else {
        this.adapter.log.warn('Client ' + this.getName() + ' received pubrel for unknown messageId ' + packet.messageId);
      }
    });

    // response for QoS1
    this.client.on('puback', (packet) => {
      // remove this message from queue
      let qosmsg = this.getResendState2Client(packet.messageId);
      if (qosmsg && qosmsg.cmd === 'publish') {
        this.deleteResendState2Client(packet.messageId);
      } else {
        this.adapter.log.warn('Client ' + this.getName() + ' received puback for unknown messageId ' + packet.messageId);
      }
    });


    this.client.on('unsubscribe', (packet) => {
      this.adapter.log.debug('Unsubscribe for ' + this.getName() + ' : ' + JSON.stringify(packet));
      this.client.unsuback({ messageId: packet.messageId });
    });

    // this.client subscribed
    this.client.on('subscribe', (packet) => {
      // send a suback with messageId and granted QoS level
      this.adapter.log.debug('Subscribe for ' + this.getName() + ' : ' + JSON.stringify(packet));
      const granted = [];
      for (let i in packet.subscriptions) {
        granted.push(packet.subscriptions[i].qos);
        let topic = packet.subscriptions[i].topic;
        // this.adapter.log.debug('publish topic: ' + topic);
      }
      if (packet.topic) this.adapter.log.debug('subscribe topic: ' + packet.topic);
      // this.adapter.log.info('Will: ' + packet.will);
      this.client.suback({ granted: granted, messageId: packet.messageId });
    });

    // timeout idle streams after 5 minutes
    // this.client.stream.setTimeout(1000 * 60 * 5);
  }

}

class MQTTServer {

  constructor(adapter, objectHelper, eventEmitter) {
    if (!(this instanceof MQTTServer)) return new MQTTServer(adapter, objectHelper, eventEmitter);
    this.messageId = 1;
    this.server = new net.Server();
    this.adapter = adapter;
    this.clients = [];
    this.objectHelper = objectHelper;
    this.eventEmitter = eventEmitter;
  }

  listen() {
    // let clientlist = {};
    this.server.on('connection', (stream) => {
      let client = new MQTTClient(this.adapter, this.objectHelper, this.eventEmitter, stream);
      stream.on('timeout', () => {
        this.adapter.log.info('Server Timeout for ' + stream.remoteAddress + ' (' + client.getName() + ')');
        client.destroy();
        stream.destroy();
      });
      stream.on('unload', () => {
        this.adapter.log.info('Server Unload for ' + stream.remoteAddress + ' (' + client.getName() + ')');
        client.destroy();
        stream.destroy();
      });
      stream.on('error', () => {
        // this.adapter.log.info('Stream Error for ' + stream.remoteAddress + ' (' + client.getName() + ')');
        if (client) {
          client.destroy();
          stream.destroy();
        }
      });
      stream.on('close', () => {
        // this.adapter.log.debug('Stream Close for ' + stream.remoteAddress + ' (' + client.getName() + ')');
      });
      stream.on('end', () => {
        this.adapter.log.debug('Stream Ends for ' + stream.remoteAddress + ' (' + client.getName() + ')');
      });
    });
    this.server.on('close', () => {
      this.adapter.log.info('Closing listender ');
    });
    this.server.on('error', (error) => {
      this.adapter.log.error('Error in listender ' + error);
    });
    // listen on port 1883
    this.server.listen(this.adapter.config.port, this.adapter.config.bind, () => {
    });
  }

}

module.exports = {
  MQTTServer: MQTTServer
};
