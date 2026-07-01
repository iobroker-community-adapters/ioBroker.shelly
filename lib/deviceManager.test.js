'use strict';

const assert = require('node:assert').strict;
const sinon = require('sinon');
const { getHttpDeviceManagerCommands, waitForAcknowledgedHttpCommand } = require('./deviceManagerHttpActions');

function state(id, common = {}) {
    return {
        _id: `shelly.0.${id}`,
        type: 'state',
        common: {
            read: true,
            write: true,
            ...common,
        },
    };
}

describe('Device Manager HTTP actions', () => {
    it('shows available actions from writable switch, RGB/RGBW, and cover capabilities', () => {
        const objects = {
            switch: state('device.Switch0.Switch', { type: 'boolean', role: 'switch' }),
            toggle: state('device.Switch0.Toggle', { type: 'boolean', role: 'button' }),
            rgb: state('device.RGBW0.Color', { type: 'string', role: 'level.color.rgb' }),
            coverOpen: state('device.Cover0.Open', { type: 'boolean', role: 'button' }),
            coverClose: state('device.Cover0.Close', { type: 'boolean', role: 'button' }),
            coverStop: state('device.Cover0.Stop', { type: 'boolean', role: 'button' }),
            sensor: state('device.Temperature0.Celsius', { type: 'number', role: 'value.temperature', write: false }),
        };

        const commands = getHttpDeviceManagerCommands(objects, 'shelly.0', 'device');
        assert.deepEqual(
            commands.map(command => command.id),
            ['http-on', 'http-off', 'http-toggle', 'http-cover-open', 'http-cover-close', 'http-cover-stop'],
        );
        assert.equal(commands.find(command => command.id === 'http-on').stateSuffix, 'Switch0.Switch');
        assert.equal(commands.find(command => command.id === 'http-toggle').stateSuffix, 'Switch0.Toggle');
        assert.equal(commands.find(command => command.id === 'http-cover-stop').stateSuffix, 'Cover0.Stop');
    });

    it('does not create action buttons for sensor-only devices', () => {
        const objects = {
            temperature: state('sensor.Temperature0.Celsius', {
                type: 'number',
                role: 'value.temperature',
                write: false,
            }),
            humidity: state('sensor.Humidity0.Relative', {
                type: 'number',
                role: 'value.humidity',
                write: false,
            }),
        };

        assert.deepEqual(getHttpDeviceManagerCommands(objects, 'shelly.0', 'sensor'), []);
    });

    it('uses writable state targets instead of duplicating HTTP command URLs', () => {
        const objects = {
            rgbw: state('light.RGBW0.Switch', { type: 'boolean', role: 'switch' }),
            toggle: state('light.RGBW0.Toggle', { type: 'boolean', role: 'button' }),
        };

        const commands = getHttpDeviceManagerCommands(objects, 'shelly.0', 'light');
        assert.deepEqual(
            commands.map(command => command.stateSuffix),
            ['RGBW0.Switch', 'RGBW0.Switch', 'RGBW0.Toggle'],
        );
        assert.equal(
            commands.some(command => String(command.stateSuffix).startsWith('/rpc/')),
            false,
        );
    });

    it('fails HTTP state commands when no command acknowledgement is observed', async () => {
        const adapter = {
            getForeignStateAsync: sinon.stub().resolves({ val: false, ack: false }),
        };

        await assert.rejects(
            async () =>
                await waitForAcknowledgedHttpCommand(adapter, 'shelly.0.device.Relay0.Switch', false, {
                    timeoutMs: 1,
                    pollDelayMs: 1,
                    sleep: async () => {},
                }),
            /No HTTP command handler acknowledged/,
        );
    });

    it('accepts HTTP state commands only after ack=true with the requested value', async () => {
        const adapter = {
            getForeignStateAsync: sinon
                .stub()
                .onFirstCall()
                .resolves({ val: false, ack: false })
                .onSecondCall()
                .resolves({ val: false, ack: true }),
        };

        const state = await waitForAcknowledgedHttpCommand(adapter, 'shelly.0.device.Relay0.Switch', false, {
            timeoutMs: 100,
            pollDelayMs: 1,
            sleep: async () => {},
        });

        assert.equal(state.ack, true);
        assert.equal(adapter.getForeignStateAsync.callCount, 2);
    });
});
