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
const { BaseClient } = (() => {
    const load = Module._load;
    Module._load = function (request, ...args) {
        if (request === '@iobroker/adapter-core') {
            return { I18n: { getTranslatedObject: text => ({ en: text }), translate: text => text } };
        }
        return load.call(this, request, ...args);
    };
    const mod = require('../build/lib/protocol/base');
    Module._load = load;
    return mod;
})();

/** Client which is offline - httpIoBrokerState() only schedules the next run */
class OfflineClient extends BaseClient {
    constructor(polltime) {
        super(
            'mqtt',
            {
                log: { debug: noop, silly: noop, info: noop, warn: noop, error: noop },
                config: { polltime },
                isOnline: () => false,
                isUnloaded: false,
                deviceStatusUpdate: async () => {},
            },
            {},
            new EventEmitter(),
        );
    }
    getDeviceClass() {
        return 'test';
    }
    getId() {
        return 'test-1';
    }
}

describe('HTTP poll loop', function () {
    it('does not run a busy loop while offline with an invalid poll time', async function () {
        const client = new OfflineClient('');
        let runs = 0;
        const original = client.httpIoBrokerState.bind(client);
        client.httpIoBrokerState = async () => {
            runs++;
            return original();
        };
        await client.httpIoBrokerState();
        await wait(100);
        client.destroy();
        assert.strictEqual(runs, 1);
    });

    it('stops after destroy() and keeps only one scheduled run', async function () {
        const client = new OfflineClient(30);
        await client.httpIoBrokerState();
        const first = client.httpIoBrokerStateTimeout;
        await client.httpIoBrokerState();
        assert.notStrictEqual(client.httpIoBrokerStateTimeout, first);
        client.destroy();
        assert.strictEqual(client.httpIoBrokerStateTimeout, null);
        await client.httpIoBrokerState();
        assert.strictEqual(client.httpIoBrokerStateTimeout, null);
    });
});
