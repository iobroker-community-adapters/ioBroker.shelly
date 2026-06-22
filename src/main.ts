import * as crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import tcpPing from 'tcp-ping';

import { Adapter, type AdapterOptions, I18n } from '@iobroker/adapter-core';

import { name as packageName } from '../package.json';
import * as objectHelper from './lib/objectHelper';
import * as protocolMqtt from './lib/protocol/mqtt';
import * as protocolCoap from './lib/protocol/coap';
import { BleDecoder } from './lib/ble-decoder';
import DeviceManagement from './lib/deviceManager';
import type { ShellyAdapterConfig } from './lib/types';

const adapterName = packageName.split('.').pop() ?? 'shelly';

export class ShellyAdapter extends Adapter {
    declare config: ShellyAdapterConfig;
    private serverMqtt: protocolMqtt.MQTTServer | null = null;
    private serverCoap: protocolCoap.CoAPServer | null = null;
    private firmwareUpdateTimeout: ioBroker.Timeout | null | undefined = null;
    private onlineCheckTimeout: ioBroker.Timeout | null | undefined = null;
    private deviceScanTimeout: ioBroker.Timeout | null | undefined = null;
    private deviceManagement: DeviceManagement | null = null;
    /** Set of device ids currently considered online. */
    private onlineDevices: Record<string, boolean> = {};
    private readonly eventEmitter: EventEmitter = new EventEmitter();
    private readonly bleDecoder: BleDecoder = new BleDecoder();
    public isUnloaded = false;

    constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: adapterName,
        });

        this.on('ready', this.onReady);
        this.on('stateChange', this.onStateChange);
        this.on('objectChange', this.onObjectChange);
        this.on('fileChange', this.onFileChange);
        this.on('unload', this.onUnload);
    }

    private onReady = async (): Promise<void> => {
        // Initialize i18n
        await I18n.init(__dirname, this).catch(error => this.log.error(`Cannot initialize i18n: ${error}`));

        try {
            this.deviceManagement = new DeviceManagement(this);

            // Upgrade older config
            if (await this.migrateConfig()) {
                return;
            }

            this.eventEmitter.setMaxListeners(Infinity);

            await this.mkdirAsync(this.namespace, 'scripts');
            await this.subscribeForeignFiles(this.namespace, '*');

            this.subscribeStates('*');
            objectHelper.init(this);

            const protocol = this.config.protocol || 'coap';

            await this.setOnlineFalse();

            // Start online check
            await this.onlineCheck();

            // Start MQTT server
            setImmediate(() => {
                if (protocol === 'both' || protocol === 'mqtt') {
                    this.validateQosConfig();

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

            this.config.scanInterval = parseInt(this.config.scanInterval as string, 10) || 0;

            // Periodic device scan
            if (this.config.scanInterval > 0) {
                const interval = Math.max(this.config.scanInterval, 60); // minimum 60 seconds
                this.log.info(`[deviceScan] Periodic scan enabled every ${interval} seconds`);
                this.setTimeout(() => this.deviceScan(), interval * 1000);
            }

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
    };

    /**
     * Validates and normalizes the QoS configuration value.
     * This is the central place where config.qos is retrieved and validated.
     * Note: This modifies config.qos as a runtime override only; it does not persist to the configuration file.
     */
    private validateQosConfig(): void {
        // Default to 0 if qos is not set
        if (this.config.qos === undefined || this.config.qos === null) {
            this.config.qos = 0;
        }

        const qos: 0 | 1 | 2 = parseInt(String(this.config.qos), 10) as 0 | 1 | 2;

        // Check for invalid values (< 0 or > 2)
        if (isNaN(qos) || qos < 0 || qos > 2) {
            this.log.error(
                `[MQTT] Invalid QoS value configured: ${this.config.qos}. QoS must be 0, 1, or 2. Setting QoS to 0.`,
            );
            this.config.qos = 0;
            return;
        }

        // Log warning if QoS 2 is configured
        if (qos === 2) {
            this.log.warn(
                `[MQTT] QoS 2 is configured but not officially supported. Using QoS 2 anyway. Consider using QoS 0 or 1 instead.`,
            );
        }

        // Normalize to integer type
        this.config.qos = qos;
    }

    private onObjectChange = (id: string, obj: ioBroker.Object | null | undefined): void =>
        this.deviceManagement?.onObjectChange(
            id,
            obj as ioBroker.StateObject | ioBroker.ChannelObject | ioBroker.DeviceObject | null,
        );

    private onStateChange = (id: string, state: ioBroker.State | null | undefined): void => {
        this.deviceManagement?.onStateChange(id, state ?? null);

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
                if (encryptionKey.length === 32) {
                    this.setState(stateId, { val: encryptionKey, ack: true }).catch(e =>
                        this.log.warn(`Cannot set state ${stateId}: ${e}`),
                    );
                }
            } else {
                this.log.debug(
                    `[onStateChange] "${id}" state changed: ${JSON.stringify(state)} - forwarding to objectHelper`,
                );

                objectHelper?.handleStateChange(id, state);
            }
        }
    };

    private onFileChange = (id: string, fileName: string, size: number | null): void =>
        this.log.debug(`[onFileChange]: id: ${id}, fileName: ${fileName}, size: ${size}`);

    /**
     * @param callback
     */
    private onUnload = async (callback: () => void): Promise<void> => {
        this.isUnloaded = true;
        await this.deviceManagement?.destroy();

        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        if (this.firmwareUpdateTimeout) {
            this.clearTimeout(this.firmwareUpdateTimeout);
            this.firmwareUpdateTimeout = null;
        }

        if (this.deviceScanTimeout) {
            this.clearTimeout(this.deviceScanTimeout);
            this.deviceScanTimeout = null;
        }

        try {
            await this.setOnlineFalse();
        } catch (e) {
            this.log.debug(`[onUnload] Error in setOnlineFalse: ${e}`);
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
    };

    /**
     * Online-Check via TCP ping (when using CoAP)
     */
    private async onlineCheck(): Promise<void> {
        const valPort = 80;

        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = null;
        }

        try {
            const deviceIds = await this.getAllDeviceIds();
            for (const deviceId of deviceIds) {
                const stateHostName = await this.getStateAsync(`${deviceId}.hostname`);
                const valHostname = stateHostName?.val;

                if (valHostname) {
                    this.log.debug(`[onlineCheck] Checking ${deviceId} on ${valHostname}:${valPort}`);

                    tcpPing.probe(String(valHostname), valPort, (_error: Error | undefined, isAlive: boolean) =>
                        this.deviceStatusUpdate(deviceId, isAlive),
                    );
                }
            }
        } catch (e) {
            this.log.error(e.toString());
        }

        this.onlineCheckTimeout = this.setTimeout(async () => {
            this.onlineCheckTimeout = null;
            await this.onlineCheck();
        }, 60 * 1000); // Restart online check in 60 seconds
    }

    public async deviceStatusUpdate(deviceId: string | undefined, status: boolean): Promise<void> {
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

    public isOnline(deviceId: string | undefined): boolean {
        return Object.prototype.hasOwnProperty.call(this.onlineDevices, deviceId ?? '');
    }

    private async getAllDeviceIds(): Promise<string[]> {
        const devices = await this.getDevicesAsync();
        return devices.map(device => this.removeNamespace(device._id));
    }

    private async setOnlineFalse(): Promise<void> {
        const deviceIds = await this.getAllDeviceIds();
        for (const deviceId of deviceIds) {
            const idOnline = `${deviceId}.online`;
            const onlineState = await this.getStateAsync(idOnline);

            if (onlineState) {
                await this.setState(idOnline, { val: false, ack: true });
            }

            await this.extendObject(deviceId, {
                common: {
                    color: null as unknown as string, // Remove color from previous versions
                },
            });
        }

        this.onlineDevices = {};
        await this.setState('info.connection', { val: false, ack: true });
    }

    private autoFirmwareUpdate(): void {
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

    private async firmwareNotify(): Promise<void> {
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
                        const deviceName =
                            typeof deviceObj?.common.name === 'string'
                                ? deviceObj.common.name
                                : (deviceObj?.common.name?.en ?? deviceId);

                        availableUpdates.push(`${deviceName} (${deviceId})`);
                    }
                }
            } catch (e) {
                this.log.error(e.toString());
            }

            if (availableUpdates.length > 0) {
                await this.registerNotification('shelly', 'deviceUpdates', availableUpdates.join('\n'));
            }

            this.firmwareUpdateTimeout = this.setTimeout(
                async () => {
                    this.firmwareUpdateTimeout = null;
                    await this.firmwareNotify();
                },
                15 * 60 * 1000,
            ); // Restart firmware check in 15 minutes
        }
    }

    private async deviceScan(): Promise<void> {
        if (this.isUnloaded) {
            return;
        }

        try {
            if (this.deviceManagement) {
                const newDevices = await this.deviceManagement.scanForNewDevices();

                if (newDevices.length > 0) {
                    const deviceList = newDevices.map(d => `${d.name} (${d.ip})`).join('\n');

                    this.log.info(
                        `[deviceScan] Found ${newDevices.length} new device(s): ${deviceList.replace(/\n/g, ', ')}`,
                    );

                    await this.registerNotification('shelly', 'newDevices', deviceList);
                } else {
                    this.log.debug('[deviceScan] No new devices found');
                }
            }
        } catch (err) {
            this.log.error(`[deviceScan] Error: ${err}`);
        }

        // Schedule next scan
        if (!this.isUnloaded && (this.config.scanInterval as number) > 0) {
            const interval = Math.max(this.config.scanInterval as number, 60);
            this.deviceScanTimeout = this.setTimeout(async () => {
                this.deviceScanTimeout = null;
                await this.deviceScan();
            }, interval * 1000);
        }
    }

    private convertFromHex(hexStr: string): number[] {
        const bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
            const byte = parseInt(hexStr.slice(i, i + 2), 16);
            bytes.push(byte);
        }
        return bytes;
    }

    private classifyBleDevice(dataKeys: string[]): { model: string; icon: string } {
        if (dataKeys.includes('precipitation') || dataKeys.includes('gust_speed') || dataKeys.includes('rain_status')) {
            return { model: 'BLU Outdoor Weather Station', icon: 'ble-ht' };
        }
        if (dataKeys.includes('motion')) {
            return { model: 'BLU Motion Sensor', icon: 'ble-motion' };
        }
        if (dataKeys.includes('window') || dataKeys.includes('rotation')) {
            return { model: 'BLU Door/Window Sensor', icon: 'ble-door-window' };
        }
        if (dataKeys.includes('humidity') && dataKeys.includes('temperature')) {
            return { model: 'BLU H&T Sensor', icon: 'ble-ht' };
        }
        if (dataKeys.includes('button_4')) {
            return { model: 'BLU Button Tough 4', icon: 'ble-button4' };
        }
        if (dataKeys.includes('button_1')) {
            return { model: 'BLU Button 1', icon: 'ble-button1' };
        }
        return { model: 'Bluetooth', icon: 'ble-button1' };
    }

    public async processBleMessage(val: any): Promise<void> {
        const valTyped: {
            scriptVersion: '1.2' | '1.3';
            src: string;
            srcBle: {
                mac: string;
                rssi: number;
            };
            payload: string;
        } = val;
        if (valTyped?.scriptVersion && valTyped.src && valTyped.payload) {
            this.log.debug(
                `[processBleMessage] Received payload ${JSON.stringify(valTyped.payload)} from ${valTyped.src}`,
            );

            const expectedScriptVersion = '1.3';
            if (valTyped.scriptVersion !== expectedScriptVersion) {
                this.log.warn(
                    `[BLE] ${valTyped.srcBle.mac} (via ${valTyped.src}): Script version ${valTyped.scriptVersion} is not supported (expected ${expectedScriptVersion}), see documentation for latest version`,
                );
            }

            await this.extendObject('ble', {
                type: 'folder',
                common: {
                    name: 'Bluetooth',
                    icon: 'icons/ble.svg',
                },
                native: {},
            });

            await this.extendObject(
                `ble.${valTyped.srcBle.mac}`,
                {
                    type: 'device',
                    common: {
                        name: valTyped.srcBle.mac,
                    },
                    native: {},
                },
                { preserve: { common: ['name', 'icon'] } },
            );

            await this.delObjectAsync(`ble.${valTyped.srcBle.mac}.rssi`); // moved to receivedBy

            await this.setObjectNotExistsAsync(`ble.${valTyped.srcBle.mac}.pid`, {
                type: 'state',
                common: {
                    name: I18n.getTranslatedObject('Packet ID') /*{
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
                    },*/,
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`ble.${valTyped.srcBle.mac}.receivedBy`, {
                type: 'state',
                common: {
                    name: I18n.getTranslatedObject('Received by devices'),
                    type: 'string',
                    role: 'json',
                    read: true,
                    write: false,
                    def: '{}',
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`ble.${valTyped.srcBle.mac}.encrypted`, {
                type: 'state',
                common: {
                    name: I18n.getTranslatedObject('Encrypted'),
                    type: 'boolean',
                    role: 'value',
                    read: true,
                    write: false,
                    def: false,
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`ble.${valTyped.srcBle.mac}.encryptionKey`, {
                type: 'state',
                common: {
                    name: I18n.getTranslatedObject('Encryption key'),
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: true,
                    def: '00000000-0000-0000-0000-000000000000',
                },
                native: {},
            });

            const rawData = this.convertFromHex(valTyped.payload); // convert hex to bytes
            let unpackedData: any = this.bleDecoder.unpack(Buffer.from(rawData));

            if (unpackedData !== null) {
                this.log.debug(
                    `[processBleMessage] Received unpacked payload ${JSON.stringify(unpackedData)} from ${valTyped.src}`,
                );

                await this.setState(`ble.${valTyped.srcBle.mac}.encrypted`, {
                    val: unpackedData.encryption,
                    ack: true,
                });

                if (unpackedData.encryption) {
                    const encryptionKeyState = await this.getStateAsync(`ble.${valTyped.srcBle.mac}.encryptionKey`);
                    const encryptionKeyHex = encryptionKeyState
                        ? String(encryptionKeyState.val)
                        : '00000000-0000-0000-0000-000000000000';

                    const encryptionKey = Buffer.from(encryptionKeyHex.replaceAll('-', ''), 'hex');
                    const macBuffer = Buffer.from(valTyped.srcBle.mac.replaceAll(':', ''), 'hex');

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
                        this.log.error(
                            `[processBleMessage] unable to process encrypted payload by ${valTyped.src}: ${err}`,
                        );
                    }
                }

                if (unpackedData !== null) {
                    this.log.debug(
                        `[processBleMessage] Processing (decrypted) payload ${JSON.stringify(unpackedData)} from ${valTyped.src}`,
                    );

                    const typesList: Record<
                        string,
                        { type: ioBroker.CommonType; unit?: string; states?: Record<string, string> }
                    > = {
                        battery: { type: 'number', unit: '%' },
                        battery_low: { type: 'number' },
                        button: {
                            type: 'number',
                            states: { 1: 'Single', 2: 'Double', 3: 'Triple', 4: 'Long', 254: 'Long' },
                        },
                        dewpoint: { type: 'number', unit: '°C' },
                        direction: { type: 'number', unit: '°' },
                        distance_m: { type: 'number', unit: 'm' },
                        distance_mm: { type: 'number', unit: 'mm' },
                        gust_speed: { type: 'number', unit: 'm/s' },
                        humidity: { type: 'number', unit: '%' },
                        illuminance: { type: 'number' },
                        light: { type: 'number', states: { 0: 'Dark', 1: 'Twilight', 2: 'Light' } },
                        moisture: { type: 'number', unit: '%' },
                        motion: { type: 'number', states: { 0: 'Clear', 1: 'Detected' } },
                        precipitation: { type: 'number', unit: 'mm' },
                        pressure: { type: 'number', unit: 'hPa' },
                        rain_status: { type: 'number', states: { 0: 'Not raining', 1: 'Raining' } },
                        rotation: { type: 'number' },
                        speed: { type: 'number', unit: 'm/s' },
                        temperature: { type: 'number', unit: '°C' },
                        uv_index: { type: 'number' },
                        voltage: { type: 'number', unit: 'V' },
                        window: { type: 'number', states: { 0: 'Closed', 1: 'Open' } },
                    };

                    const pidState = await this.getStateAsync(`ble.${valTyped.srcBle.mac}.pid`);
                    const pidOld = pidState?.val ? pidState.val : -1;
                    const pidNew = unpackedData.pid;

                    // Check if same message has been received by other Shellys
                    if (pidOld !== pidNew) {
                        await this.setState(`ble.${valTyped.srcBle.mac}.pid`, { val: pidNew, ack: true, c: val.src });
                        await this.setState(`ble.${valTyped.srcBle.mac}.receivedBy`, {
                            val: JSON.stringify(
                                {
                                    [valTyped.src]: {
                                        rssi: valTyped.srcBle.rssi,
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
                                const stateType = typesList[typeListKey].type;
                                let stateValue: ioBroker.StateValue | undefined;
                                if (stateType === 'number') {
                                    stateValue = value as ioBroker.StateValue;
                                } else if (stateType === 'boolean') {
                                    stateValue = !!value;
                                }

                                await this.extendObject(`ble.${valTyped.srcBle.mac}.${key}`, {
                                    type: 'state',
                                    common: {
                                        name: key,
                                        type: stateType,
                                        role: 'value',
                                        read: true,
                                        write: false,
                                        unit: typesList[typeListKey]?.unit,
                                        states: typesList[typeListKey]?.states,
                                    },
                                    native: {},
                                });

                                if (stateValue != undefined) {
                                    await this.setState(`ble.${valTyped.srcBle.mac}.${key}`, {
                                        val: stateValue,
                                        ack: true,
                                        c: valTyped.src,
                                    });
                                }
                            } else {
                                this.log.debug(
                                    `[processBleMessage] skipping unknown attribute ${key} from ${valTyped.src}`,
                                );
                            }
                        }

                        // Classify BLE device and set name/icon if still default
                        const bleDeviceObj = await this.getObjectAsync(`ble.${valTyped.srcBle.mac}`);
                        if (bleDeviceObj) {
                            const dataKeys = Object.keys(unpackedData);
                            const bleType = this.classifyBleDevice(dataKeys);

                            const updates: { name?: string; icon?: string } = {};
                            if (bleDeviceObj.common.name === valTyped.srcBle.mac) {
                                updates.name = bleType.model;
                            }
                            if (!bleDeviceObj.common.icon || String(bleDeviceObj.common.icon).startsWith('data:')) {
                                updates.icon = `icons/${bleType.icon}.png`;
                            }
                            if (Object.keys(updates).length > 0) {
                                await this.extendObject(`ble.${valTyped.srcBle.mac}`, { common: updates });
                            }
                        }
                    } else {
                        try {
                            const receivedByState = await this.getStateAsync(`ble.${valTyped.srcBle.mac}.receivedBy`);
                            if (receivedByState) {
                                const deviceList = JSON.parse(receivedByState.val as string);
                                deviceList[valTyped.src] = {
                                    rssi: valTyped.srcBle.rssi,
                                    ts: Date.now(),
                                };

                                await this.setState(`ble.${valTyped.srcBle.mac}.receivedBy`, {
                                    val: JSON.stringify(deviceList, null, 2),
                                    ack: true,
                                });
                            }
                        } catch (err) {
                            this.log.error(
                                `[processBleMessage] Unable to extend device list (receivedBy) of ${valTyped.srcBle.mac}: ${err}`,
                            );
                        }
                    }
                }
            }
        }
    }

    private removeNamespace(id: string): string {
        const re = new RegExp(`${this.namespace}*\\.`, 'g');
        return id.replace(re, '');
    }

    private async migrateConfig(): Promise<boolean> {
        const native: Record<string, unknown> = {};
        // Read legacy config keys that are no longer part of the typed AdapterConfig.
        const legacy = this.config as Record<string, any>;
        if (legacy?.http_username) {
            native.httpusername = legacy.http_username;
            native.http_username = '';
        }
        if (legacy?.http_password) {
            native.httppassword = legacy.http_password;
            native.http_password = '';
        }
        if (legacy?.user) {
            native.mqttusername = legacy.user;
            native.user = '';
        }
        if (legacy?.password) {
            native.mqttpassword = legacy.password;
            native.password = '';
        }
        if (legacy?.keys) {
            native.blacklist = legacy.keys.map((b: { blacklist: string }) => {
                return { id: b.blacklist };
            });
            native.keys = null;
        }

        if (this.config) {
            this.config.polltime = parseInt(String(this.config.polltime), 10);
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
    module.exports = (options: Partial<AdapterOptions> | undefined): ShellyAdapter => new ShellyAdapter(options);
} else {
    // otherwise start the instance directly
    new ShellyAdapter();
}
