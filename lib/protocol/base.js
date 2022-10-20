'use strict';

const datapoints = require(__dirname + '/../datapoints');
const axios = require('axios').default;
const crypto = require('crypto');

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

        this.stateValueCache = {};
        this.device = {};
        this.http = {};

        this.deviceId;      // e.g. SHBDUO-1#8CAAB5616291#2 (used in object IDs)
        this.ip;            // e.g. 192.168.1.2

        this.id;            // e.g. ShellyBulbDuo-8CAAB5616291
        this.deviceType;    // e.g. SHBDUO-1 or SHRGBW2
        this.deviceMode;    // e.g. color or white / relay or roller
        this.deviceClass;   // e.g. ShellyBulbDuo or shellyrgbw2
        this.serialId;      // e.g. 8CAAB5616291

        this.deviceGen;     // 1 or 2

        this.nonceCount = 0;
        this.httpTimeout = 8 * 1000;

        // Handle firmware updates
        this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());

        // Handle script download
        this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }

    async requestAsync(url) {

        const httpDebugDir = `httpDebug/${this.getDirectoryName()}`;

        if (this.adapter.config.saveHttpResponses) {
            await this.adapter.mkdirAsync(this.adapter.namespace, 'httpDebug');
            await this.adapter.mkdirAsync(this.adapter.namespace, httpDebugDir);
        }

        return new Promise((resolve, reject) => {

            if (!this.getIP()) {
                reject(`[requestAsync] Unable to perform HTTP request "${url}" - IP address is unknown of ${this.getLogInfo()}`);
            }

            const httpDebugFilePath = `${httpDebugDir}/${url.replace(/[^a-zA-Z0-9-_.]/g, '_')}.json`;

            let axiosRequestObj = {
                method: 'get',
                responseType: 'text',
                transformResponse: (res) => {
                    return res; // Avoid automatic json parse
                },
                baseURL: `http://${this.getIP()}`,
                timeout: this.httpTimeout,
                url: url,
            };

            if (this.getDeviceGen() === 1) {
                if (this.adapter.config.httpusername && this.adapter.config.httppassword) {
                    // Add basic auth if configured
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device with basic auth: "${axiosRequestObj.baseURL}${url}"`);

                    axiosRequestObj = {
                        ...axiosRequestObj,
                        auth: {
                            username: this.adapter.config.httpusername,
                            password: this.adapter.config.httppassword,
                        },
                    };
                } else {
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device: "${axiosRequestObj.baseURL}${url}"`);
                }

                axios(
                    axiosRequestObj,
                ).then(response => {
                    this.adapter.log.silly(`[requestAsync] HTTP response of gen 1 device: "${axiosRequestObj.baseURL}${url}" -> "${response.data}"`);

                    if (this.adapter.config.saveHttpResponses) {
                        this.adapter.log.silly(`[requestAsync] Saving HTTP debug file to ${httpDebugFilePath}`);
                        this.adapter.writeFile(this.adapter.namespace, httpDebugFilePath, response.data);
                    }

                    resolve(response.data);
                }).catch(reject);

            } else if (this.getDeviceGen() === 2) {
                this.adapter.log.silly(`[requestAsync] HTTP request to gen 2 device (with digest auth): "${axiosRequestObj.baseURL}${url}"`);

                axios(
                    axiosRequestObj,
                ).then(response => {
                    this.adapter.log.silly(`[requestAsync] HTTP response of gen 2 device without auth: "${axiosRequestObj.baseURL}${url}" -> "${response.data}"`);

                    if (this.adapter.config.saveHttpResponses) {
                        this.adapter.log.silly(`[requestAsync] Saving HTTP debug file to ${httpDebugFilePath}`);
                        this.adapter.writeFile(this.adapter.namespace, httpDebugFilePath, response.data);
                    }

                    resolve(response.data);
                }).catch(err => {
                    if (err && err.response && err.response.status === 401) {
                        const authDetails = err.response.headers['www-authenticate'].split(', ').map(v => v.split('='));

                        const username = 'admin';
                        const password = this.adapter.config.httppassword;

                        this.nonceCount++;
                        const nonceCount = ('00000000' + this.nonceCount).slice(-8);
                        const cnonce = crypto.randomBytes(24).toString('hex');

                        const realm = authDetails[1][1].replace(/"/g, '');
                        const nonce = authDetails[2][1].replace(/"/g, '');

                        const sha256 = str => crypto.createHash('sha256').update(str).digest('hex');

                        const HA1 = sha256(`${username}:${realm}:${password}`);
                        const HA2 = sha256(`GET:${url}`);
                        const response = sha256(`${HA1}:${nonce}:${nonceCount}:${cnonce}:auth:${HA2}`);

                        const authorization = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${url}", cnonce="${cnonce}", nc=${nonceCount}, qop=auth, response="${response}", algorithm=SHA-256`;

                        axiosRequestObj = {
                            ...axiosRequestObj,
                            headers: {
                                'Authorization': authorization,
                            },
                        };

                        axios(
                            axiosRequestObj,
                        ).then(response => {
                            this.adapter.log.silly(`[requestAsync] HTTP response of gen 2 device with digest auth: "${axiosRequestObj.baseURL}${url}" -> "${response.data}"`);

                            if (this.adapter.config.saveHttpResponses) {
                                this.adapter.log.silly(`[requestAsync] Saving HTTP debug file to ${httpDebugFilePath}`);
                                this.adapter.writeFile(this.adapter.namespace, httpDebugFilePath, response.data);
                            }

                            resolve(response.data);
                        }).catch(reject);
                    } else {
                        reject(err);
                    }
                }).catch(reject);
            }
        });
    }

    /**
    * Returns the polltime for a device (in seconds)
    */
    getPolltime() {
        if (this.adapter.config.polltime == 0) return 0;

        const deviceClass = this.getDeviceClass();
        let polltime = undefined;

        if (deviceClass) {
            polltime = datapoints.getPolltime(deviceClass);
            if (polltime === undefined) polltime = this.adapter.config.polltime || 0;
            if (this.adapter.config.polltime > polltime) polltime = this.adapter.config.polltime;
            return polltime;
        }

        return this.adapter.config.polltime; // Default = instance config
    }

    /**
     * ID of the Shelly device
     * Example: shellyplug-s-12345
     * @return {String}
     */
    getId() {
        return this.id;
    }

    /**
     * Serial id of the Shelly device
     * Example: shellyplug-s-12345
     */
    getSerialId() {
        throw new Error('You have to implement the method getSerialId!');
    }

    /**
     * @return {String}
     */
    getDeviceClass() {
        throw new Error('You have to implement the method getDeviceClass!');
    }

    /**
     * @return {String}
     */
    getDeviceType() {
        throw new Error('You have to implement the method getDeviceType!');
    }

    publishStateValue(cmd, value) {
        throw new Error(`You have to implement the method publishStateValue! ${cmd} ${value}`);
    }

    getDirectoryName() {
        return this.getId().replace(/[^a-zA-Z0-9-_.]/g, '_');
    }

    getDeviceMode() {
        return this.deviceMode;
    }

    async setDeviceMode(newDeviceMode) {
        if (newDeviceMode !== this.deviceMode) {
            if (this.deviceMode) {
                this.adapter.log.info(`Device mode of ${this.getLogInfo()} changed from "${this.deviceMode}" to "${newDeviceMode}" - recreating states NOW!`);
            }

            this.deviceMode = newDeviceMode;
            await this.adapter.setStateAsync(`${this.getDeviceId()}.Sys.deviceMode`, { val: newDeviceMode, ack: true });

            await this.deleteOldStates();
            await this.createObjects();
        }
    }

    async initDeviceModeFromState() {
        if (!this.deviceMode) {
            const deviceModeState = await this.adapter.getStateAsync(`${this.getDeviceId()}.Sys.deviceMode`);
            if (deviceModeState && deviceModeState?.val) {
                this.deviceMode = deviceModeState.val;
                this.adapter.log.debug(`Configured device mode of ${this.getLogInfo()} by state "${this.getDeviceId()}.Sys.deviceMode" (fallback): ${this.deviceMode}`);
            }
        }
    }

    /**
     * IP of Shelly device
     * Example 192.168.1.2
     * @return {String}
     */
    getIP() {
        return this.ip;
    }

    async setIP(ip, source) {
        if (!ip) return;

        this.ip = ip;
        this.adapter.log.debug(`[setIP] New IP for device ${this.getDeviceId()}: ${ip} (source: ${source})`);

        const hostNameObj = await this.adapter.getObjectAsync(`${this.getDeviceId()}.hostname`);
        if (hostNameObj) {
            await this.adapter.setStateAsync(`${this.getDeviceId()}.hostname`, { val: ip, ack: true, c: source });
        }
    }

    async initIPFromState() {
        if (!this.ip) {
            const ipState = await this.adapter.getStateAsync(`${this.getDeviceId()}.hostname`);
            if (ipState && ipState?.val) {
                this.ip = ipState.val;
                this.adapter.log.debug(`Configured IP of ${this.getLogInfo()} by state "${this.getDeviceId()}.hostname" (fallback): ${this.ip}`);
            }
        }
    }

    /**
     * Returns a string for logging with the IP address, name of device and type
     * @return {String}
     */
    getLogInfo() {
        return `${this.getIP() ?? ''} (${this.getDeviceClass()} / ${this.getId()} / ${this.getDeviceId()})`;
    }

    /**
     * Change Device ID from #2 to #1 (fimrware verson >= 1.8)
     * Example SHRGBW2#1234#2 will change to SHRGBW2#1234#1
     */
    getOldDeviceInfo(deviceId) {
        if (deviceId && deviceId.substr(-2) === '#2') {
            return deviceId.substr(0, deviceId.length - 2) + '#1';
        } else {
            return deviceId;
        }
    }

    /**
     * Get the Shelly Device type with the serialnumber of the device back.
     * Device type could be for example SHRGBW2. The serial number of the
     * device like 1234 will be added
     * Example: SHRGBW2#1234#1
     */
    getDeviceId() {
        return this.deviceId ? this.getOldDeviceInfo(this.deviceId) : undefined;
    }

    /**
     * Shelly device configuration exists
     * If missing: Add the configuration in the ./lib/devices direcotory (see docs)
     */
    deviceExists() {
        return datapoints.getDeviceTypeByClass(this.getDeviceClass()) ? true : false;
    }

    /**
     * Checks if Shelly supports rpc api
     * you have to add a configuration in the ./lib/devices directory
     */
    getDeviceGen() {
        if (this.deviceGen === undefined) {
            const deviceClass = this.getDeviceClass();
            this.deviceGen = datapoints.getDeviceGen(deviceClass);
        }

        return this.deviceGen;
    }

    /**
     * Returns the url to Shelly knowledge base
     */
    getKnowledgeBaseUrl() {
        return datapoints.getKnowledgeBaseUrlByClass(this.getDeviceClass());
    }

    isOnline() {
        return this.adapter.isOnline(this.getDeviceId());
    }

    getAllTypePublishStates() {
        const states = [];
        for (const i in this.device) {
            const state = this.device[i];

            if (this.type === 'mqtt') {
                if (state?.mqtt?.mqtt_publish) {
                    states.push(state);
                }
            } else if (this.type === 'coap') {
                if (state?.coap?.coap_publish) {
                    states.push(state);
                }
            }
        }

        return states;
    }

    /**
     * Missing data will be pulled by HTTP
     */
    async httpIoBrokerState() {
        if (!this.isOnline() || !this.getIP()) {
            this.adapter.log.silly(`[httpIoBrokerState] Device ${this.getLogInfo()} is offline (or IP is unknown) - waiting`);

            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), this.adapter.config.polltime * 1000);
            return;
        }

        this.adapter.log.silly(`[httpIoBrokerState] Running for ${this.getLogInfo()}: ${JSON.stringify(this.http)}`);

        let polltime = this.getPolltime();
        for (const httpUrl in this.http) {
            const dps = this.http[httpUrl];
            try {
                const body = await this.requestAsync(httpUrl);
                for (const i in dps) {
                    const dp = this.device[dps[i]];
                    if (dp && dp.state) {
                        const fullStateId = `${this.getDeviceId()}.${dp.state}`;
                        let value = body;
                        try {
                            this.adapter.log.silly(`[httpIoBrokerState] Updating state ${fullStateId} for ${this.getLogInfo()}: ${body}`);

                            if (dp[this.type] && dp[this.type].http_publish_funct) {
                                value = isAsync(dp[this.type].http_publish_funct) ? await dp[this.type].http_publish_funct(value, this) : dp[this.type].http_publish_funct(value, this);
                            }

                            if (dp.common.type === 'boolean' && value === 'false') value = false;
                            if (dp.common.type === 'boolean' && value === 'true') value = true;
                            if (dp.common.type === 'number' && value !== undefined) value = Number(value);

                            if (Object.prototype.hasOwnProperty.call(this.device, dp.state)) {
                                if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.stateValueCache, fullStateId) || this.stateValueCache[fullStateId] !== value || this.adapter.config.updateUnchangedObjects)) {
                                    this.adapter.log.debug(`[httpIoBrokerState] State change ${this.getLogInfo()}: state: ${fullStateId}, value: ${JSON.stringify(value)}`);
                                    this.stateValueCache[fullStateId] = value;
                                    this.objectHelper.setOrUpdateObject(fullStateId, {
                                        type: 'state',
                                        common: dp.common,
                                    }, ['name'], value);
                                }
                            }
                        } catch (err) {
                            if (err.name && err.name.startsWith('TypeError')) {
                                this.adapter.log.debug(`[httpIoBrokerState] Could not find property for state ${fullStateId} for ${this.getLogInfo()} "${httpUrl}": ${err}`);
                            } else {
                                this.adapter.log.error(`[httpIoBrokerState] Error for state ${fullStateId} for ${this.getLogInfo()} "${httpUrl}": ${err} - value: "${value}"`);
                            }
                        }
                    }
                }

                this.objectHelper.processObjectQueue(() => { });
            } catch (err) {
                // Increase polltime on http error
                if (polltime > 0 && polltime < 60) polltime = 60;
                if (err && err.response && err.response.status == 401) {
                    this.adapter.log.error(`[httpIoBrokerState] HTTP request error for ${this.getLogInfo()} "${httpUrl}": Wrong http username or http password! Please enter user credentials for restricted login.`);
                } else if (err && err.response && err.response.status == 404) {
                    this.adapter.log.debug(`[httpIoBrokerState] HTTP request error for ${this.getLogInfo()} "${httpUrl}": 404 Not Found - this can happen if the current device configuration doesn't support this feature.`);
                } else {
                    this.adapter.log.debug(`[httpIoBrokerState] HTTP request error for ${this.getLogInfo()} "${httpUrl}": ${err}`);
                }
            }
        }

        if (this.http && Object.keys(this.http).length > 0 && polltime > 0) {
            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), polltime * 1000);
        }
    }

    /**
     * Create objects in shelly.X. for a new Shelly device
     * The Shelly device must exist in the ./lib/devices/gen<X>/ directory
     */
    async createObjects() {
        return new Promise((resolve, reject) => {
            try {
                this.adapter.log.debug(`[createObjects] Starting object creation of ${this.getLogInfo()} for mode: ${this.getDeviceMode() ?? '<not set>'}`);

                const deviceStatesHttp = {};
                const deviceStates = datapoints.getDeviceByClass(this.getDeviceClass(), this.type, this.getDeviceMode());

                if (deviceStates) {
                    for (const stateId in deviceStates) {
                        const state = deviceStates[stateId];
                        state.state = stateId;

                        let hasTypeCmd = false;
                        let hasTypePublishCmd = false;

                        if (this.type === 'coap') {
                            hasTypeCmd = !!state?.coap?.coap_cmd;
                            hasTypePublishCmd = !!state?.coap?.coap_publish;
                        }

                        if (this.type === 'mqtt') {
                            hasTypeCmd = !!state.mqtt?.mqtt_cmd;
                            hasTypePublishCmd = !!state?.mqtt?.mqtt_publish;
                        }

                        const deviceId = this.getDeviceId();
                        this.objectHelper.setOrUpdateObject(deviceId, {
                            type: 'device',
                            common: {
                                name: `Device ${deviceId}`,
                                statusStates: {
                                    onlineId: `${this.adapter.namespace}.${deviceId}.online`,
                                },
                            },
                            native: {},
                        }, ['name']);

                        const channel = stateId.split('.').slice(0, 1).join();
                        if (channel !== stateId) {
                            const channelId = `${deviceId}.${channel}`;

                            this.objectHelper.setOrUpdateObject(channelId, {
                                type: 'channel',
                                common: {
                                    name: `Channel ${channel}`,
                                },
                            }, ['name']);
                        }

                        const fullStateId = `${deviceId}.${stateId}`;
                        let controlFunction;

                        // HTTP
                        if (state[this.type] && state[this.type].http_cmd && !hasTypeCmd) {
                            this.adapter.log.silly(`[http controlFunction] Found ${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}`);
                            controlFunction = async (value) => {
                                if (this.isOnline()) {
                                    let publishValue = value;

                                    this.adapter.log.silly(`[http controlFunction] Entered ${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()} with value: ${value}`);

                                    // Modify value with http_cmd_funct (if exists)
                                    if (state[this.type] && state[this.type].http_cmd_funct) {
                                        try {
                                            publishValue = isAsync(state[this.type].http_cmd_funct) ? await state[this.type].http_cmd_funct(value, this) : state[this.type].http_cmd_funct(value, this);
                                            this.adapter.log.debug(`[http controlFunction] Executing state.${this.type}.http_cmd_funct of state ${fullStateId} for ${this.getLogInfo()} with value: ${value} -> ${JSON.stringify(publishValue)}`);
                                        } catch (err) {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd_funct of state ${fullStateId} for ${this.getLogInfo()}: ${err}`);
                                        }
                                    }

                                    let body;
                                    try {
                                        if (this.getDeviceGen() === 1) {
                                            // Append value parameters
                                            const url = new URL('http://' + this.getIP() + state[this.type].http_cmd);
                                            if (typeof publishValue === 'object') {
                                                Object.keys(publishValue).forEach(key => url.searchParams.append(key, publishValue[key]));
                                            }

                                            this.adapter.log.debug(`[http controlFunction] Executing gen 1 state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()} from url: ${url.href}`);
                                            body = await this.requestAsync(url.pathname + url.search);

                                            if (body === 'Bad default state and button type combination!') {
                                                this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: ${body}`);
                                            }
                                        } else if (this.getDeviceGen() === 2) {
                                            // Not supported
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: Not supported for Gen 2 devices`);
                                        }

                                    } catch (err) {
                                        if (err && err.response && err.response.status == 401) {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: Wrong http username or http password! Please enter user credentials for restricted login.`);
                                        } else {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: ${err}`);
                                        }
                                    }

                                    if (value == this.stateValueCache?.[fullStateId]) {
                                        this.adapter.log.debug(`[http controlFunction] Ack state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()} in adapter: Value not changed`);
                                        await this.adapter.setStateAsync(fullStateId, { val: value, ack: true, c: `UNCHANGED_AUTO_ACK` });
                                    } else {
                                        // Remove from cache, since value changed
                                        delete this.stateValueCache[fullStateId];
                                    }
                                } else {
                                    this.adapter.log.warn(`[http controlFunction] Unable to perform request - device ${this.getLogInfo()} is offline`);
                                }
                            };
                        }

                        // MQTT
                        if (this.type === 'mqtt' && state[this.type] && hasTypeCmd) {
                            this.adapter.log.silly(`[mqtt controlFunction] Found ${this.type}.mqtt_cmd of state ${fullStateId} for ${this.getLogInfo()}`);
                            controlFunction = async (value) => {
                                if (this.isOnline()) {
                                    let publishValue = value;

                                    this.adapter.log.silly(`[mqtt controlFunction] Entered ${this.type}.mqtt_cmd of state ${fullStateId} for ${this.getLogInfo()} with value: ${value}`);

                                    // Modify value with mqtt_cmd_funct (if exists)
                                    if (state[this.type] && state[this.type].mqtt_cmd_funct) {
                                        try {
                                            publishValue = isAsync(state[this.type].mqtt_cmd_funct) ? await state[this.type].mqtt_cmd_funct(value, this) : state[this.type].mqtt_cmd_funct(value, this);
                                            this.adapter.log.debug(`[mqtt controlFunction] Executing state.${this.type}.mqtt_cmd_funct of state ${fullStateId} for ${this.getLogInfo()} with value: ${value} -> ${publishValue}`);
                                        } catch (err) {
                                            this.adapter.log.error(`[mqtt controlFunction] Error in function state.${this.type}.mqtt_cmd_funct of state ${fullStateId} for ${this.getLogInfo()}: ${err}`);
                                        }
                                    }

                                    this.publishStateValue(state[this.type].mqtt_cmd, publishValue);

                                    if (value == this.stateValueCache?.[fullStateId]) {
                                        this.adapter.log.debug(`[mqtt controlFunction] Ack state.${this.type}.mqtt_cmd of state ${fullStateId} for ${this.getLogInfo()} in adapter: Value not changed`);
                                        await this.adapter.setStateAsync(fullStateId, { val: value, ack: true, c: `UNCHANGED_AUTO_ACK` });
                                    } else {
                                        // Remove from cache, since value changed
                                        delete this.stateValueCache[fullStateId];
                                    }
                                } else {
                                    this.adapter.log.warn(`[mqtt controlFunction] Unable to perform request - device ${this.getLogInfo()} is offline`);
                                }
                            };
                        }

                        // Fill this.http object for httpIoBrokerState()
                        if (state?.[this.type]?.http_publish && !hasTypePublishCmd) {
                            const key = state[this.type].http_publish;
                            if (!deviceStatesHttp[key]) {
                                deviceStatesHttp[key] = [stateId];
                            } else {
                                deviceStatesHttp[key].push(stateId);
                            }
                        }

                        // Init value or funct
                        let value = undefined;

                        if (state?.[this.type]?.init_value) {
                            value = state?.[this.type]?.init_value;
                        } else if (state?.[this.type]?.init_funct) {
                            value = state[this.type].init_funct(this);
                        }

                        this.objectHelper.setOrUpdateObject(fullStateId, {
                            type: 'state',
                            common: state.common,
                        }, ['name'], value, controlFunction, false);
                    }
                }

                this.objectHelper.processObjectQueue(() => {
                    this.http = deviceStatesHttp;
                    this.device = deviceStates;

                    this.adapter.log.debug(`[createObjects] Finished object creation of ${this.getLogInfo()}`);
                    resolve(true);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * delete old states in objects unter shelly.X.
     * For example if the configuration for the device change
     */
    async deleteOldStates() {
        const deviceId = this.getDeviceId();
        const objList = await this.adapter.getAdapterObjectsAsync();
        const dps = datapoints.getDeviceByClass(this.getDeviceClass(), this.type, this.getDeviceMode());

        if (dps) {
            for (const o in objList) {
                const tmpObj = objList[o];

                if (tmpObj && tmpObj._id && tmpObj.type) {
                    // remove namespace
                    const stateId = tmpObj._id.replace(`${this.adapter.namespace}.${deviceId}.`, '');

                    // Just delete states of this device!
                    if (tmpObj.type === 'state' && tmpObj._id.startsWith(`${this.adapter.namespace}.${deviceId}`)) {
                        if (!dps[stateId]) {
                            try {
                                if (this.objectHelper.getObject(tmpObj._id)) {
                                    this.objectHelper.deleteObject(tmpObj._id);
                                } else {
                                    await this.adapter.delForeignObjectAsync(tmpObj._id);
                                }

                                delete objList[tmpObj._id];
                                delete this.device[stateId];

                                this.adapter.log.debug(`Deleted unused state: ${tmpObj._id}`);
                            } catch (err) {
                                this.adapter.log.error(`Could not delete unused state: ${tmpObj._id}`);
                            }
                        }
                    }
                }
            }
        }

        // Delete empty channels
        for (const o in objList) {
            const tmpObj = objList[o];

            if (tmpObj && tmpObj.type && tmpObj._id && tmpObj.type === 'channel') {

                // Search for states in current channel
                let found = false;
                for (const j in objList) {
                    const tmpidj = objList[j];
                    if (!tmpidj) {
                        continue;
                    }

                    if (tmpidj && tmpidj.type && tmpidj._id && tmpidj.type === 'state' && tmpidj._id.startsWith(tmpObj._id)) {
                        found = true;
                        break;
                    }
                }

                if (found === false) {
                    try {
                        if (this.objectHelper.getObject(tmpObj._id)) {
                            this.objectHelper.deleteObject(tmpObj._id);
                        } else {
                            await this.adapter.delForeignObjectAsync(tmpObj._id, { recursive: true });
                        }

                        delete objList[tmpObj._id];

                        this.adapter.log.debug(`Deleted unused channel: ${tmpObj._id}`);
                    } catch (err) {
                        this.adapter.log.error(`Could not delete unused channel: ${tmpObj._id}`);
                    }
                }
            }
        }
    }

    async firmwareUpdate() {
        if (this.getDeviceId() === undefined) return;

        if (!this.isOnline()) {
            this.adapter.log.debug(`[firmwareUpdate] Device is offline ${this.getLogInfo()}`);
            return;
        }

        try {
            const firmwareUpdateState = await this.adapter.getStateAsync(`${this.getDeviceId()}.firmware`);
            this.adapter.log.silly(`[firmwareUpdate] received state ${JSON.stringify(firmwareUpdateState)} for ${this.getLogInfo()}`);

            // Check if device has firmware update
            if (firmwareUpdateState && firmwareUpdateState.val) {
                this.adapter.log.debug(`[firmwareUpdate] Update available for ${this.getLogInfo()} - performing update process`);

                if (this.getDeviceGen() === 1) {
                    const body = await this.requestAsync('/ota?update=true');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getLogInfo()}: ${body}`);
                } else if (this.getDeviceGen() === 2) {
                    const body = await this.requestAsync('/rpc/Shelly.Update');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getLogInfo()}: ${body}`);
                }
            }
        } catch (err) {
            this.adapter.log.error(`[firmwareUpdate] Error in update request for ${this.getLogInfo()}: ${err}`);
        }
    }

    async downloadAllScripts() {
        if (this.getDeviceId() === undefined) return;

        if (!this.isOnline()) {
            this.adapter.log.debug(`[downloadAllScripts] Device is offline ${this.getLogInfo()}`);
            return;
        }

        try {
            if (this.getDeviceGen() === 2) {
                const scriptDir = `scripts/${this.getDirectoryName()}`;
                await this.adapter.mkdirAsync(this.adapter.namespace, scriptDir);

                const body = await this.requestAsync('/rpc/Script.List');

                this.adapter.log.debug(`[downloadAllScripts] Found scripts on device ${this.getLogInfo()}: ${body}`);

                const scriptList = JSON.parse(body);
                let downloadCounter = 0;

                for (const script of scriptList.scripts) {
                    if (script.id && script.name) {
                        const bodyCode = await this.requestAsync(`/rpc/Script.GetCode?id=${script.id}`);
                        const scriptCode = JSON.parse(bodyCode);

                        await this.adapter.writeFileAsync(this.adapter.namespace, `${scriptDir}/${script.id}-${script.name}.js`, scriptCode.data);
                        downloadCounter++;
                    }
                }

                this.adapter.log.info(`[downloadAllScripts] Downloaded ${downloadCounter} scripts of ${this.getLogInfo()} to files`);
            }
        } catch (err) {
            this.adapter.log.error(`[downloadAllScripts] Error ${this.getLogInfo()}: ${err}`);
        }
    }

    destroy() {
        this.adapter.log.debug(`[BaseClient] Destroying ${this.getLogInfo()}`);

        if (this.httpIoBrokerStateTimeout) {
            clearTimeout(this.httpIoBrokerStateTimeout);
        }

        this.stateValueCache = {};
        this.device = {};
        this.http = {};

        this.deviceId = undefined;
        this.ip = undefined;

        this.id = undefined;
        this.deviceType = undefined;
        this.deviceMode = undefined;
        this.deviceClass = undefined;
        this.serialId = undefined;
        this.deviceGen = undefined;
    }
}

class BaseServer {
    constructor(adapter, objectHelper, eventEmitter) {
        this.adapter = adapter;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;
    }

    destroy() {
        this.adapter.log.debug(`[BaseServer] Destroying`);
    }
}

module.exports = {
    BaseClient: BaseClient,
    BaseServer: BaseServer,
};