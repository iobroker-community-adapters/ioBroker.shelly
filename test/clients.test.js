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
describe('MQTT clients', function () {
    this.timeout(10000);
    let server;
    const sockets = [];
    afterEach(() => {
        sockets.splice(0).forEach(socket => socket.destroy());
        server?.destroy();
    });

    it('several connections from the same address are tracked separately', async function () {
        const port = 18931;
        server = new MQTTServer(createAdapter(port), {}, new EventEmitter());
        server.listen();
        await wait(100);

        sockets.push(net.connect(port, '127.0.0.1'), net.connect(port, '127.0.0.1'));
        await wait(200);
        assert.strictEqual(server.clients.size, 2);

        sockets[0].end();
        await wait(200);
        assert.strictEqual(server.clients.size, 1);
    });
});
