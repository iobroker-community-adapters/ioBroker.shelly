/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core');
const objectHelper = require('@apollon/iobroker-tools').objectHelper; // Get common adapter utils
const mqttServer = require(__dirname + '/lib/mqtt');
const coapServer = require(__dirname + '/lib/coap');
const adapterName = require('./package.json').name.split('.').pop();
const tcpPing = require('tcp-ping');
const events = require('events');
const eventEmitter = new events.EventEmitter();

class Shelly extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.serverMqtt = null;
        this.serverCoap = null;
        this.pollTimeout = null;

        this.onlineDevices = {};

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        try {
            this.log.info('Starting Adapter ' + this.namespace + ' in version ' + this.version);

            /*
            this.config.polltime = Number(this.config.polltime) || 0;
            if (this.config.polltime > 0) {
                this.log.info('Polltime of the shelly devices: ' + this.config.polltime + ' sec.');
            } else {
                this.log.info('Polltime of the shelly devices: ' + this.config.polltime + ' sec.');
            }
            */

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

            setImmediate(() => {
                if (protocol === 'both' || protocol === 'mqtt') {
                    this.log.info('Starting in MQTT mode. Listening on ' + this.config.bind + ':' + this.config.port);

                    if (!this.config.mqttusername || this.config.mqttusername.length === 0) { this.log.error('MQTT Username is missing!'); }
                    if (!this.config.mqttpassword || this.config.mqttpassword.length === 0) { this.log.error('MQTT Password is missing!'); }

                    this.serverMqtt = new mqttServer.MQTTServer(this, objectHelper, eventEmitter);
                    this.serverMqtt.listen();
                }
            });

            setImmediate(() => {
                if (protocol === 'both' || protocol === 'coap') {
                    this.log.info('Starting in CoAP mode.');
                    this.serverCoap = new coapServer.CoAPServer(this, objectHelper, eventEmitter);
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

            this.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
            this.log.debug('stateChange ' + id + ' = ' + state.val);

            objectHelper.handleStateChange(id, state);

            if (stateId === 'info.update') {
                eventEmitter.emit('onFirmwareUpdate');
            }
        }
    }

    onMessage(msg) {
        this.sendTo(msg.from, msg.command, 'Execute command ' + msg.command, msg.callback);
    }

    onUnload(callback) {
        if (this.pollTimeout) {
            this.clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }

        this.setOnlineFalse();

        try {
            this.log.info('Closing Adapter');

            if (this.serverCoap) {
                try {
                    this.serverCoap.destroy();
                } catch (err) {
                    // ignore
                }
            }

            if (this.serverMqtt) {
                try {
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

        if (this.pollTimeout) {
            this.clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }

        try {
            const idsOnline = await this.getAllDevices();
            for (const i in idsOnline) {
                const idOnline = idsOnline[i];
                const idParent = idOnline.split('.').slice(0, -1).join('.');
                const idHostname = idParent + '.hostname';
                const stateHostaname = await this.getStateAsync(idHostname);
                const valHostname = stateHostaname ? stateHostaname.val : undefined;

                if (valHostname) {
                    this.log.debug(`onlineCheck of ${idHostname} on ${valHostname}:${valPort}`);

                    tcpPing.probe(valHostname, valPort, async (error, isAlive) => {
                        if (isAlive) {
                            this.onlineDevices[idParent] = true;
                        } else if (Object.prototype.hasOwnProperty.call(this.onlineDevices, idParent)) {
                            delete this.onlineDevices[idParent];
                        }

                        const oldState = await this.getStateAsync(idOnline);
                        const oldValue = oldState && oldState.val ? (oldState.val === 'true' || oldState.val === true) : false;

                        if (oldValue != isAlive) {
                            this.log.debug(`onlineCheck of ${idHostname} changed to ${isAlive}`);
                            await this.setStateAsync(idOnline, { val: isAlive, ack: true });
                        }
                    });

                } else {
                    this.log.warn(`onlineCheck of ${idHostname} failed - state is empty (no hostname)`);
                }
            }
        } catch (e) {
            this.log.error(e.toString());
        }

        // Check online devices
        if (Object.keys(this.onlineDevices).length > 0) {
            this.setStateAsync('info.connection', true, true);
        } else {
            this.setStateAsync('info.connection', false, true);
        }

        this.pollTimeout = this.setTimeout(() => {
            this.pollTimeout = null;
            this.onlineCheck();
        }, this.config.polltime * 1000);
    }

    async getAllDevices() {
        const ids = [];
        try {
            const objs = await this.getAdapterObjectsAsync();
            for (const id in objs) {
                const obj = objs[id];
                if (id && id.endsWith('.online') && obj && obj.type === 'state') {
                    ids.push(id);
                }
            }
        } catch (error) {
            //
        }
        return ids;
    }

    async setOnlineFalse() {
        const idsOnline = await this.getAllDevices();
        for (const i in idsOnline) {
            const idOnline = idsOnline[i];
            await this.setForeignStateAsync(idOnline, { val: false, ack: true });
        }
    }

    /*
    async deleteObjects() {
        try {
            // delete online States
            const idsOnline = await this.getAllDevices();
            for (const i in idsOnline) {
                const idOnline = idsOnline[i];
                //let a = await this.delForeignStateAsync(idOnline);
                const a = await this.delForeignObjectAsync(idOnline);
                const idParent = idOnline.split('.').slice(0, -1).join('.');
            }
        } catch (error) {
            //
        }
    }
    */

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
            native.blacklist = this.config.keys.map(b => { return { id: b.blacklist } });
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