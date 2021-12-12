/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const datapoints = require(__dirname + '/../datapoints');

class BaseClient {
    constructor(type, adapter, objectHelper, eventEmitter) {
        this.type = type;

        this.adapter = adapter;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;

        this.timerid = null;

        this.active = true;
        this.states = {};
        this.device = {};
        this.http = {};

        this.devicename;
        this.ip;            // e.g. 192.168.1.2
        this.auth;          // Authorization HTTP Header

        this.id;
        this.devicetype;
        this.deviceid;
        this.serialid;
        this.deviceexist;
        this.devicegen;
        this.httptimeout = 5 * 1000;

        if (this.adapter.config.httpusername && this.adapter.config.httppassword && this.adapter.config.httpusername.length > 0 && this.adapter.config.httppassword.length > 0) {
            this.auth = 'Basic ' + Buffer.from(this.adapter.config.httpusername + ':' + this.adapter.config.httppassword).toString('base64');
        }
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
    * Checks if Shelly supports rpc api
    * you have to add a configuration in the ./lib/devices directory
    */
    getDeviceGen() {
        if (this.devicegen === undefined) {
            let deviceid = this.getDeviceId();
            this.devicegen = datapoints.getDeviceGen(deviceid);
            this.adapter.log.debug('DEVICE GEN: ' + this.devicegen);
        }

        return this.devicegen;
    }

    /**
    * Missing data will be pulled by http
    */
    async httpIoBrokerState() {
        // Test - to delete after a while
        if (!this.httpIoBrokerStateTime || Date.now() >= (this.httpIoBrokerStateTime + (1000 * 60 * 10))) {
            this.httpIoBrokerStateTime = Date.now();
        }

        if (!this.adapter.isOnline(this.getDeviceId())) {
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
                            if (state[this.type] && state[this.type].http_publish_funct) {
                                value = isAsync(state[this.type].http_publish_funct) ? await state[this.type].http_publish_funct(value, this) : state[this.type].http_publish_funct(value, this);
                            }

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

            this.adapter.log.debug('Executing Firmwareupdate for ' + this.getName());
        } catch (error) {
            this.adapter.log.error('Error in function firmwareUpdate and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
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
            this.auth = undefined;

            this.id = undefined;
            this.devicetype = undefined;
            this.deviceid = undefined;
            this.serialid = undefined;
            this.deviceexist = undefined;
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