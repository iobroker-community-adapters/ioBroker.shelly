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
describe('MQTT client lifecycle', function () {
    this.timeout(10000);
    let server;
    afterEach(() => server?.destroy());

    it('closed connections do not leave event listeners behind', async function () {
        const port = 18930;
        const eventEmitter = new EventEmitter();
        server = new MQTTServer(createAdapter(port), {}, eventEmitter);
        server.listen();
        await wait(100);

        for (let i = 0; i < 20; i++) {
            await new Promise(resolve => {
                const socket = net.connect(port, '127.0.0.1', () => {
                    socket.end();
                    socket.on('close', () => setTimeout(resolve, 20));
                });
            });
        }

        assert.strictEqual(eventEmitter.listenerCount('onFirmwareUpdate'), 0);
        assert.strictEqual(eventEmitter.listenerCount('onScriptDownload'), 0);
    });
});
