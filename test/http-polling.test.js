const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const Module = require('node:module');

// The protocol modules import @iobroker/adapter-core, which needs a js-controller installation
const originalLoad = Module._load;
Module._load = function (request, ...args) {
    if (request === '@iobroker/adapter-core') {
        return { I18n: { getTranslatedObject: text => ({ en: text }), translate: text => text } };
    }
    return originalLoad.call(this, request, ...args);
};
const { BaseClient } = require('../build/lib/protocol/base');
Module._load = originalLoad;

const noop = () => {};

/** Client with a fake device which answers the HTTP requests from `responses` */
class TestClient extends BaseClient {
    constructor(gen, responses) {
        const adapter = {
            log: { debug: noop, silly: noop, info: noop, warn: noop, error: noop },
            config: { polltime: 0 },
            isOnline: () => true,
            isUnloaded: false,
        };
        const values = {};
        const objectHelper = {
            setOrUpdateObject: (id, obj, custom, value) => (values[id] = value),
            processObjectQueue: noop,
        };
        super('mqtt', adapter, objectHelper, new EventEmitter());
        this.deviceGen = gen;
        this.deviceId = 'TEST#1#1';
        this.httpEndpoint = '127.0.0.1:80';
        this.values = values;
        this.responses = responses;
        this.requests = [];
    }
    getDeviceClass() {
        return 'test';
    }
    getId() {
        return 'test-1';
    }
    async requestAsync(url) {
        this.requests.push(url);
        if (this.responses[url] === undefined) {
            const err = new Error('Not found');
            err.response = { status: 404 };
            throw err;
        }
        return JSON.stringify(this.responses[url]);
    }
    /** One state per url which stores the raw response */
    setPollUrls(urls) {
        this.http = {};
        this.device = {};
        urls.forEach((url, i) => {
            this.http[url] = [`s${i}`];
            this.device[`s${i}`] = { state: `s${i}`, common: { type: 'string' }, mqtt: {} };
        });
    }
    valueOf(url) {
        return JSON.parse(this.values[`TEST#1#1.s${Object.keys(this.http).indexOf(url)}`]);
    }
}

describe('HTTP polling', function () {
    it('Gen 2+: answers single requests from Shelly.GetConfig / Shelly.GetStatus', async function () {
        const responses = {
            '/rpc/Shelly.GetStatus': { sys: { cfg_rev: 7 }, wifi: { rssi: -60 }, 'temperature:0': { tC: 21 } },
            '/rpc/Shelly.GetConfig': { sys: { device: { name: 'A' } }, 'switch:0': { name: 'S0' }, wifi: { ap: {} } },
            '/rpc/Shelly.GetDeviceInfo': { id: 'test-1' },
            '/rpc/PLUGS_UI.GetConfig': { leds: {} },
        };
        const client = new TestClient(2, responses);
        client.setPollUrls([
            '/rpc/Shelly.GetStatus',
            '/rpc/Sys.GetConfig',
            '/rpc/Switch.GetConfig?id=0',
            '/rpc/WiFi.GetConfig',
            '/rpc/WiFi.GetStatus',
            '/rpc/Temperature.GetStatus?id=0',
            '/rpc/Shelly.GetDeviceInfo',
            '/rpc/PLUGS_UI.GetConfig',
        ]);

        await client.httpIoBrokerState();

        // 8 urls, but only 4 requests - PLUGS_UI is not part of Shelly.GetConfig -> own request
        assert.deepStrictEqual(client.requests.sort(), [
            '/rpc/PLUGS_UI.GetConfig',
            '/rpc/Shelly.GetConfig',
            '/rpc/Shelly.GetDeviceInfo',
            '/rpc/Shelly.GetStatus',
        ]);
        assert.deepStrictEqual(client.valueOf('/rpc/Sys.GetConfig'), { device: { name: 'A' } });
        assert.deepStrictEqual(client.valueOf('/rpc/Switch.GetConfig?id=0'), { name: 'S0' });
        assert.deepStrictEqual(client.valueOf('/rpc/WiFi.GetStatus'), { rssi: -60 });
        assert.deepStrictEqual(client.valueOf('/rpc/Temperature.GetStatus?id=0'), { tC: 21 });
        assert.deepStrictEqual(client.valueOf('/rpc/PLUGS_UI.GetConfig'), { leds: {} });
    });

    it('Gen 2+: reads the configuration again only if cfg_rev changed', async function () {
        const responses = {
            '/rpc/Shelly.GetStatus': { sys: { cfg_rev: 7 }, wifi: { rssi: -60 } },
            '/rpc/Shelly.GetConfig': { 'switch:0': { name: 'S0' } },
            '/rpc/Shelly.GetDeviceInfo': { id: 'test-1' },
        };
        const client = new TestClient(2, responses);
        client.setPollUrls([
            '/rpc/Shelly.GetStatus',
            '/rpc/Switch.GetConfig?id=0',
            '/rpc/WiFi.GetStatus',
            '/rpc/Shelly.GetDeviceInfo',
        ]);

        await client.httpIoBrokerState();
        assert.strictEqual(client.requests.length, 3);

        client.requests = [];
        responses['/rpc/Shelly.GetStatus'].wifi.rssi = -70;
        await client.httpIoBrokerState();
        assert.deepStrictEqual(client.requests, ['/rpc/Shelly.GetStatus']);
        assert.deepStrictEqual(client.valueOf('/rpc/WiFi.GetStatus'), { rssi: -70 });

        client.requests = [];
        responses['/rpc/Shelly.GetStatus'].sys.cfg_rev = 8;
        responses['/rpc/Shelly.GetConfig']['switch:0'].name = 'renamed';
        await client.httpIoBrokerState();
        assert.strictEqual(client.requests.length, 3);
        assert.deepStrictEqual(client.valueOf('/rpc/Switch.GetConfig?id=0'), { name: 'renamed' });
    });

    it('Gen 2+: a failed configuration request is repeated in the next cycle', async function () {
        const responses = {
            '/rpc/Shelly.GetStatus': { sys: { cfg_rev: 1 } },
            '/rpc/Shelly.GetDeviceInfo': { id: 'test-1' },
        };
        const client = new TestClient(2, responses);
        client.setPollUrls(['/rpc/Shelly.GetStatus', '/rpc/Shelly.GetDeviceInfo']);
        client.requestAsync = async function (url) {
            this.requests.push(url);
            if (url === '/rpc/Shelly.GetDeviceInfo' && this.requests.length < 3) {
                throw new Error('timeout');
            }
            return JSON.stringify(responses[url]);
        };

        await client.httpIoBrokerState();
        client.requests = [];
        await client.httpIoBrokerState();
        assert.deepStrictEqual(client.requests, ['/rpc/Shelly.GetStatus', '/rpc/Shelly.GetDeviceInfo']);
    });
});
