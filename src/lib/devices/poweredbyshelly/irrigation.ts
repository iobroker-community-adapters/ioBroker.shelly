import type { DeviceDefinition, DeviceState } from '../../deviceTypes';

/**
 * Frankever Smart Sprinkler Controller / irrigation
 *
 * Shelly XT1 based irrigation controller (product code S3XT-0S).
 * The device does not report a device type, so 'irrigation' is used as deviceId
 * (client-id reported by the device is e.g. 'irrigation-b08184ee0488').
 *
 * The irrigation functionality is provided by an XMOD service (owner "service:0")
 * exposing typed virtual components (Boolean/Number/Enum/Object) per role.
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyX/XT1/IrrigationController
 * https://www.shelly.com/products/frankever-smart-sprinkler-controller-fk-06x
 */

const irrigation: DeviceDefinition = {
    'Irrigation.AverageTemperature': {
        mqtt: {
            http_publish: '/rpc/Number.GetStatus?owner="service:0"&role="average_temperature"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
        },
        common: {
            name: 'Average temperature',
            type: 'number',
            role: 'value.temperature',
            unit: '°C',
            read: true,
            write: false,
        },
    },
    'Irrigation.LastPrecipitation': {
        mqtt: {
            http_publish: '/rpc/Number.GetStatus?owner="service:0"&role="last_precipitation"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
        },
        common: {
            name: 'Precipitation in the last 24 hours',
            type: 'number',
            role: 'value',
            unit: 'mm/m²',
            read: true,
            write: false,
        },
    },
    'Irrigation.ActiveSequence': {
        mqtt: {
            http_publish: '/rpc/Enum.GetStatus?owner="service:0"&role="active_sequence"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Enum.Set',
                    params: { owner: 'service:0', role: 'active_sequence', value: value },
                });
            },
        },
        common: {
            name: 'Active irrigation sequence',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    },
};

// Zones 0..5: enable switch plus status information (duration/started_at/source)
for (let zoneId = 0; zoneId <= 5; zoneId++) {
    const enableState: DeviceState = {
        mqtt: {
            http_publish: `/rpc/Boolean.GetStatus?owner="service:0"&role="zone${zoneId}"`,
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Boolean.Set',
                    params: { owner: 'service:0', role: `zone${zoneId}`, value: value },
                });
            },
        },
        common: {
            name: 'Enable zone irrigation',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    };

    const durationState: DeviceState = {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="zones_status"',
            http_publish_funct: value => (value ? JSON.parse(value).value[`zone${zoneId}`]?.duration : undefined),
        },
        common: {
            name: 'Watering duration',
            type: 'number',
            role: 'value',
            unit: 'min',
            read: true,
            write: false,
        },
    };

    const startedAtState: DeviceState = {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="zones_status"',
            http_publish_funct: value => (value ? JSON.parse(value).value[`zone${zoneId}`]?.started_at : undefined),
        },
        common: {
            name: 'Started at',
            type: 'number',
            role: 'date',
            read: true,
            write: false,
        },
    };

    const sourceState: DeviceState = {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="zones_status"',
            http_publish_funct: value => (value ? JSON.parse(value).value[`zone${zoneId}`]?.source : undefined),
        },
        common: {
            name: 'Command source',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };

    irrigation[`Zone${zoneId}.Enable`] = enableState;
    irrigation[`Zone${zoneId}.Duration`] = durationState;
    irrigation[`Zone${zoneId}.StartedAt`] = startedAtState;
    irrigation[`Zone${zoneId}.Source`] = sourceState;
}

export { irrigation };
