const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const net = require('node:net');
const Module = require('node:module');

// The protocol modules import @iobroker/adapter-core, which needs a js-controller installation.
// Only I18n is used by them, so a minimal stub is enough for these unit tests.
const originalLoad = Module._load;
Module._load = function (request, ...args) {
    if (request === '@iobroker/adapter-core') {
        return { I18n: { getTranslatedObject: text => ({ en: text }), translate: text => text } };
    }
    return originalLoad.call(this, request, ...args);
};
const { MQTTServer } = require('../build/lib/protocol/mqtt');
Module._load = originalLoad;

const noop = () => {};

function createAdapter(port) {
    return {
        log: { debug: noop, silly: noop, info: noop, warn: noop, error: noop },
        namespace: 'shelly.0',
        isUnloaded: false,
        config: { mqttusername: 'user', mqttpassword: 'secret', port, bind: '127.0.0.1', qos: 1, polltime: 30 },
        deviceStatusUpdate: async () => {},
        mqttConnectionUpdate: async () => {},
        isOnline: () => false,
        delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
    };
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Starts an MQTT server on a free port (port 0) and connects one TCP client.
 *
 * @returns the MQTTClient object created by the server for this connection
 */
async function connectClient() {
    server = new MQTTServer(createAdapter(0), {}, new EventEmitter());
    server.listen();
    await new Promise((resolve, reject) => {
        server.server.once('listening', resolve);
        server.server.once('error', reject);
    });
    socket = net.connect(server.server.address().port, '127.0.0.1');
    await wait(200);
    const client = [...Object.values(server.clients ?? {}), ...(server.clients?.values?.() ?? [])][0];
    assert.ok(client, 'the connection must have reached the MQTT server');
    return client;
}
let server;
let socket;
const mqttConnection = require('mqtt-connection');

describe('MQTT message ids', function () {
    this.timeout(10000);
    afterEach(() => {
        socket?.destroy();
        server?.destroy();
    });

    it('mqtt-connection cannot encode message ids above 65535', function () {
        const connection = mqttConnection(new (require('node:stream').PassThrough)());
        assert.throws(() => connection.publish({ topic: 'a', payload: 'x', qos: 1, messageId: 65536 }));
    });

    it('message ids stay in the valid range 1..65535', async function () {
        const client = await connectClient();

        const ids = [];
        client.client.publish = packet => ids.push(packet.messageId);
        client.resendState2Client = noop;
        client.mqttprefix = 'test';
        client.messageId = 65534;
        for (let i = 0; i < 3; i++) {
            client.publishStateValue('test/rpc', 'x');
        }
        assert.deepStrictEqual(ids, [65535, 1, 2]);
    });

    it('ids of unacknowledged messages are not reused after the wrap-around', async function () {
        const client = await connectClient();

        const ids = [];
        client.client.publish = packet => ids.push(packet.messageId);
        client.resendState2Client = noop;
        client.mqttprefix = 'test';
        client.messageId = 65535;
        client.messageCache[1] = { cmd: 'publish', message: { topic: 'test/other' } };
        client.messageCache[2] = { cmd: 'publish', message: { topic: 'test/other2' } };
        client.publishStateValue('test/rpc', 'x');
        assert.deepStrictEqual(ids, [3]);
    });
});
