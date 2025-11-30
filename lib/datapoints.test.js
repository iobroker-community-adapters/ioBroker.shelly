const expect = require('chai').expect;
const datapoints = require('../lib/datapoints');

const allDevices = datapoints.getAllDeviceDefinitions();

function runTestOnEachDevice(cb) {
    for (const [deviceClass, device] of Object.entries(allDevices)) {
        cb(deviceClass, device);
    }
}

describe('Test Device Definitions', function () {
    it('Common properties', function () {
        this.timeout(5000);

        runTestOnEachDevice((deviceClass, device) => {
            expect(deviceClass).to.be.string;
            //expect(deviceClass).to.be.equal(deviceClass.toLowerCase());

            for (const stateId in device) {
                const state = device[stateId];

                expect(state).to.be.an('object');

                expect(state).to.have.own.property('common');
                expect(state.common).to.be.an('object');

                expect(state.common).to.have.own.property('name');
                expect(state.common).to.have.own.property('type');
                expect(state.common).to.have.own.property('role');

                if (typeof state.common?.name === 'object') {
                    // TODO: Add uk
                    expect(
                        state.common.name,
                        `Missing translation in device class: ${deviceClass} (${stateId})`,
                    ).to.include.all.keys('en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'zh-cn');
                }
            }
        });
    });

    it('Protocol properties', function () {
        this.timeout(5000);

        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const state = device[stateId];

                // MQTT must be implemented by all devices
                expect(
                    state,
                    `Missing mqtt object definition device class: ${deviceClass} (${stateId})`,
                ).to.have.own.property('mqtt');
                expect(state.mqtt).to.be.an('object');

                // CoAP is just supported by gen 1 devices
                if (datapoints.getDeviceGen(deviceClass) >= 2) {
                    expect(state).not.to.have.own.property('coap');
                } else {
                    expect(
                        state,
                        `Missing coap object definition for device class: ${deviceClass} (${stateId})`,
                    ).to.have.own.property('coap');
                    expect(state.coap).to.be.an('object');
                }
            }
        });
    });

    it('Read properties', function () {
        this.timeout(5000);

        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const state = device[stateId];

                expect(state.common).to.have.own.property('read');
                expect(state.common.read).to.be.a('boolean');

                if (state.common.read) {
                    if (state.coap) {
                        expect(
                            Object.keys(state.coap),
                            `Missing (or invalid) coap publish definition for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('no_display')) {
                                return keys.length === 1;
                            }

                            return (
                                keys.includes('coap_publish') ||
                                keys.includes('init_value') ||
                                keys.includes('init_funct') ||
                                keys.includes('http_publish')
                            );
                        });

                        expect(state.coap, `Invalid coap publish for ${deviceClass} (${stateId})`).not.to.have.any.keys(
                            'mqtt_publish',
                            'mqtt_publish_funct',
                        );

                        // coap_publish_funct needs coap_publish
                        expect(
                            Object.keys(state.coap),
                            `Missing coap_publish for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('coap_publish_funct')) {
                                expect(state.coap.coap_publish_funct).to.be.a('function');
                                return keys.includes('coap_publish');
                            }

                            return true;
                        });

                        // http_publish_funct needs http_publish
                        expect(
                            Object.keys(state.coap),
                            `Missing http_publish for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('http_publish_funct')) {
                                expect(state.coap.http_publish_funct).to.be.a('function');
                                return keys.includes('http_publish');
                            }

                            return true;
                        });

                        // http cannot be used if type command is defined
                        expect(
                            Object.keys(state.mqtt),
                            `Unreachable http_publish for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('coap_publish')) {
                                return !keys.includes('http_publish');
                            }

                            return true;
                        });
                    }

                    if (state.mqtt) {
                        expect(
                            Object.keys(state.mqtt),
                            `Missing (or invalid) mqtt publish definition for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('no_display')) {
                                return keys.length === 1;
                            }

                            return (
                                keys.includes('mqtt_publish') ||
                                keys.includes('init_value') ||
                                keys.includes('init_funct') ||
                                keys.includes('http_publish')
                            );
                        });

                        expect(state.mqtt, `Invalid mqtt publish for ${deviceClass} (${stateId})`).not.to.have.any.keys(
                            'coap_publish',
                            'coap_publish_funct',
                        );

                        // mqtt_publish_funct needs mqtt_publish
                        expect(
                            Object.keys(state.mqtt),
                            `Missing mqtt_publish for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('mqtt_publish_funct')) {
                                expect(state.mqtt.mqtt_publish_funct).to.be.a('function');
                                return keys.includes('mqtt_publish');
                            }

                            return true;
                        });

                        // http_publish_funct needs http_publish
                        expect(
                            Object.keys(state.mqtt),
                            `Missing http_publish for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('http_publish_funct')) {
                                expect(state.mqtt.http_publish_funct).to.be.a('function');
                                return keys.includes('http_publish');
                            }

                            return true;
                        });

                        // http cannot be used if type command is defined
                        expect(
                            Object.keys(state.mqtt),
                            `Unreachable http_publish for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('mqtt_publish')) {
                                return !keys.includes('http_publish');
                            }

                            return true;
                        });
                    }
                } else {
                    if (state.coap) {
                        expect(
                            state.coap,
                            `Existing coap publish function on read=false state for ${deviceClass} (${stateId})`,
                        ).not.to.have.any.keys(
                            'coap_publish',
                            'coap_publish_funct',
                            'http_publish',
                            'http_publish_funct',
                        );
                    }

                    if (state.mqtt) {
                        expect(
                            state.mqtt,
                            `Existing mqtt publish function on read=false state for ${deviceClass} (${stateId})`,
                        ).not.to.have.any.keys(
                            'mqtt_publish',
                            'mqtt_publish_funct',
                            'http_publish',
                            'http_publish_funct',
                        );
                    }
                }
            }
        });
    });

    it('Write properties', function () {
        this.timeout(5000);

        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const state = device[stateId];

                expect(state.common).to.have.own.property('write');
                expect(state.common.write).to.be.a('boolean');

                if (state.common.write) {
                    if (state.coap) {
                        expect(state.coap, `Invalid coap cmd for ${deviceClass} (${stateId})`).not.to.have.any.keys(
                            'coap_cmd',
                            'coap_cmd_funct',
                        ); // Not supported

                        if (state.common.role !== 'level.timer') {
                            expect(
                                Object.keys(state.coap),
                                `Missing (or invalid) coap cmd definition for ${deviceClass} (${stateId})`,
                            ).to.satisfy(keys => {
                                if (keys.includes('no_display')) {
                                    return keys.length === 1;
                                }

                                return keys.includes('http_cmd');
                            });
                        }

                        expect(
                            state.coap,
                            `mqtt_cmd not supported for coap ${deviceClass} (${stateId})`,
                        ).not.to.have.any.keys('mqtt_cmd');

                        expect(Object.keys(state.coap), `Missing coap_cmd for ${deviceClass} (${stateId})`).to.satisfy(
                            keys => {
                                if (keys.includes('coap_cmd_funct')) {
                                    expect(state.coap.coap_cmd_funct).to.be.a('function');
                                    return keys.includes('coap_cmd');
                                }

                                return true;
                            },
                        );

                        expect(Object.keys(state.coap), `Missing http_cmd for ${deviceClass} (${stateId})`).to.satisfy(
                            keys => {
                                if (keys.includes('http_cmd_funct')) {
                                    expect(state.coap.http_cmd_funct).to.be.a('function');
                                    return keys.includes('http_cmd');
                                }

                                return true;
                            },
                        );

                        // http cannot be used if type command is defined
                        expect(
                            Object.keys(state.coap),
                            `Unreachable http_cmd for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('coap_cmd')) {
                                return !keys.includes('http_cmd');
                            }

                            return true;
                        });
                    }

                    if (state.mqtt) {
                        if (state.common.role !== 'level.timer') {
                            expect(
                                Object.keys(state.mqtt),
                                `Missing (or invalid) mqtt cmd definition for ${deviceClass} (${stateId})`,
                            ).to.satisfy(keys => {
                                if (keys.includes('no_display')) {
                                    return keys.length === 1;
                                }

                                return keys.includes('mqtt_cmd') || keys.includes('http_cmd');
                            });
                        }

                        expect(
                            state.mqtt,
                            `coap_cmd not supported for mqtt ${deviceClass} (${stateId})`,
                        ).not.to.have.any.keys('coap_cmd');

                        expect(Object.keys(state.mqtt), `Missing mqtt_cmd for ${deviceClass} (${stateId})`).to.satisfy(
                            keys => {
                                if (keys.includes('mqtt_cmd_funct')) {
                                    expect(state.mqtt.mqtt_cmd_funct).to.be.a('function');
                                    return keys.includes('mqtt_cmd');
                                }

                                return true;
                            },
                        );

                        expect(Object.keys(state.mqtt), `Missing http_cmd for ${deviceClass} (${stateId})`).to.satisfy(
                            keys => {
                                if (keys.includes('http_cmd_funct')) {
                                    expect(state.mqtt.http_cmd_funct).to.be.a('function');
                                    return keys.includes('http_cmd');
                                }

                                return true;
                            },
                        );

                        // http cannot be used if type command is defined
                        expect(
                            Object.keys(state.mqtt),
                            `Unreachable http_cmd for ${deviceClass} (${stateId})`,
                        ).to.satisfy(keys => {
                            if (keys.includes('mqtt_cmd')) {
                                return !keys.includes('http_cmd');
                            }

                            return true;
                        });

                        if (datapoints.getDeviceGen(deviceClass) >= 2) {
                            expect(
                                state.mqtt,
                                `Gen 2+ devices don't support http_cmd for ${deviceClass} (${stateId})`,
                            ).not.to.have.own.property('http_cmd');
                        }
                    }
                } else {
                    if (state.coap) {
                        expect(
                            state.coap,
                            `Existing coap cmd function on write=false state for ${deviceClass} (${stateId})`,
                        ).not.to.have.any.keys('coap_cmd', 'coap_cmd_funct', 'http_cmd', 'http_cmd_funct');
                    }

                    if (state.mqtt) {
                        expect(
                            state.mqtt,
                            `Existing mqtt cmd function on write=false state for ${deviceClass} (${stateId})`,
                        ).not.to.have.any.keys('mqtt_cmd', 'mqtt_cmd_funct', 'http_cmd', 'http_cmd_funct');
                    }
                }
            }
        });
    });

    it('State roles', function () {
        this.timeout(5000);

        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const state = device[stateId];

                expect(state.common.type, `common.type must be a string - ${deviceClass} (${stateId})`).to.be.a(
                    'string',
                );
                expect(state.common.role, `common.role must be a string - ${deviceClass} (${stateId})`).to.be.a(
                    'string',
                );

                expect(state.common.type).to.be.oneOf(['array', 'number', 'boolean', 'string']);

                let validRoles = [];

                if (state.common.type === 'array') {
                    validRoles = [
                        'list',
                    ];
                } else if (state.common.type === 'number') {
                    validRoles = [
                        'date',
                        'level',
                        'level.blind',
                        'level.brightness',
                        'level.color.blue',
                        'level.color.brightness',
                        'level.color.green',
                        'level.color.hue',
                        'level.color.red',
                        'level.color.saturation',
                        'level.color.temperature',
                        'level.color.white',
                        'level.current.max',
                        'level.current.min',
                        'level.humidity',
                        'level.max',
                        'level.min',
                        'level.temperature',
                        'level.timer',
                        'level.voltage',
                        'level.voltage.max',
                        'level.voltage.min',
                        'state',
                        'value',
                        'value.battery',
                        'value.brightness',
                        'value.current',
                        'value.energy',
                        'value.energy.active',
                        'value.energy.consumed',
                        'value.energy.produced',
                        'value.energy.reactive',
                        'value.frequency',
                        'value.gps.latitude',
                        'value.gps.longitude',
                        'value.humidity',
                        'value.interval',
                        'value.power',
                        'value.power.active',
                        'value.power.consumed',
                        'value.power.consumption',  // should be removed
                        'value.power.produced',
                        'value.power.reactive',
                        'value.temperature',
                        'value.tilt',
                        'value.valve',
                        'value.voltage',
                    ];
                } else if (state.common.type === 'boolean') {
                    validRoles = [
                        'button',
                        'indicator',
                        'indicator.alarm.flood',
                        'indicator.reachable',
                        'sensor',
                        'sensor.alarm.fire',
                        'sensor.alarm.flood',
                        'sensor.door',
                        'sensor.motion',
                        'state',
                        'switch',
                        'switch.enable',
                        'switch.lock.window',
                    ];
                } else if (state.common.type === 'string') {
                    validRoles = [
                        'info.ip',
                        'info.name',
                        'json',
                        'level.color.rgbw',
                        'state',
                        'text',
                        'text.url',
                        'url.blank',
                    ];
                }

                expect(
                    state.common.role,
                    `common.role "${state.common.role}" is invalid for type "${state.common.type}" - ${deviceClass} (${stateId})`,
                ).to.be.oneOf(validRoles);

                const validUnitForRoles = {
                    'level.humidity': ['%'],
                    'level.blind': ['%'],
                    'level.color.temperature': ['K'],
                    'level.brightness': ['%'],
                    'value.temperature': ['°C', '°F'],
                    'level.temperature': ['°C', '°F'],
                    'value.battery': ['%'],
                    'value.voltage': ['V'],
                    'value.power': ['W', 'VA'],
                    'value.frequency': ['Hz'],
                    'value.power.consumption': ['Wh', 'Wmin', 'kWh'],
                    'value.power.reactive': ['VAR'],
                };

                if (Object.prototype.hasOwnProperty.call(validUnitForRoles, state.common.role)) {
                    expect(
                        state.common.unit,
                        `common.unit for role "${state.common.role}" must have unit - ${deviceClass} (${stateId})`,
                    ).to.be.oneOf(validUnitForRoles[state.common.role]);
                }
            }
        });
    });
});
