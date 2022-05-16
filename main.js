'use strict';

const utils = require('@iobroker/adapter-core');
const objectHelper = require('@apollon/iobroker-tools').objectHelper; // Common adapter utils
const protocolMqtt = require(__dirname + '/lib/protocol/mqtt');
const protocolCoap = require(__dirname + '/lib/protocol/coap');
const adapterName = require('./package.json').name.split('.').pop();
const tcpPing = require('tcp-ping');
const EventEmitter = require('events').EventEmitter;

class Shelly extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.isUnloaded = false;

        this.serverMqtt = null;
        this.serverCoap = null;
        this.firmwareUpdateTimeout = null;
        this.onlineCheckTimeout = null;

        this.onlineDevices = {};

        this.eventEmitter = new EventEmitter();

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));

        this.on('deviceStatusUpdate', this.onDeviceStatusUpdate.bind(this));
    }

    async onReady() {
        try {
            // Upgrade older config
            if (await this.migrateConfig()) {
                return;
            }

            this.subscribeStates('*');
            objectHelper.init(this);

            const protocol = this.config.protocol || 'coap';

            // Start online check
            await this.setOnlineFalse();
            this.onlineCheck();

            this.autoFirmwareUpdate();

            // Start MQTT server
            setImmediate(() => {
                if (protocol === 'both' || protocol === 'mqtt') {
                    this.log.info(`Starting in MQTT mode. Listening on ${this.config.bind}:${this.config.port}`);

                    if (!this.config.mqttusername || this.config.mqttusername.length === 0) { this.log.error('MQTT Username is missing!'); }
                    if (!this.config.mqttpassword || this.config.mqttpassword.length === 0) { this.log.error('MQTT Password is missing!'); }

                    this.serverMqtt = new protocolMqtt.MQTTServer(this, objectHelper, this.eventEmitter);
                    this.serverMqtt.listen();
                }
            });

            // Start CoAP server
            setImmediate(() => {
                if (protocol === 'both' || protocol === 'coap') {
                    this.log.info('Starting in CoAP mode.');
                    this.serverCoap = new protocolCoap.CoAPServer(this, objectHelper, this.eventEmitter);
                    this.serverCoap.listen();
                }
            });

        } catch (error) {
            // ...
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        // Warning, state can be null if it was deleted
        if (state && !state.ack) {
            const stateId = id.replace(this.namespace + '.', '');

            this.log.debug(`[onStateChange] ${id}: ${JSON.stringify(state)}`);

            objectHelper.handleStateChange(id, state);

            if (stateId === 'info.update') {
                this.log.debug(`[onStateChange] info.update state changed - starting update on every device`);

                this.eventEmitter.emit('onFirmwareUpdate');
            }
        }
    }

    onMessage(msg) {
        this.sendTo(msg.from, msg.command, 'Execute command ' + msg.command, msg.callback);
    }

    onUnload(callback) {
        this.isUnloaded = true;

        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        this.setOnlineFalse();

        if (this.firmwareUpdateTimeout) {
            this.clearTimeout(this.firmwareUpdateTimeout);
            this.firmwareUpdateTimeout = null;
        }

        try {
            this.log.debug('[onUnload] Closing adapter');

            if (this.serverCoap) {
                try {
                    this.log.debug(`[onUnload] Stopping CoAP server`);
                    this.serverCoap.destroy();
                } catch (err) {
                    // ignore
                }
            }

            if (this.serverMqtt) {
                try {
                    this.log.debug(`[onUnload] Stopping MQTT server`);
                    this.serverMqtt.destroy();
                } catch (err) {
                    // ignore
                }
            }

            callback();
        } catch (e) {
            // this.log.error('Error');
            callback();
        }
    }

    async onlineCheck() {
        const valPort = 80;

        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        try {
            const deviceIds = await this.getAllDevices();
            for (const d in deviceIds) {
                const deviceId = deviceIds[d];

                const idHostname = deviceId + '.hostname';

                const stateHostaname = await this.getStateAsync(idHostname);
                const valHostname = stateHostaname ? stateHostaname.val : undefined;

                if (valHostname) {
                    this.log.debug(`[onlineCheck] Checking ${idHostname} on ${valHostname}:${valPort}`);

                    tcpPing.probe(valHostname, valPort, async (error, isAlive) => {
                        this.emit('deviceStatusUpdate', deviceId, isAlive);
                    });
                }
            }
        } catch (e) {
            this.log.error(e.toString());
        }

        this.onlineCheckTimeout = this.setTimeout(() => {
            this.onlineCheckTimeout = null;
            this.onlineCheck();
        }, 60 * 1000); // Restart online check in 60 Seconds
    }

    async onDeviceStatusUpdate(deviceId, status) {
        if (this.isUnloaded) return;
        if (!deviceId) return;

        this.log.debug(`[onDeviceStatusUpdate] ${deviceId}: ${status}`);

        // Check if device object exists
        const knownDevices = await this.getAllDevices();
        if (knownDevices.indexOf(deviceId) === -1) {
            this.log.silly(`[onDeviceStatusUpdate] ${deviceId} is not in list of known devices: ${JSON.stringify(knownDevices)}`);
            return;
        }

        // Update online status
        const idOnline = `${deviceId}.online`;
        const onlineState = await this.getStateAsync(idOnline);

        if (onlineState) {
            const prevValue = onlineState.val ? (onlineState.val === 'true' || onlineState.val === true) : false;

            if (prevValue != status) {
                await this.setStateAsync(idOnline, { val: status, ack: true });
            }
        }

        // Update connection state
        const oldOnlineDeviceCount = Object.keys(this.onlineDevices).length;

        if (status) {
            this.onlineDevices[deviceId] = true;
        } else if (Object.prototype.hasOwnProperty.call(this.onlineDevices, deviceId)) {
            delete this.onlineDevices[deviceId];
        }

        const newOnlineDeviceCount = Object.keys(this.onlineDevices).length;

        // Check online devices
        if (oldOnlineDeviceCount !== newOnlineDeviceCount) {
            this.log.debug(`[onDeviceStatusUpdate] Online devices: ${JSON.stringify(Object.keys(this.onlineDevices))}`);
            if (newOnlineDeviceCount > 0) {
                this.setStateAsync('info.connection', true, true);
            } else {
                this.setStateAsync('info.connection', false, true);
            }
        }
    }

    isOnline(deviceId) {
        return Object.prototype.hasOwnProperty.call(this.onlineDevices, deviceId);
    }

    async getAllDevices() {
        const devices = await this.getDevicesAsync();
        return devices.map(device => this.removeNamespace(device._id));
    }

    async setOnlineFalse() {
        const deviceIds = await this.getAllDevices();
        for (const d in deviceIds) {
            const deviceId = deviceIds[d];
            const idOnline = `${deviceId}.online`;
            const onlineState = await this.getStateAsync(idOnline);

            if (onlineState) {
                const prevValue = onlineState.val ? (onlineState.val === 'true' || onlineState.val === true) : false;

                if (prevValue) {
                    await this.setStateAsync(idOnline, { val: false, ack: true });
                }
            }

            await this.extendObjectAsync(deviceId, {
                common: {
                    color: null // Remove color from previous versions
                }
            });
        }

        this.onlineDevices = {};
        this.setStateAsync('info.connection', false, true);
    }

    autoFirmwareUpdate() {
        if (this.isUnloaded) return;
        if (this.config.autoupdate) {
            this.log.debug(`[firmwareUpdate] Auto-Update enabled - starting update on every device`);

            this.eventEmitter.emit('onFirmwareUpdate');

            this.firmwareUpdateTimeout = this.setTimeout(() => {
                this.firmwareUpdateTimeout = null;
                this.autoFirmwareUpdate();
            }, 15 * 60 * 1000); // Restart firmware update in 60 Seconds
        }
    }

    removeNamespace(id) {
        const re = new RegExp(this.namespace + '*\\.', 'g');
        return id.replace(re, '');
    }

    async migrateConfig() {
        const native = {};
        if (this.config.http_username) {
            native.httpusername = this.config.http_username;
            native.http_username = '';
        }
        if (this.config.http_password) {
            native.httppassword = this.config.http_password;
            native.http_password = '';
        }
        if (this.config.user) {
            native.mqttusername = this.config.user;
            native.user = '';
        }
        if (this.config.password) {
            native.mqttpassword = this.config.password;
            native.password = '';
        }
        if (this.config.keys) {
            native.blacklist = this.config.keys.map(b => { return { id: b.blacklist }; });
            native.keys = null;
        }

        if (Object.keys(native).length) {
            this.log.info('Migrate some data from old Shelly Adapter version. Restarting Shelly Adapter now!');
            await this.extendForeignObjectAsync('system.adapter.' + this.namespace, { native: native });

            return true;
        }

        return false;
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Shelly(options);
} else {
    // otherwise start the instance directly
    new Shelly();
}