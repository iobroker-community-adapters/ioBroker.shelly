'use strict';

const crypto = require('node:crypto');

const utils = require('@iobroker/adapter-core');
const objectHelper = require('@apollon/iobroker-tools').objectHelper; // Common adapter utils
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

        this.eventEmitter = new EventEmitter();
        this.bleDecoder = new BleDecoder();

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
            this.subscribeForeignFiles(this.namespace, '*');

            this.subscribeStates('*');
            objectHelper.init(this);

            const protocol = this.config.protocol || 'coap';

            await this.setOnlineFalse();

            // Start online check
            await this.onlineCheck();

            // Start MQTT server
            setImmediate(() => {
                if (protocol === 'both' || protocol === 'mqtt') {
                    this.log.info(
                        `Starting in MQTT mode. Listening on ${this.config.bind}:${this.config.port} (QoS ${this.config.qos})`,
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
            });

            // Start CoAP server
            setImmediate(() => {
                if (protocol === 'both' || protocol === 'coap') {
                    this.log.info(`Starting in CoAP mode. Listening on ${this.config.coapbind}:5683`);
                    this.serverCoap = new protocolCoap.CoAPServer(this, objectHelper, this.eventEmitter);
                    this.serverCoap.listen();
                }
            });

            if (this.config.autoupdate) {
                this.log.info(`[firmwareUpdate] Auto-Update enabled - devices will be updated automatically`);

                // Wait 10 seconds for devices to connect
                this.setTimeout(() => this.autoFirmwareUpdate(), 10 * 1000);
            } else {
                // Wait 10 seconds for devices to connect
                this.setTimeout(() => this.firmwareNotify(), 10 * 1000);
            }
        } catch (err) {
            this.log.error(`[onReady] Startup error: ${err}`);
        }
    }

    onStateChange(id, state) {
        // Warning, state can be null if it was deleted
        if (state && !state.ack) {
            const stateId = this.removeNamespace(id);

            if (stateId === 'info.update') {
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

    onFileChange(id, fileName, size) {
        this.log.debug(`[onFileChange]: id: ${id}, fileName: ${fileName}, size: ${size}`);
    }

    /**
     * @param callback
     */
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
                } catch {
                    // ignore
                }
            }

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
            // this.log.error('Error');
            callback();
        }
    }

    /**
     * Online-Check via TCP ping (when using CoAP)
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
                const stateHostaname = await this.getStateAsync(`${deviceId}.hostname`);
                const valHostname = stateHostaname ? stateHostaname.val : undefined;

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
                    color: null, // Remove color from previous versions
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

            const expectedScriptVersion = '1.0';
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

            await this.delObjectAsync(`ble.${val.srcBle.mac}.rssi`); // moved to receivedBy

            await this.setObjectNotExistsAsync(`ble.${val.srcBle.mac}.pid`, {
                type: 'state',
                common: {
                    name: {
                        en: 'Received by devices',
                        de: 'Von Geräten empfangen',
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

            const rawData = this.convertFromHex(val.payload); // convert hex to bytes
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
                    const typesList = {
                        moisture: { type: 'number', unit: '%' },
                        soil: { type: 'number', unit: 'µS/cm' },
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
                    };

                    const pidState = await this.getStateAsync(`ble.${val.srcBle.mac}.pid`);
                    const pidOld = pidState && pidState.val ? pidState.val : -1;
                    const pidNew = unpackedData.pid;

                    // Check if same message has been received by other Shellys
                    if (pidOld !== pidNew) {
                        await this.setState(`ble.${val.srcBle.mac}.pid`, { val: pidNew, ack: true, c: val.src });
                        await this.setState(`ble.${val.srcBle.mac}.receivedBy`, {
                            val: JSON.stringify(
                                {
                                    [val.src]: {
                                        rssi: unpackedData.rssi,
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
                                    rssi: unpackedData.rssi,
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
    // Export the constructor in compact mode
    /**
     * @param [options]
     */
    module.exports = options => new Shelly(options);
} else {
    // otherwise start the instance directly
    new Shelly();
}
