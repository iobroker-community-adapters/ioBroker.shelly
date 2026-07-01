'use strict';

const assert = require('node:assert').strict;
const http = require('node:http');
const sinon = require('sinon');
const { HTTPPollingClient, HTTPPollingServer, _private } = require('./http');
const realObjectHelper = require('../../build/lib/objectHelper');

function createFakeAdapter(config = {}) {
    const adapter = {
        namespace: 'shelly.0',
        config: {
            polltime: 15,
            httpTimeout: 1000,
            httpRetries: 0,
            httpAllowAdmin: false,
            httpSaveRawJson: false,
            httpAuthEnabled: false,
            httpDefaultUsername: 'admin',
            httpDefaultPassword: '',
            ...config,
        },
        logMessages: [],
        log: {
            debug(message) {
                this.owner?.logMessages.push(String(message));
            },
            silly(message) {
                this.owner?.logMessages.push(String(message));
            },
            warn(message) {
                this.owner?.logMessages.push(String(message));
            },
            error(message) {
                this.owner?.logMessages.push(String(message));
            },
            info(message) {
                this.owner?.logMessages.push(String(message));
            },
        },
        deviceStatusUpdate: sinon.stub().resolves(),
        isOnline: () => true,
        setState: sinon.stub().resolves(),
        getObject: sinon.stub((_id, callback) => callback(null, null)),
        setObject: sinon.stub((_id, _obj, callback) => callback?.()),
        extendObject: sinon.stub((_id, _obj, callback) => callback?.()),
        getAdapterObjects: sinon.stub(callback => callback({})),
        getStateAsync: sinon.stub().resolves(undefined),
        getObjectAsync: sinon.stub().resolves(undefined),
        getAdapterObjectsAsync: sinon.stub().resolves({}),
        extendObjectAsync: sinon.stub().resolves(),
        mkdirAsync: sinon.stub().resolves(),
        writeFile: sinon.stub(),
        writeFileAsync: sinon.stub().resolves(),
    };
    adapter.log.owner = adapter;
    return adapter;
}

function createTestHttpServer(handler) {
    const server = http.createServer(handler);
    return new Promise(resolve => {
        server.listen(0, 'localhost', () => {
            const address = server.address();
            resolve({
                host: `localhost:${address.port}`,
                close: () => new Promise(closeResolve => server.close(closeResolve)),
            });
        });
    });
}

function createCapturingObjectHelper() {
    const callbacks = {};
    const objects = {};
    return {
        callbacks,
        objects,
        setOrUpdateObject(id, obj, _preserve, value, callback) {
            objects[id] = { obj, value, callback };
            if (callback) {
                callbacks[id] = callback;
            }
        },
        processObjectQueue(callback) {
            callback?.();
        },
        async handleStateChange(id, value) {
            assert.equal(typeof callbacks[id], 'function', `Missing stateChangeCallback for ${id}`);
            await callbacks[id](value, { val: value, ack: false });
        },
    };
}

describe('protocol/http helpers', () => {
    it('expands single IPs, short ranges, full ranges, and /30 CIDR ranges', () => {
        assert.deepEqual(
            _private.expandHttpNetworkRanges([
                { enabled: true, range: '192.168.1.10' },
                { enabled: true, range: '192.168.1.20-22' },
                { enabled: true, range: '192.168.1.30-192.168.1.31' },
                { enabled: true, range: '192.168.178.0/30' },
                { enabled: false, range: '192.168.1.200' },
            ]),
            [
                '192.168.1.10',
                '192.168.1.20',
                '192.168.1.21',
                '192.168.1.22',
                '192.168.1.30',
                '192.168.1.31',
                '192.168.178.1',
                '192.168.178.2',
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

    it('maps known Gen1 Relay0 power and energy from /status into ioBroker states', async () => {
        const adapter = createFakeAdapter({ polltime: 0 });
        const writes = [];
        const objectHelper = {
            setOrUpdateObject: (id, obj, preserve, value) => writes.push({ id, obj, preserve, value }),
            processObjectQueue: callback => callback?.(),
        };
        const client = new HTTPPollingClient(adapter, objectHelper, { on: () => {} }, {});
        client.deviceId = 'SHPLG-S#AABBCC001122#1';
        client.deviceType = 'SHPLG-S';
        client.serialId = 'AABBCC001122';
        client.deviceClass = 'shellyplug-s';
        client.deviceGen = 1;
        client.type = 'coap';
        client.id = 'shellyplug-s-AABBCC001122';
        client.ip = '192.168.1.10';

        await client.createObjects();

        assert.equal(client.http['/status'].includes('Relay0.Power'), true);
        assert.equal(client.http['/status'].includes('Relay0.Energy'), true);

        writes.length = 0;
        sinon.stub(client, 'requestAsync').resolves(
            JSON.stringify({
                relays: [{ ison: true }],
                meters: [{ power: 412.34, total: 23100 }],
            }),
        );

        await client.httpIoBrokerState();

        assert.equal(writes.find(entry => entry.id.endsWith('.Relay0.Power')).value, 412.34);
        assert.equal(writes.find(entry => entry.id.endsWith('.Relay0.Energy')).value, 385);
    });

    it('registers and executes HTTP callbacks for Gen1 switches even when coap_cmd exists', async () => {
        const adapter = createFakeAdapter({
            polltime: 0,
            httpAuthEnabled: true,
            httpDefaultUsername: 'admin',
            httpDefaultPassword: 'globalValueToMask',
        });
        const objectHelper = createCapturingObjectHelper();
        const client = new HTTPPollingClient(adapter, objectHelper, { on: () => {} }, {});
        client.deviceId = 'SHPLG-S#AABBCC001122#1';
        client.deviceType = 'SHPLG-S';
        client.serialId = 'AABBCC001122';
        client.deviceClass = 'shellyplug-s';
        client.deviceGen = 1;
        client.type = 'coap';
        client.id = 'shellyplug-s-AABBCC001122';
        client.ip = '192.168.1.10';
        sinon.stub(client, 'afterHttpControlCommand').resolves();
        const performHttpRequest = sinon.stub(client, 'performHttpRequest').resolves('{}');

        await client.createObjects();
        await objectHelper.handleStateChange('SHPLG-S#AABBCC001122#1.Relay0.Switch', true);
        await objectHelper.handleStateChange('SHPLG-S#AABBCC001122#1.Relay0.Switch', false);

        assert.equal(performHttpRequest.firstCall.args[0], '/relay/0?turn=on');
        assert.equal(performHttpRequest.secondCall.args[0], '/relay/0?turn=off');
        assert.equal(
            adapter.logMessages.some(message => message.includes('executing HTTP command callback')),
            true,
        );
        assert.deepEqual(performHttpRequest.firstCall.args[1], {
            source: 'global',
            username: 'admin',
            password: 'globalValueToMask',
        });
    });

    it('registers real objectHelper stateChangeTriggers for HTTP Gen1 Relay0.Switch', async () => {
        const adapter = createFakeAdapter({ polltime: 0 });
        realObjectHelper.init(adapter);
        const client = new HTTPPollingClient(adapter, realObjectHelper, { on: () => {} }, {});
        client.deviceId = 'SHPLG-S#AABBCC001122#1';
        client.deviceType = 'SHPLG-S';
        client.serialId = 'AABBCC001122';
        client.deviceClass = 'shellyplug-s';
        client.deviceGen = 1;
        client.type = 'coap';
        client.id = 'shellyplug-s-AABBCC001122';
        client.ip = '192.168.1.10';
        sinon.stub(client, 'afterHttpControlCommand').resolves();
        const performHttpRequest = sinon.stub(client, 'performHttpRequest').resolves('{}');

        await client.createObjects();

        assert.equal(realObjectHelper.getStateChangeTriggerKeys().includes('SHPLG-S#AABBCC001122#1.Relay0.Switch'), true);
        realObjectHelper.handleStateChange('shelly.0.SHPLG-S#AABBCC001122#1.Relay0.Switch', {
            val: true,
            ack: false,
            from: 'system.adapter.test.0',
        });
        await new Promise(resolve => setTimeout(resolve, 0));
        realObjectHelper.handleStateChange('shelly.0.SHPLG-S#AABBCC001122#1.Relay0.Switch', {
            val: false,
            ack: false,
            from: 'system.adapter.test.0',
        });
        await new Promise(resolve => setTimeout(resolve, 0));

        assert.equal(performHttpRequest.firstCall.args[0], '/relay/0?turn=on');
        assert.equal(performHttpRequest.secondCall.args[0], '/relay/0?turn=off');
        assert.equal(
            adapter.logMessages.some(message =>
                message.includes('registering stateChangeTrigger for SHPLG-S#AABBCC001122#1.Relay0.Switch'),
            ),
            true,
        );
    });

    it('synthesizes HTTP callbacks for writable Relay0.Switch states without http_cmd metadata', () => {
        const adapter = createFakeAdapter({ polltime: 0 });
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        client.deviceGen = 1;

        const httpState = client.getHttpProtocolState(
            {
                common: {
                    read: true,
                    write: true,
                    type: 'boolean',
                    role: 'switch',
                },
                coap: {
                    coap_cmd: 'relay/0',
                },
            },
            'Relay0.Switch',
        );

        assert.equal(httpState.http_cmd, '/relay/0');
        assert.deepEqual(httpState.http_cmd_funct(true), { turn: 'on' });
        assert.deepEqual(httpState.http_cmd_funct(false), { turn: 'off' });
    });

    it('routes Gen2 profile switch callbacks to HTTP RPC instead of MQTT or unsupported handling', async () => {
        const adapter = createFakeAdapter({ polltime: 0 });
        const objectHelper = createCapturingObjectHelper();
        const client = new HTTPPollingClient(adapter, objectHelper, { on: () => {} }, {});
        client.deviceId = 'shellyplus1pm-aabbcc001122';
        client.deviceType = 'shellyplus1pm';
        client.serialId = 'AABBCC001122';
        client.deviceClass = 'shellyplus1pm';
        client.deviceGen = 2;
        client.type = 'mqtt';
        client.deviceMode = 'switch';
        client.id = 'shellyplus1pm-aabbcc001122';
        client.ip = '192.168.1.10';
        sinon.stub(client, 'afterHttpControlCommand').resolves();
        const executeRpc = sinon.stub(client, 'executeRpc').resolves();

        await client.createObjects();
        await objectHelper.handleStateChange('shellyplus1pm-aabbcc001122.Relay0.Switch', true);
        await objectHelper.handleStateChange('shellyplus1pm-aabbcc001122.Relay0.Switch', false);

        assert.deepEqual(executeRpc.firstCall.args, ['Switch.Set', { id: 0, on: true }]);
        assert.deepEqual(executeRpc.secondCall.args, ['Switch.Set', { id: 0, on: false }]);
        assert.equal(adapter.logMessages.some(message => message.includes('Not supported for Gen 2+')), false);
    });

    it('logs HTTP command request method, URL path, and status code when command debug is enabled', async () => {
        const server = await createTestHttpServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');
            if (req.url === '/relay/0?turn=on') {
                res.statusCode = 200;
                res.end(JSON.stringify({ ison: true }));
            } else {
                res.statusCode = 404;
                res.end('{}');
            }
        });
        const adapter = createFakeAdapter({ httpDebugCommands: true });
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        client.deviceId = 'SHPLG-S#AABBCC001122#1';
        client.deviceClass = 'shellyplug-s';
        client.deviceGen = 1;
        client.ip = server.host;

        try {
            await client.requestAsync('/relay/0?turn=on');
        } finally {
            await server.close();
        }

        const joinedLogs = adapter.logMessages.join('\n');
        assert.equal(joinedLogs.includes('request started: method=GET, url=/relay/0?turn=on'), true);
        assert.equal(joinedLogs.includes('request finished: method=GET, url=/relay/0?turn=on, status=200'), true);
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

    it('resolves requests without auth when no auth is configured', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        const performHttpRequest = sinon.stub(client, 'performHttpRequest').resolves('{}');

        await client.requestHttp('/shelly');

        assert.equal(performHttpRequest.firstCall.args[1], undefined);
    });

    it('resolves requests with global Basic Auth', async () => {
        const adapter = createFakeAdapter({
            httpAuthEnabled: true,
            httpDefaultUsername: 'admin',
            httpDefaultPassword: 'globalValueToMask',
        });
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        const performHttpRequest = sinon.stub(client, 'performHttpRequest').resolves('{}');

        await client.requestHttp('/shelly');

        assert.deepEqual(performHttpRequest.firstCall.args[1], {
            source: 'global',
            username: 'admin',
            password: 'globalValueToMask',
        });
    });

    it('resolves requests with device-specific Basic Auth', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            { authMode: 'custom', username: 'device-user', password: 'deviceValueToMask' },
        );
        const performHttpRequest = sinon.stub(client, 'performHttpRequest').resolves('{}');

        await client.requestHttp('/shelly');

        assert.deepEqual(performHttpRequest.firstCall.args[1], {
            source: 'custom',
            username: 'device-user',
            password: 'deviceValueToMask',
        });
    });

    it('lets device-specific Basic Auth override global Basic Auth', async () => {
        const auth = _private.resolveHttpAuth(
            { authMode: 'custom', username: 'device-user', password: 'deviceValueToMask' },
            {
                httpAuthEnabled: true,
                httpDefaultUsername: 'admin',
                httpDefaultPassword: 'globalValueToMask',
            },
        );

        assert.deepEqual(auth, {
            source: 'custom',
            username: 'device-user',
            password: 'deviceValueToMask',
        });
    });

    it('retries discovery with global Basic Auth after a 401 response', async () => {
        const adapter = createFakeAdapter({
            httpAuthEnabled: true,
            httpDefaultUsername: 'admin',
            httpDefaultPassword: 'globalValueToMask',
        });
        const server = new HTTPPollingServer(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
        );
        const error401 = new Error('Request failed with status code 401');
        error401.response = { status: 401 };
        const performProbeRequest = sinon.stub(server, 'performProbeRequest');
        performProbeRequest.onFirstCall().rejects(error401);
        performProbeRequest.onSecondCall().resolves('{"type":"SHSW-1","mac":"AABBCC001122"}');

        const body = await server.probeGet('192.168.1.10', '/shelly');

        assert.equal(body, '{"type":"SHSW-1","mac":"AABBCC001122"}');
        assert.equal(performProbeRequest.firstCall.args[2], undefined);
        assert.deepEqual(performProbeRequest.secondCall.args[2], {
            source: 'global',
            username: 'admin',
            password: 'globalValueToMask',
        });
    });

    it('uses resolved auth for command requests', async () => {
        const adapter = createFakeAdapter({
            httpAuthEnabled: true,
            httpDefaultUsername: 'admin',
            httpDefaultPassword: 'globalValueToMask',
        });
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        client.deviceId = 'shellyplus1pm-aabbcc001122';
        client.deviceGen = 2;
        client.deviceClass = 'shellyplus1pm';
        client.ip = '192.168.1.10';
        const performHttpRequest = sinon.stub(client, 'performHttpRequest').resolves('{}');

        await client.executeRpc('Switch.Set', { id: 0, on: true });

        assert.equal(performHttpRequest.firstCall.args[0], '/rpc/Switch.Set?id=0&on=true');
        assert.deepEqual(performHttpRequest.firstCall.args[1], {
            source: 'global',
            username: 'admin',
            password: 'globalValueToMask',
        });
    });

    it('sanitizes passwords and authorization headers in logs', async () => {
        const adapter = createFakeAdapter();
        const client = new HTTPPollingClient(
            adapter,
            { setOrUpdateObject: () => {}, processObjectQueue: () => {} },
            { on: () => {} },
            {},
        );
        client.deviceId = 'shellyplus1pm-aabbcc001122';
        client.deviceGen = 2;
        client.deviceClass = 'shellyplus1pm';
        client.ip = '192.168.1.10';
        sinon
            .stub(client, 'requestWithInheritedAuth')
            .rejects(new Error('Authorization: Basic abc password=valueToMask {"password":"valueToMask"}'));

        await assert.rejects(async () => await client.requestAsync('/rpc/Shelly.GetStatus'));

        const joinedLogs = adapter.logMessages.join('\n');
        assert.equal(joinedLogs.includes('valueToMask'), false);
        assert.equal(joinedLogs.includes('Authorization: Basic'), false);
        assert.equal(joinedLogs.includes('Authorization: <masked>'), true);
    });

    it('sanitizes credentials from raw JSON state payloads', () => {
        const body = _private.sanitizeHttpBodyForState(
            JSON.stringify({
                wifi: { password: 'wifiValueToMask' },
                auth: { user: 'admin', pass: 'deviceValueToMask' },
                headers: { Authorization: 'Basic abc' },
                ok: true,
            }),
        );

        assert.equal(body.includes('wifiValueToMask'), false);
        assert.equal(body.includes('deviceValueToMask'), false);
        assert.equal(body.includes('Basic abc'), false);
        assert.equal(body.includes('<masked>'), true);
    });

    it('tests an HTTP device connection successfully', async () => {
        const server = await createTestHttpServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');
            if (req.url === '/shelly') {
                res.end(JSON.stringify({ id: 'shellyplus1pm-aabbcc001122', gen: 2, app: 'Plus1PM' }));
            } else if (req.url === '/rpc/Shelly.GetStatus') {
                res.end(JSON.stringify({ wifi: { rssi: -60 }, 'switch:0': { output: true } }));
            } else if (req.url === '/rpc/Sys.GetConfig') {
                res.end(JSON.stringify({ device: { profile: 'switch' } }));
            } else {
                res.statusCode = 404;
                res.end('{}');
            }
        });

        try {
            const result = await _private.testHttpDeviceConnection(createFakeAdapter(), { ip: server.host });
            assert.equal(result.reachable, true);
            assert.equal(result.authOk, true);
            assert.equal(result.generation, 2);
            assert.equal(result.statusOk, true);
            assert.equal(result.configOk, true);
            assert.equal(typeof result.responseTimeMs, 'number');
        } finally {
            await server.close();
        }
    });

    it('reports HTTP auth errors without leaking credentials', async () => {
        const server = await createTestHttpServer((_req, res) => {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'password secret-token invalid' }));
        });

        try {
            const result = await _private.testHttpDeviceConnection(
                createFakeAdapter({
                    httpAuthEnabled: true,
                    httpDefaultUsername: 'admin',
                    httpDefaultPassword: 'valueToMask',
                }),
                { ip: server.host },
            );
            assert.equal(result.reachable, false);
            assert.equal(result.authOk, false);
            assert.equal(result.error.includes('valueToMask'), false);
            assert.equal(result.error.includes('Authorization'), false);
        } finally {
            await server.close();
        }
    });

    it('falls back from Sys.GetConfig to Shelly.GetConfig for Gen2+ diagnostics', async () => {
        const server = await createTestHttpServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');
            if (req.url === '/shelly') {
                res.end(JSON.stringify({ id: 'shellyplus1pm-aabbcc001122', gen: 2 }));
            } else if (req.url === '/rpc/Shelly.GetStatus') {
                res.end(JSON.stringify({ sys: { uptime: 10 } }));
            } else if (req.url === '/rpc/Sys.GetConfig') {
                res.statusCode = 404;
                res.end('{}');
            } else if (req.url === '/rpc/Shelly.GetConfig') {
                res.end(JSON.stringify({ device: { profile: 'switch' } }));
            } else {
                res.statusCode = 404;
                res.end('{}');
            }
        });

        try {
            const result = await _private.testHttpDeviceConnection(createFakeAdapter(), { ip: server.host });
            assert.equal(result.configOk, true);
            assert.equal(result.config.device.profile, 'switch');
        } finally {
            await server.close();
        }
    });
});
