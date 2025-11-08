'use strict';

const crypto = require('node:crypto');
const utils = require('@iobroker/adapter-core');
const DeviceRegistry = require('./lib/deviceRegistry');
const ShellyRpcClient = require('./lib/protocol/rpc');
const objectHelper = require('@apollon/iobroker-tools').objectHelper;
const protocolMqtt = require('./lib/protocol/mqtt');
const protocolCoap = require('./lib/protocol/coap');
const BleDecoder = require('./lib/ble-decoder').BleDecoder;
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
        this.gen2PollIntervals = {};
        this.gen2Devices = new Set(); // Tracking für Gen2-Geräte

        this.eventEmitter = new EventEmitter();
        this.bleDecoder = new BleDecoder();

        // Hybrid-Logik: Registry und RPC-Client
        this.registry = new DeviceRegistry(this.log);
        this.rpc = new ShellyRpcClient(this.log);

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('fileChange', this.onFileChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        try {
            // Upgrade older config
            if (await this.migrateConfig()) {
                return;
            }

            this.eventEmitter.setMaxListeners(Infinity);

            await this.mkdirAsync(this.namespace, 'scripts');
            await this.subscribeForeignFiles(this.namespace, '*');

            this.subscribeStates('*');
            objectHelper.init(this);

            await this.setStateAsync('info.connection', { val: false, ack: true });

            // Start online check
            await this.onlineCheck();

            // Start MQTT/CoAP Server für Gen1-Geräte
            await this.initProtocolServersForGen1();

            // Discover und attach devices (Gen2/Gen3 via RPC)
            await this.discoverAndAttachDevices();

            if (this.config.autoupdate) {
                this.log.info(`[firmwareUpdate] Auto-Update enabled - devices will be updated automatically`);
                this.setTimeout(() => this.autoFirmwareUpdate(), 10 * 1000);
            } else {
                this.setTimeout(() => this.firmwareNotify(), 10 * 1000);
            }

            this.log.info('Shelly Adapter ready - Hybrid mode (Gen1: MQTT/CoAP, Gen2+: RPC)');
        } catch (e) {
            this.log.error(`[onReady] Startup error: ${e.message}`);
            this.log.error(e.stack);
        }
    }

    /**
     * Start MQTT/CoAP servers for Gen1 devices
     */
    async initProtocolServersForGen1() {
        const protocol = this.config.protocol || 'both';

        // Start MQTT server for Gen1
        if (protocol === 'both' || protocol === 'mqtt') {
            this.log.info(
                `Starting MQTT server for Gen1 devices on ${this.config.bind}:${this.config.port} (QoS ${this.config.qos})`,
            );

            if (!this.config.mqttusername || this.config.mqttusername.length === 0) {
                this.log.error('MQTT Username is missing!');
            }
            if (!this.config.mqttpassword || this.config.mqttpassword.length === 0) {
                this.log.error('MQTT Password is missing!');
            }

            this.serverMqtt = new protocolMqtt.MQTTServer(this, objectHelper, this.eventEmitter);
            this.serverMqtt.listen();
        }

        // Start CoAP server for Gen1
        if (protocol === 'both' || protocol === 'coap') {
            this.log.info(`Starting CoAP server for Gen1 devices on ${this.config.coapbind}:5683`);
            this.serverCoap = new protocolCoap.CoAPServer(this, objectHelper, this.eventEmitter);
            this.serverCoap.listen();
        }
    }

    /**
     * Discover devices and attach them based on generation
     */
    async discoverAndAttachDevices() {
        const devices = await this.getConfiguredDevices();
        
        if (devices.length === 0) {
            this.log.info('No devices configured for discovery');
            return;
        }

        this.log.info(`Starting device discovery for ${devices.length} configured device(s)`);

        for (const dev of devices) {
            try {
                this.log.debug(`Detecting device at ${dev.ip}...`);
                const meta = await this.registry.detect(dev.ip);

                if (meta.gen === 'gen2' || meta.gen === 'gen3') {
                    await this.attachGen2Device(dev.ip, meta);
                    this.log.info(`✓ ${dev.ip} (${meta.model || 'Unknown'}, ${meta.gen}) attached via RPC`);
                } else if (meta.gen === 'gen1') {
                    this.log.info(`✓ ${dev.ip} (${meta.model || 'Unknown'}, Gen1) will use MQTT/CoAP`);
                    // Gen1 devices announce themselves via MQTT/CoAP - no direct attachment needed
                } else {
                    this.log.warn(`⚠ Device ${dev.ip} could not be identified (gen: ${meta.gen})`);
                }
            } catch (e) {
                this.log.error(`✗ Failed to detect/attach device ${dev.ip}: ${e.message}`);
            }
        }
    }

    /**
     * Attach Gen2/Gen3 device via RPC
     */
    async attachGen2Device(ip, meta) {
        const deviceId = await this.getDeviceIdFromMeta(ip, meta);
        
        if (!deviceId) {
            this.log.error(`Could not determine device ID for ${ip}`);
            return;
        }

        this.gen2Devices.add(deviceId);

        try {
            // Create device objects
            await this.createGen2DeviceObjects(deviceId, meta, ip);

            // Get initial status via RPC
            const status = await this.rpc.getStatus(ip);
            await this.updateGen2DeviceStates(deviceId, status);

            // Start polling
            this.startGen2Polling(deviceId, ip);

            this.log.debug(`Gen2 device ${deviceId} successfully attached`);
        } catch (e) {
            this.log.error(`Failed to attach Gen2 device ${ip}: ${e.message}`);
        }
    }

    /**
     * Create device objects for Gen2 device
     */
    async createGen2DeviceObjects(deviceId, meta, ip) {
        // Create device
        await this.extendObject(deviceId, {
            type: 'device',
            common: {
                name: meta.model || deviceId,
            },
            native: {
                gen: meta.gen,
                model: meta.model,
                ip: ip,
            },
        });

        // Create standard states
        await this.setObjectNotExistsAsync(`${deviceId}.hostname`, {
            type: 'state',
            common: {
                name: 'Hostname / IP',
                type: 'string',
                role: 'info.ip',
                read: true,
                write: false,
            },
            native: {},
        });

        await this.setState(`${deviceId}.hostname`, { val: ip, ack: true });

        await this.setObjectNotExistsAsync(`${deviceId}.online`, {
            type: 'state',
            common: {
                name: 'Online',
                type: 'boolean',
                role: 'indicator.reachable',
                read: true,
                write: false,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync(`${deviceId}.firmware`, {
            type: 'state',
            common: {
                name: 'Has Firmware Update',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: false,
            },
            native: {},
        });
    }

    /**
     * Update Gen2 device states from RPC status
     */
    async updateGen2DeviceStates(deviceId, status) {
        if (!status) return;

        // Update switch states (if available)
        if (status.switch) {
            for (let i = 0; i < status.switch.length; i++) {
                const sw = status.switch[i];
                const channel = `${deviceId}.Switch:${i}`;

                await this.setObjectNotExistsAsync(`${channel}.Output`, {
                    type: 'state',
                    common: {
                        name: `Switch ${i} Output`,
                        type: 'boolean',
                        role: 'switch',
                        read: true,
                        write: true,
                    },
                    native: {},
                });

                await this.setState(`${channel}.Output`, { val: !!sw.output, ack: true });

                if (typeof sw.apower === 'number') {
                    await this.setObjectNotExistsAsync(`${channel}.Power`, {
                        type: 'state',
                        common: {
                            name: `Switch ${i} Power`,
                            type: 'number',
                            role: 'value.power',
                            read: true,
                            write: false,
                            unit: 'W',
                        },
                        native: {},
                    });

                    await this.setState(`${channel}.Power`, { val: sw.apower, ack: true });
                }

                if (typeof sw.aenergy?.total === 'number') {
                    await this.setObjectNotExistsAsync(`${channel}.Energy`, {
                        type: 'state',
                        common: {
                            name: `Switch ${i} Energy`,
                            type: 'number',
                            role: 'value.power.consumption',
                            read: true,
                            write: false,
                            unit: 'Wh',
                        },
                        native: {},
                    });

                    await this.setState(`${channel}.Energy`, { val: sw.aenergy.total, ack: true });
                }
            }
        }

        // Update input states (if available)
        if (status.input) {
            for (let i = 0; i < status.input.length; i++) {
                const input = status.input[i];
                const channel = `${deviceId}.Input:${i}`;

                await this.setObjectNotExistsAsync(`${channel}.State`, {
                    type: 'state',
                    common: {
                        name: `Input ${i} State`,
                        type: 'boolean',
                        role: 'sensor.state',
                        read: true,
                        write: false,
                    },
                    native: {},
                });

                await this.setState(`${channel}.State`, { val: !!input.state, ack: true });
            }
        }

        // Update system info
        if (status.sys) {
            if (status.sys.available_updates) {
                await this.setState(`${deviceId}.firmware`, { 
                    val: Object.keys(status.sys.available_updates).length > 0, 
                    ack: true 
                });
            }
        }
    }

    /**
     * Start polling for Gen2 device
     */
    startGen2Polling(deviceId, ip) {
        const pollInterval = this.config.rpcPollIntervalMs || 5000;

        const poll = async () => {
            if (this.isUnloaded) return;

            try {
                const status = await this.rpc.getStatus(ip);
                await this.updateGen2DeviceStates(deviceId, status);
                await this.deviceStatusUpdate(deviceId, true);
            } catch (e) {
                this.log.debug(`RPC poll failed for ${deviceId}: ${e.message}`);
                await this.deviceStatusUpdate(deviceId, false);
            }
        };

        // Initial poll
        poll();

        // Start interval
        this.gen2PollIntervals[deviceId] = setInterval(poll, pollInterval);
        this.log.debug(`Started polling for ${deviceId} every ${pollInterval}ms`);
    }

    /**
     * Get device ID from IP and metadata
     */
    async getDeviceIdFromMeta(ip, meta) {
        try {
            // Try to get device ID from RPC
            const shelly = await this.rpc.getShelly(ip);
            if (shelly && shelly.id) {
                return shelly.id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            }
        } catch (e) {
            this.log.debug(`Could not get device ID from RPC for ${ip}: ${e.message}`);
        }

        // Fallback: use IP-based ID
        return `shelly_${ip.replace(/\./g, '_')}`;
    }

    /**
     * Get configured devices from adapter config
     */
    async getConfiguredDevices() {
        const list = Array.isArray(this.config.devices) ? this.config.devices : [];
        return list
            .filter(d => d.ip && d.ip.length > 0)
            .map(d => ({ 
                ip: d.ip.trim(), 
                name: d.name || d.ip 
            }));
    }

    /**
     * Check if device is Gen2
     */
    isGen2Device(stateId) {
        const deviceId = stateId.split('.')[0];
        return this.gen2Devices.has(deviceId);
    }

    /**
     * Get device IP from device ID
     */
    async getDeviceIp(deviceId) {
        const obj = await this.getObjectAsync(deviceId);
        return obj?.native?.ip;
    }

    /**
     * State change handler
     */
    onStateChange(id, state) {
        if (state && !state.ack) {
            const stateId = this.removeNamespace(id);

            // Check if it's a Gen2 device state
            if (this.isGen2Device(stateId)) {
                this.handleGen2StateChange(stateId, state);
            } else if (stateId === 'info.update') {
                this.log.debug(`[onStateChange] "info.update" state changed - starting update on every device`);
                this.eventEmitter.emit('onFirmwareUpdate');
            } else if (stateId === 'info.downloadScripts') {
                this.log.debug(
                    `[onStateChange] "info.downloadScripts" state changed - starting script download of every device`,
                );
                this.eventEmitter.emit('onScriptDownload');
            } else if (stateId.startsWith('ble.') && stateId.endsWith('.encryptionKey')) {
                this.log.debug(`[onStateChange] "${stateId}" state changed - checking new encryption key`);

                const encryptionKey = String(state.val).replaceAll('-', '').toUpperCase();
                if (encryptionKey.length == 32) {
                    this.setState(stateId, { val: encryptionKey, ack: true });
                }
            } else {
                this.log.debug(
                    `[onStateChange] "${id}" state changed: ${JSON.stringify(state)} - forwarding to objectHelper`,
                );

                if (objectHelper) {
                    objectHelper.handleStateChange(id, state);
                }
            }
        }
    }

    /**
     * Handle Gen2 device state changes
     */
    async handleGen2StateChange(stateId, state) {
        const parts = stateId.split('.');
        const deviceId = parts[0];
        const component = parts[1]; // e.g., "Switch:0"
        const property = parts[2];   // e.g., "Output"

        const deviceIp = await this.getDeviceIp(deviceId);

        if (!deviceIp) {
            this.log.error(`Could not find IP for device ${deviceId}`);
            return;
        }

        try {
            // Handle Switch component
            if (component && component.startsWith('Switch:')) {
                const switchId = parseInt(component.split(':')[1]);

                if (property === 'Output') {
                    await this.rpc.switchSet(deviceIp, switchId, { on: !!state.val });
                    this.log.debug(`Set ${deviceId} Switch:${switchId} to ${state.val}`);
                    
                    // Confirm state
                    await this.setState(stateId, { val: state.val, ack: true });
                }
            }
            // Add more component handlers here (Cover, Light, etc.)
        } catch (e) {
            this.log.error(`Failed to set state for ${stateId}: ${e.message}`);
        }
    }

    onFileChange(id, fileName, size) {
        this.log.debug(`[onFileChange]: id: ${id}, fileName: ${fileName}, size: ${size}`);
    }

    /**
     * Unload handler
     */
    onUnload(callback) {
        this.isUnloaded = true;

        // Stop online check
        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        // Stop firmware update check
        if (this.firmwareUpdateTimeout) {
            this.clearTimeout(this.firmwareUpdateTimeout);
            this.firmwareUpdateTimeout = null;
        }

        // Stop Gen2 polling
        if (this.gen2PollIntervals) {
            for (const [deviceId, interval] of Object.entries(this.gen2PollIntervals)) {
                this.clearInterval(interval);
                this.log.debug(`Stopped polling for ${deviceId}`);
            }
            this.gen2PollIntervals = {};
        }

        // Close RPC connections
        if (this.rpc) {
            try {
                this.rpc.disconnectAll();
            } catch (e) {
                // ignore
            }
        }

        // Set all devices offline
        this.setOnlineFalse();

        try {
            this.log.debug('[onUnload] Closing adapter');

            // Stop CoAP server
            if (this.serverCoap) {
                try {
                    this.log.debug(`[onUnload] Stopping CoAP server`);
                    this.serverCoap.destroy();
                } catch {
                    // ignore
                }
            }

            // Stop MQTT server
            if (this.serverMqtt) {
                try {
                    this.log.debug(`[onUnload] Stopping MQTT server`);
                    this.serverMqtt.destroy();
                } catch {
                    // ignore
                }
            }

            callback();
        } catch {
            callback();
        }
    }

    /**
     * Online-Check via TCP ping
     */
    async onlineCheck() {
        const valPort = 80;

        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        try {
            const deviceIds = await this.getAllDeviceIds();
            for (const deviceId of deviceIds) {
                const stateHostname = await this.getStateAsync(`${deviceId}.hostname`);
                const valHostname = stateHostname ? stateHostname.val : undefined;

                if (valHostname) {
                    this.log.debug(`[onlineCheck] Checking ${deviceId} on ${valHostname}:${valPort}`);

                    tcpPing.probe(valHostname, valPort, (error, isAlive) => this.deviceStatusUpdate(deviceId, isAlive));
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

    async deviceStatusUpdate(deviceId, status) {
        if (this.isUnloaded) {
            return;
        }
        if (!deviceId) {
            return;
        }

        this.log.debug(`[deviceStatusUpdate] ${deviceId}: ${status}`);

        // Check if device object exists
        const knownDeviceIds = await this.getAllDeviceIds();
        if (!knownDeviceIds.includes(deviceId)) {
            this.log.silly(
                `[deviceStatusUpdate] ${deviceId} is not in list of known devices: ${JSON.stringify(knownDeviceIds)}`,
            );
            return;
        }

        // Update online status
        const idOnline = `${deviceId}.online`;
        const onlineState = await this.getStateAsync(idOnline);

        if (onlineState) {
            // Compare to previous value
            const prevValue = onlineState.val ? onlineState.val === 'true' || onlineState.val === true : false;

            if (prevValue != status) {
                await this.setState(idOnline, { val: status, ack: true });
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
                await this.setState('info.connection', { val: true, ack: true });
            } else {
                await this.setState('info.connection', { val: false, ack: true });
            }
        }
    }

    isOnline(deviceId) {
        return Object.prototype.hasOwnProperty.call(this.onlineDevices, deviceId);
    }

    async getAllDeviceIds() {
        const devices = await this.getDevicesAsync();
        return devices.map(device => this.removeNamespace(device._id));
    }

    async setOnlineFalse() {
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
                    color: null,
                },
            });
        }

        this.onlineDevices = {};
        await this.setState('info.connection', { val: false, ack: true });
    }

    autoFirmwareUpdate() {
        if (this.isUnloaded) {
            return;
        }
        if (this.config.autoupdate) {
            this.log.debug(`[firmwareUpdate] Starting update on every device`);

            this.eventEmitter.emit('onFirmwareUpdate');

            this.firmwareUpdateTimeout = this.setTimeout(
                () => {
                    this.firmwareUpdateTimeout = null;
                    this.autoFirmwareUpdate();
                },
                15 * 60 * 1000,
            ); // Restart firmware update in 15 minutes
        }
    }

    async firmwareNotify() {
        if (this.isUnloaded) {
            return;
        }
        if (!this.config.autoupdate) {
            this.log.debug(`[firmwareNotify] Starting firmware check on every device`);

            const availableUpdates = [];

            try {
                const deviceIds = await this.getAllDeviceIds();
                for (const deviceId of deviceIds) {
                    const stateFirmware = await this.getStateAsync(`${deviceId}.firmware`);
                    const hasNewFirmware = stateFirmware && stateFirmware.ack ? stateFirmware.val : false;

                    if (hasNewFirmware) {
                        const deviceObj = await this.getObjectAsync(deviceId);

                        availableUpdates.push(`${deviceObj?.common.name} (${deviceId})`);
                    }
                }
            } catch (e) {
                this.log.error(e.toString());
            }

            if (availableUpdates.length > 0) {
                this.registerNotification('shelly', 'deviceUpdates', availableUpdates.join('\n'));
            }

            this.firmwareUpdateTimeout = this.setTimeout(
                () => {
                    this.firmwareUpdateTimeout = null;
                    this.firmwareNotify();
                },
                15 * 60 * 1000,
            ); // Restart firmware check in 15 minutes
        }
    }

    convertFromHex(hexStr) {
        let bytes = [];
        for (let i = 0; i < hexStr.length; i += 2) {
            let byte = parseInt(hexStr.slice(i, i + 2), 16);
            bytes.push(byte);
        }
        return bytes;
    }

    async processBleMessage(val) {
        if (val && val.scriptVersion && val.src && val.payload) {
            this.log.debug(`[processBleMessage] Received payload ${JSON.stringify(val.payload)} from ${val.src}`);

            const expectedScriptVersion = '1.2';
            if (val.scriptVersion !== expectedScriptVersion) {
                this.log.warn(
                    `[BLE] ${val.srcBle.mac} (via ${val.src}): Script version ${val.scriptVersion} is not supported (expected ${expectedScriptVersion}), see documentation for latest version`,
                );
            }

            await this.extendObject(
                `ble.${val.srcBle.mac}`,
                {
                    type: 'device',
                    common: {
                        name: val.srcBle.mac,
                        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuNC4yIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIzIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTk2LjQ4IDI2MC4wMjNsOTIuNjI2LTEwMy4zMzNMMTQzLjEyNSAwdjIwNi4zM2wtODYuMTExLTg2LjExMS0zMS40MDYgMzEuNDA1IDEwOC4wNjEgMTA4LjM5OUwyNS42MDggMzY4LjQyMmwzMS40MDYgMzEuNDA1IDg2LjExMS04Ni4xMTFMMTQ1Ljg0IDUxMmwxNDguNTUyLTE0OC42NDQtOTcuOTEyLTEwMy4zMzN6bTQwLjg2LTEwMi45OTZsLTQ5Ljk3NyA0OS45NzgtLjMzOC0xMDAuMjk1IDUwLjMxNSA1MC4zMTd6TTE4Ny4zNjMgMzEzLjA0bDQ5Ljk3NyA0OS45NzgtNTAuMzE1IDUwLjMxNi4zMzgtMTAwLjI5NHoiLz48L3N2Zz4=',
                    },
                    native: {},
                },
                { preserve: { common: ['name'] } },
            );

            await this.delObjectAsync(`ble.${val.srcBle.mac}.rssi`);

            await this.setObjectNotExistsAsync(`ble.${val.srcBle.mac}.pid`, {
                type: 'state',
                common: {
                    name: {
                        en: 'Packet ID',
                        de: 'Paket-ID',
                        ru: 'ID пакета',
                        pt: 'ID da embalagem',
                        nl: 'Pakket-ID',
                        fr: 'ID du paquet',
                        it: 'ID pacchetto',
                        es: 'ID de paquete',
                        pl: 'Identyfikator opakowania',
                        uk: 'Код товару',
                        'zh-cn': '软件包标识',
                    },
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`ble.${val.srcBle.mac}.receivedBy`, {
                type: 'state',
                common: {
                    name: {
                        en: 'Received by devices',
                        de: 'Empfangen von Geräten',
                        ru: 'Получено устройствами',
                        pt: 'Recebido por dispositivos',
                        nl: 'Ontvangen door apparaten',
                        fr: 'Reçu par les appareils',
                        it: 'Ricevuto da dispositivi',
                        es: 'Recibido por dispositivos',
                        pl: 'Otrzymane przez urządzenia',
                        uk: 'Пристрої',
                        'zh-cn': '设备接收',
                    },
                    type: 'string',
                    role: 'json',
                    read: true,
                    write: false,
                    def: '{}',
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`ble.${val.srcBle.mac}.encrypted`, {
                type: 'state',
                common: {
                    name: {
                        en: 'Encrypted',
                        de: 'Verschlüsselt',
                        ru: 'Зашифрованный',
                        pt: 'Criptografado',
                        nl: 'Versleuteld',
                        fr: 'Chiffres',
                        it: 'Crittografia',
                        es: 'Encriptado',
                        pl: 'Zaszyfrowane',
                        uk: 'Зашифрований',
                        'zh-cn': '已加密',
                    },
                    type: 'boolean',
                    role: 'value',
                    read: true,
                    write: false,
                    def: false,
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`ble.${val.srcBle.mac}.encryptionKey`, {
                type: 'state',
                common: {
                    name: {
                        en: 'Encryption key',
                        de: 'Schlüssel zur Verschlüsselung',
                        ru: 'Ключ шифрования',
                        pt: 'Chave de criptografia',
                        nl: 'Versleutelingssleutel',
                        fr: 'Clé de chiffrement',
                        it: 'Chiave di crittografia',
                        es: 'Clave de cifrado',
                        pl: 'Klucz szyfrowania',
                        uk: 'Ключ шифрування',
                        'zh-cn': '加密密钥',
                    },
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: true,
                    def: '00000000-0000-0000-0000-000000000000',
                },
                native: {},
            });

            const rawData = this.convertFromHex(val.payload);
            let unpackedData = this.bleDecoder.unpack(rawData);

            if (unpackedData !== null) {
                this.log.debug(
                    `[processBleMessage] Received unpacked payload ${JSON.stringify(unpackedData)} from ${val.src}`,
                );

                await this.setState(`ble.${val.srcBle.mac}.encrypted`, { val: unpackedData.encryption, ack: true });

                if (unpackedData.encryption) {
                    const encryptionKeyState = await this.getStateAsync(`ble.${val.srcBle.mac}.encryptionKey`);
                    const encryptionKeyHex = encryptionKeyState
                        ? String(encryptionKeyState.val)
                        : '00000000-0000-0000-0000-000000000000';

                    const encryptionKey = Buffer.from(encryptionKeyHex.replaceAll('-', ''), 'hex');
                    const macBuffer = Buffer.from(val.srcBle.mac.replaceAll(':', ''), 'hex');

                    const dataPrefix = Buffer.concat([Buffer.from('d2fc', 'hex'), Buffer.from(rawData)]);

                    const uuid = Buffer.from(dataPrefix.slice(0, 2));
                    const deviceInfo = Buffer.from([dataPrefix[2]]);
                    const ciphertext = Buffer.from(dataPrefix.slice(3, -8));
                    const counter = Buffer.from(dataPrefix.slice(-8, -4));
                    const mic = Buffer.from(dataPrefix.slice(-4));

                    const nonce = Buffer.concat([macBuffer, uuid, deviceInfo, counter]);

                    try {
                        const decipher = crypto.createDecipheriv('aes-128-ccm', encryptionKey, nonce, {
                            authTagLength: 4,
                        });
                        decipher.setAuthTag(mic);

                        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

                        unpackedData = this.bleDecoder.unpack(decrypted, true);
                    } catch (err) {
                        this.log.error(`[processBleMessage] unable to process encrypted payload by ${val.src}: ${err}`);
                    }
                }

                if (unpackedData !== null) {
                    this.log.debug(
                        `[processBleMessage] Processing (decrypted) payload ${JSON.stringify(unpackedData)} from ${val.src}`,
                    );

                    const typesList = {
                        moisture: { type: 'number', unit: '%' },
                        battery: { type: 'number', unit: '%' },
                        temperature: { type: 'number', unit: '°C' },
                        humidity: { type: 'number', unit: '%' },
                        illuminance: { type: 'number' },
                        motion: { type: 'number', states: { 0: 'Clear', 1: 'Detected' } },
                        window: { type: 'number', states: { 0: 'Closed', 1: 'Open' } },
                        button: {
                            type: 'number',
                            states: { 1: 'Single', 2: 'Double', 3: 'Triple', 4: 'Long', 254: 'Long' },
                        },
                        rotation: { type: 'number' },
                        distance_m: { type: 'number', unit: 'm' },
                        distance_mm: { type: 'number', unit: 'mm' },
                    };

                    const pidState = await this.getStateAsync(`ble.${val.srcBle.mac}.pid`);
                    const pidOld = pidState && pidState.val ? pidState.val : -1;
                    const pidNew = unpackedData.pid;

                    if (pidOld !== pidNew) {
                        await this.setState(`ble.${val.srcBle.mac}.pid`, { val: pidNew, ack: true, c: val.src });
                        await this.setState(`ble.${val.srcBle.mac}.receivedBy`, {
                            val: JSON.stringify(
                                {
                                    [val.src]: {
                                        rssi: val.srcBle.rssi,
                                        ts: Date.now(),
                                    },
                                },
                                null,
                                2,
                            ),
                            ack: true,
                        });

                        for (const [key, value] of Object.entries(unpackedData)) {
                            const typeListKey = key.includes('button_') ? 'button' : key;

                            if (Object.keys(typesList).includes(typeListKey)) {
                                await this.extendObject(`ble.${val.srcBle.mac}.${key}`, {
                                    type: 'state',
                                    common: {
                                        name: key,
                                        type: typesList[typeListKey].type,
                                        role: 'value',
                                        read: true,
                                        write: false,
                                        unit: typesList[typeListKey]?.unit,
                                        states: typesList[typeListKey]?.states,
                                    },
                                    native: {},
                                });

                                await this.setState(`ble.${val.srcBle.mac}.${key}`, {
                                    val: value,
                                    ack: true,
                                    c: val.src,
                                });
                            }
                        }
                    } else {
                        try {
                            const receivedByState = await this.getStateAsync(`ble.${val.srcBle.mac}.receivedBy`);
                            if (receivedByState) {
                                const deviceList = JSON.parse(receivedByState.val);
                                deviceList[val.src] = {
                                    rssi: val.srcBle.rssi,
                                    ts: Date.now(),
                                };

                                await this.setState(`ble.${val.srcBle.mac}.receivedBy`, {
                                    val: JSON.stringify(deviceList, null, 2),
                                    ack: true,
                                });
                            }
                        } catch (err) {
                            this.log.error(
                                `[processBleMessage] Unable to extend device list (receivedBy) of ${val.srcBle.mac}: ${err}`,
                            );
                        }
                    }
                }
            }
        }
    }

    removeNamespace(id) {
        const re = new RegExp(`${this.namespace}*\\.`, 'g');
        return id.replace(re, '');
    }

    async migrateConfig() {
        const native = {};
        if (this.config?.http_username) {
            native.httpusername = this.config.http_username;
            native.http_username = '';
        }
        if (this.config?.http_password) {
            native.httppassword = this.config.http_password;
            native.http_password = '';
        }
        if (this.config?.user) {
            native.mqttusername = this.config.user;
            native.user = '';
        }
        if (this.config?.password) {
            native.mqttpassword = this.config.password;
            native.password = '';
        }
        if (this.config?.keys) {
            native.blacklist = this.config.keys.map(b => {
                return { id: b.blacklist };
            });
            native.keys = null;
        }

        if (this.config) {
            this.config.polltime = parseInt(this.config?.polltime, 10);
        }

        if (Object.keys(native).length) {
            this.log.info('Migrate some data from old Shelly Adapter version. Restarting Shelly Adapter now!');
            await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, { native });

            return true;
        }

        return false;
    }
}

if (module.parent) {
    module.exports = options => new Shelly(options);
} else {
    new Shelly();
}
