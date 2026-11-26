const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const Module = require('node:module');

/** Fake shelly-iot listener which counts the device description requests */
class FakeShelly extends EventEmitter {
    constructor() {
        super();
        this.knownDevices = {};
        this.descriptionRequests = 0;
        FakeShelly.instance = this;
    }
    listen() {}
    stopListening() {}
    getDeviceDescription(deviceId, callback) {
        this.descriptionRequests++;
        callback(null, deviceId, {}, this.knownDevices[deviceId].ip);
    }
}

// Stub the dependencies which need a js-controller installation or the network
const originalLoad = Module._load;
Module._load = function (request, ...args) {
    if (request === '@iobroker/adapter-core') {
        return { I18n: { getTranslatedObject: text => ({ en: text }), translate: text => text } };
    }
    if (request === 'shelly-iot') {
        return { __esModule: true, default: FakeShelly };
    }
    return originalLoad.call(this, request, ...args);
};
const { CoAPServer } = require('../build/lib/protocol/coap');
Module._load = originalLoad;

const noop = () => {};

describe('CoAP server', function () {
    it('requests the device description only for new devices and after an IP change', function () {
        const adapter = {
            log: { debug: noop, silly: noop, info: noop, warn: noop, error: noop },
            config: { coapbind: '0.0.0.0', blacklist: [] },
        };
        const server = new CoAPServer(adapter, {}, new EventEmitter());
        server.listen();
        const shelly = FakeShelly.instance;

        // The real client would create objects - a minimal client is enough here
        const created = [];
        const ips = {};
        server.clients = new Proxy(
            {},
            {
                set(target, key, value) {
                    created.push(key);
                    target[key] = { getIP: () => ips[key], destroy: noop };
                    return true;
                },
            },
        );

        const deviceId = 'SHSW-1#ABC#1';
        shelly.knownDevices[deviceId] = { ip: '192.168.1.10' };
        ips[deviceId] = '192.168.1.10';

        for (let i = 0; i < 5; i++) {
            shelly.emit('update-device-status', deviceId, { G: [] });
        }
        assert.strictEqual(shelly.descriptionRequests, 1);
        assert.deepStrictEqual(created, [deviceId]);

        // IP changed -> description again, client is replaced
        shelly.knownDevices[deviceId].ip = '192.168.1.11';
        ips[deviceId] = '192.168.1.11';
        server.clients[deviceId].getIP = () => '192.168.1.10';
        shelly.emit('update-device-status', deviceId, { G: [] });
        assert.strictEqual(shelly.descriptionRequests, 2);
    });
});
