'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const {
    digestAuthorization,
    expandHttpNetworkRanges,
    isValidIpv4,
    normalizeShellyInfo,
    parseDigestChallenge,
    requestShelly,
    runWithConcurrency,
    HTTPPollingClient,
} = require('../build/lib/protocol/http');

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
});
