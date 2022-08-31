'use strict';

const datapoints = require(__dirname + '/../datapoints');
const axios = require('axios').default;
const crypto = require('crypto');

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

        this.states = {};
        this.device = {};
        this.http = {};

        this.devicename;    // e.g. SHBDUO-1#8CAAB5616291#2 (used in object IDs)
        this.ip;            // e.g. 192.168.1.2

        this.id;            // e.g. ShellyBulbDuo-8CAAB5616291
        this.devicetype;    // e.g. SHBDUO-1 or SHRGBW2
        this.deviceClass;   // e.g. ShellyBulbDuo or shellyrgbw2
        this.serialid;      // e.g. 8CAAB5616291

        this.deviceexists;  // boolean
        this.devicegen;     // 1 or 2

        this.nonceCount = 0;
        this.httptimeout = 8 * 1000;

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

            const httpDebugFilePath = `${httpDebugDir}/${url.replace(/[^a-zA-Z0-9-_.]/g, '_')}.json`;

            let axiosRequestObj = {
                method: 'get',
                responseType: 'text',
                transformResponse: (res) => {
                    return res; // Avoid automatic json parse
                },
                baseURL: `http://${this.getIP()}`,
                timeout: this.httptimeout,
                url: url
            };

            if (this.getDeviceGen() === 1) {
                if (this.adapter.config.httpusername && this.adapter.config.httppassword) {
                    // Add basic auth if configured
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device with basic auth: "${axiosRequestObj.baseURL}${url}"`);

                    axiosRequestObj = {
                        ...axiosRequestObj,
                        auth: {
                            username: this.adapter.config.httpusername,
                            password: this.adapter.config.httppassword
                        }
                    };
                } else {
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device: "${axiosRequestObj.baseURL}${url}"`);
                }

                axios(
                    axiosRequestObj
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
                    axiosRequestObj
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
                                'Authorization': authorization
                            }
                        };

                        axios(
                            axiosRequestObj
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
     * @return {String}
     */
    getId() {
        throw new Error('You have to implement the method getId!');
    }

    /**
     * @return {String}
     */
    getSerialId() {
        throw new Error('You have to implement the method getSerialId!');
    }

    getDirectoryName() {
        return this.getId().replace(/[^a-zA-Z0-9-_.]/g, '_');
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

    sendState2Client(cmd, value, qos) {
        throw new Error(`You have to implement the method sendState2Client! ${cmd} ${value} ${qos}`);
    }

    /**
     * Get IP of device. For example
     * 192.168.1.2
     */
    getIP() {
        return this.ip;
    }

    /**
     * Returns a string for logging with the IP address, name of device and type
     * @return {String}
     */
    getName() {
        return this.getIP() + ' (' + this.getDeviceClass() + ' / ' + this.getId() + ' / ' + this.getDeviceName() + ')';
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
            this.deviceexists = datapoints.getDeviceName(this.getDeviceClass()) ? true : false;
        }

        return this.deviceexists;
    }

    /**
     * Checks if Shelly supports rpc api
     * you have to add a configuration in the ./lib/devices directory
     */
    getDeviceGen() {
        if (this.devicegen === undefined) {
            const deviceClass = this.getDeviceClass();
            this.devicegen = datapoints.getDeviceGen(deviceClass);
        }

        return this.devicegen;
    }

    isOnline() {
        return this.adapter.isOnline(this.getDeviceName());
    }

    /**
     * Missing data will be pulled by HTTP
     */
    async httpIoBrokerState() {
        if (!this.isOnline()) {
            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), this.adapter.config.polltime * 1000);
            return;
        }

        this.adapter.log.silly(`[httpIoBrokerState] Running for ${this.getName()}: ${JSON.stringify(this.http)}`);

        let polltime = this.getPolltime();
        for (const httpUrl in this.http) {
            const states = this.http[httpUrl];
            try {
                const body = await this.requestAsync(httpUrl);
                for (const j in states) {
                    const state = this.device[states[j]];
                    if (state && state.state) {
                        const stateid = `${this.getDeviceName()}.${state.state}`;
                        let value = body;
                        try {
                            this.adapter.log.silly(`[httpIoBrokerState] Updating state ${stateid} for ${this.getName()}: ${body}`);

                            if (state[this.type] && state[this.type].http_publish_funct) {
                                value = isAsync(state[this.type].http_publish_funct) ? await state[this.type].http_publish_funct(value, this) : state[this.type].http_publish_funct(value, this);
                            }

                            if (state.common.type === 'boolean' && value === 'false') value = false;
                            if (state.common.type === 'boolean' && value === 'true') value = true;
                            if (state.common.type === 'number' && value !== undefined) value = Number(value);

                            if (value !== undefined && (!Object.prototype.hasOwnProperty.call(this.states, stateid) || this.states[stateid] !== value || this.adapter.config.updateUnchangedObjects)) {
                                this.adapter.log.debug(`[httpIoBrokerState] State change ${this.getName()}: state: ${stateid}, value: ${JSON.stringify(value)}`);
                                this.states[stateid] = value;
                                this.objectHelper.setOrUpdateObject(stateid, {
                                    type: 'state',
                                    common: state.common
                                }, ['name'], value);
                            }
                        } catch (err) {
                            if (err.name && err.name.startsWith('TypeError')) {
                                this.adapter.log.debug(`[httpIoBrokerState] Could not find property for state ${stateid} for ${this.getName()} "${httpUrl}": ${err}`);
                            } else {
                                this.adapter.log.error(`[httpIoBrokerState] Error for state ${stateid} for ${this.getName()} "${httpUrl}": ${err} - value: "${value}"`);
                            }
                        }
                    }
                }

                this.objectHelper.processObjectQueue(() => { });
            } catch (err) {
                // Increase polltime on http error
                if (polltime > 0 && polltime < 60) polltime = 60;
                if (err && err.response && err.response.status == 401) {
                    this.adapter.log.error(`[httpIoBrokerState] HTTP request error for ${this.getName()} "${httpUrl}": Wrong http username or http password! Please enter user credentials for restricted login.`);
                } else if (err && err.response && err.response.status == 404) {
                    this.adapter.log.debug(`[httpIoBrokerState] HTTP request error for ${this.getName()} "${httpUrl}": 404 Not Found - this can happen if the current device configuration doesn't support this feature.`);
                } else {
                    this.adapter.log.debug(`[httpIoBrokerState] HTTP request error for ${this.getName()} "${httpUrl}": ${err}`);
                }
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
            try {
                if (Object.keys(this.device).length === 0) {
                    let deviceStates = datapoints.getDeviceByType(this.getDeviceClass(), this.type);
                    if (deviceStates) {
                        if (this.type === 'coap') {
                            deviceStates = recursiveSubStringReplace(deviceStates, new RegExp('<deviceclass>', 'g'), this.getDeviceClass());
                            deviceStates = recursiveSubStringReplace(deviceStates, new RegExp('<serialid>', 'g'), this.getSerialId());
                        }

                        if (this.type === 'mqtt') {
                            deviceStates = recursiveSubStringReplace(deviceStates, new RegExp('<mqttprefix>', 'g'), this.mqttprefix);
                        }

                        for (const statename in deviceStates) {
                            const state = deviceStates[statename];
                            state.state = statename;

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

                            const deviceName = this.getDeviceName();
                            if (!this.states[deviceName] || this.states[deviceName] !== deviceName) {
                                this.states[deviceName] = deviceName;
                                this.objectHelper.setOrUpdateObject(deviceName, {
                                    type: 'device',
                                    common: {
                                        name: `Device ${deviceName}`,
                                        statusStates: {
                                            onlineId: `${this.adapter.namespace}.${deviceName}.online`
                                        }
                                    },
                                    native: {}
                                }, ['name']);
                            }

                            const channel = statename.split('.').slice(0, 1).join();
                            if (channel !== statename) {
                                const channelid = `${deviceName}.${channel}`;
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

                            const stateid = `${deviceName}.${statename}`;
                            let controlFunction;

                            // HTTP
                            if (state[this.type] && state[this.type].http_cmd && !hasTypeCmd) {
                                this.adapter.log.silly(`[http controlFunction] Found ${this.type}.http_cmd of state ${stateid} for ${this.getName()}`);
                                controlFunction = async (value) => {
                                    this.adapter.log.silly(`[http controlFunction] Entered ${this.type}.http_cmd of state ${stateid} for ${this.getName()} with value: ${value}`);

                                    // Modify value with http_cmd_funct (if exists)
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
                                        if (this.getDeviceGen() === 1) {
                                            // Append value parameters
                                            const url = new URL('http://' + this.getIP() + state[this.type].http_cmd);
                                            if (typeof value === 'object') {
                                                Object.keys(value).forEach(key => url.searchParams.append(key, value[key]));
                                            }

                                            this.adapter.log.debug(`[http controlFunction] Executing gen 1 state.${this.type}.http_cmd of state ${stateid} for ${this.getName()} from url: ${url.href}`);
                                            body = await this.requestAsync(url.pathname + url.search);

                                            if (body === 'Bad default state and button type combination!') {
                                                this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: ${body}`);
                                            }
                                        } else if (this.getDeviceGen() === 2) {
                                            // Not supported
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: Not supported for Gen 2 devices`);
                                        }

                                    } catch (err) {
                                        if (err && err.response && err.response.status == 401) {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: Wrong http username or http password! Please enter user credentials for restricted login.`);
                                        } else {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${stateid} for ${this.getName()}: ${err}`);
                                        }
                                    }

                                    if (value == this.states?.[stateid]) {
                                        this.adapter.log.debug(`[http controlFunction] Ack state.${this.type}.http_cmd of state ${stateid} for ${this.getName()} in adapter: Value not changed`);
                                        await this.adapter.setStateAsync(stateid, { val: value, ack: true });
                                    } else {
                                        delete this.states[stateid];
                                    }
                                };
                            }

                            // MQTT
                            if (this.type === 'mqtt' && state[this.type] && hasTypeCmd) {
                                this.adapter.log.silly(`[mqtt controlFunction] Found ${this.type}.mqtt_cmd of state ${stateid} for ${this.getName()}`);
                                controlFunction = async (value) => {

                                    // Modify value with mqtt_cmd_funct (if exists)
                                    if (state[this.type] && state[this.type].mqtt_cmd_funct) {
                                        try {
                                            value = isAsync(state[this.type].mqtt_cmd_funct) ? await state[this.type].mqtt_cmd_funct(value, this) : state[this.type].mqtt_cmd_funct(value, this);
                                            this.adapter.log.debug(`[mqtt controlFunction] Executing state.${this.type}.mqtt_cmd_funct of state ${stateid} for ${this.getName()} with value: ${value}`);
                                        } catch (error) {
                                            this.adapter.log.error(`[mqtt controlFunction] Error in function state.${this.type}.mqtt_cmd_funct of state ${stateid} for ${this.getName()}: ${error}`);
                                        }
                                    }

                                    this.sendState2Client(state[this.type].mqtt_cmd, value, this.adapter.config.qos);

                                    if (value == this.states?.[stateid]) {
                                        this.adapter.log.debug(`[mqtt controlFunction] Ack state.${this.type}.mqtt_cmd of state ${stateid} for ${this.getName()} in adapter: Value not changed`);
                                        await this.adapter.setStateAsync(stateid, { val: value, ack: true });
                                    } else {
                                        delete this.states[stateid];
                                    }
                                };
                            }

                            // Fill this.http object for httpIoBrokerState()
                            if (state[this.type] && state[this.type].http_publish && !hasTypePublishCmd) {
                                if (!this.http[state[this.type].http_publish]) {
                                    this.http[state[this.type].http_publish] = [];
                                }

                                this.http[state[this.type].http_publish].push(statename);
                            }

                            // Init value
                            let value;

                            if (this.type === 'coap' && state?.coap?.coap_init_value) {
                                value = state.coap.coap_init_value;
                            }

                            if (this.type === 'mqtt' && state?.mqtt?.mqtt_init_value) {
                                value = state.mqtt.mqtt_init_value;
                            }

                            this.objectHelper.setOrUpdateObject(stateid, {
                                type: 'state',
                                common: state.common
                            }, ['name'], value, controlFunction);
                        }
                        this.device = deviceStates;
                    }

                    this.objectHelper.processObjectQueue(() => {
                        resolve(true);
                    });
                }
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
        const id = this.adapter.namespace + '.' + this.getDeviceName();
        const obj = await this.adapter.getAdapterObjectsAsync();
        const devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());

        let dps = datapoints.getAll(this.type);
        dps = dps[devicetype];

        if (dps) {
            for (const i in obj) {
                const tmpid = obj[i];
                if (tmpid && tmpid._id && tmpid.type) {
                    const stateid = tmpid._id.replace(id + '.', '');
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
        for (const i in obj) {
            const tmpidi = obj[i];
            if (tmpidi && tmpidi.type && tmpidi._id && tmpidi.type === 'channel') {
                let found = false;
                for (const j in obj) {
                    const tmpidj = obj[j];
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

    async firmwareUpdate() {
        if (this.getDeviceName() === undefined) return;

        if (!this.isOnline()) {
            this.adapter.log.debug(`[firmwareUpdate] Device is offline ${this.getName()}`);
            return;
        }

        try {
            const firmwareUpdateState = await this.adapter.getStateAsync(this.getDeviceName() + '.firmware');
            this.adapter.log.silly(`[firmwareUpdate] received state ${JSON.stringify(firmwareUpdateState)} for ${this.getName()}`);

            // Check if device has firmware update
            if (firmwareUpdateState && firmwareUpdateState.val) {
                this.adapter.log.debug(`[firmwareUpdate] Update available for ${this.getName()} - performing update process`);

                if (this.getDeviceGen() === 1) {
                    const body = await this.requestAsync('/ota?update=true');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getName()}: ${body}`);
                } else if (this.getDeviceGen() === 2) {
                    const body = await this.requestAsync('/rpc/Shelly.Update');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getName()}: ${body}`);
                }
            }
        } catch (error) {
            this.adapter.log.error(`[firmwareUpdate] Error in update request for ${this.getName()}: ${error}`);
        }
    }

    async downloadAllScripts() {
        if (this.getDeviceName() === undefined) return;

        if (!this.isOnline()) {
            this.adapter.log.debug(`[downloadAllScripts] Device is offline ${this.getName()}`);
            return;
        }

        try {
            if (this.getDeviceGen() === 2) {
                const scriptDir = `scripts/${this.getDirectoryName()}`;
                await this.adapter.mkdirAsync(this.adapter.namespace, scriptDir);

                const body = await this.requestAsync('/rpc/Script.List');

                this.adapter.log.debug(`[downloadAllScripts] Found scripts on device ${this.getName()}: ${body}`);

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

                this.adapter.log.info(`[downloadAllScripts] Downloaded ${downloadCounter} scripts of ${this.getName()} to files`);
            }
        } catch (error) {
            this.adapter.log.error(`[downloadAllScripts] Error ${this.getName()}: ${error}`);
        }
    }

    destroy() {
        this.adapter.log.debug(`[BaseClient] Destroying ${this.getName()}`);

        if (this.httpIoBrokerStateTimeout) {
            clearTimeout(this.httpIoBrokerStateTimeout);
        }

        this.states = {};
        this.device = {};
        this.http = {};

        this.devicename = undefined;
        this.ip = undefined;

        this.id = undefined;
        this.devicetype = undefined;
        this.deviceClass = undefined;
        this.serialid = undefined;
        this.deviceexists = undefined;
        this.devicegen = undefined;
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
    BaseServer: BaseServer
};