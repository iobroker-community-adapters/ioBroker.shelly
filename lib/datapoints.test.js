const expect = require('chai').expect;
const datapoints = require('../lib/datapoints');

const allDevices = datapoints.getAllDeviceDefinitions();

function runTestOnEachDevice(cb) {
    for (const [deviceClass, device] of Object.entries(allDevices)) {
        cb(deviceClass, device);
    }
}

describe('Device Definitions', function () {

    it('Test general properties', function () {
        runTestOnEachDevice((deviceClass, device) => {
            expect(deviceClass).to.be.string;
            //expect(deviceClass).to.be.equal(deviceClass.toLowerCase());

            for (const stateId in device) {
                const state = device[stateId];

                expect(state).to.be.an('object');

                expect(state).to.have.own.property('common');
                expect(state).to.have.own.property('mqtt'); // required!

                expect(state.mqtt).to.be.an('object');

                if (state.coap) {
                    expect(state.coap).to.be.an('object');
                }

                expect(state.common).to.be.an('object');

                expect(state.common).to.have.own.property('read');
                expect(state.common.read).to.be.a('boolean');

                expect(state.common).to.have.own.property('write');
                expect(state.common.write).to.be.a('boolean');
            }
        });
    });

    it('Test read properties', function () {
        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const state = device[stateId];

                if (state.common.read) {
                    if (state.coap) {
                        expect(state.coap, `Missing coap publish function for ${deviceClass} (${stateId})`).to.have.any.keys('coap_publish', 'http_publish', 'no_display');
                        expect(state.coap, `Invalid coap publish for ${deviceClass} (${stateId})`).not.to.have.any.keys('mqtt_publish', 'mqtt_publish_funct');

                        expect(Object.keys(state.coap), `Missing coap_publish for ${deviceClass} (${stateId})`).to.satisfy((keys) => {
                            if (keys.includes('coap_publish_funct')) {
                                expect(state.coap.coap_publish_funct).to.be.a('function');
                                return keys.includes('coap_publish');
                            }

                            return true;
                        });

                        expect(Object.keys(state.coap), `Missing http_publish for ${deviceClass} (${stateId})`).to.satisfy((keys) => {
                            if (keys.includes('http_publish_funct')) {
                                expect(state.coap.http_publish_funct).to.be.a('function');
                                return keys.includes('http_publish');
                            }

                            return true;
                        });
                    }

                    if (state.mqtt) {
                        expect(state.mqtt, `Missing mqtt publish function for ${deviceClass} (${stateId})`).to.have.any.keys('mqtt_publish', 'http_publish', 'no_display');
                        expect(state.mqtt, `Invalid mqtt publish for ${deviceClass} (${stateId})`).not.to.have.any.keys('coap_publish', 'coap_publish_funct');

                        expect(Object.keys(state.mqtt), `Missing mqtt_publish for ${deviceClass} (${stateId})`).to.satisfy((keys) => {
                            if (keys.includes('mqtt_publish_funct')) {
                                expect(state.mqtt.mqtt_publish_funct).to.be.a('function');
                                return keys.includes('mqtt_publish');
                            }

                            return true;
                        });

                        expect(Object.keys(state.mqtt), `Missing http_publish for ${deviceClass} (${stateId})`).to.satisfy((keys) => {
                            if (keys.includes('http_publish_funct')) {
                                expect(state.mqtt.http_publish_funct).to.be.a('function');
                                return keys.includes('http_publish');
                            }

                            return true;
                        });
                    }
                } else {
                    if (state.coap) {
                        expect(state.coap, `Existing coap publish function on read=false state for ${deviceClass} (${stateId})`).not.to.have.any.keys('coap_publish', 'coap_publish_funct', 'http_publish', 'http_publish_funct');
                    }

                    if (state.mqtt) {
                        expect(state.mqtt, `Existing mqtt publish function on read=false state for ${deviceClass} (${stateId})`).not.to.have.any.keys('mqtt_publish', 'mqtt_publish_funct', 'http_publish', 'http_publish_funct');
                    }
                }
            }
        });
    });

    it('Test write properties', function () {
        runTestOnEachDevice((deviceClass, device) => {
            for (const stateId in device) {
                const state = device[stateId];

                if (state.common.write) {
                    if (state.coap) {
                        expect(state.coap, `Invalid coap cmd for ${deviceClass} (${stateId})`).not.to.have.any.keys('coap_cmd', 'coap_cmd_funct'); // Not supported

                        // Supported commands
                        //expect(state.coap, `Invalid coap cmd for ${deviceClass} (${stateId})`).to.have.any.keys('http_cmd', 'no_display');
                        expect(state.coap, `mqtt_cmd not supported for coap ${deviceClass} (${stateId})`).not.to.have.any.keys('mqtt_cmd');
                    }

                    if (state.mqtt) {
                        // Supported commands
                        //expect(state.mqtt, `Invalid mqtt cmd for ${deviceClass} (${stateId})`).to.have.any.keys('mqtt_cmd', 'http_cmd', 'no_display');
                    }
                } else {
                    if (state.coap) {
                        expect(state.coap, `Existing coap cmd function on write=false state for ${deviceClass} (${stateId})`).not.to.have.any.keys('coap_cmd', 'http_cmd');
                    }

                    if (state.mqtt) {
                        expect(state.mqtt, `Existing mqtt cmd function on write=false state for ${deviceClass} (${stateId})`).not.to.have.any.keys('mqtt_cmd', 'http_cmd');
                    }
                }
            }
        });
    });

});