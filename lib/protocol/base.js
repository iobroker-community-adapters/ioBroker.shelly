/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const datapoints = require(__dirname + '/../datapoints');

class BaseClient {
    constructor(adapter, objectHelper, eventEmitter) {
        this.adapter = adapter;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;

        this.active = true;
        this.states = {};
        this.device = {};
        this.http = {};

        this.devicename;
        this.ip;
        this.auth;

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

    destroy() {
        if (this.active) {
            this.adapter.log.debug('Destroy ' + this.getName());

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
            this.devicegen = undefined;        }
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