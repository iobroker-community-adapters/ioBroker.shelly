'use strict';

const assert = require('node:assert').strict;
const objectHelper = require('../build/lib/objectHelper');

describe('objectHelper state change handling', () => {
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
