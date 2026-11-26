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
const mqttConnection = require('mqtt-connection');
const { MQTTServer } = require('../build/lib/protocol/mqtt');
const { CoAPServer } = require('../build/lib/protocol/coap');
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

function connectAndClose(port) {
    return new Promise(resolve => {
        const socket = net.connect(port, '127.0.0.1', () => {
            socket.end();
            socket.on('close', () => setTimeout(resolve, 20));
        });
    });
}

describe('Protocol lifecycle', function () {
    this.timeout(10000);

    // Close everything even if a test fails, otherwise mocha does not exit
    const openServers = [];
    const openSockets = [];
    afterEach(function () {
        openSockets.splice(0).forEach(socket => socket.destroy());
        openServers.splice(0).forEach(server => server.destroy());
    });

    it('MQTT: closed connections do not leave event listeners behind', async function () {
        const port = 18930;
        const eventEmitter = new EventEmitter();
        const server = new MQTTServer(createAdapter(port), {}, eventEmitter);
        server.listen();
        openServers.push(server);
        await new Promise(resolve => setTimeout(resolve, 100));

        for (let i = 0; i < 20; i++) {
            await connectAndClose(port);
        }

        assert.strictEqual(eventEmitter.listenerCount('onFirmwareUpdate'), 0);
        assert.strictEqual(eventEmitter.listenerCount('onScriptDownload'), 0);
    });

    it('MQTT: several connections from the same address are tracked separately', async function () {
        const port = 18931;
        const server = new MQTTServer(createAdapter(port), {}, new EventEmitter());
        server.listen();
        openServers.push(server);
        await new Promise(resolve => setTimeout(resolve, 100));

        const sockets = [net.connect(port, '127.0.0.1'), net.connect(port, '127.0.0.1')];
        openSockets.push(...sockets);
        await new Promise(resolve => setTimeout(resolve, 200));
        assert.strictEqual(server.clients.size, 2);

        sockets[0].end();
        await new Promise(resolve => setTimeout(resolve, 200));
        assert.strictEqual(server.clients.size, 1);
    });

    it('MQTT: message ids stay in the valid range 1..65535', async function () {
        const port = 18932;
        const server = new MQTTServer(createAdapter(port), {}, new EventEmitter());
        server.listen();
        openServers.push(server);
        await new Promise(resolve => setTimeout(resolve, 100));

        const socket = net.connect(port, '127.0.0.1');
        openSockets.push(socket);
        await new Promise(resolve => setTimeout(resolve, 200));
        const client = [...server.clients.values()][0];

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

    it('MQTT: mqtt-connection cannot encode message ids above 65535', function () {
        // Documents why the wrap-around is needed: mqtt-connection cannot encode larger ids
        const stream = new (require('node:stream').PassThrough)();
        const connection = mqttConnection(stream);
        assert.throws(() => connection.publish({ topic: 'a', payload: 'x', qos: 1, messageId: 65536 }));
    });

    it('CoAP: destroy() closes the listener and removes all client listeners', function () {
        const adapter = createAdapter(0);
        adapter.config = { coapbind: '0.0.0.0' };
        const server = new CoAPServer(adapter, {}, new EventEmitter());
        let stopped = false;
        const timer = setTimeout(noop, 100000);
        const shelly = new EventEmitter();
        shelly.stopListening = () => {
            stopped = true;
        };
        shelly.knownDevices = { 'SHSW-1#ABC#1': { offlineTimer: timer } };
        server.shelly = shelly;

        const listener = noop;
        shelly.on('error', listener);
        server.clients['SHSW-1#ABC#1'] = {
            destroy: () => shelly.removeListener('error', listener),
        };

        server.destroy();

        assert.strictEqual(stopped, true);
        assert.strictEqual(shelly.knownDevices['SHSW-1#ABC#1'].offlineTimer, null);
        assert.strictEqual(shelly.listenerCount('error'), 0);
        assert.deepStrictEqual(Object.keys(server.clients), []);
    });
});
