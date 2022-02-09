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

        this.httpIoBrokerStateTimeout = null;
        this.firmwareUpdatePollingTimeout = null;

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

        this.httptimeout = 8 * 1000;

        // Handle firmware updates
        this.firmwareUpdatePolling();
        this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate(true));
    }

    async requestAsync(url) {
        return new Promise((resolve, reject) => {
            if (this.adapter.config.httppassword) {
                if (this.getDeviceGen() === 1) {
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device with basic auth: "${url}"`);
                    const client = new DigestFetch(this.adapter.config.httpusername, this.adapter.config.httppassword, { basic: true });
                    client.fetch(url, {timeout: this.httptimeout})
                        .then(res => res.text())
                        .then(text => {
                            this.adapter.log.silly(`[requestAsync] HTTP response of gen 1 device with basic auth: "${url}" -> "${text}"`);
                            resolve(text);
                        })
                        .catch(reject);
                } else if (this.getDeviceGen() === 2) {
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 2 device with digest auth: "${url}"`);
                    const client = new DigestFetch('admin', this.adapter.config.httppassword, { algorithm: 'MD5' }); // Username is always admin
                    client.fetch(url, {timeout: this.httptimeout})
                        .then(res => res.text())
                        .then(text => {
                            this.adapter.log.silly(`[requestAsync] HTTP response of gen 2 device with digest auth: "${url}" -> "${text}"`);
                            resolve(text);
                        })
                        .catch(reject);
                }
            } else {
                this.adapter.log.silly(`[requestAsync] HTTP request to gen ${this.getDeviceGen()} device without auth: "${url}"`);
                fetch(url, {timeout: this.httptimeout})
                    .then(res => res.text())
                    .then(text => {
                        this.adapter.log.silly(`[requestAsync] HTTP response of gen ${this.getDeviceGen()} device without auth: "${url}" -> "${text}"`);
                        resolve(text);
                    })
                    .catch(reject);
            }
        });
    }

    /**
    * Returns the polltime for a device (in seconds)
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

        return this.adapter.config.polltime; // Default = instance config
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
     * Get the Shelly Device type with the serialnumber of the device back.
     * Device type could be for example SHRGBW2. The serial number of the
     * device like 1234 will be added
     * Example: SHRGBW2#1234#1
     */
    getDeviceName() {
        return this.devicename ? this.getOldDeviceInfo(this.devicename) : undefined;
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

    isOnline() {
        return this.adapter.isOnline(this.getDeviceName());
    }

    /**
    * Missing data will be pulled by http
    */
    async httpIoBrokerState() {
        if (!this.isOnline()) {
            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), this.adapter.config.polltime * 1000);
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
                                this.adapter.log.debug(`Could not find property for state ${stateid} for ${this.getName()}: ${error}`);
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
                this.adapter.log.debug(`HTTP request (httpIoBrokerState) error: ${JSON.stringify(error)}`);
            }
        }

        if (this.http && Object.keys(this.http).length > 0 && polltime > 0) {
            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), polltime * 1000);
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
                            this.adapter.log.silly(`[http controlFunction] Found ${this.type}.http_cmd of state ${stateid} for ${this.getName()}`);
                            controlFunction = async (value) => {
                                this.adapter.log.silly(`[http controlFunction] Entered ${this.type}.http_cmd of state ${stateid} for ${this.getName()} with value: ${value}`);

                                if (state[this.type] && state[this.type].http_cmd_funct) {
                                    try {
                                        value = isAsync(state[this.type].http_cmd_funct) ? await state[this.type].http_cmd_funct(value, this) : state[this.type].http_cmd_funct(value, this);
                                        this.adapter.log.debug(`[http controlFunction] Executing state.${this.type}.http_cmd_funct of state ${stateid} for ${this.getName()} with value: ${JSON.stringify(value)}`);
                                    } catch (error) {
                                        this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd_funct of state ${stateid} for ${this.getName()}: ${error}`);
                                    }
                                }

                                let body;
                                try {
                                    // Append value parameters
                                    var url = new URL('http://' + this.getIP() + state[this.type].http_cmd);
                                    if (typeof value === 'object') {
                                        Object.keys(value).forEach(key => url.searchParams.append(key, value[key]));
                                    }

                                    this.adapter.log.debug(`[http controlFunction] Executing state.${this.type}.http_cmd of state ${stateid} for ${this.getName()} from url: ${url.href}`);
                                    body = await this.requestAsync(url.href);

                                    if (body === 'Bad default state and button type combination!') {
                                        this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: ${body}`);
                                    }
                                } catch (error) {
                                    if (body && body === '401 Unauthorized') {
                                        this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: Wrong http username or http password! Please enter user credentials for restricted login.`);
                                    } else {
                                        this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: ${error}`);
                                    }
                                }

                                delete this.states[stateid];
                            };
                        }

                        // MQTT
                        if (this.type === 'mqtt' && state[this.type] && hasTypeCmd) {
                            this.adapter.log.silly(`[mqtt controlFunction] Found ${this.type}.mqtt_cmd of state ${stateid} for ${this.getName()}`);
                            controlFunction = async (value) => {
                                let cmd = state[this.type].mqtt_cmd;
                                if (state[this.type] && state[this.type].mqtt_cmd_funct) {
                                    try {
                                        value = isAsync(state[this.type].mqtt_cmd_funct) ? await state[this.type].mqtt_cmd_funct(value, this) : state[this.type].mqtt_cmd_funct(value, this);
                                        this.adapter.log.debug(`[mqtt controlFunction] Executing state.${this.type}.mqtt_cmd_funct of state ${stateid} for ${this.getName()} with value: ${value}`);
                                    } catch (error) {
                                        this.adapter.log.error(`[mqtt controlFunction] Error in function state.${this.type}.mqtt_cmd_funct of state ${stateid} for ${this.getName()}: ${error}`);
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
                                this.adapter.log.info(`Delete old state: ${tmpid._id}`);
                            } catch (error) {
                                this.adapter.log.error(`Cound not delete old state: ${tmpid._id}`);
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
                        this.adapter.log.info(`Delete old channel: ${tmpidi._id}`);
                        await this.adapter.delObjectAsync(tmpidi._id);
                        delete obj[tmpidi._id];
                    } catch (error) {
                        this.adapter.log.error(`Could not delete old channel: ${tmpidi._id}`);
                    }
                }
            }
        }
    }

    async firmwareUpdatePolling() {
        if (this.adapter.config.autoupdate) {
            await this.firmwareUpdate(true);
            this.firmwareUpdatePollingTimeout = setTimeout(async () => await this.firmwareUpdatePolling(), 15 * 60 * 1000); // Every 15 Minutes
        }
    }

    async firmwareUpdate(update) {
        if (!update) return;
        if (this.getDeviceName() === undefined) return;

        if (!this.isOnline()) {
            this.adapter.log.debug(`[firmwareUpdate] Device is offline ${this.getName()}`);
            return;
        }

        try {
            const firmwareUpdateState = await this.adapter.getStateAsync(this.getDeviceName() + '.firmware');
            this.adapter.log.debug(`[firmwareUpdate] received state ${JSON.stringify(firmwareUpdateState)} for ${this.getName()}`);

            // Check if device has firmware update
            if (firmwareUpdateState && firmwareUpdateState.val) {
                if (this.getDeviceGen() === 1) {
                    let body = await this.requestAsync('http://' + this.getIP() + '/ota?update=true');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getName()}: ${body}`);
                } else if (this.getDeviceGen() === 2) {
                    // TODO
                }
            }
        } catch (error) {
            this.adapter.log.error(`[firmwareUpdate] Error in update request for ${this.getName()}: ${error}`);
        }
    }

    destroy() {
        if (this.active) {
            this.adapter.log.debug(`Destroy ${this.getName()}`);

            clearTimeout(this.httpIoBrokerStateTimeout);
            clearTimeout(this.firmwareUpdatePollingTimeout);

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