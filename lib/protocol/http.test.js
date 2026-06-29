'use strict';

const assert = require('node:assert').strict;
const { _private } = require('./http');

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
        assert.equal(_private.isAdministrativeUrl('/ota?update=true'), true);
        assert.equal(_private.isAdministrativeUrl('/rpc/Shelly.GetStatus'), false);
        assert.equal(_private.isAdministrativeUrl('/rpc/Switch.Set?id=0&on=true'), false);
    });

    it('appends RPC query parameters', () => {
        assert.equal(_private.appendRpcParams('/rpc/Switch.Set', { id: 0, on: true }), '/rpc/Switch.Set?id=0&on=true');
    });
});
