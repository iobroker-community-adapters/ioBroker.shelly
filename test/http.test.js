'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const http = require('node:http');
const {
    digestAuthorization,
    expandHttpNetworkRanges,
    isValidIpv4,
    normalizeShellyInfo,
    parseDigestChallenge,
    requestShelly,
    runWithConcurrency,
    HTTPPollingClient,
    HTTPPollingServer,
    sanitizeHttpDeviceCredentials,
} = require('../build/lib/protocol/http');

async function withHttpServer(handler, test) {
    const server = http.createServer(handler);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    try {
        const address = server.address();
        assert.equal(typeof address, 'object');
        await test(address.port);
    } finally {
        await new Promise((resolve, reject) => server.close(error => (error ? reject(error) : resolve())));
    }
}

function createDefinitionClient({ generation, deviceClass, deviceType, deviceId }) {
    const controls = new Map();
    const initialValues = new Map();
    const acknowledgements = [];
    const adapter = {
        namespace: 'shelly.0',
        config: { httpTimeout: 1_000, httpRetries: 0, polltime: 15 },
        log: { debug() {}, info() {}, warn() {}, error() {}, silly() {} },
        deviceStatusUpdate: async () => {},
        getStateAsync: async id => (id.endsWith('.Relay0.Timer') ? { val: 0, ack: true } : null),
        setState: async (id, state) => acknowledgements.push({ id, state }),
    };
    const objectHelper = {
        setOrUpdateObject(id, _object, _customFields, value, controlFunction) {
            if (value !== undefined) {
                initialValues.set(id, value);
            }
            if (controlFunction) {
                controls.set(id, controlFunction);
            }
        },
        processObjectQueue(callback) {
            callback();
        },
    };
    const client = new HTTPPollingClient(adapter, objectHelper, new EventEmitter(), {
        ip: '192.168.1.2',
        deviceId,
    });
    client.deviceGen = generation;
    client.deviceClass = deviceClass;
    client.deviceType = deviceType;
    client.deviceId = deviceId;
    client.serialId = 'AABBCC';
    client.type = generation === 1 ? 'coap' : 'mqtt';
    return { client, controls, initialValues, acknowledgements };
}

describe('HTTP polling transport', () => {
    describe('discovery helpers', () => {
        it('normalizes Gen1 identities', () => {
            assert.deepEqual(normalizeShellyInfo({ type: 'SHSW-1', mac: 'aa:bb:cc:dd:ee:ff' }), {
                deviceId: 'SHSW-1#AABBCCDDEEFF#1',
                deviceType: 'SHSW-1',
                serialId: 'AABBCCDDEEFF',
                generation: 1,
                profile: 'coap',
            });
        });

        it('normalizes Gen2+ identities', () => {
            assert.deepEqual(normalizeShellyInfo({ id: 'shellyplus1-aabbcc', mac: 'aabbcc', gen: 2 }), {
                deviceId: 'shellyplus1-aabbcc',
                deviceType: 'shellyplus1',
                serialId: 'AABBCC',
                generation: 2,
                profile: 'mqtt',
            });
        });

        it('rejects malformed identities and IP addresses', () => {
            assert.equal(normalizeShellyInfo({}), undefined);
            assert.equal(isValidIpv4('192.168.1.2'), true);
            assert.equal(isValidIpv4('192.168.1.999'), false);
            assert.equal(isValidIpv4('localhost'), false);
        });

        it('expands CIDR and dash ranges without duplicates', () => {
            assert.deepEqual(
                expandHttpNetworkRanges([{ range: '192.168.1.0/30' }, { range: '192.168.1.1-2' }]),
                ['192.168.1.1', '192.168.1.2'],
            );
        });

        it('rejects broad and unbounded scans', () => {
            assert.throws(() => expandHttpNetworkRanges(['10.0.0.0/16']), /Only \/24 through \/32/);
            assert.throws(() => expandHttpNetworkRanges(['10.0.0.1-10.0.0.20'], 5), /safety limit/);
        });

        it('limits concurrency', async () => {
            let active = 0;
            let maximum = 0;
            const result = await runWithConcurrency([1, 2, 3, 4, 5], 2, async value => {
                active++;
                maximum = Math.max(maximum, active);
                await new Promise(resolve => setTimeout(resolve, 5));
                active--;
                return value * 2;
            });
            assert.deepEqual(result, [2, 4, 6, 8, 10]);
            assert.equal(maximum, 2);
        });
    });

    describe('authentication and request hardening', () => {
        it('parses Digest challenges', () => {
            assert.deepEqual(
                parseDigestChallenge('Digest realm="shelly", nonce="abc", algorithm=SHA-256, qop="auth"'),
                { realm: 'shelly', nonce: 'abc', algorithm: 'SHA-256', qop: 'auth', opaque: undefined, stale: undefined },
            );
        });

        it('builds bounded Digest authorization without exposing the password', () => {
            const header = digestAuthorization(
                'GET',
                '/rpc/Shelly.GetStatus',
                { username: 'admin', password: 'top-secret' },
                { realm: 'shelly', nonce: 'abc', algorithm: 'SHA-256', qop: 'auth' },
                1,
            );
            assert.match(header, /^Digest /);
            assert.match(header, /algorithm=SHA-256/);
            assert.doesNotMatch(header, /top-secret/);
        });

        it('rejects non-device URLs before any request', async () => {
            await assert.rejects(() => requestShelly('localhost', '/shelly', 500), /validated IPv4/);
            await assert.rejects(() => requestShelly('127.0.0.1', '//example.com', 500), /validated IPv4/);
        });

        it('retries a Basic challenge once with the correct credentials', async () => {
            const credentials = { username: 'admin', password: 'basic-secret' };
            const expectedHeader = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`;
            const receivedHeaders = [];
            await withHttpServer((request, response) => {
                receivedHeaders.push(request.headers.authorization);
                if (request.headers.authorization !== expectedHeader) {
                    response.writeHead(401, { 'WWW-Authenticate': 'Basic realm="shelly"' });
                    response.end('authentication required');
                    return;
                }
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end('{"ok":true}');
            }, async port => {
                const body = await requestShelly('127.0.0.1', '/shelly', 1_000, { credentials, port });
                assert.equal(body, '{"ok":true}');
            });
            assert.deepEqual(receivedHeaders, [undefined, expectedHeader]);
        });

        it('fails wrong Basic credentials after one bounded retry without exposing the password', async () => {
            const password = 'wrong-basic-secret';
            let requests = 0;
            let thrown;
            await withHttpServer((_request, response) => {
                requests++;
                response.writeHead(401, { 'WWW-Authenticate': 'Basic realm="shelly"' });
                response.end('denied');
            }, async port => {
                try {
                    await requestShelly('127.0.0.1', '/shelly', 1_000, {
                        credentials: { username: 'admin', password },
                        port,
                    });
                } catch (error) {
                    thrown = error;
                }
            });
            assert.equal(requests, 2);
            assert.match(String(thrown), /HTTP authentication failed \(status 401\)/);
            assert.doesNotMatch(String(thrown), new RegExp(password));
            assert.doesNotMatch(String(thrown), /Authorization/i);
        });

        it('removes legacy per-device credentials instead of persisting plaintext secrets', () => {
            const result = sanitizeHttpDeviceCredentials([
                {
                    ip: '192.168.1.2',
                    authMode: 'custom',
                    username: 'admin',
                    password: 'plaintext-device-secret',
                },
            ]);
            assert.equal(result.changed, true);
            assert.deepEqual(result.devices, [{ ip: '192.168.1.2', authMode: 'global' }]);
            assert.doesNotMatch(JSON.stringify(result.devices), /plaintext-device-secret/);
        });
    });

    describe('device-definition command paths', () => {
        it('maps Shelly 1 relay ON and OFF writes to the Gen1 REST endpoint and preserves ACK handling', async () => {
            const deviceId = 'SHSW-1#AABBCC#1';
            const { client, controls, initialValues, acknowledgements } = createDefinitionClient({
                generation: 1,
                deviceClass: 'shelly1',
                deviceType: 'SHSW-1',
                deviceId,
            });
            await client.createObjects();
            assert.equal(initialValues.get(`${deviceId}.protocol`), 'http');
            const control = controls.get(`${deviceId}.Relay0.Switch`);
            assert.equal(typeof control, 'function');

            const paths = [];
            client.requestAsync = async path => {
                paths.push(path);
                return '{}';
            };
            client.stateValueCache[`${deviceId}.Relay0.Switch`] = true;
            await control(true, { val: true, ack: false });
            client.stateValueCache[`${deviceId}.Relay0.Switch`] = false;
            await control(false, { val: false, ack: false });

            assert.equal(paths.length, 2);
            for (const [index, expectedTurn] of ['on', 'off'].entries()) {
                const url = new URL(paths[index], 'http://device');
                assert.equal(url.pathname, '/relay/0');
                assert.equal(url.searchParams.get('turn'), expectedTurn);
                assert.equal(url.searchParams.get('timer'), '0');
            }
            assert.deepEqual(
                acknowledgements.map(entry => ({ id: entry.id, val: entry.state.val, ack: entry.state.ack })),
                [
                    { id: `${deviceId}.Relay0.Switch`, val: true, ack: true },
                    { id: `${deviceId}.Relay0.Switch`, val: false, ack: true },
                ],
            );
        });

        it('maps Gen2+ Light and RGBW definitions to typed RPC query parameters', async () => {
            const deviceId = 'shellyplusrgbwpm-aabbcc';
            const { client, controls } = createDefinitionClient({
                generation: 2,
                deviceClass: 'shellyplusrgbwpm',
                deviceType: 'shellyplusrgbwpm',
                deviceId,
            });
            await client.createObjects();
            const lightControl = controls.get(`${deviceId}.Light0.Brightness`);
            const rgbwControl = controls.get(`${deviceId}.RGBW0.ColorRGB`);
            assert.equal(typeof lightControl, 'function');
            assert.equal(typeof rgbwControl, 'function');

            const paths = [];
            client.requestAsync = async path => {
                paths.push(path);
                return '{}';
            };
            await lightControl(42, { val: 42, ack: false });
            await rgbwControl('12,34,56', { val: '12,34,56', ack: false });

            const lightUrl = new URL(paths[0], 'http://device');
            assert.equal(lightUrl.pathname, '/rpc/Light.Set');
            assert.equal(lightUrl.searchParams.get('id'), '0');
            assert.equal(lightUrl.searchParams.get('brightness'), '42');

            const rgbwUrl = new URL(paths[1], 'http://device');
            assert.equal(rgbwUrl.pathname, '/rpc/RGBW.Set');
            assert.equal(rgbwUrl.searchParams.get('id'), '0');
            assert.deepEqual(JSON.parse(rgbwUrl.searchParams.get('rgb')), [12, 34, 56]);
        });
    });

    describe('RPC commands', () => {
        function createClient() {
            const adapter = {
                config: {},
                log: { debug() {}, warn() {}, error() {}, silly() {} },
                deviceStatusUpdate: async () => {},
            };
            const client = new HTTPPollingClient(adapter, {}, new EventEmitter(), { ip: '192.168.1.2' });
            client.deviceGen = 2;
            client.deviceId = 'shellyplus1-aabbcc';
            return client;
        }

        it('translates switch commands to native RPC paths', async () => {
            const client = createClient();
            let path;
            client.requestAsync = async value => {
                path = value;
                return '{}';
            };
            await client.publishStateValue('', JSON.stringify({ method: 'Switch.Set', params: { id: 0, on: true } }));
            assert.equal(path, '/rpc/Switch.Set?id=0&on=true');
        });

        it('translates cover actions to native RPC paths', async () => {
            const client = createClient();
            let path;
            client.requestAsync = async value => {
                path = value;
                return '{}';
            };
            await client.publishStateValue('', JSON.stringify({ method: 'Cover.Stop', params: { id: 0 } }));
            assert.equal(path, '/rpc/Cover.Stop?id=0');
        });

        it('blocks administrative RPC methods', async () => {
            const client = createClient();
            await assert.rejects(
                () => client.publishStateValue('', JSON.stringify({ method: 'Shelly.FactoryReset', params: {} })),
                /not permitted/,
            );
        });
    });

    describe('registry startup', () => {
        it('starts a known HTTP device after restart while discovery remains disabled', async () => {
            const deviceId = 'shellyplus1-aabbcc';
            let discoveryProbes = 0;
            const started = [];
            const originalStart = HTTPPollingClient.prototype.start;
            HTTPPollingClient.prototype.start = async function () {
                started.push({
                    deviceId: this.deviceConfig.deviceId,
                    ip: this.deviceConfig.ip,
                    transport: this.transport,
                });
            };
            const adapter = {
                namespace: 'shelly.0',
                config: {
                    httpDiscoveryEnabled: false,
                    httpNetworks: [],
                    httpDevices: [],
                    httpAutoCreate: true,
                },
                log: { debug() {}, info() {}, warn() {}, error() {}, silly() {} },
                getDevicesAsync: async () => [
                    { _id: `shelly.0.${deviceId}`, common: { name: 'Known HTTP device' } },
                ],
                getStateAsync: async id => {
                    if (id === `${deviceId}.hostname`) {
                        return { val: '192.168.1.20', ack: true };
                    }
                    if (id === `${deviceId}.protocol`) {
                        return { val: 'http', ack: true };
                    }
                    return null;
                },
                deviceStatusUpdate: async () => {},
            };
            const server = new HTTPPollingServer(adapter, {}, new EventEmitter());
            server.probeIp = async () => {
                discoveryProbes++;
                return undefined;
            };
            try {
                await server.listen();
                assert.deepEqual(started, [
                    { deviceId, ip: '192.168.1.20', transport: 'http' },
                ]);
                assert.equal(discoveryProbes, 0);
            } finally {
                HTTPPollingClient.prototype.start = originalStart;
                server.destroy();
            }
        });
    });
});
