'use strict';

const assert = require('node:assert').strict;
const sinon = require('sinon');
const { HTTPPollingClient, HTTPPollingServer, _private } = require('./http');

function createFakeAdapter(config = {}) {
    return {
        namespace: 'shelly.0',
        config: {
            polltime: 15,
            httpTimeout: 1000,
            httpRetries: 0,
            httpAllowAdmin: false,
            httpSaveRawJson: false,
            ...config,
        },
        log: {
            debug: () => {},
            silly: () => {},
            warn: () => {},
            error: () => {},
            info: () => {},
        },
        deviceStatusUpdate: sinon.stub().resolves(),
        isOnline: () => true,
        setState: sinon.stub().resolves(),
        getStateAsync: sinon.stub().resolves(undefined),
        getObjectAsync: sinon.stub().resolves(undefined),
        getAdapterObjectsAsync: sinon.stub().resolves({}),
        mkdirAsync: sinon.stub().resolves(),
        writeFile: sinon.stub(),
        writeFileAsync: sinon.stub().resolves(),
    };
}

describe('protocol/http helpers', () => {
    it('expands single IPs, short ranges, full ranges, and /30 CIDR ranges', () => {
        assert.deepEqual(
            _private.expandHttpNetworkRanges([
                { enabled: true, range: '192.168.1.10' },
                { enabled: true, range: '192.168.1.20-22' },
                { enabled: true, range: '192.168.2.10-192.168.2.11' },
                { enabled: true, range: '10.0.0.0/30' },
                { enabled: false, range: '172.16.0.1' },
            ]),
            [
                '192.168.1.10',
                '192.168.1.20',
                '192.168.1.21',
                '192.168.1.22',
                '192.168.2.10',
                '192.168.2.11',
                '10.0.0.1',
                '10.0.0.2',
            ],
        );
    });

    it('normalizes Gen1 classic REST identity', () => {
        assert.deepEqual(_private.normalizeShellyInfo({ type: 'SHSW-1', mac: 'AA:BB:CC:00:11:22' }), {
            gen: 1,
            deviceType: 'SHSW-1',
            serialId: 'AABBCC001122',
            deviceId: 'SHSW-1#AABBCC001122#1',
            protocolProfile: 'coap',
        });
    });

    it('normalizes Gen2+ RPC identity', () => {
        assert.deepEqual(
            _private.normalizeShellyInfo({
                id: 'shellyplus1pm-aabbcc001122',
                mac: 'AABBCC001122',
                gen: 2,
                app: 'Plus1PM',
            }),
            {
                gen: 2,
                deviceType: 'shellyplus1pm',
                serialId: 'AABBCC001122',
                deviceId: 'shellyplus1pm-aabbcc001122',
                protocolProfile: 'mqtt',
            },
        );
    });

    it('detects administrative URLs', () => {
        assert.equal(_private.isAdministrativeUrl('/rpc/Shelly.Update'), true);
        assert.equal(_private.isAdministrativeUrl('/rpc/WiFi.SetConfig'), true);
        assert.equal(_private.isAdministrativeUrl('/rpc/Switch.ResetCounters?id=0'), true);
        assert.equal(_private.isAdministrativeUrl('/rpc/Debug.GetConfig'), true);
        assert.equal(_private.isAdministrativeUrl('/ota?update=true'), true);
        assert.equal(_private.isAdministrativeUrl('/rpc/Shelly.GetStatus'), false);
        assert.equal(_private.isAdministrativeUrl('/rpc/Switch.Set?id=0&on=true'), false);
    });

    it('appends RPC query parameters', () => {
        assert.equal(_private.appendRpcParams('/rpc/Switch.Set', { id: 0, on: true }), '/rpc/Switch.Set?id=0&on=true');
    });

    it('discovers Gen1 capabilities from classic status payloads', () => {
        const capability = _private.analyzeShellyCapabilities({
            gen: 1,
            info: { type: 'SHSW-1', mac: 'AABBCC001122' },
            settings: { name: 'Example Shelly', mode: 'relay' },
            status: {
                relays: [{ ison: true }],
                inputs: [{ input: 0 }],
                meters: [{ power: 42.5, total: 1234 }],
                wifi_sta: { ip: '192.168.1.10', rssi: -62 },
                cloud: { connected: true },
                uptime: 100,
            },
        });

        const relay = capability.states.find(state => state.id === 'Relay0.Switch');
        assert.equal(relay.value, true);
        assert.equal(relay.common.write, true);
        assert.equal(capability.states.find(state => state.id === 'Meter0.Power').common.unit, 'W');
        assert.equal(capability.states.find(state => state.id === 'Network.ip').value, '192.168.1.10');
    });

    it('discovers Gen2/Gen3/Gen4 RPC capabilities from status and config payloads', () => {
        const capability = _private.analyzeShellyCapabilities({
            gen: 3,
            info: { id: 'shellyplusrgbwpm-aabbcc001122', gen: 3 },
            config: { device: { profile: 'rgbw', name: 'Example' } },
            status: {
                sys: { uptime: 100, restart_required: false },
                wifi: { status: 'got ip', sta_ip: '192.168.1.10', rssi: -60 },
                cloud: { connected: true },
                mqtt: { connected: false },
                'switch:0': { output: false, apower: 5.5, voltage: 230, current: 0.03, aenergy: { total: 12 } },
                'input:0': { state: false },
                'rgbw:0': { output: true, brightness: 80, rgb: [10, 20, 30], white: 40, gain: 50, effect: 1 },
                'cover:0': { state: 'stopped', current_pos: 66 },
                'temperature:0': { tC: 21.5 },
                'humidity:0': { rh: 45 },
            },
        });

        assert.equal(capability.states.find(state => state.id === 'Switch0.Switch').common.write, true);
        assert.equal(capability.states.find(state => state.id === 'RGBW0.RGB').common.role, 'level.color.rgb');
        assert.equal(capability.states.find(state => state.id === 'Cover0.Position').common.role, 'level.blind');
        assert.equal(capability.states.find(state => state.id === 'Temperature0.Celsius').common.unit, '°C');
        assert.equal(capability.states.find(state => state.id === 'Humidity0.Relative').common.unit, '%');
        assert.equal(capability.states.find(state => state.id === 'Network.cloudConnected').value, true);
    });

    it('maps generic Switch/Relay commands to HTTP RPC', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        const executeRpc = sinon.stub(client, 'executeRpc').resolves();
        const capability = _private.analyzeShellyCapabilities({
            gen: 2,
            info: { id: 'shellyplus1pm-aabbcc001122' },
            config: {},
            status: { 'switch:0': { output: false } },
        });

        await client.executeGenericCommand(
            capability.states.find(state => state.id === 'Switch0.Switch'),
            true,
        );

        assert.equal(executeRpc.firstCall.args[0], 'Switch.Set');
        assert.deepEqual(executeRpc.firstCall.args[1], { id: 0, on: true });
    });

    it('maps generic light commands to HTTP RPC', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        const executeRpc = sinon.stub(client, 'executeRpc').resolves();
        const capability = _private.analyzeShellyCapabilities({
            gen: 2,
            info: { id: 'shellyplusdimmer-aabbcc001122' },
            config: {},
            status: { 'light:0': { output: true, brightness: 10 } },
        });

        await client.executeGenericCommand(
            capability.states.find(state => state.id === 'Light0.Brightness'),
            55,
        );

        assert.equal(executeRpc.firstCall.args[0], 'Light.Set');
        assert.deepEqual(executeRpc.firstCall.args[1], { id: 0, brightness: 55 });
    });

    it('maps generic RGB/RGBW commands to HTTP RPC', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        const executeRpc = sinon.stub(client, 'executeRpc').resolves();
        const capability = _private.analyzeShellyCapabilities({
            gen: 2,
            info: { id: 'shellyplusrgbwpm-aabbcc001122' },
            config: {},
            status: { 'rgbw:0': { output: true, rgb: [1, 2, 3], white: 4 } },
        });

        await client.executeGenericCommand(
            capability.states.find(state => state.id === 'RGBW0.RGB'),
            '[10,20,30]',
        );

        assert.equal(executeRpc.firstCall.args[0], 'RGBW.Set');
        assert.deepEqual(executeRpc.firstCall.args[1], { id: 0, rgb: [10, 20, 30] });
    });

    it('maps generic cover commands to HTTP RPC', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        const executeRpc = sinon.stub(client, 'executeRpc').resolves();
        const capability = _private.analyzeShellyCapabilities({
            gen: 2,
            info: { id: 'shellyplus2pm-aabbcc001122' },
            config: {},
            status: { 'cover:0': { current_pos: 20, state: 'stopped' } },
        });

        await client.executeGenericCommand(
            capability.states.find(state => state.id === 'Cover0.Position'),
            75,
        );

        assert.equal(executeRpc.firstCall.args[0], 'Cover.GoToPosition');
        assert.deepEqual(executeRpc.firstCall.args[1], { id: 0, pos: 75 });
    });

    it('does not include maintenance commands in generic capabilities', () => {
        const capability = _private.analyzeShellyCapabilities({
            gen: 2,
            info: { id: 'shellyplus1pm-aabbcc001122' },
            config: {},
            status: { sys: { restart_required: true }, 'switch:0': { output: false } },
        });

        assert.equal(
            capability.states.some(state => /reboot|reset|update/i.test(state.id)),
            false,
        );
    });

    it('classifies unsafe profile commands as administrative unless explicitly allowed', () => {
        assert.equal(
            _private.isUnsafeProfileCommand(
                {
                    mqtt: {
                        mqtt_cmd_funct: () => JSON.stringify({ method: 'Switch.ResetCounters', params: { id: 0 } }),
                    },
                },
                'mqtt',
            ),
            true,
        );
        assert.equal(
            _private.isUnsafeProfileCommand(
                {
                    mqtt: {
                        mqtt_cmd_funct: () => JSON.stringify({ method: 'Switch.Set', params: { id: 0, on: true } }),
                    },
                },
                'mqtt',
            ),
            false,
        );
    });

    it('marks a device offline after repeated polling failures', async () => {
        const adapter = createFakeAdapter({ httpRetries: 0 });
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        client.deviceId = 'shellyplus1pm-aabbcc001122';
        client.id = 'shellyplus1pm-aabbcc001122';
        client.deviceClass = 'shellyplus1pm';
        client.deviceGen = 2;
        client.ip = '192.168.1.10';
        sinon.stub(client, 'requestWithInheritedAuth').rejects(new Error('timeout'));

        await assert.rejects(async () => await client.requestAsync('/rpc/Shelly.GetStatus'));
        await assert.rejects(async () => await client.requestAsync('/rpc/Shelly.GetStatus'));
        await assert.rejects(async () => await client.requestAsync('/rpc/Shelly.GetStatus'));

        assert.equal(adapter.deviceStatusUpdate.lastCall.args[0], 'shellyplus1pm-aabbcc001122');
        assert.equal(adapter.deviceStatusUpdate.lastCall.args[1], false);
    });

    it('creates generic states for unknown devices without raw JSON when disabled', () => {
        const adapter = createFakeAdapter({ httpSaveRawJson: false });
        const created = [];
        const objectHelper = {
            setOrUpdateObject: (id, obj) => created.push({ id, obj }),
            processObjectQueue: callback => callback?.(),
        };
        const client = new HTTPPollingClient(adapter, objectHelper, { on: () => {} }, {});
        client.deviceId = 'unknown-aabbcc001122';
        client.id = 'unknown-aabbcc001122';
        client.deviceType = 'unknown';
        client.deviceGen = 2;
        client.capability = _private.analyzeShellyCapabilities({
            gen: 2,
            info: { id: 'unknown-aabbcc001122' },
            config: {},
            status: { 'switch:0': { output: true } },
        });

        client.createGenericCapabilityObjects();

        assert.equal(
            created.some(entry => entry.id.includes('.raw')),
            false,
        );
        assert.equal(
            created.some(entry => entry.id === 'unknown-aabbcc001122.Switch0.Switch'),
            true,
        );
    });

    it('keeps manual devices and lets them override discovered duplicates', () => {
        const devices = _private.mergeHttpDevices(
            [{ ip: '192.168.1.20', deviceId: 'shellyplus1pm-aabbcc001122', source: 'manual', name: 'Manual' }],
            [
                { ip: '192.168.1.10', deviceId: 'shellyplus1pm-aabbcc001122', source: 'http-discovery' },
                { ip: '192.168.1.11', deviceId: 'shellyplus1pm-aabbcc001123', source: 'http-discovery' },
            ],
            true,
        );

        assert.deepEqual(
            devices.map(device => `${device.deviceId}@${device.ip}`),
            ['shellyplus1pm-aabbcc001122@192.168.1.20', 'shellyplus1pm-aabbcc001123@192.168.1.11'],
        );
    });

    it('does not auto-create discovered devices when disabled', () => {
        const devices = _private.mergeHttpDevices(
            [{ ip: '192.168.1.20', deviceId: 'manual-device', source: 'manual' }],
            [{ ip: '192.168.1.10', deviceId: 'discovered-device', source: 'http-discovery' }],
            false,
        );

        assert.deepEqual(
            devices.map(device => device.deviceId),
            ['manual-device'],
        );
    });

    it('retries discovery requests after a timeout', async () => {
        const adapter = createFakeAdapter({ httpRetries: 1 });
        const server = new HTTPPollingServer(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
        );
        const probeGet = sinon.stub(server, 'probeGet');
        probeGet.onFirstCall().rejects(new Error('timeout'));
        probeGet.onSecondCall().resolves('{"type":"SHSW-1","mac":"AABBCC001122"}');

        const body = await server.probeGetWithRetry('192.168.1.10', '/shelly');

        assert.equal(body, '{"type":"SHSW-1","mac":"AABBCC001122"}');
        assert.equal(probeGet.callCount, 2);
    });
});
