'use strict';

const BaseClient = require('./base').BaseClient;
const BaseServer = require('./base').BaseServer;
const datapoints = require('../datapoints');

class HTTPPollingClient extends BaseClient {
    constructor(adapter, objectHelper, eventEmitter, config) {
        // Gen1 devices already expose classic REST mappings in the CoAP section
        // via http_publish/http_cmd. Reusing that section keeps object/state names
        // compatible with the existing adapter.
        super('coap', adapter, objectHelper, eventEmitter);

        this.config = config || {};
        this.ip = this.config.ip;
        this.customName = this.config.name;
    }

    getId() {
        if (!this.id) {
            const deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
            const serialId = this.getSerialId();
            if (deviceClass && serialId) {
                this.id = `${deviceClass}-${serialId}`;
            }
        }
        return this.id;
    }

    getSerialId() {
        if (!this.serialId && this.deviceId) {
            this.serialId = this.deviceId.split('#')[1];
        }
        return this.serialId;
    }

    getDeviceClass() {
        if (!this.deviceClass) {
            this.deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
        }
        return this.deviceClass;
    }

    getDeviceType() {
        if (!this.deviceType && this.deviceId) {
            this.deviceType = this.deviceId.split('#')[0];
        }
        return this.deviceType;
    }

    publishStateValue(cmd, value) {
        this.adapter.log.debug(`[HTTP] Ignoring publishStateValue for ${this.getLogInfo()}: ${cmd}=${value}`);
    }

    async discover() {
        const body = await this.requestAsync('/shelly');
        const info = JSON.parse(body);

        if (!info || !info.type || !info.mac) {
            throw new Error(`Invalid /shelly response from ${this.getIP()}: ${body}`);
        }

        this.deviceType = info.type;
        this.serialId = String(info.mac)
            .replace(/[^a-fA-F0-9]/g, '')
            .toUpperCase();
        this.deviceId = this.config.deviceId || `${this.deviceType}#${this.serialId}#1`;
        this.deviceClass = datapoints.getDeviceClassByType(this.deviceType);

        if (!this.deviceClass) {
            throw new Error(`Unsupported Shelly device type "${this.deviceType}" at ${this.getIP()}`);
        }

        try {
            const settingsBody = await this.requestAsync('/settings');
            const settings = JSON.parse(settingsBody);
            if (settings && settings.mode) {
                this.deviceMode = settings.mode;
            }
        } catch (err) {
            this.adapter.log.debug(`[HTTP] Unable to read /settings for ${this.getLogInfo()}: ${err}`);
        }

        return info;
    }

    async start() {
        try {
            const info = await this.discover();
            this.adapter.log.info(
                `[HTTP] Device ${this.getLogInfo()} discovered via /shelly (${JSON.stringify(info)})`,
            );

            if (!this.deviceExists()) {
                this.adapter.log.error(
                    `[HTTP] Device unknown, configuration for Shelly device ${this.getLogInfo()} does not exist!`,
                );
                return;
            }

            await this.initDeviceModeFromState();
            await this.deleteOldStates();
            await this.createObjects();
            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true);
            await this.setIP(this.getIP(), 'HTTP polling');
            await this.httpIoBrokerState();
        } catch (err) {
            this.adapter.log.error(`[HTTP] Unable to initialize ${this.getIP()}: ${err}`);
            if (this.deviceId) {
                await this.adapter.deviceStatusUpdate(this.getDeviceId(), false);
            }
        }
    }
}

class HTTPPollingServer extends BaseServer {
    constructor(adapter, objectHelper, eventEmitter) {
        super(adapter, objectHelper, eventEmitter);
        this.clients = {};
    }

    listen() {
        const devices = Array.isArray(this.adapter.config.httpDevices) ? this.adapter.config.httpDevices : [];
        const enabledDevices = devices.filter(device => device && device.ip && device.enabled !== false);

        if (enabledDevices.length === 0) {
            this.adapter.log.warn('[HTTP] No HTTP polling devices configured');
            return;
        }

        for (const device of enabledDevices) {
            if (this.clients[device.ip]) {
                continue;
            }
            const client = new HTTPPollingClient(this.adapter, this.objectHelper, this.eventEmitter, device);
            this.clients[device.ip] = client;
            client.start();
        }
    }

    destroy() {
        super.destroy();
        for (const ip in this.clients) {
            this.clients[ip].destroy();
            delete this.clients[ip];
        }
    }
}

module.exports = {
    HTTPPollingServer,
};
