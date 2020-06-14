/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';


const Shelly = require('shelly-iot');
const ping = require('ping');
const request = require('request');
const datapoints = require(__dirname + '/datapoints');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAsync(funct) {
  if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
  return undefined;
}

/**
 * ping host
 * @param {string} host - hostname or ip-address
 */
function pingAsync(host) {
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

class CoAPClient {
  constructor(adapter, objectHelper, eventEmitter, shelly, devicename, ip, payload) {
    this.active = true;
    this.adapter = adapter;
    this.objectHelper = objectHelper;
    this.eventEmitter = eventEmitter;
    this.shelly = shelly;
    this.devicename = devicename;
    this.ip = ip;
    this.states = {};
    this.device = {};
    this.http = {};
    this.auth;
    this.polltime = this.adapter.config.polltime * 1000 || 5000;
    this.id;
    this.devicetype;
    this.deviceid;
    this.serialid;
    this.deviceexist;
    this.httptimeout = 5 * 1000;
    if (this.adapter.config.httpusername && this.adapter.config.httppassword && this.adapter.config.httpusername.length > 0 && this.adapter.config.httppassword.length > 0)
      this.auth = 'Basic ' + Buffer.from(this.adapter.config.httpusername + ':' + this.adapter.config.httppassword).toString('base64');
    this.start(payload);
  }

  /**
   * Get IP of device back. For example
   * 192.168.1.2
   */
  getIP() {
    return this.ip;
  }

  /**
   * Get the ID of the Shelly Device. For example: shellyplug-s-12345
   */
  getId() {
    if (!this.id) {
      let devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());
      let serialid = this.getSerialId();
      if (devicetype && serialid) this.id = devicetype + '-' + serialid;
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
    return this.devicename;
  }

  /**
   * Get the Shelly Device type without serialnumber of the device back.
   * Example: SHRGBW2
   */
  getDeviceType() {
    if (!this.devicetype) {
      let devicename = this.getDeviceName();
      if (typeof devicename === 'string') {
        this.devicetype = devicename.split('#').slice(0, 1).join();
      }
    }
    return this.devicetype;
  }

  /**
   * Get the deviceid back without serial number.
   * For example, you get shellyplug-s back 
   */
  getDeviceId() {
    if (!this.deviceid) {
      this.deviceid = datapoints.getDeviceNameForCoAP(this.getDeviceType());
    }
    return this.deviceid;
  }

  /**
   * Get the serialid back without devicename.
   * For example, you get 12345 for shellyplug-s-12345 back 
   */
  getSerialId() {
    if (!this.serialid) {
      let devicename = this.getDeviceName();
      if (typeof devicename === 'string') {
        let devicetype = devicename.split('#');
        if (devicetype) this.serialid = devicetype[1];
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
      this.adapter.log.info('Destroy ' + this.getName());
      this.active = false;
      clearTimeout(this.timerid);
      clearTimeout(this.autoupdateid);
      this.devicename = undefined;
      this.http = {};
      this.states = {};
      this.device = {};
      this.ip = undefined;
      this.id = undefined;
      this.devicetype = undefined;
      this.deviceid = undefined;
      this.serialid = undefined;
      this.deviceexist = undefined;
      if (this.listenerus) this.shelly.removeListener('update-device-status', this.listenerus);
      if (this.listenerds) this.shelly.removeListener('device-connection-status', this.listenerds);
    }
  }

  /**
   * check if the protcoll for shelly device is mqtt or coap
   * and returns coap or mqtt
   */
  async getProtocol() {
    let params;
    try {
      let url = 'http://' + this.getIP() + '/settings';
      if (this.auth) {
        params = {
          url: url,
          timeout: this.httptimeout,
          headers: { 'Authorization': this.auth }
        };
      } else {
        params = {
          url: url,
          timeout: this.httptimeout
        };
      }
      let body = await requestAsync(params);
      body = body && JSON.parse(body);
      if (body && body.mqtt) {
        switch (body.mqtt.enable) {
          case true:
            return 'mqtt';
          case false:
            return 'coap';
          default:
            return undefined;
        }
      }
    } catch (error) {
      this.adapter.log.error('Error in function getProtocol and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
    }
  }

  test(obj, key) {
    Object.keys(obj).some((prop) => {
      return ~prop.indexOf(key);
    }); //true
  }

  /**
   * delete old states in objects unter shelly.X. 
   * For example if the configuration for the device change
   */
  async deleteOldStates() {
    let id = this.adapter.namespace + '.' + this.getDeviceName();
    let obj = await this.adapter.getAdapterObjectsAsync();
    let devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());
    let dps = datapoints.getAll('coap');
    dps = dps[devicetype];
    if (dps) {
      for (let i in obj) {
        let tmpid = obj[i];
        if (tmpid && tmpid._id && tmpid.type) {
          let stateid = tmpid._id.replace(id + '.', '');
          if (tmpid.type === 'state' && tmpid._id.startsWith(id)) {
            if (!dps[stateid]) {
              await this.adapter.delObjectAsync(tmpid._id);
              delete obj[tmpid._id];
              this.adapter.log.info('Delete old state: ' + tmpid._id);
            }
          }
        }
      }
    }
    // delete empty channels
    for (let i in obj) {
      let tmpidi = obj[i];
      if (tmpidi.type === 'channel') {
        let found = false;
        for (let j in obj) {
          let tmpidj = obj[j];
          if (tmpidj.type === 'state' && tmpidj._id.startsWith(tmpidi._id)) {
            found = true;
            break;
          }
        }
        if (found === false) {
          await this.adapter.delObjectAsync(tmpidi._id);
          delete obj[tmpidi._id];
          this.adapter.log.info('Delete old channel: ' + tmpidi._id);
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
      let devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());
      let devices = datapoints.getDeviceByType(devicetype, 'coap');
      if (devices) {
        devices = recursiveSubStringReplace(devices, new RegExp('<devicetype>', 'g'), devicetype);
        devices = recursiveSubStringReplace(devices, new RegExp('<deviceid>', 'g'), this.getSerialId());
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
          if (state.coap && state.coap.http_cmd && !state.coap.coap_cmd) {
            controlFunction = async (value) => {
              if (state.coap && state.coap.http_cmd_funct) {
                try {
                  value = isAsync(state.coap.http_cmd_funct) ? await state.coap.http_cmd_funct(value, this) : state.coap.http_cmd_funct(value, this);
                } catch (error) {
                  this.adapter.log.error('Error in function state.coap.http_cmd_funct for state ' + stateid + ' for ' + this.getName() + ' (' + error + ')');
                }
              }
              let body;
              let params;
              try {
                if (this.auth) {
                  params = {
                    url: 'http://' + this.getIP() + state.coap.http_cmd,
                    timeout: this.httptimeout,
                    qs: value,
                    headers: {
                      'Authorization': this.auth
                    }
                  };
                } else {
                  params = {
                    url: 'http://' + this.getIP() + state.coap.http_cmd,
                    timeout: this.httptimeout,
                    qs: value
                  };
                }
                this.adapter.log.debug('Call url ' + JSON.stringify(params) + ' for ' + this.getName());
                body = await requestAsync(params);
                // this.adapter.log.debug('Create Object body : ' + body);
              } catch (error) {
                if (body && body === '401 Unauthorized') {
                  this.adapter.log.error('Wrong http username or http password! Please enter the user credential from restricted login for ' + this.getName());
                } else {
                  this.adapter.log.error('Error in function state.coap.http_cmd for state ' + stateid + ' and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
                }
              }
              delete this.states[stateid];
            };
          }
          if (state.coap && state.coap.http_publish && !state.coap.coap_publish) {
            if (!this.http[state.coap.http_publish]) this.http[state.coap.http_publish] = [];
            this.http[state.coap.http_publish].push(statename);
          }
          let value;
          if (state.coap.coap_init_value) value = state.coap.coap_init_value;
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

  getDevices() {
    let states = [];
    for (let i in this.device) {
      let state = this.device[i];
      if (state.coap && state.coap.coap_publish_funct) states.push(state);
    }
    return states;
  }


  /**
   * State changes from device will be saved in the ioBroker states
   * @param {object} payload - object can be ervery type of value
   */
  async createIoBrokerState(payload) {
    this.adapter.log.debug('CoAP Message for ' + this.getDeviceName() + ' : ' + JSON.stringify(payload));
    let dps = this.getDevices();
    for (let i in dps) {
      let dp = dps[i];
      let deviceid = this.getDeviceName();
      let stateid = deviceid + '.' + dp.state;
      let value = payload;
      this.adapter.log.debug('Create State : ' + stateid + ', Payload: ' + JSON.stringify(payload) + ' for ' + this.getDeviceName());
      this.adapter.log.debug('Create State : ' + stateid + ', Payload: ' + payload.toString() + ' for ' + this.getDeviceName());
      try {
        if (dp.coap && dp.coap.coap_publish_funct) {
          value = isAsync(dp.coap.coap_publish_funct) ? await dp.coap.coap_publish_funct(value, this) : dp.coap.coap_publish_funct(value, this);
          if (dp.common.type === 'boolean' && value === 'false') value = false;
          if (dp.common.type === 'boolean' && value === 'true') value = true;
          if (dp.common.type === 'number') value = Number(value);
          // this.adapter.log.debug('createIoBrokerState(), State : ' + stateid + ', Value: ' + JSON.stringify(value));
          // if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value)) {}
          if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value)) {
            this.adapter.log.debug('State change : ' + stateid + ', Value: ' + JSON.stringify(value) + ' for ' + this.getName());
            this.states[stateid] = value;
            this.objectHelper.setOrUpdateObject(stateid, {
              type: 'state',
              common: dp.common
            }, ['name'], value);

          }
        }
      } catch (error) {
        this.adapter.log.error('Error ' + error + ' in function dp.coap.coap_publish_funct for state ' + stateid + ' for ' + this.getName());
      }
    }
    this.objectHelper.processObjectQueue(() => { });
  }

  /**
   * Missting data in CoAP will be pulled by http  
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
        // this.adapter.log.debug('Call url ' + JSON.stringify(params) + ' for ' + this.getName());
        let body = await requestAsync(params);
        for (let j in states) {
          let state = this.device[states[j]];
          if (state && state.state) {
            let deviceid = this.getDeviceName();
            let stateid = deviceid + '.' + state.state;
            let value = body;
            try {
              if (state.coap && state.coap.http_publish_funct)
                value = isAsync(state.coap.http_publish_funct) ? await state.coap.http_publish_funct(value, this) : state.coap.http_publish_funct(value, this);
              if (state.common.type === 'boolean' && value === 'false') value = false;
              if (state.common.type === 'boolean' && value === 'true') value = true;
              if (state.common.type === 'number') value = Number(value);
              // this.adapter.log.debug('httpIoBrokerState(), State : ' + stateid + ', Value: ' + JSON.stringify(value));
              if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value)) {
                this.adapter.log.debug('Set state ' + stateid + ', Value: ' + JSON.stringify(value) + ' for ' + this.getName());
                this.states[stateid] = value;
                this.objectHelper.setOrUpdateObject(stateid, {
                  type: 'state',
                  common: state.common
                }, ['name'], value);
              }
              this.polltime = this.adapter.config.polltime * 1000 || 5000;
            } catch (error) {
              this.polltime = 60 * 1000;
              if (body && body === '401 Unauthorized') {
                this.adapter.log.error('Wrong http username or http password! Please enter the user credential from restricted login for ' + this.getName());
                break;
              } else {
                this.adapter.log.error('Error in function httpIoBrokerState for state ' + stateid + ' and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
              }
            }
          }
        }
        this.objectHelper.processObjectQueue(() => { });
      } catch (error) {
        this.polltime = 60 * 1000;
        // this.adapter.log.error('Error ' + error + ' - ' + this.getName());
      }
    }
    if (this.http && Object.keys(this.http).length > 0) {
      // await sleep(this.polltime);
      this.timerid = setTimeout(async () => await this.httpIoBrokerState(), this.polltime);
    }
  }

  async firmwareUpdatePolling() {
    if (this.adapter.config.autoupdate) {
      await this.firmwareUpdate(true);
      setTimeout(async () => await this.firmwareUpdatePolling(), 60 * 1000);
    }
  }

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

  start(payload) {
    if (this.deviceExist()) {
      this.adapter.log.info('Shelly device ' + this.getName() + ' with CoAP connected!');
      this.deleteOldStates();
      this.createObjects();
      this.httpIoBrokerState();
      if (payload) this.createIoBrokerState(payload);
      this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate(true));
      // this.firmwareUpdatePolling();
      this.listener();
    } else {
      this.adapter.log.error('Configuratin for Shelly device ' + this.getName() + ' for CoAP does not exist!');
    }
  }

  listener() {
    this.shelly.on('error', (err) => {
      this.adapter.log.debug('Error handling Shelly data: ' + err);
    });
    this.shelly.on('update-device-status', this.listenerus = (devicename, payload) => {
      if (devicename === this.devicename) {
        this.createIoBrokerState(payload);
      }
    });
    this.shelly.on('device-connection-status', this.listenerds = (devicename, connected) => {
      this.adapter.log.debug('Connection update received for ' + devicename + ': ' + connected);
      if (devicename === this.devicename) {
        // adapter.setState(deviceId + '.online', connected, true);
      }
    });
  }


}

class CoAPServer {

  constructor(adapter, objectHelper, eventEmitter) {
    if (!(this instanceof CoAPServer)) return new CoAPServer(adapter, objectHelper, eventEmitter);
    this.adapter = adapter;
    this.objectHelper = objectHelper;
    this.clients = {};
    this.blacklist = {};
    this.eventEmitter = eventEmitter;
  }

  isBlackListed(deviceId) {
    if (deviceId && this.blacklist[deviceId]) {
      return true;
    }
    if (deviceId && this.adapter.config.keys) {
      for (let i in this.adapter.config.keys) {
        let key = this.adapter.config.keys[i];
        if (key.blacklist && deviceId) {
          let reg = new RegExp(key.blacklist, 'gm');
          let res = deviceId.match(reg);
          if (res) {
            this.blacklist[deviceId] = deviceId;
            return true;
          }
        }
      }
    }
    return false;
  }

  listen() {
    let options = {};
    if (this.adapter.config.httpusername && this.adapter.config.httppassword) {
      options = {
        logger: this.adapter.log.debug,
        user: this.adapter.config.httpusername,
        password: this.adapter.config.httppassword,
        multicastInterface: null
      };
    } else {
      options = {
        logger: this.adapter.log.debug,
      };
    }
    if (this.adapter.config.coapbind && this.adapter.config.coapbind != '0.0.0.0') {
      options.multicastInterface = this.adapter.config.coapbind;
    }
    let shelly = new Shelly(options);
    shelly.on('error', (err) => {
      this.adapter.log.debug('Error handling Shelly data: ' + err);
    });
    shelly.on('update-device-status', (deviceId, status) => {
      this.adapter.log.debug('Status update received for ' + deviceId + ': ' + JSON.stringify(status));
      if (deviceId && typeof deviceId === 'string') {
        shelly.getDeviceDescription(deviceId, (err, deviceId, description, ip) => {
          if (!err && deviceId && ip) {
            // if ip address change of coap device change
            if (this.clients[deviceId] && this.clients[deviceId].getIP() !== ip) {
              this.clients[deviceId].destroy();
              delete this.clients[deviceId];
            }
            if (!this.clients[deviceId]) {
              if (!this.isBlackListed(deviceId) && !this.isBlackListed(ip)) {
                this.clients[deviceId] = new CoAPClient(this.adapter, this.objectHelper, this.eventEmitter, shelly, deviceId, ip, status);
              }
            }
          }
        });
      } else {
        this.adapter.log.debug('Device Id is missing ' + deviceId);
      }
    });
    shelly.on('disconnect', () => {
      for (let i in this.clients) {
        this.clients[i].destroy();
        delete this.clients[i];
      }
    });
    shelly.listen(() => {
      this.adapter.log.info('Listening for Shelly packets in the network');
    });
  }

}

module.exports = {
  CoAPServer: CoAPServer
};
