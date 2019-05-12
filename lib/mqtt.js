/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';


const mqtt = require('mqtt-connection');
const net = require('net');
const request = require('request');
const datapoints = require(__dirname + '/datapoints');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAsync(funct) {
  if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
  return undefined;
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

class MQTTClient {
  constructor(adapter, objectHelper, stream) {
    this.adapter = adapter;
    this.objectHelper = objectHelper;
    this.packet;
    this.qos = {};
    this.messageIds = [];
    this.messageId = 1;
    this.client = mqtt(stream);
    this.states = {};

    this.device = {};
    this.http = {};
    this.auth;
    if (this.adapter.config.http_username.length > 0 && this.adapter.config.http_password.length > 0)
      this.auth = 'Basic ' + new Buffer(this.adapter.config.http_username + ':' + this.adapter.config.http_password).toString('base64');
    this.listen();
  }

  destroy() {
    if (this.client) this.client.destroy();
    this.qos = [];
    this.messageId = 1;
    this.states = {};
    this.device = {};
    this.http = {};
    this.auth;
  }

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
    this.adapter.log.info('Send to ' + this.getName() + ' : ' + topic + ' = ' + state);
    this.client.publish({ topic: topic, payload: state, qos: qos, retain: retain, messageId: this.messageId }, cb);
    this.messageId &= 0xFFFFFFFF;
  }

  getIP() {
    let ip;
    if (this.client && this.client.stream && this.client.stream.remoteAddress) ip = this.client.stream.remoteAddress;
    return ip;
  }

  getId() {
    let id;
    if (this.packet && this.packet.clientId) id = this.packet.clientId;
    return id;
  }

  getDeviceName() {
    let id =  this.getId();
    let deviceid = id.split('-').slice(0,1).join();
    let devicename = datapoints.getDeviceName(deviceid) || id;
    devicename = recursiveSubStringReplace(devicename, new RegExp('<deviceid>', 'g'), this.getDeviceId());
    return devicename;
  }

  getDeviceId() {
    let id = this.getId();
    let deviceid;
    if (id) {
      deviceid = id.split('-').slice(1).join();
    }
    return deviceid;
  }

  getName() {
    let name;
    if (this.packet && this.packet.clientId) name = this.packet.clientId;
    if (this.client && this.client.stream && this.client.stream.remoteAddress) name = this.client.stream.remoteAddress + ' (' + name + ')';
    return name;
  }

  createObjects(id) {
    if (Object.keys(this.device).length === 0) {
      let all = datapoints.getAll();
      for (let i in all) {
        if (id.startsWith(i + '-')) {
          let devices = all[i];
          devices = recursiveSubStringReplace(devices, new RegExp('<deviceid>', 'g'), this.getDeviceId());
          for (let j in devices) {
            let statename = j;
            let state = devices[j];
            state.state = j;
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
            if (state.mqtt && state.mqtt.cmd) {
              controlFunction = (value) => {
                let cmd = state.mqtt.cmd;
                value = state.mqtt.funct_out ? state.mqtt.funct_out(value) : value;
                this.sendState2Client(cmd, value, this.adapter.config.qos);
              };
            }
            if (state.http && state.http.cmd && !state.mqtt.cmd) {
              controlFunction = async (value) => {
                value = state.http.funct_out ? state.http.funct_out(value) : value;
                if(typeof value === 'object') {
                  for(let i in value) {
                    if(typeof value[i] === 'function') {
                      try {
                        value[i]  = isAsync(value[i]) ? await  value[i](this) :  value[i](this);
                        if(!value[i]) delete value[i];
                      } catch (error) {
                        delete value[i];    
                      }
                    }
                  } 
                }
                try {
                  let params;
                  if (this.auth) {
                    params = { 
                      url: 'http://' + this.getIP() + state.http.cmd,
                      qs: value,
                      headers: { 
                        'Authorization': this.auth 
                      }
                    };
                  } else {
                    params = { 
                      url: 'http://' + this.getIP() + state.http.cmd,
                      qs: value
                    };
                  }
                  let body = await requestAsync(params);
                } catch (error) {
                  /* */
                }
              };
            }
            if (state.http && state.http.publish && !state.mqtt.publish) {
              if (!this.http[state.http.publish]) this.http[state.http.publish] = [];
              this.http[state.http.publish].push(statename);
            }
            // if (state.mqtt.publish) this.states[state.mqtt.publish] = stateid;
            this.objectHelper.setOrUpdateObject(stateid, {
              type: 'state',
              common: state.common
            }, ['name'], controlFunction);
          }
          this.device = devices;
        }
      }
      this.objectHelper.processObjectQueue(() => { });
    }
    this.httpIoBrokerState();
  }

  getDevices(topic) {
    let states = [];
    for (let i in this.device) {
      let state = this.device[i];
      if (state.mqtt && state.mqtt.publish && topic === state.mqtt.publish) states.push(state);
      if (state.mqtt && state.mqtt.subscribe && topic === state.mqtt.subscribe) states.push(state);
      // if (state.coap && state.coap.name && topic === state.coap.name) states.push(state);
    }
    return states;
  }

  createIoBrokerState(topic, payload) {
    let dps = this.getDevices(topic);
    for (let i in dps) {
      let dp = dps[i];
      let deviceid =  this.getDeviceName();
      let stateid = deviceid + '.' + dp.state;
      let value = payload.toString();
      value = dp.mqtt && dp.mqtt.funct_in ? dp.mqtt.funct_in(value) : value;
      if (!this.states.hasOwnProperty(stateid) || this.states[stateid] !== value) {
        this.states[stateid] = value;
        this.objectHelper.setOrUpdateObject(stateid, {
          type: 'state',
          common: dp.common
        }, ['name'], value);
        this.objectHelper.processObjectQueue(() => { });
      }
    }
  }

  async httpIoBrokerState() {
    for (let i in this.http) {
      let params = { url: 'http://' + this.getIP() + i };
      let states = this.http[i];
      try {
        if (this.auth) {
          params = { 
            url: 'http://' + this.getIP() + i,
            headers: { 
              'Authorization': this.auth 
            }
          };
        } else {
          params = { 
            url: 'http://' + this.getIP() + i 
          };
        }
        let body = await requestAsync(params);
        for (let j in states) {
          let state = this.device[states[j]];
          let deviceid =  this.getDeviceName();
          let stateid = deviceid + '.' + state.state;
          let value = state.http && state.http.funct_in ? state.http.funct_in(body) : body;
          if (!this.states.hasOwnProperty(stateid) || this.states[stateid] !== value) {
            this.states[stateid] = value;
            this.objectHelper.setOrUpdateObject(stateid, {
              type: 'state',
              common: state.common
            }, ['name'], value);
          }
        }
        this.objectHelper.processObjectQueue(() => { });
      } catch (error) { /* */ }
    }
    if (this.http && Object.keys(this.http).length > 0) {
      await sleep(5 * 1000);
      await this.httpIoBrokerState();
    }
  }

  listen() {
    // client connected
    this.client.on('connect', (packet) => {
      this.packet = packet;
      if (packet.username === this.adapter.config.user && packet.password.toString() === this.adapter.config.password) {
        this.adapter.log.debug('Connect to ' + this.getName());
        this.adapter.log.debug('connect: ' + JSON.stringify(packet));
        this.adapter.log.debug('Will: ' + packet.will.toString());
        // Letzer Wille speichern
        if (packet.will) {
          this.will = packet.will;
        }
        this.createObjects(this.getId());

        this.client.connack({ returnCode: 0 });
        // this.client.connack({ returnCode: 0, sessionPresent });
      } else {
        this.adapter.log.error('Wrong authentification for : ' + this.getName());
        this.client.connack({ returnCode: 4 });
      }
    });

    this.client.on('close', (error) => {
      this.adapter.log.info('Close : ' + this.getName() + ' (' + error + ')');
      this.destroy();
    });
    this.client.on('error', (error) => {
      this.adapter.log.info('Close : ' + this.getName() + ' (' + error + ')');
      this.destroy();
    });
    this.client.on('disconnect', () => {
      this.adapter.log.info('Disconnect : ' + this.getName());
      this.destroy();
    });
    this.client.stream.on('timeout', () => {
      this.destroy();
    });

    this.client.on('publish', (packet) => {
      this.adapter.log.debug('publish: ' + JSON.stringify(packet));
      if (packet.payload) this.adapter.log.info('publish payload: ' + packet.topic + ' = ' + packet.payload.toString());
      this.createIoBrokerState(packet.topic, packet.payload);
      let pack;
      switch (packet.qos) {
        case 1:
          this.client.puback({
            messageId: packet.messageId
          });
          break;
        case 2:
          pack = this.messageIds.find((p) => {
            return p.messageId === packet.messageId;
          });
          if (pack) {
            this.adapter.log.warn('Client ' + this.getName() + ' Ignored duplicate message with ID: ' + packet.messageId);
            return;
          } else {
            pack = {
              ts: Date.now(),
              cmd: 'pubrel',
              count: 0,
              messageId: packet.messageId
            };
            this.messageIds.push(pack);
            this.client.pubrec({
              messageId: packet.messageId
            });
          }
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
      for (let i in this.messageIds) {
        if (this.messageIds[i].messageId === packet.messageId) {
          this.qos[packet.messageId] = {
            ts: Date.now(),
            cmd: 'pubrec',
            count: 0,
            messageId: packet.messageId
          };
          this.client.pubrel({
            messageId: packet.messageId
          });
          return;
        }
      }
      this.adapter.log.warn('Client ' + this.getName() + ' received pubrec for unknown messageId ' + packet.messageId);
    });

    // response for QoS2
    this.client.on('pubcomp', (packet) => {
      let pos = null;
      if (pos !== null) {
        // remove this message from queue
      } else {
        this.adapter.log.warn(`Client [${this.client.id}] Received pubcomp for unknown message ID: ${packet.messageId}`);
      }
    });


    // response for QoS2
    this.client.on('pubrel', (packet) => {
      let pos = null;
      // remove this message from queue
      if (pos !== -1) {
        this.client.pubcomp({
          messageId: packet.messageId
        });
      } else {
        this.adapter.log.warn(`Client [${this.client.id}] Received pubrel on ${this.client.id} for unknown messageId ${packet.messageId}`);
      }
    });

    // response for QoS1
    this.client.on('puback', (packet) => {
      // remove this message from queue
      let pos = null;
      // remove this message from queue
      if (pos !== null) {
        this.adapter.log.debug(`Client [${this.client.id}] Received puback for ${this.client.id} message ID: ${packet.messageId}`);
        this.client._messages.splice(pos, 1);
      } else {
        this.adapter.log.warn(`Client [${this.client.id}] Received puback for unknown message ID: ${packet.messageId}`);
      }
    });


    this.client.on('unsubscribe', (packet) => {
      this.client.unsuback({ messageId: packet.messageId });
    });

    // this.client subscribed
    this.client.on('subscribe', (packet) => {
      // send a suback with messageId and granted QoS le^el
      this.adapter.log.debug('subscribe: ' + JSON.stringify(packet));
      const granted = [];
      for (let i = 0; i < packet.subscriptions.length; i++) {
        granted.push(packet.subscriptions[i].qos);
        let topic = packet.subscriptions[i].topic;
        this.adapter.log.info('publish topic: ' + topic);
      }

      if (packet.topic) this.adapter.log.info('subscribe topic: ' + packet.topic);
      // this.adapter.log.info('Will: ' + packet.will);
      // this.client.suback({ granted: [packet.qos], messageId: packet.messageId });
      this.client.suback({ granted: granted, messageId: packet.messageId });
    });

    // timeout idle streams after 5 minutes
    this.client.stream.setTimeout(1000 * 60 * 5);
  }

}

class MQTTServer {

  constructor(adapter, objectHelper) {
    if (!(this instanceof MQTTServer)) return new MQTTServer(adapter, objectHelper);
    this.messageId = 1;
    this.server = new net.Server();
    this.adapter = adapter;
    this.clients = [];
    this.objectHelper = objectHelper;
  }

  listen() {
    this.server.on('connection', (stream) => {
      let client = new MQTTClient(this.adapter, this.objectHelper, stream);
      stream.on('timeout', () => {
        this.adapter.log.info('Timeout for ' + stream.remoteAddress + '(' + client.getName() + ')');
        client.destroy();
      });
      stream.on('unload', () => {
        this.adapter.log.info('Unload for ' + stream.remoteAddress + '(' + client.getName() + ')');
        client.destroy();
      });
    });
    this.server.on('close', () => {
      this.adapter.log.info('Closing litender ');
    });
    this.server.on('error', (error) => {
      this.adapter.log.info('Error in listender ' + error);
    });
    // listen on port 1883
    this.server.listen(this.adapter.config.port, this.adapter.config.bind, () => {
    });
  }

}

module.exports = {
  MQTTServer: MQTTServer
};