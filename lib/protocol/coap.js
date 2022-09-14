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
 * @param {object|string} objkey - like 112 or '112' or [11,12] or ['11','12']
 * @param {array} payload - [[0,111,0],[0,112,1]]
 */
function getCoapValue(objkey, payload) {
    const isArray = (typeof objkey !== 'string' && typeof objkey !== 'number');
    if (!isArray) {
        const key = Number(objkey);
        const index = payload.findIndex((item) => item[1] === key);
        return index >= 0 ? payload[index][2] : undefined;
    } else {
        const ret = [];
        for (const i in objkey) {
            const key = Number(objkey[i]);
            const index = payload.findIndex((item) => item[1] === key);
            if (index >= 0) { ret.push(payload[index][2]); } else { ret.push(undefined); }
        }
        return ret;
    }
}

class CoAPClient extends BaseClient {
    constructor(adapter, objectHelper, eventEmitter, shelly, deviceId, ip, payload, description) {

        super('coap', adapter, objectHelper, eventEmitter);

        this.shelly = shelly;

        this.deviceId = deviceId;     // e.g. SHRGBW2#D88040#2
        this.ip = ip;                 // e.g. 192.168.1.2

        // Device Mode information (init)
        this.deviceMode = getCoapValue('9101', payload.G); // 9101 = Mode

        this.adapter.log.debug(`[CoAP] Starting new client. Device ID: "${this.deviceId}", Device Mode: "${this.deviceMode}", IP: ${this.ip}`);
        this.start(payload, description);
    }

    /**
     * Get the ID of the Shelly device
     * Example: shellyplug-s-12345
     */
    getId() {
        if (!this.id) {
            const deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
            const serialId = this.getSerialId();
            if (deviceClass && serialId) {
                this.id = deviceClass + '-' + serialId;
            }
        }
        return this.id;
    }

    /**
     * Get the Shelly device type without serial number
     * Example: SHRGBW2
     */
    getDeviceType() {
        if (!this.deviceType) {
            const deviceId = this.getDeviceId();
            if (typeof deviceId === 'string') {
                this.deviceType = deviceId.split('#').slice(0, 1).join(); // SHRGBW2#D88040#1 -> SHRGBW2
            }
        }
        return this.deviceType;
    }

    /**
     * Device id without serial number
     * Example: shellyplug-s
     */
    getDeviceClass() {
        if (!this.deviceClass) {
            this.deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
        }
        return this.deviceClass;
    }

    /**
     * Serial id of the Shelly device
     * Example: shellyplug-s-12345
     */
    getSerialId() {
        if (!this.serialId) {
            const deviceId = this.getDeviceId();
            if (typeof deviceId === 'string') {
                const deviceType = deviceId.split('#');
                if (deviceType) this.serialId = deviceType[1];
            }
        }
        return this.serialId;
    }

    /**
     * Cleanup, destroy this object
     */
    destroy() {
        super.destroy();
        this.adapter.log.debug(`[CoAP] Destroying: ${this.getLogInfo()}`);
        this.adapter.deviceStatusUpdate(this.getDeviceId(), false); // Device offline

        if (this.listenerus) this.shelly.removeListener('update-device-status', this.listenerus);
        if (this.listenerds) this.shelly.removeListener('device-connection-status', this.listenerds);
    }

    getDevices() {
        const states = [];
        for (const i in this.device) {
            const state = this.device[i];

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
        this.adapter.log.debug(`[CoAP] Message for ${this.getLogInfo()}: ${JSON.stringify(payload)}`);
        const dps = this.getDevices();
        for (const i in dps) {
            const dp = dps[i];
            const deviceId = this.getDeviceId();
            const stateid = `${deviceId}.${dp.state}`;
            let value = payload;

            this.adapter.log.silly(`[CoAP] Message with value for ${this.getLogInfo()}: state: ${stateid}, payload: ${JSON.stringify(payload)}`);

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
                        this.adapter.log.debug(`[CoAP] State change ${this.getLogInfo()}: state: ${stateid}, value: ${JSON.stringify(value)}`);
                        this.states[stateid] = value;
                        this.objectHelper.setOrUpdateObject(stateid, {
                            type: 'state',
                            common: dp.common,
                        }, ['name'], value);

                    }
                }
            } catch (error) {
                this.adapter.log.error(`[CoAP] Error ${error} in function dp.coap.coap_publish_funct of state ${stateid} for ${this.getLogInfo()}`);
            }
        }
        this.objectHelper.processObjectQueue(() => { });
    }

    async start(payload, description) {
        if (this.deviceExists()) { // needs getDeviceClass()
            const polltime = this.getPolltime();
            if (polltime > 0) {
                this.adapter.log.info(`[CoAP] Device ${this.getLogInfo()} connected! Polltime set to ${polltime} sec.`);
            } else {
                this.adapter.log.info(`[CoAP] Device ${this.getLogInfo()} connected! No polling`);
            }

            this.adapter.log.debug(`[CoAP] 1. Shelly device info for ${this.getDeviceId()}: ${JSON.stringify(description)}`);
            this.adapter.log.debug(`[CoAP] 2. Shelly device info for ${this.getDeviceId()}: ${JSON.stringify(payload)}`);

            // Device Mode information (init)
            await this.initDeviceModeFromState();

            await this.deleteOldStates();
            await this.createObjects();

            // Fill hostname
            await this.adapter.setStateAsync(this.getDeviceId() + '.hostname', { val: this.getIP(), ack: true });
            this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online

            this.httpIoBrokerState();

            if (payload) this.createIoBrokerState(payload);

            this.listener();
        } else {
            this.adapter.log.error(`[CoAP] Device unknown, configuration for Shelly device ${this.getLogInfo()} does not exist!`);
            this.adapter.log.error(`[CoAP] 1. Send developer following info for ${this.getDeviceId()}: ${JSON.stringify(description)}`);
            this.adapter.log.error(`[CoAP] 2. Send developer following info for ${this.getDeviceId()}: ${JSON.stringify(payload)}`);
        }
    }

    listener() {
        this.shelly.on('error', (err) => {
            this.adapter.log.debug(`[CoAP] Listener - error handling data: ${err}`);
        });

        this.shelly.on('update-device-status', this.listenerus = async (deviceId, payload) => {
            if (this.getOldDeviceInfo(deviceId) === this.getDeviceId()) {

                // Device Mode information (new)
                const newDeviceMode = getCoapValue('9101', payload.G); // 9101 = Mode
                if (newDeviceMode) {
                    await this.setDeviceMode(newDeviceMode);
                }

                this.createIoBrokerState(payload);
            }
        });

        this.shelly.on('device-connection-status', this.listenerds = (deviceId, connected) => {
            this.adapter.log.debug(`[CoAP] Connection update received for ${deviceId}: ${connected}`);
            if (this.getOldDeviceInfo(deviceId) === this.getDeviceId()) {
                this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online
            }
        });
    }
}

class CoAPServer extends BaseServer {

    constructor(adapter, objectHelper, eventEmitter) {
        // if (!(this instanceof CoAPServer)) return new CoAPServer(adapter, objectHelper, eventEmitter);

        super(adapter, objectHelper, eventEmitter);

        this.clients = {};
        this.blacklist = {};
    }

    isBlackListed(deviceId) {
        if (deviceId && this.blacklist[deviceId]) {
            return true;
        }
        if (deviceId && this.adapter.config.blacklist) {
            for (const i in this.adapter.config.blacklist) {
                const key = this.adapter.config.blacklist[i];
                if (key.id && deviceId) {
                    const reg = new RegExp(key.id, 'gm');
                    const res = deviceId.match(reg);
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
                multicastInterface: null,
            };
        } else {
            options = {
                logger: this.adapter.log.debug,
            };
        }

        if (this.adapter.config.coapbind && this.adapter.config.coapbind != '0.0.0.0') {
            options.multicastInterface = this.adapter.config.coapbind;
        }

        this.adapter.log.debug(`[CoAP Server] Starting shelly listener with options: ${JSON.stringify(options)}`);
        const shelly = new Shelly(options);

        shelly.on('error', (err) => {
            this.adapter.log.debug(`[CoAP Server] Error - handling data: ${err}`);
        });

        shelly.on('update-device-status', (deviceId, status) => {
            this.adapter.log.debug(`[CoAP Server] Status update received for ${deviceId}: ${JSON.stringify(status)}`);

            if (deviceId && typeof deviceId === 'string') {
                shelly.getDeviceDescription(deviceId, (err, deviceId, description, ip) => {
                    if (!err && deviceId && ip) {
                        // if ip address change of coap device change
                        if (this.clients[deviceId] && this.clients[deviceId].getIP() !== ip) {
                            this.clients[deviceId].destroy();
                            delete this.clients[deviceId];
                        }

                        if (!this.clients[deviceId]) {
                            if (!this.isBlackListed(deviceId) && !this.isBlackListed(ip)) {
                                this.clients[deviceId] = new CoAPClient(this.adapter, this.objectHelper, this.eventEmitter, shelly, deviceId, ip, status, description);
                            }
                        }
                    }
                });
            } else {
                this.adapter.log.debug(`[CoAP Server] Device ID is missing: ${deviceId}`);
            }
        });

        shelly.on('disconnect', () => {
            for (const i in this.clients) {
                this.clients[i].destroy();
                delete this.clients[i];
            }
        });

        shelly.listen(() => {
            this.adapter.log.info('[CoAP Server] Listening for packets in the network');
        });
    }

    destroy() {
        super.destroy();
        this.adapter.log.debug(`[CoAP Server] Destroying`);

        // TODO: Disconnect all clients
    }
}

module.exports = {
    CoAPServer: CoAPServer,
};
