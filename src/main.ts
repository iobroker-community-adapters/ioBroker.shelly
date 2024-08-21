import * as utils from '@iobroker/adapter-core';

import { probe } from '@network-utils/tcp-ping';
import { EventEmitter } from 'node:events';
import { Manager } from './lib/manager';
import { MQTTServer } from './lib/server/mqtt';

class Shelly extends utils.Adapter {
    private isUnloaded: boolean;
    private serverMqtt: null | MQTTServer;
    private firmwareUpdateTimeout: ioBroker.Timeout | undefined;
    private onlineCheckTimeout: ioBroker.Timeout | undefined;
    private eventEmitter: EventEmitter | undefined;
    private manager: Manager | undefined;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'shelly',
        });

        this.isUnloaded = false;

        this.serverMqtt = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    private async onReady(): Promise<void> {
        this.eventEmitter = new EventEmitter();
        this.manager = new Manager(this, this.eventEmitter);

        try {
            await this.mkdirAsync(this.namespace, 'scripts');

            this.subscribeStates('*');
            // objectHelper.init(this);

            const protocol = this.config.protocol || 'mqtt';

            await this.setOnlineFalse();

            // Start online check
            await this.onlineCheck();

            // Start MQTT server
            setImmediate(() => {
                if (protocol === 'both' || protocol === 'mqtt') {
                    this.log.info(`Starting in MQTT mode. Listening on ${this.config.bind}:${this.config.port} (QoS ${this.config.qos})`);

                    if (!this.config.mqttusername || this.config.mqttusername.length === 0) {
                        this.log.error('MQTT Username is missing!');
                    }
                    if (!this.config.mqttpassword || this.config.mqttpassword.length === 0) {
                        this.log.error('MQTT Password is missing!');
                    }

                    this.serverMqtt = new MQTTServer(this, this.manager!);
                    this.serverMqtt.listen();
                }
            });

            if (this.config.autoupdate) {
                this.log.info(`[firmwareUpdate] Auto-Update enabled - devices will be updated automatically`);

                // Wait 10 seconds for devices to connect
                this.setTimeout(() => this.autoFirmwareUpdate(), 10 * 1000);
            }
        } catch (err) {
            this.log.error(`[onReady] Startup error: ${err}`);
        }
    }

    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        // Warning, state can be null if it was deleted
        if (state && !state.ack) {
            const stateId = id.replace(`${this.namespace}.`, '');

            if (stateId === 'info.update') {
                this.log.debug(`[onStateChange] "info.update" state changed - starting update on every device`);

                this.eventEmitter!.emit('onFirmwareUpdate');
            } else if (stateId === 'info.downloadScripts') {
                this.log.debug(`[onStateChange] "info.downloadScripts" state changed - starting script download of every device`);

                this.eventEmitter!.emit('onScriptDownload');
            } else if (!this.isUnloaded) {
                this.log.debug(`[onStateChange] "${id}" state changed: ${JSON.stringify(state)} - forwarding to objectHelper`);

                //if (objectHelper) {
                //    objectHelper.handleStateChange(id, state);
                //}
            }
        }
    }

    private onUnload(callback: () => void): void {
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

            if (this.serverMqtt) {
                try {
                    this.log.debug(`[onUnload] Stopping MQTT server`);
                    // this.serverMqtt.destroy();
                } catch {
                    // ignore
                }
            }

            callback();
        } catch {
            // this.log.error('Error');
            callback();
        }
    }

    /**
     * Online-Check via TCP ping (when using CoAP)
     */
    async onlineCheck(): Promise<void> {
        const valPort = 80;

        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        try {
            const deviceIds = await this.getAllDeviceIds();
            for (const d in deviceIds) {
                const deviceId = deviceIds[d];

                const idHostname = `${deviceId}.hostname`;

                const stateHostaname = await this.getStateAsync(idHostname);
                const valHostname = stateHostaname ? stateHostaname.val : undefined;

                if (valHostname) {
                    this.log.debug(`[onlineCheck] Checking ${deviceId} on ${valHostname}:${valPort}`);

                    try {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const isAlive = await probe(valPort, String(valHostname));
                        //this.deviceStatusUpdate(deviceId, isAlive);
                    } catch (err) {
                        this.log.warn(`[onlineCheck] Failed for ${deviceId} on ${valHostname}:${valPort}: ${err}`);
                    }
                }
            }
        } catch (e) {
            this.log.error(e.toString());
        }

        this.onlineCheckTimeout = this.setTimeout(() => {
            this.onlineCheckTimeout = null;
            this.onlineCheck();
        }, 60 * 1000); // Restart online check in 60 seconds
    }

    /*
    async deviceStatusUpdate(deviceId: string, status: boolean): Promise<void> {
        if (this.isUnloaded) return;
        if (!deviceId) return;

        this.log.debug(`[deviceStatusUpdate] ${deviceId}: ${status}`);

        // Check if device object exists
        const knownDeviceIds = await this.getAllDeviceIds();
        if (knownDeviceIds.indexOf(deviceId) === -1) {
            this.log.silly(`[deviceStatusUpdate] ${deviceId} is not in list of known devices: ${JSON.stringify(knownDeviceIds)}`);
            return;
        }

        // Update online status
        const idOnline = `${deviceId}.online`;
        const onlineState = await this.getStateAsync(idOnline);

        if (onlineState) {
            // Compare to previous value
            const prevValue = onlineState.val ? onlineState.val === 'true' || onlineState.val === true : false;

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
            this.log.debug(`[deviceStatusUpdate] Online devices: ${JSON.stringify(Object.keys(this.onlineDevices))}`);
            if (newOnlineDeviceCount > 0) {
                await this.setStateAsync('info.connection', { val: true, ack: true });
            } else {
                await this.setStateAsync('info.connection', { val: false, ack: true });
            }
        }
    }
    */

    async getAllDeviceIds(): Promise<string[]> {
        const devices = await this.getDevicesAsync();
        return devices.map((device) => this.removeNamespace(device._id));
    }

    async setOnlineFalse(): Promise<void> {
        const deviceIds = await this.getAllDeviceIds();
        for (const d in deviceIds) {
            const deviceId = deviceIds[d];
            const idOnline = `${deviceId}.online`;
            const onlineState = await this.getStateAsync(idOnline);

            if (onlineState) {
                await this.setState(idOnline, { val: false, ack: true });
            }

            await this.extendObject(deviceId, {
                common: {
                    color: undefined, // Remove color from previous versions
                },
            });
        }

        await this.setState('info.connection', { val: false, ack: true });
    }

    autoFirmwareUpdate(): void {
        if (this.isUnloaded) return;
        if (this.config.autoupdate) {
            this.log.debug(`[firmwareUpdate] Starting update on every device`);

            this.eventEmitter!.emit('onFirmwareUpdate');

            this.firmwareUpdateTimeout = this.setTimeout(
                () => {
                    this.firmwareUpdateTimeout = null;
                    this.autoFirmwareUpdate();
                },
                15 * 60 * 1000,
            ); // Restart firmware update in 60 Seconds
        }
    }

    removeNamespace(id: string): string {
        const re = new RegExp(`${this.namespace}*\\.`, 'g');
        return id.replace(re, '');
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Shelly(options);
} else {
    // otherwise start the instance directly
    (() => new Shelly())();
}
