/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const BaseClient = require(__dirname + '/base').BaseClient;
const BaseServer = require(__dirname + '/base').BaseServer;
const datapoints = require(__dirname + '/../datapoints');

const Shelly = require('shelly-iot');

function isAsync(funct) {
  if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
  return undefined;
}

/**
 * get the CoAP value by key
 * @param {object/string} key - like 112 or '112' or [11,12] or ['11','12']
 * @param {array} array - [[0,111,0],[0,112,1]]
 */
function getCoapValue(objkey, payload) {
  let isArray = (typeof objkey !== 'string' && typeof objkey !== 'number');
  if (!isArray) {
    let key = Number(objkey);
    let index = payload.findIndex((item) => item[1] === key);
    return index >= 0 ? payload[index][2] : undefined;
  } else {
    let ret = [];
    for (let i in objkey) {
      let key = Number(objkey[i]);
      let index = payload.findIndex((item) => item[1] === key);
      if (index >= 0) { ret.push(payload[index][2]); } else { ret.push(undefined); }
    }
    return ret;
  }
}


function descrToSensor(description) {
  let sensors = {};
  if (description && description.sen) {
    for (let i in description.sen) {
      try {
        let sensor = description.sen[i];
        let descr = sensor.D;
        let key = sensor.I;
        if (descr) sensors[descr.toLowerCase()] = key;
      } catch (error) {
        //
      }
    }
  }
  return sensors;
}

class CoAPClient extends BaseClient {
  constructor(adapter, objectHelper, eventEmitter, shelly, devicename, ip, payload, description) {

    super('coap', adapter, objectHelper, eventEmitter);

    this.shelly = shelly;
    this.devicename = devicename;
    this.ip = ip;

    this.description = description;
    this.sensors = descrToSensor(description);

    this.start(payload, description);
  }

  /**
   * Change Device ID from #2 to #1 (fimrware verson >= 1.8)
   * Example SHRGBW2#1234#2 will change to SHRGBW2#1234#1
   */
  getOldDeviceInfo(devicename) {
    if (devicename && devicename.substr(-2) === '#2') {
      return devicename.substr(0, devicename.length - 2) + '#1';
    } else {
      return devicename;
    }
  }

  /**
   * Get the ID of the Shelly Device. For example: shellyplug-s-12345
   */
  getId() {
    if (!this.id) {
      let devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());
      let serialid = this.getSerialId();
      if (devicetype && serialid) {
        this.id = devicetype + '-' + serialid;
      }
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
    return this.getOldDeviceInfo(this.devicename);
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
   * Cleanup, destroy this object
   */
  destroy() {
    super.destroy();

    this.description = undefined;

    if (this.listenerus) this.shelly.removeListener('update-device-status', this.listenerus);
    if (this.listenerds) this.shelly.removeListener('device-connection-status', this.listenerds);
  }

  getDevices() {
    let states = [];
    for (let i in this.device) {
      let state = this.device[i];
      // if (state.coap && state.coap.coap_publish_funct) states.push(state);
      if (state.coap) {
        if (state.coap.coap_publish) {
          states.push(state);
        } else if (state.coap.coap_publish_funct) {
          states.push(state);
        }
      }
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
      // this.adapter.log.debug('Create State : ' + stateid + ', Payload: ' + JSON.stringify(payload) + ' for ' + this.getDeviceName());
      try {
        if (dp.coap && dp.coap.coap_publish) {
          value = getCoapValue(dp.coap.coap_publish, value.G);
          if (dp.coap && dp.coap.coap_publish_funct) {
            value = isAsync(dp.coap.coap_publish_funct) ? await dp.coap.coap_publish_funct(value, this) : dp.coap.coap_publish_funct(value, this);
          }

          if (dp.common.type === 'boolean' && value === 'false') value = false;
          if (dp.common.type === 'boolean' && value === 'true') value = true;
          if (dp.common.type === 'number' && value !== undefined) value = Number(value);

          if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value || this.adapter.config.updateUnchangedObjects)) {
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

  async start(payload, description) {
    if (this.deviceExists()) {
      let polltime = this.getPolltime();
      if (polltime > 0) {
        this.adapter.log.info('Shelly device ' + this.getName() + ' with CoAP connected! Polltime set to ' + polltime + ' sec.');
      } else {
        this.adapter.log.info('Shelly device ' + this.getName() + ' with CoAP connected! No polling');
      }

      this.adapter.log.debug('1. Shelly device Info: ' + this.getDeviceName() + ' : ' + JSON.stringify(description));
      this.adapter.log.debug('2. Shelly device Info: ' + this.getDeviceName() + ' : ' + JSON.stringify(payload));

      this.deleteOldStates();
      await this.createObjects();

      // Fill hostname
      await this.adapter.setStateAsync(this.getDeviceName() + '.hostname', {val: this.getIP(), ack: true});
      this.adapter.emit('deviceStatusUpdate', this.getDeviceName(), true); // Device online

      this.httpIoBrokerState();

      if (payload) this.createIoBrokerState(payload);

      this.listener();
    } else {
      this.adapter.log.error('Shelly Device unknown, configuration for Shelly device ' + this.getName() + ' for CoAP does not exist!');
      this.adapter.log.error('1. Send developer following Info: ' + this.getDeviceName() + ' : ' + JSON.stringify(description));
      this.adapter.log.error('2. Send developer following Info: ' + this.getDeviceName() + ' : ' + JSON.stringify(payload));
    }
  }

  listener() {
    this.shelly.on('error', (err) => {
      this.adapter.log.debug('Error handling Shelly data: ' + err);
    });

    this.shelly.on('update-device-status', this.listenerus = (devicename, payload) => {
      if (this.getOldDeviceInfo(devicename) === this.getDeviceName()) {
        this.createIoBrokerState(payload);
      }
    });

    this.shelly.on('device-connection-status', this.listenerds = (devicename, connected) => {
      this.adapter.log.debug('Connection update received for ' + devicename + ': ' + connected);
      if (this.getOldDeviceInfo(devicename) === this.getDeviceName()) {
        this.adapter.emit('deviceStatusUpdate', this.getDeviceName(), true); // Device online
      }
    });
  }
}

class CoAPServer extends BaseServer {

  constructor(adapter, objectHelper, eventEmitter) {
    //if (!(this instanceof CoAPServer)) return new CoAPServer(adapter, objectHelper, eventEmitter);

    super(adapter, objectHelper, eventEmitter);

    this.clients = {};
    this.blacklist = {};
  }

  isBlackListed(deviceId) {
    if (deviceId && this.blacklist[deviceId]) {
      return true;
    }
    if (deviceId && this.adapter.config.blacklist) {
      for (let i in this.adapter.config.blacklist) {
        let key = this.adapter.config.blacklist[i];
        if (key.id && deviceId) {
          let reg = new RegExp(key.id, 'gm');
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
        logger: this.adapter.log.debug
      };
    }

    if (this.adapter.config.coapbind && this.adapter.config.coapbind != '0.0.0.0') {
      options.multicastInterface = this.adapter.config.coapbind;
    }

    let shelly = new Shelly(options);

    shelly.on('error', (err) => {
      this.adapter.log.debug('Error handling Shelly data: ' + err);
    });

    shelly.on('update-device-status', (devicename, status) => {
      this.adapter.log.debug(`Status update received for ${devicename}: ${JSON.stringify(status)}`);

      if (devicename && typeof devicename === 'string') {
        shelly.getDeviceDescription(devicename, (err, devicename, description, ip) => {
          if (!err && devicename && ip) {
            // if ip address change of coap device change
            if (this.clients[devicename] && this.clients[devicename].getIP() !== ip) {
              this.clients[devicename].destroy();
              delete this.clients[devicename];
            }
            if (!this.clients[devicename]) {
              if (!this.isBlackListed(devicename) && !this.isBlackListed(ip)) {
                this.clients[devicename] = new CoAPClient(this.adapter, this.objectHelper, this.eventEmitter, shelly, devicename, ip, status, description);
              }
            }
          }
        });
      } else {
        this.adapter.log.debug('Device Id is missing ' + devicename);
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
