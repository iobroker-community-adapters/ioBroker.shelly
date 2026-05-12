'use strict';

const BaseClient = require('./base').BaseClient;
const BaseServer = require('./base').BaseServer;
const datapoints = require('../datapoints');

const mqttConnection = require('mqtt-connection');
const mqttClient = require('mqtt');
const net = require('node:net');

const adapterVersion = require('../../package.json').version;
const INIT_SRC = 'iobroker-init';

/**
 * checks if  function is an asynchron function
 *
 * @param funct - function
 */
function isAsync(funct) {
    if (funct && funct.constructor) {
        return funct.constructor.name == 'AsyncFunction';
    }
    return undefined;
}

class MQTTClient extends BaseClient {
    constructor(adapter, objectHelper, eventEmitter, stream) {
        super('mqtt', adapter, objectHelper, eventEmitter);

        this.stream = stream;

        this.mqttprefix;
        this.messageCache = {};
        this.messageId = 1;
        this.will = undefined;

        this.initializing = false; // use to delay publish packets after new connection
        this.publishQueue = []; // queue for publish packets during initialization
        this.processingQueue = false; // flag to indicate queue processing is in progress
        this.destroying = false; // flag to prevent new packets from being queued during destruction

        this.client;

        this.start();
    }

    start() {
        if (!this.stream) {
            // ExternalMQTTDeviceClient mode - no TCP stream, connection handled by MQTTServerExternal
            return;
        }
        this.client = mqttConnection(this.stream);
        this.listener();
    }

    /**
     * to get sure, that an instance will be start more than one, we check for running instances
     * if an instance run with same name (shellyswitch-12345), we destroy the old instance
     *
     * @param self - my instance
     */
    static _registerRun(self) {
        if (self) {
            this.clientlist = this.clientlist || {};
            const name = self.getId();
            if (name && this.clientlist[name]) {
                this.clientlist[name].destroy();
            }
            this.clientlist[name] = self;
        }
    }

    /**
     * @inheritdoc
     */
    getSerialId() {
        if (!this.serialId) {
            let id = this.getId();
            if (id) {
                id = id.replace(/(.+?)\/(.+?)\/(.*)/, '$2');
                this.serialId = id.replace(/(.+)-(.+)/, '$2');
            }
        }
        return this.serialId;
    }

    /**
     * @inheritdoc
     */
    getDeviceClass() {
        if (!this.deviceClass) {
            let id = this.getId();
            if (id) {
                id = id.replace(/(.+?)\/(.+?)\/(.*)/, '$2');
                this.deviceClass = id.replace(/(.+)-(.+)/, '$1');
            }
        }
        return this.deviceClass;
    }

    /**
     * @inheritdoc
     */
    getDeviceType() {
        if (!this.deviceType) {
            const deviceClass = this.getDeviceClass();
            this.deviceType = datapoints.getDeviceTypeByClass(deviceClass);
        }
        return this.deviceType;
    }

    /**
     * @inheritdoc
     */
    getDeviceId() {
        if (!this.deviceId) {
            const deviceType = this.getDeviceType();
            const serialId = this.getSerialId();
            if (deviceType && serialId) {
                this.deviceId = `${deviceType}#${serialId}#1`;
            }
        }
        return this.deviceId;
    }

    getMqttPrefix() {
        return this.mqttprefix;
    }

    replacePrefixIn(topic) {
        return new String(topic).replace(new RegExp('<mqttprefix>', 'g'), this.getMqttPrefix());
    }

    /**
     * Process queued publish packets sequentially
     */
    async processPublishQueue() {
        // Atomic check-and-set to prevent race conditions
        // Both operations must be synchronous (no await between them)
        if (this.processingQueue || this.publishQueue.length === 0) {
            return;
        }
        this.processingQueue = true;

        this.adapter.log.silly(
            `[MQTT] Publish: ${this.getLogInfo()} - start processing ${this.publishQueue.length} queued packets`,
        );

        try {
            while (this.publishQueue.length > 0) {
                const packet = this.publishQueue.shift();
                try {
                    await this.processPublishPacket(packet);
                } catch (err) {
                    this.adapter.log.error(
                        `[MQTT] Publish: ${this.getLogInfo()} - error processing packet: ${err?.message || err}`,
                    );
                }
            }
        } finally {
            this.processingQueue = false;
        }
        this.adapter.log.silly(`[MQTT] Publish: ${this.getLogInfo()} - processing queued packets done`);
    }

    /**
     * Process a single publish packet
     *
     * @param packet - MQTT publish packet
     */
    async processPublishPacket(packet) {
        if (this.adapter.isUnloaded) {
            return;
        }

        this.adapter.log.silly(`[MQTT] Publish: ${this.getLogInfo()} - ${JSON.stringify(packet)}`);

        if (packet.payload) {
            this.adapter.log.debug(
                `[MQTT] Publish: ${this.getLogInfo()} - topic: ${packet.topic}, qos: ${packet.qos}, payload: ${packet.payload.toString()}`,
            );

            // Generation 1
            if (this.getDeviceGen() === 1) {
                if (packet.topic === 'shellies/announce') {
                    try {
                        const payloadObj = JSON.parse(packet.payload);

                        // Update IP address
                        const ip = payloadObj?.ip;
                        if (ip && ip !== this.getIP()) {
                            await this.setIP(ip, 'Gen 1 shellies/announce');
                            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online
                        }

                        // Device Mode information (new)
                        const newDeviceMode = payloadObj?.mode;
                        if (newDeviceMode) {
                            await this.setDeviceMode(newDeviceMode);
                        }
                    } catch {
                        // we do not change anything
                    }
                }
            }

            // Generation 2+
            if (this.getDeviceGen() >= 2) {
                if (packet.topic === 'iobroker/rpc') {
                    try {
                        const payloadObj = JSON.parse(packet.payload.toString());

                        // Error handling for Gen 2+ devices
                        if (payloadObj?.error) {
                            this.adapter.log.error(
                                `[MQTT] Received error message for ${this.getLogInfo()} - from "${payloadObj.src}": ${JSON.stringify(payloadObj.error)}`,
                            );
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Error parsing command response: ${this.getLogInfo()} - topic: ${packet.topic}, error: ${err}`,
                        );
                    }
                }

                if (packet.topic === `${INIT_SRC}/rpc`) {
                    try {
                        const payloadObj = JSON.parse(packet.payload.toString());

                        // Update IP address
                        const ip = payloadObj?.result?.eth?.ip || payloadObj?.result?.wifi?.sta_ip;
                        if (ip && ip !== this.getIP()) {
                            await this.setIP(ip, `Gen 2+ ${INIT_SRC}/rpc`);
                            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online
                        }

                        // Device Mode information (new)
                        if (payloadObj?.result?.profile) {
                            const newDeviceMode = payloadObj?.result?.profile;
                            if (newDeviceMode) {
                                await this.setDeviceMode(newDeviceMode);
                            }
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Error parsing init command response: ${this.getLogInfo()} - topic: ${packet.topic}, error: ${err}`,
                        );
                    }
                }

                // Log debug messages for Gen 2+ devices (if enabled in instance configuration)
                if (packet.topic === `${this.getMqttPrefix()}/debug/log`) {
                    if (this.adapter.config.logDebugMessages) {
                        this.adapter.log.info(
                            `[Shelly Debug Message] ${this.getLogInfo()}: ${packet.payload.toString().trim()}`,
                        );
                    }
                }
            }
        }

        await this.createIoBrokerState(packet.topic, packet.payload);
    }

    async destroy() {
        // Set destroying flag to prevent new packets from being queued
        this.destroying = true;

        // Wait for initialization to complete
        if (this.initializing) {
            this.adapter.log.debug(`[MQTT] Destroying ${this.getLogInfo()}, waiting for initialization to complete`);
            let cnt = 5 * 60; // wait up to 60 seconds
            while (this.initializing && cnt-- > 0) {
                await this.adapter.delay(200);
            }
        }

        // Wait for queue processing to complete
        if (this.processingQueue) {
            this.adapter.log.debug(`[MQTT] Destroying ${this.getLogInfo()}, waiting for queue processing to complete`);
            let cnt = 5 * 60; // wait up to 60 seconds
            while (this.processingQueue && cnt-- > 0) {
                await this.adapter.delay(200);
            }
        }

        // Process any remaining queued packets
        if (this.publishQueue.length > 0) {
            this.adapter.log.debug(
                `[MQTT] Destroying ${this.getLogInfo()}, processing ${this.publishQueue.length} remaining queued packets`,
            );
            await this.processPublishQueue();
        }

        super.destroy();
        this.adapter.log.debug(`[MQTT] Destroying`);

        for (const messageId in this.messageCache) {
            if (this.messageCache[messageId].resendid) {
                clearTimeout(this.messageCache[messageId].resendid);
            }
        }

        this.messageCache = {};
        this.messageId = 1;
        this.mqttprefix = undefined;
        this.will = undefined;
        this.publishQueue = [];
        this.processingQueue = false;

        if (this.client) {
            this.client.removeAllListeners();
            this.client.destroy();
        }
    }

    /**
     * @inheritdoc
     */
    publishStateValue(topic, value) {
        if (topic.includes('<mqttprefix>') && !this.getMqttPrefix()) {
            this.adapter.log.warn(
                `[MQTT] Unable to publish message to ${this.getLogInfo()} - mqtt prefix was not set but is required for this message: ${topic} = ${value}`,
            );
            return;
        }

        topic = this.replacePrefixIn(topic);

        const parsedQos = parseInt(this.adapter.config.qos, 10);
        const qos = Number.isFinite(parsedQos) && parsedQos >= 0 && parsedQos <= 2 ? parsedQos : 0;

        this.messageId &= 0xffffffff;
        this.messageId++;

        try {
            this.adapter.log.debug(
                `[MQTT] Send state to ${this.getLogInfo()} with QoS ${qos}: ${topic} = ${value} (${this.messageId})`,
            );
            this.client.publish({ topic: topic, payload: value, qos: qos, messageId: this.messageId });
        } catch (err) {
            this.adapter.log.debug(
                `[MQTT] Unable to publish message to ${this.getLogInfo()} - received error "${err}": ${topic} = ${value}`,
            );
        }

        if (qos > 0) {
            this.deleteResendState2ClientFromTopic(topic);
            this.resendState2Client('publish', this.messageId, {
                topic,
                payload: value,
                qos,
                dup: true,
                messageId: this.messageId,
            });
        }
    }

    resendState2Client(cmd, messageId, message) {
        const retaintime = 5 * 1000;

        if (
            !this.messageCache[messageId] ||
            this.messageCache[messageId].cmd !== cmd ||
            this.messageCache[messageId].message !== message
        ) {
            this.messageCache[messageId] = {
                ts: Date.now(),
                cmd,
                count: 0,
                message,
            };
        }

        if (this.messageCache[messageId] && this.messageCache[messageId].count < 10) {
            clearTimeout(this.messageCache[messageId].resendid);
            this.messageCache[messageId].resendid = setTimeout(() => {
                if (this.messageCache[messageId]) {
                    const ts = Date.now();
                    this.messageCache[messageId].count++;
                    this.messageCache[messageId].ts = ts;
                    switch (this.messageCache[messageId].cmd) {
                        case 'publish':
                            try {
                                this.client.publish(this.messageCache[messageId].message);
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (publish): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        case 'pubrel':
                            try {
                                this.client.pubrel({ messageId });
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (pubrel): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        case 'pubrec':
                            try {
                                this.client.pubrec({ messageId });
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (pubrec): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        case 'pubcomp':
                            try {
                                this.client.pubcomp({ messageId });
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (pubcomp): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        default:
                            break;
                    }

                    this.resendState2Client(cmd, messageId, message);
                }
            }, retaintime);
        }
    }

    deleteResendState2Client(messageId) {
        if (this.messageCache[messageId]) {
            clearTimeout(this.messageCache[messageId].resendid);
            delete this.messageCache[messageId];
        }
    }

    deleteResendState2ClientFromTopic(topic) {
        for (const messageId in this.messageCache) {
            if (
                this.messageCache[messageId].message &&
                this.messageCache[messageId].cmd === 'publish' &&
                this.messageCache[messageId].message.topic === topic
            ) {
                clearTimeout(this.messageCache[messageId].resendid);
                delete this.messageCache[messageId];
            }
        }
    }

    getCachedMessage(messageId) {
        return this.messageCache[messageId];
    }

    /**
     * State changes from device will be saved in the ioBroker states
     *
     * @param topic
     * @param payload - object can be ervery type of value
     */
    async createIoBrokerState(topic, payload) {
        this.adapter.log.silly(
            `[MQTT] Message for ${this.getLogInfo()}: ${topic} / ${JSON.stringify(payload)} (${payload.toString()})`,
        );

        const dps = this.getAllTypePublishStates();
        for (const i in dps) {
            const dp = dps[i];
            const deviceId = this.getDeviceId();
            const fullStateId = `${deviceId}.${dp.state}`;
            let value = payload.toString();

            this.adapter.log.silly(
                `[MQTT] Message with value for ${this.getLogInfo()}: ${topic} -> state: ${fullStateId}, value: ${value}`,
            );

            try {
                if (this.replacePrefixIn(dp.mqtt.mqtt_publish) === topic) {
                    if (dp.mqtt?.mqtt_publish_funct) {
                        value = isAsync(dp.mqtt.mqtt_publish_funct)
                            ? await dp.mqtt.mqtt_publish_funct(value, this)
                            : dp.mqtt.mqtt_publish_funct(value, this);
                    }

                    if (dp.common.type === 'boolean' && value === 'false') {
                        value = false;
                    }
                    if (dp.common.type === 'boolean' && value === 'true') {
                        value = true;
                    }
                    if (dp.common.type === 'number' && value !== undefined && value !== null) {
                        value = Number(value);
                    }

                    if (Object.prototype.hasOwnProperty.call(this.device, dp.state)) {
                        if (
                            value !== undefined &&
                            (!Object.prototype.hasOwnProperty.call(this.stateValueCache, fullStateId) ||
                                this.stateValueCache[fullStateId] !== value ||
                                this.adapter.config.updateUnchangedObjects)
                        ) {
                            this.adapter.log.debug(
                                `[MQTT] State change ${this.getLogInfo()}: ${topic} -> state: ${fullStateId}, value: ${JSON.stringify(value)}`,
                            );
                            this.stateValueCache[fullStateId] = value;
                            this.objectHelper.setOrUpdateObject(
                                fullStateId,
                                {
                                    type: 'state',
                                    common: dp.common,
                                },
                                ['name'],
                                value,
                            );
                        }
                    }
                }
            } catch (err) {
                this.adapter.log.error(
                    `[MQTT] Error ${err} in function dp.mqtt.mqtt_publish_funct of state ${fullStateId} for ${this.getLogInfo()}`,
                );
            }
        }

        this.objectHelper.processObjectQueue(() => {});
    }

    async setMqttPrefixHttp() {
        if (this.mqttprefix) {
            return this.mqttprefix;
        }

        this.adapter.log.debug(
            `[MQTT] Started mqttprefix fallback via HTTP for client ${this.getId()} (Gen ${this.getDeviceGen()})`,
        );

        if (this.getDeviceGen() == 1) {
            try {
                const body = await this.requestAsync('/settings');
                if (body) {
                    const settings = JSON.parse(body);
                    this.mqttprefix = settings.mqtt.id;

                    this.adapter.log.debug(
                        `[MQTT] Requested mqttprefix for client ${this.getId()} (Gen 1): ${this.mqttprefix}`,
                    );

                    return this.mqttprefix;
                }
            } catch (err) {
                if (err && err.response && err.response.status == 401) {
                    this.adapter.log.error(
                        `[MQTT] Wrong http username or http password! Please enter the user credential from restricted login for client ${this.getId()}`,
                    );
                } else {
                    this.adapter.log.error(
                        `[MQTT] Error in function setMqttPrefixHttp (Gen 1) for client ${this.getId()}: ${err}`,
                    );
                }
            }
        } else if (this.getDeviceGen() >= 2) {
            try {
                const body = await this.requestAsync('/rpc/Mqtt.GetConfig');
                if (body) {
                    const settings = JSON.parse(body);
                    this.mqttprefix = settings.topic_prefix;

                    this.adapter.log.debug(
                        `[MQTT] Requested mqttprefix for client ${this.getId()} (Gen 2+): ${this.mqttprefix}`,
                    );

                    return this.mqttprefix;
                }
            } catch (err) {
                this.adapter.log.error(
                    `[MQTT] Error in function setMqttPrefixHttp (Gen 2+) for client ${this.getId()}: ${err}`,
                );
            }
        }

        return undefined;
    }

    setMqttPrefixByWill(topic) {
        // Gen1: "shellies/huhu-shellybutton1-A4CF12F454A3/online"
        // Gen2: "shellyplus1pm-44179394d4d4/online"

        if (this.mqttprefix) {
            return this.mqttprefix;
        }
        if (topic) {
            const arr = topic.split('/');
            if (this.getDeviceGen() === 1) {
                if (arr[0] === 'shellies') {
                    this.mqttprefix = arr[1];
                    this.adapter.log.debug(`[MQTT] setMqttPrefixByWill (Gen 1): ${this.mqttprefix}`);
                    return this.mqttprefix;
                }
            } else if (this.getDeviceGen() >= 2) {
                this.mqttprefix = arr.slice(0, -1).join('/');
                this.adapter.log.debug(`[MQTT] setMqttPrefixByWill (Gen 2+): ${this.mqttprefix}`);
                return this.mqttprefix;
            }
        }
        return undefined;
    }

    listener() {
        // client connected
        this.client.on('connect', async packet => {
            this.id = packet.clientId;

            this.adapter.log.debug(`[MQTT] Client connected: ${JSON.stringify(packet)}`);
            if (this.deviceExists()) {
                this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" processing existing device`);
                if (
                    packet.username === this.adapter.config.mqttusername &&
                    packet.password?.toString() === this.adapter.config.mqttpassword
                ) {
                    // check for existing instances
                    MQTTClient._registerRun(this);

                    const ip = this.stream?.remoteAddress ?? null;

                    this.adapter.log.info(`[MQTT] Device with client id "${packet.clientId}" connected from ${ip}!`);
                    this.initializing = true;

                    // Device Mode information (init)
                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" init device mode`);
                    await this.initDeviceModeFromState();

                    // accept connection
                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" accepting connection`);
                    try {
                        this.client.connack({ returnCode: 0 });
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                        );
                        return;
                    }

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" deleting old states`);
                    await this.deleteOldStates();
                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" create objects`);
                    await this.createObjects();

                    // Save last will
                    // Gen 1:  {"retain": false, "qos": 0, "topic" :"shellies/shellyswitch25-C45BBE798F0F/online", "payload": {"type":"Buffer","data": [102,97,108,115,101]}}
                    // Gen 2+: {"retain": false, "qos": 0, "topic": "shellypro2pm-30c6f7850a64/online", "payload": {"type":"Buffer","data":[102,97,108,115,101]}}
                    if (packet.will) {
                        this.will = packet.will;
                        this.adapter.log.debug(
                            `[MQTT] Last will for client id "${packet.clientId}" saved: ${JSON.stringify(this.will)}`,
                        );
                    }

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" setting ip`);
                    if (ip && !String(ip).endsWith('.1')) {
                        // TODO: remove workaround to skip in Docker env
                        await this.setIP(ip, 'MQTT connect');
                    } else {
                        await this.initIPFromState();
                    }

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" updating device status`);
                    await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" setting http states`);
                    await this.httpIoBrokerState();

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" setting mqtt prefix`);
                    if (this.will?.topic) {
                        this.setMqttPrefixByWill(this.will.topic);
                    } else {
                        await this.setMqttPrefixHttp();
                    }

                    if (!this.getMqttPrefix()) {
                        this.adapter.log.error(
                            `[MQTT] Unable to get mqttprefix of client with id "${packet.clientId}"`,
                        );
                    }

                    //this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" accepting connection`);
                    try {
                        //this.client.connack({ returnCode: 0 });

                        // Device Mode information (request)
                        if (this.getDeviceGen() >= 2) {
                            this.adapter.log.silly(
                                `[MQTT] Client id "${packet.clientId}" retrieving device mode information (Gen 2+)`,
                            );
                            try {
                                // Ask for more information (like IP address)
                                this.publishStateValue(
                                    '<mqttprefix>/rpc',
                                    JSON.stringify({
                                        id: this.getNextMsgId(),
                                        src: INIT_SRC,
                                        method: 'Shelly.GetDeviceInfo',
                                        params: { ident: true },
                                    }),
                                );

                                this.publishStateValue(
                                    '<mqttprefix>/rpc',
                                    JSON.stringify({
                                        id: this.getNextMsgId(),
                                        src: INIT_SRC,
                                        method: 'Shelly.GetStatus',
                                    }),
                                );

                                this.publishStateValue('<mqttprefix>/command', 'status_update');
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (publish): "${packet.clientId}" - error: ${err}`,
                                );
                            }
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                        );
                    }

                    this.adapter.log.info(`[MQTT] Device with client id "${packet.clientId}" initialized.`);
                    this.initializing = false;

                    // Process any queued publish packets
                    if (this.publishQueue.length > 0) {
                        this.adapter.log.debug(
                            `[MQTT] Processing ${this.publishQueue.length} queued packets for ${this.getLogInfo()}`,
                        );
                        try {
                            await this.processPublishQueue();
                        } catch (err) {
                            this.adapter.log.error(
                                `[MQTT] Error processing publish queue for ${this.getLogInfo()}: ${err?.message || err}`,
                            );
                        }
                    }
                } else {
                    if (packet.username === undefined) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": No username transmitted by client`,
                        );
                    } else if (packet.username !== this.adapter.config.mqttusername) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": Incorrect username (expected "${this.adapter.config.mqttusername}")`,
                        );
                    }

                    if (packet.password === undefined) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": No password transmitted by client`,
                        );
                    } else if (packet.password?.toString() !== this.adapter.config.mqttpassword) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": Incorrect password`,
                        );
                    }

                    try {
                        this.client.connack({ returnCode: 4 });
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                        );
                    }
                }
            } else {
                this.adapter.log.error(
                    `[MQTT] (Shelly?) device unknown, configuration for client with id "${packet.clientId}" ${this.getLogInfo()} does not exist! Maybe this device is not supported in this adapter version (${adapterVersion}).`,
                );
                this.adapter.log.error(
                    `[MQTT] DO NOT CHANGE THE CLIENT-ID OF YOUR SHELLY DEVICES (see adapter documentation for details)`,
                );

                try {
                    this.client.connack({ returnCode: 4 });
                } catch (err) {
                    this.adapter.log.debug(
                        `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                    );
                }
            }
        });

        this.client.on('close', status => {
            this.initializing = false;
            this.adapter.log.info(`[MQTT] Client Close: ${this.getLogInfo()} (${status})`);
            this.destroy();
        });

        this.client.on('error', error => {
            this.adapter.log.info(`[MQTT] Client Error: ${this.getLogInfo()} (${error})`);
            // this.destroy();
        });

        this.client.on('disconnect', () => {
            this.initializing = false;
            this.adapter.log.info(`[MQTT] Client Disconnect: ${this.getLogInfo()}`);
            this.destroy();
        });

        this.client.on('timeout', () => {
            this.adapter.log.info(`[MQTT] Client Timeout: ${this.getLogInfo()}`);
            // this.destroy();
        });

        this.client.on('publish', async packet => {
            if (this.adapter.isUnloaded) {
                return;
            }

            // Send QoS acknowledgment immediately to avoid client timeouts
            switch (packet.qos) {
                case 1:
                    this.adapter.log.silly(`[MQTT] puback: ${this.getLogInfo()}`);
                    try {
                        this.client.puback({ messageId: packet.messageId });
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (puback): ${this.getLogInfo()} - qos: ${packet.qos}, error: ${err}`,
                        );
                    }

                    break;
                case 2:
                    this.adapter.log.silly(`[MQTT] pubrec: ${this.getLogInfo()} - messageId: ${packet.messageId}`);
                    try {
                        this.client.pubrec({ messageId: packet.messageId });
                        this.resendState2Client('pubrec', packet.messageId);
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (pubrec): ${this.getLogInfo()} - qos: ${packet.qos}, error: ${err}`,
                        );
                    }

                    break;
                default:
                    break;
            }

            // Don't queue packets if we're being destroyed
            if (this.destroying) {
                this.adapter.log.debug(
                    `[MQTT] Publish: ${this.getLogInfo()} - destruction in progress, ignoring packet`,
                );
                return;
            }

            // Always queue packets to ensure they are processed in order
            this.publishQueue.push(packet);

            // Start processing queue if not already processing
            if (!this.processingQueue && !this.initializing) {
                await this.processPublishQueue();
            }
        });

        // this.client pinged
        this.client.on('pingreq', () => {
            try {
                this.client.pingresp();
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT] Client communication error (pingresp): ${this.getLogInfo()} - error: ${err}`,
                );
            }
        });

        // response for QoS2
        this.client.on('pubrec', packet => {
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'publish') {
                try {
                    this.client.pubrel({ messageId: packet.messageId });
                    this.resendState2Client('pubrel', packet.messageId);
                } catch (err) {
                    this.adapter.log.debug(
                        `[MQTT] Client communication error (pubrel): ${this.getLogInfo()} - error: ${err}`,
                    );
                }
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received pubrec for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        // response for QoS2
        this.client.on('pubcomp', packet => {
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'pubrec') {
                this.deleteResendState2Client(packet.messageId);
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received pubcomp for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        // response for QoS2
        this.client.on('pubrel', packet => {
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'pubrec') {
                try {
                    this.deleteResendState2Client(packet.messageId);
                    this.client.pubcomp({ messageId: packet.messageId });
                } catch (err) {
                    this.adapter.log.debug(
                        `[MQTT] Client communication error (pubcomp): ${this.getLogInfo()} - error: ${err}`,
                    );
                }
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received pubrel for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        // response for QoS1
        this.client.on('puback', packet => {
            // remove this message from queue
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'publish') {
                this.deleteResendState2Client(packet.messageId);
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received puback for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        this.client.on('unsubscribe', packet => {
            this.adapter.log.debug(`[MQTT] Unsubscribe ${this.getLogInfo()}: ${JSON.stringify(packet)}`);

            try {
                this.client.unsuback({ messageId: packet.messageId });
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT] Client communication error (unsuback): ${this.getLogInfo()} - error: ${err}`,
                );
            }
        });

        // this.client subscribed
        this.client.on('subscribe', packet => {
            // send a suback with messageId and granted QoS level
            this.adapter.log.debug(`[MQTT] Subscribe ${this.getLogInfo()}: ${JSON.stringify(packet)}`);
            const granted = [];
            for (const i in packet.subscriptions) {
                granted.push(packet.subscriptions[i].qos);
            }
            if (packet.topic) {
                this.adapter.log.debug(`[MQTT] Subscribe topic ${this.getLogInfo()}: ${packet.topic}`);
            }

            try {
                this.client.suback({ granted: granted, messageId: packet.messageId });
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT] Client communication error (suback): ${this.getLogInfo()} - error: ${err}`,
                );
            }
        });
    }
}

class MQTTServer extends BaseServer {
    constructor(adapter, objectHelper, eventEmitter) {
        //if (!(this instanceof MQTTServer)) return new MQTTServer(adapter, objectHelper, eventEmitter);

        super(adapter, objectHelper, eventEmitter);

        this.server = new net.Server();
        this.clients = {};
    }

    listen() {
        this.server.on('connection', stream => {
            this.adapter.log.debug(`[MQTT Server] New connection from ${stream.remoteAddress}`);

            const client = new MQTTClient(this.adapter, this.objectHelper, this.eventEmitter, stream);
            this.clients[stream.remoteAddress] = client;

            stream.on('timeout', () => {
                this.adapter.log.debug(`[MQTT Server] Timeout for ${stream.remoteAddress} (${client.getLogInfo()})`);
                client.destroy();
                stream.destroy();
            });

            stream.on('unload', () => {
                this.adapter.log.debug(`[MQTT Server] Unload for ${stream.remoteAddress} (${client.getLogInfo()})`);
                client.destroy();
                stream.destroy();
            });

            stream.on('error', () => {
                this.adapter.log.debug(`[MQTT Server] Error for ${stream.remoteAddress} (${client.getLogInfo()})`);
                if (client) {
                    client.destroy();
                    stream.destroy();
                }
            });

            stream.on('close', () => {
                this.adapter.log.debug(`[MQTT Server] Close for ${stream.remoteAddress} (${client.getLogInfo()})`);
                delete this.clients[stream.remoteAddress];
            });

            stream.on('end', () => {
                this.adapter.log.debug(`[MQTT Server] End for ${stream.remoteAddress} (${client.getLogInfo()})`);
                stream.end();
            });
        });

        this.server.on('close', () => this.adapter.log.debug(`[MQTT Server] Closing listener`));

        this.server.on('error', error => this.adapter.log.debug(`[MQTT Server] Error in listener: ${error}`));

        this.server.listen(this.adapter.config.port, this.adapter.config.bind, () =>
            this.adapter.log.debug(
                `[MQTT Server] Started listener on ${this.adapter.config.bind}:${this.adapter.config.port}`,
            ),
        );
    }

    destroy() {
        super.destroy();
        this.adapter.log.debug(`[MQTT Server] Destroying`);

        for (const i in this.clients) {
            this.clients[i].destroy();
        }
        this.server.close();
    }
}

/**
 * Represents a single Shelly device connected via an external MQTT broker.
 * Extends MQTTClient but uses a shared MQTT connection instead of a raw TCP stream.
 */
class ExternalMQTTDeviceClient extends MQTTClient {
    constructor(adapter, objectHelper, eventEmitter, devicePrefix, server) {
        super(adapter, objectHelper, eventEmitter, null); // null stream – skips start()
        this.devicePrefix = devicePrefix;
        this.id = this.normalizeExternalDeviceId(devicePrefix);
        this._externalServer = server; // MQTTServerExternal reference
        this.setMqttPrefixById(devicePrefix);
    }

    /**
     * Extract the actual Shelly device id from an external MQTT topic prefix.
     * Supports multi-level prefixes like "home/room/shellyplus1pm-XXXX".
     *
     * @param {string} prefix - Full MQTT topic prefix
     * @returns {string} Last non-empty topic segment or the original value
     */
    normalizeExternalDeviceId(prefix) {
        if (typeof prefix !== 'string') {
            return prefix;
        }

        const parts = prefix.split('/').filter(Boolean);
        return parts.length ? parts[parts.length - 1] : prefix;
    }

    /**
     * Publish a value to the external MQTT broker instead of the raw stream.
     *
     * @param {string} topic - MQTT topic
     * @param {string} value - Payload value
     */
    publishStateValue(topic, value) {
        if (topic.includes('<mqttprefix>') && !this.getMqttPrefix()) {
            this.adapter.log.warn(
                `[MQTT External] Unable to publish message to ${this.getLogInfo()} - mqtt prefix was not set but is required: ${topic} = ${value}`,
            );
            return;
        }

        topic = this.replacePrefixIn(topic);

        const parsedQos = parseInt(this.adapter.config.qos, 10);
        const qos = Number.isFinite(parsedQos) && parsedQos >= 0 && parsedQos <= 2 ? parsedQos : 0;

        this.adapter.log.debug(
            `[MQTT External] Send state to ${this.getLogInfo()} with QoS ${qos}: ${topic} = ${value}`,
        );

        this._externalServer.publishToDevice(topic, value, qos);
    }

    /**
     * Called once when a device is first seen on the external broker.
     * Mirrors the initialization flow of the internal MQTTClient.
     */
    async initialize() {
        if (!this.deviceExists()) {
            this.adapter.log.error(
                `[MQTT External] Shelly device unknown – prefix "${this.id}" does not exist in adapter configuration! Maybe this device is not supported in this adapter version (${adapterVersion}).`,
            );
            return;
        }

        this.adapter.log.info(`[MQTT External] Initializing device ${this.getLogInfo()}`);
        this.initializing = true;

        await this.initDeviceModeFromState();
        await this.deleteOldStates();
        await this.createObjects();

        // Derive MQTT prefix from the device prefix (same as client ID in internal mode)
        if (!this.getMqttPrefix()) {
            this.setMqttPrefixById(this.id);
        }

        if (!this.getMqttPrefix()) {
            await this.setMqttPrefixHttp();
        }

        await this.adapter.deviceStatusUpdate(this.getDeviceId(), true);
        await this.httpIoBrokerState();

        if (this.getDeviceGen() >= 2) {
            try {
                this.publishStateValue(
                    '<mqttprefix>/rpc',
                    JSON.stringify({
                        id: this.getNextMsgId(),
                        src: INIT_SRC,
                        method: 'Shelly.GetDeviceInfo',
                        params: { ident: true },
                    }),
                );

                this.publishStateValue(
                    '<mqttprefix>/rpc',
                    JSON.stringify({
                        id: this.getNextMsgId(),
                        src: INIT_SRC,
                        method: 'Shelly.GetStatus',
                    }),
                );

                this.publishStateValue('<mqttprefix>/command', 'status_update');
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT External] Error publishing init commands to ${this.getLogInfo()}: ${err}`,
                );
            }
        }

        this.adapter.log.info(`[MQTT] Device with client id "${this.id}" initialized.`);
        this.initializing = false;

        if (this.publishQueue.length > 0) {
            this.adapter.log.debug(
                `[MQTT External] Processing ${this.publishQueue.length} queued packets for ${this.getLogInfo()}`,
            );
            await this.processPublishQueue();
        }
    }

    /**
     * Set the MQTT prefix directly from the device ID (used in external mode
     * where we already know the prefix from the topic).
     *
     * @param {string} prefix - Device MQTT prefix
     */
    setMqttPrefixById(prefix) {
        if (!this.mqttprefix) {
            this.mqttprefix = prefix;
            this.adapter.log.debug(`[MQTT External] setMqttPrefixById: ${this.mqttprefix}`);
        }
    }

    /**
     * Handle an incoming MQTT message for this device.
     * Queues the packet if still initializing, otherwise processes immediately.
     *
     * @param {string} topic - MQTT topic
     * @param {Buffer} payload - Message payload
     */
    async handleMessage(topic, payload) {
        if (this.adapter.isUnloaded || this.destroying) {
            return;
        }

        const packet = { topic, payload };

        if (this.initializing) {
            this.publishQueue.push(packet);
            return;
        }

        this.publishQueue.push(packet);

        if (!this.processingQueue) {
            await this.processPublishQueue();
        }
    }

    destroy() {
        this.destroying = true;
        try {
            super.destroy();
        } catch (error) {
            this.adapter.log.error(
                `[MQTT External] Error while destroying ${this.getLogInfo()}: ${error?.message || String(error)}`,
            );
        }
    }
}

/**
 * Connects the Shelly adapter to an existing external MQTT broker as a client.
 * Subscribes to all Shelly device topics and creates ExternalMQTTDeviceClient
 * instances for each discovered device.
 */
class MQTTServerExternal extends BaseServer {
    constructor(adapter, objectHelper, eventEmitter) {
        super(adapter, objectHelper, eventEmitter);
        this.mqttClientConnection = null;
        this.deviceClients = {}; // devicePrefix → ExternalMQTTDeviceClient
    }

    listen() {
        const host = this.adapter.config.mqttClientHost;
        const configuredPort = parseInt(this.adapter.config.mqttClientPort, 10) || 1883;
        const username = this.adapter.config.mqttusername;
        const password = this.adapter.config.mqttpassword;

        if (!host) {
            this.adapter.log.error(
                '[MQTT External] External MQTT broker host is not configured. Please set the host in the adapter settings.',
            );
            return;
        }

        let brokerUrl = host.trim();
        if (!brokerUrl.includes('://')) {
            brokerUrl = `mqtt://${brokerUrl}`;
        }

        let connectUrl;
        try {
            const parsedUrl = new URL(brokerUrl);
            if (!parsedUrl.port) {
                parsedUrl.port = String(configuredPort);
            }
            connectUrl = parsedUrl.toString();
        } catch (err) {
            this.adapter.log.error(
                `[MQTT External] Invalid external MQTT broker host "${brokerUrl}". Expected e.g. "broker.example.com" or "mqtt://broker.example.com:1883". Error: ${err?.message || String(err)}`,
            );
            return;
        }

        const options = {
            clientId: `iobroker_shelly_${this.adapter.instance}`,
            reconnectPeriod: 5000,
            connectTimeout: 10000,
        };

        if (username) {
            options.username = username;
        }
        if (password) {
            options.password = password;
        }

        this.adapter.log.info(`[MQTT External] Connecting to external MQTT broker at ${connectUrl}`);

        this.mqttClientConnection = mqttClient.connect(connectUrl, options);

        this.mqttClientConnection.on('connect', async () => {
            this.adapter.log.info(`[MQTT External] Connected to external MQTT broker at ${connectUrl}`);

            const topics = [
                'shellies/#',
                '+/events/#',
                '+/rpc',
                '+/online',
                '+/debug/#',
                '+/+/events/#',
                '+/+/rpc',
                '+/+/online',
                '+/+/debug/#',
                `${INIT_SRC}/#`,
            ];
            for (const topic of topics) {
                this.mqttClientConnection.subscribe(topic, { qos: 0 }, err => {
                    if (err) {
                        this.adapter.log.error(
                            `[MQTT External] Failed to subscribe to ${topic}: ${err?.message || String(err)}`,
                        );
                    }
                });
            }

            // Devices connected to an external broker do not re-send their state when the
            // adapter (re)connects. Actively poll known devices so the adapter is in sync.
            await this._requestStatusFromKnownDevices();
        });

        this.mqttClientConnection.on('message', async (topic, payload, packet) => {
            if (this.adapter.isUnloaded) {
                return;
            }

            // Route RPC responses that devices send back to our INIT_SRC topic
            if (topic.startsWith(`${INIT_SRC}/`)) {
                const payloadString = payload ? payload.toString() : '';
                this.adapter.log.debug(
                    `[MQTT External] Received INIT_SRC packet: topic=${topic}, payload=${payloadString}`,
                );
                this.adapter.log.debug(`[MQTT External] Routing INIT_SRC packet: topic=${topic}`);
                await this._handleInitSrcMessage(topic, payload);
                return;
            }

            const devicePrefix = this._identifyDevicePrefix(topic);
            if (!devicePrefix) {
                return;
            }

            const payloadString = payload ? payload.toString() : '';
            const isOnlineTopic = this._isOnlineTopicForPrefix(topic, devicePrefix);
            const isOnline = isOnlineTopic ? this._isOnlinePayload(payloadString) : false;

            this.adapter.log.debug(
                `[MQTT External] Received Shelly packet: topic=${topic}, prefix=${devicePrefix}, payload=${payloadString}`,
            );
            this.adapter.log.debug(
                `[MQTT External] Routing packet for device prefix "${devicePrefix}": topic=${topic}`,
            );

            let client = this.deviceClients[devicePrefix];
            const isRetained = packet?.retain === true;
            if (!client) {
                const shouldInitialize = (isOnlineTopic && isOnline) || !isRetained;
                if (!shouldInitialize) {
                    this.adapter.log.debug(
                        `[MQTT External] Ignoring retained message for unknown device "${devicePrefix}" until online=true is received (topic=${topic})`,
                    );
                    return;
                }
                if (!isRetained && (!isOnlineTopic || !isOnline)) {
                    this.adapter.log.debug(
                        `[MQTT External] New Shelly device "${devicePrefix}" discovered by live message (topic=${topic})`,
                    );
                }
                this.adapter.log.info(`[MQTT External] New Shelly device discovered: ${devicePrefix}`);
                client = new ExternalMQTTDeviceClient(
                    this.adapter,
                    this.objectHelper,
                    this.eventEmitter,
                    devicePrefix,
                    this,
                );
                this.deviceClients[devicePrefix] = client;

                // Initialize asynchronously - don't block message processing
                client.initialize().catch(err => {
                    this.adapter.log.error(
                        `[MQTT External] Error initializing device ${devicePrefix}: ${err?.message || err}`,
                    );
                });
            }

            await client.handleMessage(topic, payload);
        });

        this.mqttClientConnection.on('error', err => {
            this.adapter.log.error(`[MQTT External] Connection error: ${err?.message || err}`);
        });

        this.mqttClientConnection.on('close', () => {
            this.adapter.log.info('[MQTT External] Connection to external broker closed');
        });

        this.mqttClientConnection.on('reconnect', () => {
            this.adapter.log.debug('[MQTT External] Reconnecting to external MQTT broker...');
        });

        this.mqttClientConnection.on('offline', () => {
            this.adapter.log.warn('[MQTT External] External MQTT broker connection is offline');
        });
    }

    /**
     * Route an RPC response (topic starting with INIT_SRC/) to the correct device client.
     * When the adapter sends an RPC call with src: INIT_SRC, the Shelly device replies by
     * publishing to `INIT_SRC/rpc`. The response JSON contains a "src" field that identifies
     * the originating device (its MQTT prefix).
     *
     * @param {string} topic - MQTT topic (e.g. 'iobroker-init/rpc')
     * @param {Buffer} payload - Message payload
     */
    async _handleInitSrcMessage(topic, payload) {
        try {
            const payloadObj = JSON.parse(payload.toString());
            const srcDevice = payloadObj?.src; // MQTT prefix of the responding device
            if (!srcDevice) {
                this.adapter.log.debug(`[MQTT External] INIT_SRC packet without src ignored: topic=${topic}`);
                return;
            }

            this.adapter.log.debug(`[MQTT External] INIT_SRC response mapped to "${srcDevice}": topic=${topic}`);

            let client = this.deviceClients[srcDevice];
            if (!client) {
                this.adapter.log.info(`[MQTT External] New Shelly device discovered from RPC response: ${srcDevice}`);
                client = new ExternalMQTTDeviceClient(
                    this.adapter,
                    this.objectHelper,
                    this.eventEmitter,
                    srcDevice,
                    this,
                );
                this.deviceClients[srcDevice] = client;
                client.initialize().catch(err => {
                    this.adapter.log.error(
                        `[MQTT External] Error initializing device ${srcDevice} from RPC response: ${err?.message || err}`,
                    );
                });
            }

            await client.handleMessage(topic, payload);
        } catch (err) {
            this.adapter.log.debug(
                `[MQTT External] Malformed RPC response on ${topic}: ${err?.message || err}; payload=${payload?.toString() || ''}`,
            );
        }
    }

    /**
     * On every (re)connect to the external broker, request the current status from all
     * already-known ioBroker Shelly devices.
     */
    async _requestStatusFromKnownDevices() {
        try {
            const deviceIds = await this.adapter.getAllDeviceIds();
            for (const deviceId of deviceIds) {
                // Device IDs are formatted as '<type>#<serial>#1' (e.g. 'SHSW-25#ABC123#1')
                const parts = deviceId.split('#');
                if (parts.length < 2) {
                    continue;
                }
                const [deviceType, serialId] = parts;
                const deviceClass = datapoints.getDeviceClassByType(deviceType);
                if (!deviceClass) {
                    continue;
                }

                const devicePrefix = `${deviceClass}-${serialId}`;
                let client = this.deviceClients[devicePrefix];
                if (!client) {
                    client = new ExternalMQTTDeviceClient(
                        this.adapter,
                        this.objectHelper,
                        this.eventEmitter,
                        devicePrefix,
                        this,
                    );
                    this.deviceClients[devicePrefix] = client;
                    client
                        .initialize()
                        .then(() => this._sendStatusRequest(client))
                        .catch(err => {
                            this.adapter.log.error(
                                `[MQTT External] Error initializing known device ${devicePrefix}: ${err?.message || err}`,
                            );
                        });
                } else {
                    this._sendStatusRequest(client);
                }
            }
        } catch (err) {
            this.adapter.log.error(
                `[MQTT External] Error requesting status from known devices: ${err?.message || err}`,
            );
        }
    }

    /**
     * Send a lightweight status request to an already initialized device client.
     *
     * @param {ExternalMQTTDeviceClient} client
     */
    _sendStatusRequest(client) {
        if (!client.getMqttPrefix()) {
            return;
        }
        try {
            if (client.getDeviceGen() >= 2) {
                client.publishStateValue(
                    '<mqttprefix>/rpc',
                    JSON.stringify({
                        id: client.getNextMsgId(),
                        src: INIT_SRC,
                        method: 'Shelly.GetStatus',
                    }),
                );
            }
            // status_update works for Gen1 and can also trigger refresh on Gen2+.
            client.publishStateValue('<mqttprefix>/command', 'status_update');
        } catch (err) {
            this.adapter.log.debug(
                `[MQTT External] Error sending status request to ${client.getLogInfo()}: ${err?.message || err}`,
            );
        }
    }

    /**
     * Checks if a topic is the online topic of the detected device prefix.
     * Gen2+ pattern: "<prefix>/online"
     * Gen1 pattern:  "shellies/<prefix>/online"
     *
     * @param {string} topic - Full MQTT topic string
     * @param {string} devicePrefix - Extracted Shelly device prefix
     * @returns {boolean} True when topic is an online topic for this prefix
     */
    _isOnlineTopicForPrefix(topic, devicePrefix) {
        return topic === `${devicePrefix}/online` || topic === `shellies/${devicePrefix}/online`;
    }

    /**
     * Evaluates a MQTT online payload.
     *
     * @param {Buffer|string} payload - MQTT payload to evaluate
     * @returns {boolean} True if payload indicates the device is online
     */
    _isOnlinePayload(payload) {
        let value = '';
        if (typeof payload === 'string') {
            value = payload;
        } else if (payload) {
            value = payload.toString();
        }
        value = value.trim().toLowerCase();
        return value === 'true' || value === '1' || value === 'on';
    }

    /**
     * Extract the Shelly device MQTT prefix from an incoming topic.
     * Returns null for topics that don't belong to a specific device.
     *
     * @param {string} topic - MQTT topic
     * @returns {string|null} Device prefix or null
     */
    _identifyDevicePrefix(topic) {
        const parts = topic.split('/');

        // Ignore non-device topics
        if (!parts || parts.length < 2) {
            return null;
        }

        // Skip adapter's own response topic
        if (parts[0] === 'iobroker' || parts[0] === INIT_SRC) {
            return null;
        }

        // Gen1: shellies/<prefix>/...  (e.g. shellies/shellyswitch25-ABC123/relay/0)
        // shellies/announce is a broadcast, not a device-specific topic
        if (parts[0] === 'shellies') {
            if (parts.length >= 3 && parts[1] !== 'announce') {
                return parts[1];
            }
            return null;
        }

        // Gen2+: <prefix>/events/...  <prefix>/rpc  <prefix>/online  <prefix>/debug/...
        // Handle /events/ first so "<prefix>/events/rpc" maps to "<prefix>".
        if (topic.includes('/events/')) {
            return topic.split('/events/')[0];
        }
        // Support multi-level prefixes by using topic suffix detection.
        if (topic.endsWith('/rpc') || topic.endsWith('/online')) {
            return topic.substring(0, topic.lastIndexOf('/'));
        }
        if (topic.includes('/debug/')) {
            return topic.split('/debug/')[0];
        }

        return null;
    }

    /**
     * Publish a message to a device through the external MQTT broker.
     *
     * @param {string} topic - MQTT topic
     * @param {string} value - Payload
     * @param {number} qos - QoS level
     */
    publishToDevice(topic, value, qos) {
        if (this.mqttClientConnection && this.mqttClientConnection.connected) {
            this.mqttClientConnection.publish(topic, value, { qos: qos || 0 }, err => {
                if (err) {
                    this.adapter.log.debug(
                        `[MQTT External] Error publishing to topic ${topic}: ${err?.message || String(err)}`,
                    );
                }
            });
        } else {
            this.adapter.log.warn(`[MQTT External] Cannot publish to ${topic} – not connected to external broker`);
        }
    }

    destroy() {
        super.destroy();
        this.adapter.log.debug('[MQTT External] Destroying');

        for (const prefix in this.deviceClients) {
            this.deviceClients[prefix].destroy();
        }
        this.deviceClients = {};

        if (this.mqttClientConnection) {
            this.mqttClientConnection.end(true);
            this.mqttClientConnection = null;
        }
    }
}

module.exports = {
    MQTTServer,
    MQTTServerExternal,
};
