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
    it('accepts Gen1 shellies topics and ignores unrelated prefixes', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});

        // Gen1 topics must be accepted
        expect(server._identifyDevicePrefix('shellies/shellyswitch25-ABC123/relay/0')).to.equal(
            'shellyswitch25-ABC123',
        );
        expect(server._identifyDevicePrefix('shellies/shellyswitch25-ABC123/online')).to.equal('shellyswitch25-ABC123');
        // Folder-prefixed variants are unsupported and must be ignored
        expect(server._identifyDevicePrefix('shellies/room/shellyswitch25-ABC123/relay/0')).to.equal(null);
        expect(server._identifyDevicePrefix('shellies/invalid-prefix/relay/0')).to.equal(null);
        // Completely unrelated topic trees must be ignored
        expect(server._identifyDevicePrefix('home/shellyplus1-ABC123/status/switch:0')).to.equal(null);
        expect(server._identifyDevicePrefix('room/shellyplus1-ABC123/status/switch:0')).to.equal(null);
    });

    it('identifies only shelly-folder Gen2 status topic prefixes for live switch updates', function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});

        expect(server._identifyDevicePrefix('shellyplus1-ABC123/status/switch:0')).to.equal(null);
        expect(server._identifyDevicePrefix('room/shellyplus1-ABC123/status/switch:0')).to.equal(null);
        expect(server._identifyDevicePrefix('shelly/shellyplus1-ABC123/status/switch:0')).to.equal(
            'shelly/shellyplus1-ABC123',
        );
    });

    it('normalizes stored Mqtt.topicPrefix values to shelly/<id> in external mode', async function () {
        const folderServer = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async () => ({ val: 'shelly/shellyplus1-ABC123' }),
            }),
            {},
            {},
        );
        const plainServer = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async () => ({ val: 'shellyplus1-ABC123' }),
            }),
            {},
            {},
        );
        const wrongFolderServer = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async () => ({ val: 'room/shellyplus1-ABC123' }),
            }),
            {},
            {},
        );
        const multiFolderServer = new MQTTServerExternal(
            createAdapter({
                getStateAsync: async () => ({ val: 'a/b/shellyplus1-ABC123' }),
            }),
            {},
            {},
        );

        expect(await folderServer._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'fallback-prefix')).to.equal(
            'shelly/shellyplus1-ABC123',
        );
        expect(await plainServer._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'fallback-prefix')).to.equal(
            'shelly/shellyplus1-ABC123',
        );
        expect(await wrongFolderServer._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'fallback-prefix')).to.equal(
            'fallback-prefix',
        );
        expect(await multiFolderServer._getStoredDevicePrefix('SHSW-PM#ABC123#1', 'fallback-prefix')).to.equal(
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

    it('reinitializes known external devices when broker online changes from false to true', async function () {
        const calls = [];
        const server = new MQTTServerExternal(
            createAdapter({
                deviceStatusUpdate: async (deviceId, isOnline) => calls.push({ deviceId, isOnline }),
            }),
            {},
            {},
        );
        const client = {
            initialize: async () => calls.push({ action: 'initialize' }),
            getDeviceId: () => 'shellyplus1#ABC123#1',
        };

        await server._handleKnownDeviceOnlineStateChange(client, 'shellyplus1-ABC123', false, true);

        expect(calls).to.deep.equal([{ action: 'initialize' }]);
    });

    it('does not reinitialize known external devices without an offline to online transition', async function () {
        const calls = [];
        const server = new MQTTServerExternal(
            createAdapter({
                deviceStatusUpdate: async (deviceId, isOnline) => calls.push({ deviceId, isOnline }),
            }),
            {},
            {},
        );
        const client = {
            initialize: async () => calls.push({ action: 'initialize' }),
            getDeviceId: () => 'shellyplus1#ABC123#1',
        };

        await server._handleKnownDeviceOnlineStateChange(client, 'shellyplus1-ABC123', undefined, true);
        await server._handleKnownDeviceOnlineStateChange(client, 'shellyplus1-ABC123', true, true);
        await server._handleKnownDeviceOnlineStateChange(client, 'shellyplus1-ABC123', true, false);

        expect(calls).to.deep.equal([
            { deviceId: 'shellyplus1#ABC123#1', isOnline: true },
            { deviceId: 'shellyplus1#ABC123#1', isOnline: true },
            { deviceId: 'shellyplus1#ABC123#1', isOnline: false },
        ]);
    });

    it('remembers retained broker online state until a known device client exists', async function () {
        const calls = [];
        const server = new MQTTServerExternal(
            createAdapter({
                deviceStatusUpdate: async (deviceId, isOnline) => calls.push({ deviceId, isOnline }),
            }),
            {},
            {},
        );

        server._rememberOnlineState('shellyplus1-ABC123', false);
        await server._applyPendingOnlineState(
            {
                getDeviceId: () => 'shellyplus1#ABC123#1',
            },
            'shellyplus1-ABC123',
        );

        expect(calls).to.deep.equal([{ deviceId: 'shellyplus1#ABC123#1', isOnline: false }]);
    });

    it('replays only the latest cached retained value per topic after external device initialization starts', async function () {
        const server = new MQTTServerExternal(createAdapter(), {}, {});
        const calls = [];

        server._rememberPendingRetainedMessage(
            'shellyplus1-ABC123',
            'shellyplus1-ABC123/status/switch:0',
            Buffer.from('false'),
        );
        server._rememberPendingRetainedMessage(
            'shellyplus1-ABC123',
            'shellyplus1-ABC123/status/switch:0',
            Buffer.from('true'),
        );
        server._rememberPendingRetainedMessage(
            'shellyplus1-ABC123',
            'shellyplus1-ABC123/status/input:0',
            Buffer.from('1'),
        );

        await server._replayPendingRetainedMessages(
            {
                handleMessage: async (topic, payload) => calls.push({ topic, payload: payload.toString() }),
            },
            'shellyplus1-ABC123',
        );

        expect(calls).to.deep.equal([
            { topic: 'shellyplus1-ABC123/status/switch:0', payload: 'true' },
            { topic: 'shellyplus1-ABC123/status/input:0', payload: '1' },
        ]);
        expect(server.pendingRetainedMessages).to.deep.equal({});
    });

    it('ignores pending online-state application when no broker state was cached', async function () {
        const calls = [];
        const server = new MQTTServerExternal(
            createAdapter({
                deviceStatusUpdate: async (deviceId, isOnline) => calls.push({ deviceId, isOnline }),
            }),
            {},
            {},
        );

        await server._applyPendingOnlineState(
            {
                getDeviceId: () => 'shellyplus1#ABC123#1',
            },
            'shellyplus1-ABC123',
        );

        expect(calls).to.deep.equal([]);
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

    it('ignores online-state updates for clients without a device id', async function () {
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
                getDeviceId: () => null,
            },
            false,
        );

        expect(calls).to.deep.equal([]);
    });

    it('waits for external topic subscriptions before continuing startup flow', async function () {
        const subscriptions = [];
        const server = new MQTTServerExternal(createAdapter(), {}, {});
        server.mqttClientConnection = {
            subscribe: (topic, options, callback) => {
                subscriptions.push({ topic, qos: options.qos });
                callback();
            },
        };

        await server._subscribeToExternalTopics(['shellies/#', '+/rpc', '+/online']);

        expect(subscriptions).to.deep.equal([
            { topic: 'shellies/#', qos: 0 },
            { topic: '+/rpc', qos: 0 },
            { topic: '+/online', qos: 0 },
        ]);
    });
});
