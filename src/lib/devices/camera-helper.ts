import type { DeviceDefinition } from '../deviceTypes';
import * as shellyHelper from '../shelly-helper';

/**
 * Adds a generic camera definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Camera
 *
 * @param deviceObj
 * @param cameraId
 */
function addCamera(deviceObj: DeviceDefinition, cameraId: number): void {
    deviceObj[`Camera${cameraId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/Camera.GetConfig?id=${cameraId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Camera${cameraId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Camera.SetConfig',
                    params: { id: cameraId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`Camera${cameraId}.arm`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camera:${cameraId}`,
            mqtt_publish_funct: value => JSON.parse(value).arm,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Camera.Set',
                    params: { id: cameraId, arm: value },
                });
            },
        },
        common: {
            name: 'Armed',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Camera${cameraId}.privacy`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camera:${cameraId}`,
            mqtt_publish_funct: value => JSON.parse(value).privacy,
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Camera.Set',
                    params: { id: cameraId, privacy: value },
                });
            },
        },
        common: {
            name: 'Privacy mode',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`Camera${cameraId}.motion`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camera:${cameraId}`,
            mqtt_publish_funct: value => JSON.parse(value).motion,
        },
        common: {
            name: 'Motion',
            type: 'boolean',
            role: 'sensor.motion',
            read: true,
            write: false,
        },
    };

    deviceObj[`Camera${cameraId}.streams`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camera:${cameraId}`,
            mqtt_publish_funct: value => JSON.parse(value).streams,
        },
        common: {
            name: 'Active streams',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
    };

    deviceObj[`Camera${cameraId}.streamer`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camera:${cameraId}`,
            mqtt_publish_funct: value => JSON.parse(value).streamer,
        },
        common: {
            name: 'Streamer state',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    deviceObj[`Camera${cameraId}.streamer_version`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camera:${cameraId}`,
            mqtt_publish_funct: value => JSON.parse(value).streamer_version,
        },
        common: {
            name: 'Streamer version',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds a generic camera zone definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/CameraZone
 *
 * @param deviceObj
 * @param zoneId
 */
function addCameraZone(deviceObj: DeviceDefinition, zoneId: number): void {
    deviceObj[`CameraZone${zoneId}.ChannelName`] = {
        mqtt: {
            http_publish: `/rpc/CameraZone.GetConfig?id=${zoneId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `CameraZone${zoneId}`, JSON.parse(value).name)
                    : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CameraZone.SetConfig',
                    params: { id: zoneId, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };

    deviceObj[`CameraZone${zoneId}.enable`] = {
        mqtt: {
            http_publish: `/rpc/CameraZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => (value ? JSON.parse(value).enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'CameraZone.SetConfig',
                    params: { id: zoneId, config: { enable: value } },
                });
            },
        },
        common: {
            name: 'Zone enabled',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    deviceObj[`CameraZone${zoneId}.type`] = {
        mqtt: {
            http_publish: `/rpc/CameraZone.GetConfig?id=${zoneId}`,
            http_publish_funct: value => (value ? JSON.parse(value).type : undefined),
        },
        common: {
            name: 'Zone type',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
            states: {
                motion: 'motion',
                privacy: 'privacy',
            },
        },
    };

    deviceObj[`CameraZone${zoneId}.motion`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/camerazone:${zoneId}`,
            mqtt_publish_funct: value => JSON.parse(value).motion,
        },
        common: {
            name: 'Motion',
            type: 'boolean',
            role: 'sensor.motion',
            read: true,
            write: false,
        },
    };
}

/**
 * Adds a generic streamer definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Streamer
 *
 * The Streamer component only exposes WebRTC action methods (Offer/Answer/GetAnswer/
 * SetStreamSource/StopStream) and has no status or config states of its own; the streamer
 * state and version are published by (and located at) the Camera component. This is a
 * placeholder for future streamer states.
 *
 * @param _deviceObj
 * @param _streamerId
 */
function addStreamer(_deviceObj: DeviceDefinition, _streamerId: number): void {
    // no states yet
}

/**
 * Adds a generic storage definition for Gen 2+ devices
 * see
 * https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Storage
 *
 * @param deviceObj
 * @param storageId
 */
function addStorage(deviceObj: DeviceDefinition, storageId: number): void {
    deviceObj[`Storage${storageId}.present`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/storage:${storageId}`,
            mqtt_publish_funct: value => JSON.parse(value).present,
        },
        common: {
            name: 'Storage present',
            type: 'boolean',
            role: 'indicator',
            read: true,
            write: false,
        },
    };

    deviceObj[`Storage${storageId}.active`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/storage:${storageId}`,
            mqtt_publish_funct: value => JSON.parse(value).active,
        },
        common: {
            name: 'Storage active',
            type: 'boolean',
            role: 'indicator',
            read: true,
            write: false,
        },
    };

    deviceObj[`Storage${storageId}.fs_size`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/storage:${storageId}`,
            mqtt_publish_funct: value => JSON.parse(value).fs_size,
        },
        common: {
            name: 'Storage size',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'B',
        },
    };

    deviceObj[`Storage${storageId}.fs_free`] = {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/storage:${storageId}`,
            mqtt_publish_funct: value => JSON.parse(value).fs_free,
        },
        common: {
            name: 'Storage free',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'B',
        },
    };
}

export { addCamera, addCameraZone, addStreamer, addStorage };
