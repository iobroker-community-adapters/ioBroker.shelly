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
const { CoAPServer } = (() => {
    const load = Module._load;
    Module._load = function (request, ...args) {
        if (request === '@iobroker/adapter-core') {
            return { I18n: { getTranslatedObject: text => ({ en: text }), translate: text => text } };
        }
        return load.call(this, request, ...args);
    };
    const mod = require('../build/lib/protocol/coap');
    Module._load = load;
    return mod;
})();

describe('CoAP unload', function () {
    it('destroy() closes the listener, clears its timers and destroys all clients', function () {
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

        let destroyed = 0;
        server.clients['SHSW-1#ABC#1'] = { destroy: () => destroyed++ };

        server.destroy();

        assert.strictEqual(stopped, true);
        assert.strictEqual(destroyed, 1);
        assert.strictEqual(shelly.knownDevices['SHSW-1#ABC#1'].offlineTimer, null);
        assert.deepStrictEqual(Object.keys(server.clients), []);
    });
});
