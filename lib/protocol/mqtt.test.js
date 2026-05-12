const expect = require('chai').expect;

const { MQTTServerExternal } = require('./mqtt');

function createAdapter(overrides = {}) {
    return {
        config: {},
        instance: 0,
        namespace: 'shelly.0',
        log: {
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            silly: () => {},
        },
        getStateAsync: async () => null,
        ...overrides,
    };
}

describe('Test MQTT external folder prefixes', function () {
    it('identifies a Gen1 online topic with folder prefix', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});

        expect(server._identifyDevicePrefix('shellies/room/shellyswitch25-ABC123/online')).to.equal(
            'room/shellyswitch25-ABC123',
        );
    });

    it('identifies a known Gen1 topic with folder prefix', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});
        server.deviceClients['room/shellyswitch25-ABC123'] = {};

        expect(server._identifyDevicePrefix('shellies/room/shellyswitch25-ABC123/relay/0')).to.equal(
            'room/shellyswitch25-ABC123',
        );
    });

    it('matches plain and folder-prefixed external clients as equivalent', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});
        const fakeClient = {};
        server.deviceClients['room/shellyplus1-abc123'] = fakeClient;

        const match = server._findClientByEquivalentPrefix('shellyplus1-abc123');

        expect(match.prefix).to.equal('room/shellyplus1-abc123');
        expect(match.client).to.equal(fakeClient);
    });

    it('updates the client mapping to the observed folder-prefixed topic', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});
        const updatedPrefixes = [];
        const fakeClient = {
            updateDevicePrefix: prefix => updatedPrefixes.push(prefix),
        };

        server.deviceClients.shellyplus1abc123 = fakeClient;
        server._updateClientPrefixMapping('shellyplus1abc123', 'room/shellyplus1abc123', fakeClient);

        expect(server.deviceClients.shellyplus1abc123).to.equal(undefined);
        expect(server.deviceClients['room/shellyplus1abc123']).to.equal(fakeClient);
        expect(updatedPrefixes).to.deep.equal(['room/shellyplus1abc123']);
    });

    it('reuses the stored Mqtt.topicPrefix state for known devices', async function () {
        const server = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async id =>
                    id === 'SHSW-PM#ABC123#1.Mqtt.topicPrefix' ? { val: 'room/shellyplus1-ABC123' } : null,
            }),
            {},
            {},
        );

        const prefix = await server._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'shellyplus1-ABC123');

        expect(prefix).to.equal('room/shellyplus1-ABC123');
    });
});
