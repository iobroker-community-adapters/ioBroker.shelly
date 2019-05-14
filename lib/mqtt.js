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
    this.states = {};
    this.stream = stream;
    this.client;
    this.device = {};
    this.http = {};
    this.auth;
    if (this.adapter.config.http_username.length > 0 && this.adapter.config.http_password.length > 0)
      this.auth = 'Basic ' + new Buffer(this.adapter.config.http_username + ':' + this.adapter.config.http_password).toString('base64');
    this.start();
  }

  destroy() {
    this.adapter.log.info('Destroy ' + this.getName());
    // if (this.stream) this.stream.destroy();
    if (this.client) this.client.destroy();
    this.qos = [];
    this.messageId = 1;
    this.states = {};
    this.device = {};
    this.http = {};
    this.client.removeAllListeners();
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
    qos = qos ? Number.parseInt(qos) : 0;
    this.adapter.log.debug('Send to ' + this.getName() + ' : ' + topic + ' = ' + state);
    this.client.publish({ topic: topic, payload: state, qos: qos, retain: retain, messageId: this.messageId++ }, cb);
    this.messageId &= 0xFFFFFFFF;
  }

  getIP() {
    let ip;
    if (this.stream && this.stream.remoteAddress) ip = this.stream.remoteAddress;
    return ip;
  }

  getId() {
    let id;
    if (this.packet && this.packet.clientId) id = this.packet.clientId;
    return id;
  }

  getDeviceName() {
    let id = this.getId();
    let deviceid = id.split('-').slice(0, 1).join();
    let devicename = datapoints.getDeviceNameForMQTT(deviceid) + '#' + this.getDeviceId() + '#1' || id;
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
    if (this.stream && this.stream.remoteAddress) name = this.stream.remoteAddress + ' (' + name + ')';
    return name;
  }

  async getProtocol() {
    try {
      let params;
      let url = 'http://' + this.getIP() + '/settings';
      if (this.auth) {
        params = {
          url: url,
          headers: { 'Authorization': this.auth }
        };
      } else {
        params = {
          url: url
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
      /* */
    }
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
            if (state.mqtt && state.mqtt.mqtt_cmd) {
              controlFunction = (value) => {
                let cmd = state.mqtt.mqtt_cmd;
                value = state.mqtt.mqtt_cmd_funct ? state.mqtt.mqtt_cmd_funct(value) : value;
                this.sendState2Client(cmd, value, this.adapter.config.qos);
                delete this.states[stateid];
              };
            } else if (state.mqtt && state.mqtt.http_cmd) {
              controlFunction = async (value) => {
                value = state.mqtt.http_cmd_funct ? state.mqtt.http_cmd_funct(value) : value;
                if (typeof value === 'object') {
                  for (let i in value) {
                    if (typeof value[i] === 'function') {
                      try {
                        value[i] = isAsync(value[i]) ? await value[i](this) : value[i](this);
                        if (!value[i]) delete value[i];
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
                      url: 'http://' + this.getIP() + state.mqtt.http_cmd,
                      qs: value,
                      headers: {
                        'Authorization': this.auth
                      }
                    };
                  } else {
                    params = {
                      url: 'http://' + this.getIP() + state.mqtt.http_cmd,
                      qs: value
                    };
                  }
                  this.adapter.log.debug('Call url ' + JSON.stringify(params) + ' for ' + this.getName());
                  let body = await requestAsync(params);
                } catch (error) {
                  /* */
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
      }
      this.objectHelper.processObjectQueue(() => { });
    }
    this.httpIoBrokerState();
  }

  getDevices(topic) {
    let states = [];
    for (let i in this.device) {
      let state = this.device[i];
      if (state.mqtt && state.mqtt.mqtt_publish && topic === state.mqtt.mqtt_publish) states.push(state);
      if (state.mqtt && state.mqtt.mqtt_subscribe && topic === state.mqtt.mqtt_subscribe) states.push(state);
    }
    return states;
  }

  createIoBrokerState(topic, payload) {
    let dps = this.getDevices(topic);
    for (let i in dps) {
      let dp = dps[i];
      let deviceid = this.getDeviceName();
      let stateid = deviceid + '.' + dp.state;
      let value = payload.toString();
      value = dp.mqtt && dp.mqtt.mqtt_publish_funct ? dp.mqtt.mqtt_publish_funct(value) : value;
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
        this.adapter.log.debug('Call url ' + JSON.stringify(params) + ' for ' + this.getName());
        let body = await requestAsync(params);
        for (let j in states) {
          let state = this.device[states[j]];
          let deviceid = this.getDeviceName();
          let stateid = deviceid + '.' + state.state;
          let value = state.mqtt && state.mqtt.http_publish_funct ? state.mqtt.http_publish_funct(body) : body;
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

  start() {
    this.client = mqtt(this.stream);
    this.listen();
  }

  listen() {
    // client connected
    this.client.on('connect', (packet) => {
      this.packet = packet;
      if (packet.username === this.adapter.config.user && packet.password.toString() === this.adapter.config.password) {
        this.adapter.log.info('Shelly device ' + this.getIP() + ' (' + this.getDeviceName() + ') with MQTT connected!');
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
        this.destroy();
      }
    });

    this.client.on('close', (status) => {
      this.adapter.log.info('Close : ' + this.getName() + ' (' + status + ')');
      this.destroy();
    });
    this.client.on('error', (error) => {
      this.adapter.log.info('Error : ' + this.getName() + ' (' + error + ')');
      this.destroy();
    });
    this.client.on('disconnect', () => {
      this.adapter.log.info('Disconnect : ' + this.getName());
      this.destroy();
    });
    this.client.on('timeout', () => {
      this.destroy();
    });

    this.client.on('publish', (packet) => {
      this.adapter.log.debug('publish: ' + JSON.stringify(packet));
      if (packet.payload) this.adapter.log.debug('publish payload: ' + packet.topic + ' = ' + packet.payload.toString());
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
      /*
      let pos = null;
      if (pos !== null) {
        // remove this message from queue
      } else {
        this.adapter.log.warn(`Client [${this.client.id}] Received pubcomp for unknown message ID: ${packet.messageId}`);
      }
      */
    });


    // response for QoS2
    this.client.on('pubrel', (packet) => {
    });

    // response for QoS1
    this.client.on('puback', (packet) => {
      // remove this message from queue
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
        this.adapter.log.debug('publish topic: ' + topic);
      }

      if (packet.topic) this.adapter.log.debug('subscribe topic: ' + packet.topic);
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
        // client.destroy();
      });
      stream.on('unload', () => {
        this.adapter.log.info('Unload for ' + stream.remoteAddress + '(' + client.getName() + ')');
        client.destroy();
        stream.destroy();
      });
      stream.on('error', () => {
        this.adapter.log.info('Error for ' + stream.remoteAddress + '(' + client.getName() + ')');
        client.destroy();
        stream.destroy();
      });
    });
    this.server.on('close', () => {
      this.adapter.log.info('Closing litender ');
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