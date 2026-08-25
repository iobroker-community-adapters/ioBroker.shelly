const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const datapoints = require('../build/lib/datapoints');

const allDevices = datapoints.getAllDeviceDefinitions();

const { devices, deviceTypes, deviceGen, deviceKnowledgeBase, deviceIcons, deviceGroupMap, pollTime } = datapoints;

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

    it('Gen 2+ input states use specific roles', function () {
        runTestOnEachDevice((deviceClass, device) => {
            for (const [stateId, state] of Object.entries(device)) {
                const expectedRoles = {
                    'Input enable': 'switch.enable',
                    'Input Inverted': 'switch',
                    'Input Status': 'indicator',
                };
                const expectedRole = expectedRoles[state.common.name];

                if (expectedRole) {
                    expect(state.common.role, `${deviceClass} (${stateId})`).to.equal(expectedRole);
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
                        'value.timer',
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
                        'sensor.switch',
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
                    'level.brightness': ['Lux', '%'], 
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

describe('Test i18n translations', function () {
    const i18nDir = path.join(__dirname, '..', 'src', 'i18n');
    const enPath = path.join(i18nDir, 'en.json');
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    const langFiles = fs.readdirSync(i18nDir).filter(file => file.endsWith('.json'));

    // Recursively collect all device source files so a missing name can be traced to its file
    function collectDeviceSourceFiles(dir) {
        const result = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                result.push(...collectDeviceSourceFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                result.push(fullPath);
            }
        }
        return result;
    }

    function findSourceFilesForName(name) {
        const devicesDir = path.join(__dirname, '..', 'src', 'lib', 'devices');
        const files = collectDeviceSourceFiles(devicesDir);
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match name: 'value' / "value" / `value`
        const regex = new RegExp(`name:\\s*(['"\`])${escaped}\\1`);
        const matches = [];
        for (const file of files) {
            if (regex.test(fs.readFileSync(file, 'utf8'))) {
                matches.push(path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/'));
            }
        }
        return matches;
    }

    it('Every "name" used in object creation exists as key in src/i18n/en.json', function () {
        this.timeout(10000);

        // key => missing name, value => Set of "deviceClass (stateId)" occurrences
        const missing = new Map();

        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const name = device[stateId]?.common?.name;

                if (typeof name === 'string' && !Object.prototype.hasOwnProperty.call(en, name)) {
                    if (!missing.has(name)) {
                        missing.set(name, new Set());
                    }
                    missing.get(name).add(`${deviceClass} (${stateId})`);
                }
            }
        });

        if (missing.size > 0) {
            const lines = [];
            for (const [name, occurrences] of missing) {
                const files = findSourceFilesForName(name);
                lines.push(`  - Missing key: "${name}"`);
                lines.push(`      used in: ${[...occurrences].join(', ')}`);
                lines.push(`      file(s): ${files.length ? files.join(', ') : '(source file not located)'}`);
            }

            expect.fail(
                `${missing.size} "name" value(s) are missing as keys in src/i18n/en.json:\n${lines.join('\n')}`,
            );
        }
    });

    it('Every key in src/i18n/en.json exists in all other src/i18n/*.json files', function () {
        const enKeys = Object.keys(en);

        for (const langFile of langFiles) {
            if (langFile === 'en.json') {
                continue;
            }

            const lang = JSON.parse(fs.readFileSync(path.join(i18nDir, langFile), 'utf8'));
            const missing = enKeys.filter(key => !Object.prototype.hasOwnProperty.call(lang, key));

            expect(missing, `Keys missing in src/i18n/${langFile}`).to.be.an('array').that.is.empty;
        }
    });

    it('No key exists in any src/i18n/*.json file which is missing in src/i18n/en.json', function () {
        for (const langFile of langFiles) {
            if (langFile === 'en.json') {
                continue;
            }

            const lang = JSON.parse(fs.readFileSync(path.join(i18nDir, langFile), 'utf8'));
            const extra = Object.keys(lang).filter(key => !Object.prototype.hasOwnProperty.call(en, key));

            expect(extra, `Keys in src/i18n/${langFile} that are missing in src/i18n/en.json`).to.be.an(
                'array',
            ).that.is.empty;
        }
    });
});

describe('Test Device Registry Completeness', function () {
    const deviceKeys = Object.keys(devices);

    it('Every device in "devices" has an entry in "deviceTypes"', function () {
        for (const deviceClass of deviceKeys) {
            expect(deviceTypes, `"${deviceClass}" is missing from deviceTypes`).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "devices" has an entry in "deviceGen" with value 1, 2, 3 or 4', function () {
        for (const deviceClass of deviceKeys) {
            expect(deviceGen, `"${deviceClass}" is missing from deviceGen`).to.have.own.property(deviceClass);
            expect(
                deviceGen[deviceClass],
                `"${deviceClass}" has invalid gen value ${deviceGen[deviceClass]} in deviceGen`,
            ).to.be.oneOf([1, 2, 3, 4]);
        }
    });

    it('Every device in "devices" has an entry in "deviceKnowledgeBase"', function () {
        for (const deviceClass of deviceKeys) {
            expect(
                deviceKnowledgeBase,
                `"${deviceClass}" is missing from deviceKnowledgeBase`,
            ).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "devices" has an entry in "deviceIcons"', function () {
        for (const deviceClass of deviceKeys) {
            expect(deviceIcons, `"${deviceClass}" is missing from deviceIcons`).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "devices" has an entry in "deviceGroupMap"', function () {
        for (const deviceClass of deviceKeys) {
            expect(deviceGroupMap, `"${deviceClass}" is missing from deviceGroupMap`).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "deviceTypes" has an entry in "devices"', function () {
        for (const deviceClass of Object.keys(deviceTypes)) {
            expect(devices, `"${deviceClass}" in deviceTypes is missing from devices`).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "deviceGen" has an entry in "devices"', function () {
        for (const deviceClass of Object.keys(deviceGen)) {
            expect(devices, `"${deviceClass}" in deviceGen is missing from devices`).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "deviceKnowledgeBase" has an entry in "devices"', function () {
        for (const deviceClass of Object.keys(deviceKnowledgeBase)) {
            expect(devices, `"${deviceClass}" in deviceKnowledgeBase is missing from devices`).to.have.own.property(
                deviceClass,
            );
        }
    });

    it('Every device in "deviceIcons" has an entry in "devices"', function () {
        for (const deviceClass of Object.keys(deviceIcons)) {
            expect(devices, `"${deviceClass}" in deviceIcons is missing from devices`).to.have.own.property(deviceClass);
        }
    });

    it('Every device in "deviceGroupMap" has an entry in "devices"', function () {
        for (const deviceClass of Object.keys(deviceGroupMap)) {
            expect(devices, `"${deviceClass}" in deviceGroupMap is missing from devices`).to.have.own.property(
                deviceClass,
            );
        }
    });

    it('Every device in "pollTime" has an entry in "devices"', function () {
        for (const deviceClass of Object.keys(pollTime)) {
            expect(devices, `"${deviceClass}" in pollTime is missing from devices`).to.have.own.property(deviceClass);
        }
    });

    it('Non-gen1 devices in "deviceTypes": array content must equal the deviceId key', function () {
        for (const [deviceClass, types] of Object.entries(deviceTypes)) {
            const gen = deviceGen[deviceClass] ?? 1;
            if (gen === 1) {
                continue;
            }

            expect(
                types,
                `"${deviceClass}" in deviceTypes must be an array containing exactly ["${deviceClass}"] for gen ${gen} devices`,
            ).to.deep.equal([deviceClass]);
        }
    });

    it('Every icon referenced in "deviceIcons" has a corresponding file in admin/icons', function () {
        const iconsDir = path.join(__dirname, '..', 'admin', 'icons');
        for (const [deviceClass, iconName] of Object.entries(deviceIcons)) {
            const iconFile = path.join(iconsDir, `${iconName}.png`);
            expect(
                fs.existsSync(iconFile),
                `Icon file "${iconName}.png" referenced by "${deviceClass}" does not exist in admin/icons`,
            ).to.be.true;
        }
    });

    it('Every device in "deviceIcons" has its own icon file (key === icon name)', function () {
        const iconsDir = path.join(__dirname, '..', 'admin', 'icons');
        for (const [deviceClass, iconName] of Object.entries(deviceIcons)) {
            const ownIconFile = path.join(iconsDir, `${deviceClass}.png`);
            if (deviceClass !== iconName || !fs.existsSync(ownIconFile)) {
                console.info(
                    `Info: "${deviceClass}" does not have its own icon file - uses "${iconName}.png" as fallback`,
                );
            }
        }
    });

    it('Every value in "deviceGroupMap" is a valid group', function () {
        const validGroups = ['ble', 'climate', 'cover', 'dimmer', 'gateway', 'input', 'light', 'meter', 'plug', 'relay', 'sensor', 'other'];
        for (const [deviceClass, group] of Object.entries(deviceGroupMap)) {
            expect(
                group,
                `"${deviceClass}" in deviceGroupMap has invalid group "${group}"`,
            ).to.be.oneOf(validGroups);
        }
    });
});
