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
        deviceStatusUpdate: async () => {},
        ...overrides,
    };
}

describe('Test external MQTT topic handling', function () {
    it('identifies exact Gen1 topic prefixes and ignores folder-prefixed variants', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});

        expect(server._identifyDevicePrefix('shellies/shellyswitch25-ABC123/relay/0')).to.equal(
            'shellyswitch25-ABC123',
        );
        expect(server._identifyDevicePrefix('shellies/room/shellyswitch25-ABC123/relay/0')).to.equal(null);
    });

    it('uses only single-segment stored Mqtt.topicPrefix values for known devices', async function () {
        const exactServer = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async () => ({ val: 'shellyplus1-ABC123' }),
            }),
            {},
            {},
        );
        const folderServer = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async () => ({ val: 'room/shellyplus1-ABC123' }),
            }),
            {},
            {},
        );

        expect(await exactServer._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'fallback-prefix')).to.equal(
            'shellyplus1-ABC123',
        );
        expect(await folderServer._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'fallback-prefix')).to.equal(
            'fallback-prefix',
        );
    });

    it('accepts only valid single-segment Gen1 device prefixes', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});

        expect(server._isValidDevicePrefix('shellyswitch25-ABC123')).to.equal(true);
        expect(server._isValidDevicePrefix('room/shellyswitch25-ABC123')).to.equal(false);
        expect(server._isValidDevicePrefix('not-a-known-device-ABC123')).to.equal(false);
        expect(server._isValidDevicePrefix('invalidprefix')).to.equal(false);
    });

    it('updates adapter online status for initialized external devices', async function () {
        const calls = [];
        const server = new MQTTServerExternal(
            createAdapter({
                deviceStatusUpdate: async (deviceId, isOnline) => calls.push({ deviceId, isOnline }),
            }),
            {},
            {},
        );

        await server._updateKnownDeviceOnlineState(
            {
                getDeviceId: () => 'shellyplus1#ABC123#1',
            },
            false,
        );
        await server._updateKnownDeviceOnlineState(
            {
                getDeviceId: () => 'shellyplus1#ABC123#1',
            },
            true,
        );

        expect(calls).to.deep.equal([
            { deviceId: 'shellyplus1#ABC123#1', isOnline: false },
            { deviceId: 'shellyplus1#ABC123#1', isOnline: true },
        ]);
    });

    it('keeps message processing alive when online-state updates fail', async function () {
        const server = new MQTTServerExternal(
            createAdapter({
                deviceStatusUpdate: async () => {
                    throw new Error('boom');
                },
            }),
            {},
            {},
        );

        await server._updateKnownDeviceOnlineState(
            {
                getDeviceId: () => 'shellyplus1#ABC123#1',
            },
            false,
        );
    });
});
