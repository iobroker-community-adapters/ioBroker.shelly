'use strict';

const assert = require('node:assert').strict;
const objectHelper = require('../build/lib/objectHelper');

describe('objectHelper state change handling', () => {
    it('stores a stateChangeTrigger when setOrUpdateObject is called with a callback', done => {
        const logMessages = [];
        objectHelper.init({
            namespace: 'shelly.0',
            log: {
                debug: message => logMessages.push(String(message)),
            },
            getObject: (_id, callback) => callback(null, null),
            setObject: (_id, _obj, callback) => callback?.(),
            setState: (_id, _value, _ack, callback) => callback?.(),
        });

        objectHelper.setOrUpdateObject(
            'trigger-test.Relay0.Switch',
            {
                type: 'state',
                common: {
                    type: 'boolean',
                    read: true,
                    write: true,
                },
                native: {},
            },
            ['name'],
            undefined,
            () => {},
            true,
            () => {
                assert.equal(objectHelper.getStateChangeTriggerKeys().includes('trigger-test.Relay0.Switch'), true);
                assert.equal(
                    logMessages.some(message =>
                        message.includes('registering stateChangeTrigger for trigger-test.Relay0.Switch'),
                    ),
                    true,
                );
                done();
            },
        );
    });

    it('logs missing stateChangeTrigger instead of silently ignoring writable state changes', () => {
        const logMessages = [];
        objectHelper.init({
            namespace: 'shelly.0',
            log: {
                debug: message => logMessages.push(String(message)),
            },
        });

        objectHelper.handleStateChange('shelly.0.device.Relay0.Switch', { val: true, ack: false });

        assert.equal(
            logMessages.some(message =>
                message.includes('No stateChangeTrigger registered for device.Relay0.Switch'),
            ),
            true,
        );
        assert.equal(logMessages.some(message => message.includes('Similar trigger keys:')), true);
    });
});
