/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const datapoints = require(__dirname + '/../datapoints');
const fetch = require('node-fetch');
const DigestFetch = require('digest-fetch');

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

function isAsync(funct) {
    if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
    return undefined;
}

class BaseClient {
    constructor(type, adapter, objectHelper, eventEmitter) {
        this.type = type;   // mqtt or coap

        this.adapter = adapter;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;

        this.timerid = null;

        this.active = true;
        this.states = {};
        this.device = {};
        this.http = {};

        this.devicename;    // e.g. SHBDUO-1#8CAAB5616291#2
        this.ip;            // e.g. 192.168.1.2

        this.id;            // e.g. ShellyBulbDuo-8CAAB5616291
        this.devicetype;    // e.g. SHBDUO-1
        this.deviceid;      // e.g. ShellyBulbDuo
        this.serialid;      // e.g. 8CAAB5616291

        this.deviceexists;  // boolean
        this.devicegen;     // 1 or 2

        this.httptimeout = 5 * 1000;

        // Handle firmware updates
        this.firmwareUpdatePolling();
        this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate(true));
    }

    async requestAsync(url) {
        return new Promise((resolve, reject) => {
            if (this.getDeviceGen() === 1) {
                this.adapter.log.debug(`HTTP request (requestAsync) to gen 1 device with basic auth: "${url}"`);
                const client = new DigestFetch(this.adapter.config.httpusername, this.adapter.config.httppassword, { basic: true });
                client.fetch(url, {timeout: this.httptimeout, headers: { 'Content-Type': 'application/json' }})
                    .then(res => res.text())
                    .then(text => {
                        this.adapter.log.debug(`HTTP response (requestAsync) of gen 1 device widh basic auth: "${url}" -> "${text}"`);
                        resolve(text);
                    })
                    .catch(reject);
            } else {
                this.adapter.log.debug(`HTTP request (requestAsync) to gen 2 device widh digest auth: "${url}"`);
                const client = new DigestFetch(this.adapter.config.httpusername, this.adapter.config.httppassword, { algorithm: 'MD5' });
                client.fetch(url, {timeout: this.httptimeout, headers: { 'Content-Type': 'application/json' }})
                    .then(res => res.text())
                    .then(text => {
                        this.adapter.log.debug(`HTTP response (requestAsync) of gen 2 device widh digest auth: "${url}" -> "${text}"`);
                        resolve(text);
                    })
                    .catch(reject);
            }
        });
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

    /**
    * Get IP of device. For example
    * 192.168.1.2
    */
    getIP() {
        return this.ip;
    }

    /**
    * Returns a string for logging with the IP address and name of Shelly device and type
    */
    getName() {
        return this.getIP() + ' (' + this.getDeviceId() + ' / ' + this.getId() + ' / ' + this.getDeviceName() + ')';
    }

    /**
    * Checks if Shelly device type in the configuration exist. If missing
    * you have to add a configuration in the ./lib/devices direcotory
    */
    deviceExists() {
        if (this.deviceexists === undefined) {
            this.deviceexists = datapoints.getDeviceNameForMQTT(this.getDeviceId()) ? true : false;
        }

        return this.deviceexists;
    }

    /**
    * Checks if Shelly supports rpc api
    * you have to add a configuration in the ./lib/devices directory
    */
    getDeviceGen() {
        if (this.devicegen === undefined) {
            let deviceid = this.getDeviceId();
            this.devicegen = datapoints.getDeviceGen(deviceid);
        }

        return this.devicegen;
    }

    /**
    * Missing data will be pulled by http
    */
    async httpIoBrokerState() {
        if (!this.adapter.isOnline(this.getDeviceName())) {
            this.timerid = setTimeout(async () => await this.httpIoBrokerState(), 1000);
            return;
        }

        let polltime = this.getPolltime();
        for (let i in this.http) {
            let states = this.http[i];
            try {
                let body = await this.requestAsync('http://' + this.getIP() + i);
                for (let j in states) {
                    let state = this.device[states[j]];
                    if (state && state.state) {
                        let deviceid = this.getDeviceName();
                        let stateid = deviceid + '.' + state.state;
                        let value = body;
                        try {
                            if (state[this.type] && state[this.type].http_publish_funct) {
                                value = isAsync(state[this.type].http_publish_funct) ? await state[this.type].http_publish_funct(value, this) : state[this.type].http_publish_funct(value, this);
                            }

                            if (state.common.type === 'boolean' && value === 'false') value = false;
                            if (state.common.type === 'boolean' && value === 'true') value = true;
                            if (state.common.type === 'number' && value !== undefined) value = Number(value);

                            if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value || this.adapter.config.updateUnchangedObjects)) {
                                this.states[stateid] = value;
                                this.objectHelper.setOrUpdateObject(stateid, {
                                    type: 'state',
                                    common: state.common
                                }, ['name'], value);
                            }
                        } catch (error) {
                            if (error.name && error.name.startsWith('TypeError')) {
                                this.adapter.log.debug('Could not find property for state ' + stateid + ' for ' + this.getName() + ' (' + error + ')');
                            } else {
                                if (polltime > 0 && polltime < 60) polltime = 60;
                                if (body && body === '401 Unauthorized') {
                                    this.adapter.log.error(`Error in function httpIoBrokerState for state ${stateid} for ${this.getName()}: Wrong http username or http password! Please enter user credentials for restricted login.`);
                                    break;
                                } else {
                                    this.adapter.log.error(`Error in function httpIoBrokerState for state ${stateid} for ${this.getName()}: ${error}`);
                                }
                            }
                        }
                    }
                }
                this.objectHelper.processObjectQueue(() => { });
            } catch (error) {
                this.adapter.log.error(`HTTP request (httpIoBrokerState) error: ${JSON.stringify(error)}`);
            }
        }

        if (this.http && Object.keys(this.http).length > 0 && polltime > 0) {
            this.timerid = setTimeout(async () => await this.httpIoBrokerState(), polltime * 1000);
        }
    }

    /**
     * Create objects in shelly.X. for a new shelly device
     * The Shelly device has to exist in the ./lib/devices/ directory
     */
    async createObjects() {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.device).length === 0) {
                let devices = datapoints.getDeviceByType(this.getDeviceId(), this.type);
                if (devices) {
                    if (this.type === 'coap') {
                        devices = recursiveSubStringReplace(devices, new RegExp('<devicetype>', 'g'), this.getDeviceId());
                        devices = recursiveSubStringReplace(devices, new RegExp('<deviceid>', 'g'), this.getSerialId());
                    }

                    if (this.type === 'mqtt') {
                        devices = recursiveSubStringReplace(devices, new RegExp('<mqttprefix>', 'g'), this.mqttprefix);
                    }

                    for (let j in devices) {
                        let hasTypeCmd = false;
                        let hasTypePublishCmd = false;
                        let statename = j;
                        let state = devices[statename];
                        state.state = statename;

                        if (this.type === 'coap') {
                            hasTypeCmd = !!state.coap.coap_cmd;
                            hasTypePublishCmd = !!state.coap.coap_publish;
                        }
        
                        if (this.type === 'mqtt') {
                            hasTypeCmd = !!state.mqtt.mqtt_cmd;
                            hasTypePublishCmd = !!state.mqtt.mqtt_publish
                        }

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

                        if (state[this.type] && state[this.type].http_cmd && !hasTypeCmd) {
                            controlFunction = async (value) => {
                                if (state[this.type] && state[this.type].http_cmd_funct) {
                                    try {
                                        value = isAsync(state[this.type].http_cmd_funct) ? await state[this.type].http_cmd_funct(value, this) : state[this.type].http_cmd_funct(value, this);
                                    } catch (error) {
                                        this.adapter.log.error(`Error in function state.${this.type}.http_cmd_funct for state ${stateid} for ${this.getName()}: ${error}`);
                                    }
                                }

                                let body;
                                try {
                                    body = await this.requestAsync('http://' + this.getIP() + state[this.type].http_cmd);
                                    this.adapter.log.debug(`HTTP response (state.${this.type}.http_cmd) ${JSON.stringify(body)} for ${this.getName()}`);
                                } catch (error) {
                                    if (body && body === '401 Unauthorized') {
                                        this.adapter.log.error(`Error in function state.${this.type}.http_cmd for state ${stateid} for ${this.getName()}: Wrong http username or http password! Please enter user credentials for restricted login.`);
                                    } else {
                                        this.adapter.log.error(`Error in function state.${this.type}.http_cmd for state ${stateid} for ${this.getName()}: ${error}`);
                                    }
                                }
                                delete this.states[stateid];
                            };
                        }

                        // MQTT
                        if (this.type === 'mqtt' && state[this.type] && hasTypeCmd) {
                            controlFunction = async (value) => {
                                let cmd = state[this.type].mqtt_cmd;
                                if (state[this.type] && state[this.type].mqtt_cmd_funct) {
                                    try {
                                        value = isAsync(state[this.type].mqtt_cmd_funct) ? await state[this.type].mqtt_cmd_funct(value, this) : state[this.type].mqtt_cmd_funct(value, this);
                                    } catch (error) {
                                        this.adapter.log.error(`Error in function state.${this.type}.mqtt_cmd_funct for state ${stateid} for ${this.getName()}: ${error}`);
                                    }
                                }
                                this.sendState2Client(cmd, value, this.adapter.config.qos); // TODO: Abstract method?
                                delete this.states[stateid];
                            };
                        }

                        if (state[this.type] && state[this.type].http_publish && !hasTypePublishCmd) {
                            if (!this.http[state[this.type].http_publish]) this.http[state[this.type].http_publish] = [];
                            this.http[state[this.type].http_publish].push(statename);
                        }

                        // Init value
                        let value;

                        if (this.type === 'coap' && state.coap.coap_init_value) {
                            value = state.coap.coap_init_value;
                        }

                        if (this.type === 'mqtt' && state.mqtt.mqtt_init_value) {
                            value = state.mqtt.mqtt_init_value;
                        }

                        this.objectHelper.setOrUpdateObject(stateid, {
                            type: 'state',
                            common: state.common
                        }, ['name'], value, controlFunction);
                    }
                    this.device = devices;
                }

                this.objectHelper.processObjectQueue(() => {
                    resolve();
                });
            }
        });
    }

    /**
     * delete old states in objects unter shelly.X.
     * For example if the configuration for the device change
     */
    async deleteOldStates() {
        let id = this.adapter.namespace + '.' + this.getDeviceName();
        let obj = await this.adapter.getAdapterObjectsAsync();
        let devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());

        let dps = datapoints.getAll(this.type);
        dps = dps[devicetype];

        if (dps) {
            for (let i in obj) {
                let tmpid = obj[i];
                if (tmpid && tmpid._id && tmpid.type) {
                    let stateid = tmpid._id.replace(id + '.', '');
                    if (tmpid.type === 'state' && tmpid._id.startsWith(id)) {
                        if (!dps[stateid]) {
                            try {
                                await this.adapter.delObjectAsync(tmpid._id);
                                delete obj[tmpid._id];
                                this.adapter.log.info('Delete old state: ' + tmpid._id);
                            } catch (error) {
                                this.adapter.log.error('Cound not delete old state: ' + tmpid._id);
                            }
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
                        this.adapter.log.info('Delete old channel: ' + tmpidi._id);
                        await this.adapter.delObjectAsync(tmpidi._id);
                        delete obj[tmpidi._id];
                    } catch (error) {
                        this.adapter.log.error('Could not delete old channel: ' + tmpidi._id);
                    }
                }
            }
        }
    }

    async firmwareUpdatePolling() {
        if (this.adapter.config.autoupdate) {
            await this.firmwareUpdate(true);
            this.autoupdateid = setTimeout(async () => await this.firmwareUpdatePolling(), 60 * 1000);
        }
    }

    async firmwareUpdate(update) {
        if (!update) return;

        this.adapter.log.debug('Calling function firmwareUpdate');

        try {
            let body = await this.requestAsync('http://' + this.getIP() + '/ota?update=true');

            this.adapter.log.debug('Executing Firmwareupdate for ' + this.getName());
        } catch (error) {
            this.adapter.log.error('Error in function firmwareUpdate and request for ' + this.getName() + ' (' + error + ')');
        }
    }

    destroy() {
        if (this.active) {
            this.adapter.log.debug('Destroy ' + this.getName());

            clearTimeout(this.timerid);

            this.active = false;
            this.states = {};
            this.device = {};
            this.http = {};

            this.devicename = undefined;
            this.ip = undefined;

            this.id = undefined;
            this.devicetype = undefined;
            this.deviceid = undefined;
            this.serialid = undefined;
            this.deviceexists = undefined;
            this.devicegen = undefined;
        }
    }
}

class BaseServer {
    constructor(adapter, objectHelper, eventEmitter) {
        this.adapter = adapter;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;
    }
}

module.exports = {
    BaseClient: BaseClient,
    BaseServer: BaseServer
};