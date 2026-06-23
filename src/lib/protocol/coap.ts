import { BaseClient, BaseServer } from './base';
import * as datapoints from '../datapoints';
import Shelly, { type CoapStatusPayload, type CoapTuple } from 'shelly-iot';
import type { EventEmitter } from 'node:events';
import type { ShellyAdapter } from '../../main';
import type ObjectHelper from '../objectHelper';

// Whether `funct` is an `async` function (so the caller knows to `await` its result).
function isAsync(funct: unknown): boolean | undefined {
    if (typeof funct === 'function' && funct.constructor) {
        return funct.constructor.name == 'AsyncFunction';
    }
    return undefined;
}

/**
 * get the CoAP value by key
 *
 * @param objKey - like 112 or '112' or [11,12] or ['11','12']
 * @param payload - [[0,111,0],[0,112,1]]
 */
function getCoapValue(
    objKey: string | number | (string | number)[] | undefined,
    payload: CoapTuple[],
): ioBroker.StateValue | (ioBroker.StateValue | undefined)[] | undefined {
    if (!Array.isArray(objKey)) {
        const key = Number(objKey);
        const index = payload.findIndex(item => item[1] === key);
        return index >= 0 ? payload[index][2] : undefined;
    }

    const ret: (ioBroker.StateValue | undefined)[] = [];
    for (const entry of objKey) {
        const key = Number(entry);
        const index = payload.findIndex(item => item[1] === key);
        ret.push(index >= 0 ? payload[index][2] : undefined);
    }
    return ret;
}

class CoAPClient extends BaseClient {
    /** The shared shelly-iot listener instance. */
    shelly: Shelly;
    listenerus?: (deviceId: string, payload: CoapStatusPayload) => void;
    listenerds?: (deviceId: string, connected: boolean) => void;

    constructor(
        adapter: ShellyAdapter,
        objectHelper: ObjectHelper,
        eventEmitter: EventEmitter,
        shelly: Shelly,
        deviceId: string,
        ip: string,
        payload: CoapStatusPayload,
        description: unknown,
    ) {
        super('coap', adapter, objectHelper, eventEmitter);

        this.shelly = shelly;

        this.deviceId = deviceId; // e.g. SHRGBW2#D88040#2
        this.setIP(ip, 'CoAP').catch((e: unknown) => this.adapter.log.error(`[CoAP] setIP failed: ${String(e)}`)); // e.g. 192.168.1.2

        // Device Mode information (init). A single-key lookup yields a scalar; coerce to the
        // string-or-undefined that `deviceMode` expects.
        const mode = getCoapValue('9101', payload.G); // 9101 = Mode
        this.deviceMode = mode === undefined || mode === null ? undefined : String(mode);

        this.adapter.log.debug(
            `[CoAP] Starting new client. Device ID: "${this.deviceId}", Device Mode: "${this.deviceMode ?? '<default>'}", IP: ${ip}`,
        );
        this.start(payload, description).catch((e: unknown) =>
            this.adapter.log.error(`[CoAP] start failed: ${String(e)}`),
        );
    }

    /**
     * @inheritdoc
     */
    getId(): string | undefined {
        if (!this.id) {
            const deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
            const serialId = this.getSerialId();

            if (deviceClass && serialId) {
                this.id = `${deviceClass}-${serialId}`;
            }
        }
        return this.id;
    }

    /**
     * @inheritdoc
     */
    getSerialId(): string {
        if (!this.serialId) {
            const deviceId = this.getDeviceId();
            if (typeof deviceId === 'string') {
                const deviceType = deviceId.split('#');
                if (deviceType) {
                    this.serialId = deviceType[1];
                }
            }
        }
        return this.serialId ?? '';
    }

    /**
     * @inheritdoc
     */
    getDeviceClass(): string {
        if (!this.deviceClass) {
            this.deviceClass = datapoints.getDeviceClassByType(this.getDeviceType());
        }
        return this.deviceClass ?? '';
    }

    /**
     * @inheritdoc
     */
    getDeviceType(): string | undefined {
        if (!this.deviceType) {
            const deviceId = this.getDeviceId();
            if (typeof deviceId === 'string') {
                this.deviceType = deviceId.split('#').slice(0, 1).join(); // SHRGBW2#D88040#1 -> SHRGBW2
            }
        }
        return this.deviceType;
    }

    destroy(): void {
        super.destroy();
        this.adapter.log.debug(`[CoAP] Destroying`);

        if (this.listenerus) {
            this.shelly.removeListener('update-device-status', this.listenerus);
        }
        if (this.listenerds) {
            this.shelly.removeListener('device-connection-status', this.listenerds);
        }
    }

    /**
     * State changes from device will be saved in the ioBroker states
     *
     * @param payload - object can be every type of value
     */
    async createIoBrokerState(payload: CoapStatusPayload): Promise<void> {
        this.adapter.log.silly(`[CoAP] Message for ${this.getLogInfo()}: ${JSON.stringify(payload)}`);

        const dps = this.getAllTypePublishStates();
        for (const dp of dps) {
            const deviceId = this.getDeviceId();
            const fullStateId = `${deviceId}.${dp.state}`;
            let value: any;

            this.adapter.log.silly(
                `[CoAP] Message with value for ${this.getLogInfo()}: state: ${fullStateId}, payload: ${JSON.stringify(payload)}`,
            );

            try {
                const coapValue = getCoapValue(dp.coap?.coap_publish, payload.G);

                if (coapValue !== undefined) {
                    if (dp.coap?.coap_publish_funct) {
                        value = isAsync(dp.coap.coap_publish_funct)
                            ? await dp.coap.coap_publish_funct(coapValue, this)
                            : dp.coap.coap_publish_funct(coapValue, this);
                    } else {
                        value = coapValue;
                    }

                    if (dp.common.type === 'boolean' && value === 'false') {
                        value = false;
                    } else if (dp.common.type === 'boolean' && value === 'true') {
                        value = true;
                    } else if (dp.common.type === 'number' && value !== undefined) {
                        value = Number(value);
                    }

                    if (Object.prototype.hasOwnProperty.call(this.device, dp.state ?? '')) {
                        if (
                            value !== undefined &&
                            (!Object.prototype.hasOwnProperty.call(this.stateValueCache, fullStateId) ||
                                this.stateValueCache[fullStateId] !== value ||
                                this.adapter.config.updateUnchangedObjects)
                        ) {
                            this.adapter.log.debug(
                                `[CoAP] State change ${this.getLogInfo()}: state: ${fullStateId}, value: ${JSON.stringify(value)}`,
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
                    `[CoAP] Error ${err} in function dp.coap.coap_publish_funct of state ${fullStateId} for ${this.getLogInfo()}`,
                );
            }
        }
        this.objectHelper.processObjectQueue(() => {});
    }

    async start(payload: CoapStatusPayload, description: unknown): Promise<void> {
        if (this.deviceExists()) {
            // needs getDeviceClass()
            const polltime = this.getPollTime();
            if (polltime > 0) {
                this.adapter.log.info(`[CoAP] Device ${this.getLogInfo()} connected! Polltime set to ${polltime} sec.`);
            } else {
                this.adapter.log.info(`[CoAP] Device ${this.getLogInfo()} connected! No polling`);
            }

            this.adapter.log.debug(
                `[CoAP] 1. Shelly device info for ${this.getDeviceId()}: ${JSON.stringify(description)}`,
            );
            this.adapter.log.debug(
                `[CoAP] 2. Shelly device info for ${this.getDeviceId()}: ${JSON.stringify(payload)}`,
            );

            // Device Mode information (init)
            await this.initDeviceModeFromState();

            await this.deleteOldStates();
            await this.createObjects();

            this.adapter
                .deviceStatusUpdate(this.getDeviceId(), true) // Device online
                .catch((e: unknown) => this.adapter.log.error(`[CoAP] deviceStatusUpdate failed: ${String(e)}`));

            this.httpIoBrokerState().catch((e: unknown) =>
                this.adapter.log.error(`[CoAP] httpIoBrokerState failed: ${String(e)}`),
            );

            if (payload) {
                this.createIoBrokerState(payload).catch((e: unknown) =>
                    this.adapter.log.error(`[CoAP] createIoBrokerState failed: ${String(e)}`),
                );
            }

            this.listener();
        } else {
            this.adapter.log.error(
                `[CoAP] Device unknown, configuration for Shelly device ${this.getLogInfo()} does not exist!`,
            );
            this.adapter.log.error(
                `[CoAP] 1. Send developer following info for ${this.getDeviceId()}: ${JSON.stringify(description)}`,
            );
            this.adapter.log.error(
                `[CoAP] 2. Send developer following info for ${this.getDeviceId()}: ${JSON.stringify(payload)}`,
            );
        }
    }

    listener(): void {
        this.shelly.on('error', (err: unknown) =>
            this.adapter.log.debug(`[CoAP] Listener - error handling data: ${String(err)}`),
        );

        this.shelly.on(
            'update-device-status',
            (this.listenerus = async (deviceId, payload) => {
                if (this.getOldDeviceInfo(deviceId) === this.getDeviceId()) {
                    // Device Mode information (new)
                    const newDeviceMode = getCoapValue('9101', payload.G); // 9101 = Mode
                    if (newDeviceMode) {
                        await this.setDeviceMode(String(newDeviceMode));
                    }

                    await this.createIoBrokerState(payload);
                }
            }),
        );

        this.shelly.on(
            'device-connection-status',
            (this.listenerds = (deviceId, connected) => {
                this.adapter.log.debug(`[CoAP] Connection update received for ${deviceId}: ${connected}`);
                if (this.getOldDeviceInfo(deviceId) === this.getDeviceId()) {
                    this.adapter
                        .deviceStatusUpdate(this.getDeviceId(), true) // Device online
                        .catch((e: unknown) =>
                            this.adapter.log.error(`[CoAP] deviceStatusUpdate failed: ${String(e)}`),
                        );
                }
            }),
        );
    }
}

export class CoAPServer extends BaseServer {
    /** Active CoAP clients by device id. */
    clients: Record<string, CoAPClient>;
    /** Device ids that matched a blacklist entry (cached). */
    blacklist: Record<string, string>;

    constructor(adapter: ShellyAdapter, objectHelper: ObjectHelper, eventEmitter: EventEmitter) {
        super(adapter, objectHelper, eventEmitter);

        this.clients = {};
        this.blacklist = {};
    }

    isBlackListed(deviceId: string | undefined): boolean {
        if (deviceId && this.blacklist[deviceId]) {
            return true;
        }
        if (deviceId && this.adapter.config.blacklist) {
            for (const key of this.adapter.config.blacklist as { id?: string }[]) {
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

    listen(): void {
        let options: Record<string, unknown> = {};
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

        shelly.on('error', (err: unknown) =>
            this.adapter.log.debug(`[CoAP Server] Error - handling data: ${String(err)}`),
        );

        shelly.on('update-device-status', (deviceId: string, status: CoapStatusPayload) => {
            this.adapter.log.debug(`[CoAP Server] Status update received for ${deviceId}: ${JSON.stringify(status)}`);

            if (deviceId && typeof deviceId === 'string') {
                shelly.getDeviceDescription(
                    deviceId,
                    (err: unknown, deviceId: string, description: unknown, ip: string) => {
                        if (!err && deviceId && ip) {
                            this.adapter.log.debug(
                                `[CoAP Server] Received device description for ${deviceId} (${ip}): ${JSON.stringify(description)}`,
                            );

                            // ip address of coap device changed
                            if (this.clients[deviceId] && this.clients[deviceId].getIP() !== ip) {
                                this.adapter.log.debug(
                                    `[CoAP Server] IP of device ${deviceId} changed from ${this.clients[deviceId].getIP()} to ${ip}`,
                                );

                                this.clients[deviceId].destroy();
                                delete this.clients[deviceId];
                            }

                            if (!this.clients[deviceId]) {
                                if (!this.isBlackListed(deviceId) && !this.isBlackListed(ip)) {
                                    this.clients[deviceId] = new CoAPClient(
                                        this.adapter,
                                        this.objectHelper,
                                        this.eventEmitter,
                                        shelly,
                                        deviceId,
                                        ip,
                                        status,
                                        description,
                                    );
                                } else {
                                    this.adapter.log.info(`[CoAP Server] Device is blacklisted: ${deviceId}`);
                                }
                            }
                        }
                    },
                );
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

        shelly.listen(() => this.adapter.log.info('[CoAP Server] Listening for packets in the network'));
    }

    destroy(): void {
        super.destroy();
        this.adapter.log.debug(`[CoAP Server] Destroying`);

        // TODO: Disconnect all clients
    }
}
