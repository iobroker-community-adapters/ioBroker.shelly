import type { DeviceDefinition } from '../../deviceTypes';

/**
 * Top AC Portable EV Charger / topacportableevcharger
 *
 * This device does not provide a device type, so 'topacportableevcharger' is used as deviceId.
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyX/XT1/TopACPortableEVCharger
 */
const topacportableevcharger: DeviceDefinition = {
    'Charger.WorkState': {
        mqtt: {
            http_publish: '/rpc/Enum.GetStatus?owner="service:0"&role="work_state"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
        },
        common: {
            name: 'Work state',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    'Charger.CurrentLimit': {
        mqtt: {
            http_publish: '/rpc/Number.GetStatus?owner="service:0"&role="current_limit"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Number.Set',
                    params: { owner: 'service:0', role: 'current_limit', value: value },
                });
            },
        },
        common: {
            name: 'Current limit',
            type: 'number',
            role: 'level',
            unit: 'A',
            read: true,
            write: true,
        },
    },
    'Charger.StartCharging': {
        mqtt: {
            http_publish: '/rpc/Boolean.GetStatus?owner="service:0"&role="start_charging"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Boolean.Set',
                    params: { owner: 'service:0', role: 'start_charging', value: value },
                });
            },
        },
        common: {
            name: 'Start charging',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
        },
    },
    'Charger.EnergyCharge': {
        mqtt: {
            http_publish: '/rpc/Number.GetStatus?owner="service:0"&role="energy_charge"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
        },
        common: {
            name: 'Session energy consumption',
            type: 'number',
            role: 'value.energy',
            unit: 'kWh',
            read: true,
            write: false,
        },
    },
    'Charger.TimeCharge': {
        mqtt: {
            http_publish: '/rpc/Number.GetStatus?owner="service:0"&role="time_charge"',
            http_publish_funct: value => (value ? JSON.parse(value).value : undefined),
        },
        common: {
            name: 'Session duration',
            type: 'number',
            role: 'value',
            unit: 'min',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.TotalCurrent': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.total_current : undefined),
        },
        common: {
            name: 'Total current',
            type: 'number',
            role: 'value.current',
            unit: 'A',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.TotalPower': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.total_power : undefined),
        },
        common: {
            name: 'Total power',
            type: 'number',
            role: 'value.power',
            unit: 'W',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.TotalActEnergy': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.total_act_energy : undefined),
        },
        common: {
            name: 'Total active energy',
            type: 'number',
            role: 'value.energy',
            unit: 'kWh',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseAVoltage': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_a.voltage : undefined),
        },
        common: {
            name: 'Phase A voltage',
            type: 'number',
            role: 'value.voltage',
            unit: 'V',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseACurrent': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_a.current : undefined),
        },
        common: {
            name: 'Phase A current',
            type: 'number',
            role: 'value.current',
            unit: 'A',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseAPower': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_a.power : undefined),
        },
        common: {
            name: 'Phase A power',
            type: 'number',
            role: 'value.power',
            unit: 'W',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseBVoltage': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_b.voltage : undefined),
        },
        common: {
            name: 'Phase B voltage',
            type: 'number',
            role: 'value.voltage',
            unit: 'V',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseBCurrent': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_b.current : undefined),
        },
        common: {
            name: 'Phase B current',
            type: 'number',
            role: 'value.current',
            unit: 'A',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseBPower': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_b.power : undefined),
        },
        common: {
            name: 'Phase B power',
            type: 'number',
            role: 'value.power',
            unit: 'W',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseCVoltage': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_c.voltage : undefined),
        },
        common: {
            name: 'Phase C voltage',
            type: 'number',
            role: 'value.voltage',
            unit: 'V',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseCCurrent': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_c.current : undefined),
        },
        common: {
            name: 'Phase C current',
            type: 'number',
            role: 'value.current',
            unit: 'A',
            read: true,
            write: false,
        },
    },
    'PhaseInfo.PhaseCPower': {
        mqtt: {
            http_publish: '/rpc/Object.GetStatus?owner="service:0"&role="phase_info"',
            http_publish_funct: value => (value ? JSON.parse(value).value.phase_c.power : undefined),
        },
        common: {
            name: 'Phase C power',
            type: 'number',
            role: 'value.power',
            unit: 'W',
            read: true,
            write: false,
        },
    },
};

export { topacportableevcharger };
