const expect = require('chai').expect;
const virtualHelper = require('./virtual-helper');

describe('Test Virtual Helper', function () {
    it('Test addBoolean without additionalCommon parameter', function () {
        const deviceObj = {};
        virtualHelper.addBoolean(deviceObj, 0, 'crw');

        // Check that Boolean0.Value is created
        expect(deviceObj).to.have.property('Boolean0.Value');
        expect(deviceObj['Boolean0.Value']).to.have.property('common');
        expect(deviceObj['Boolean0.Value'].common).to.have.property('read', true);
        expect(deviceObj['Boolean0.Value'].common).to.have.property('write', true);
        expect(deviceObj['Boolean0.Value'].common).to.have.property('type', 'boolean');
        expect(deviceObj['Boolean0.Value'].common).to.have.property('role', 'switch');

        // Check that additional properties do not exist
        expect(deviceObj['Boolean0.Value'].common).to.not.have.property('unit');
    });

    it('Test addBoolean with additionalCommon parameter containing unit', function () {
        const deviceObj = {};
        virtualHelper.addBoolean(deviceObj, 1, 'cr', { unit: '%' });

        // Check that Boolean1.Value is created
        expect(deviceObj).to.have.property('Boolean1.Value');
        expect(deviceObj['Boolean1.Value']).to.have.property('common');

        // Check that read and write are not changed
        expect(deviceObj['Boolean1.Value'].common).to.have.property('read', true);
        expect(deviceObj['Boolean1.Value'].common).to.have.property('write', false);

        // Check that additional property is added
        expect(deviceObj['Boolean1.Value'].common).to.have.property('unit', '%');
    });

    it('Test addBoolean with additionalCommon parameter containing multiple properties', function () {
        const deviceObj = {};
        virtualHelper.addBoolean(deviceObj, 2, 'crw', { unit: '°C', min: 0, max: 100, def: 20 });

        // Check that Boolean2.Value is created
        expect(deviceObj).to.have.property('Boolean2.Value');
        expect(deviceObj['Boolean2.Value']).to.have.property('common');

        // Check that read and write are not changed
        expect(deviceObj['Boolean2.Value'].common).to.have.property('read', true);
        expect(deviceObj['Boolean2.Value'].common).to.have.property('write', true);

        // Check that additional properties are added
        expect(deviceObj['Boolean2.Value'].common).to.have.property('unit', '°C');
        expect(deviceObj['Boolean2.Value'].common).to.have.property('min', 0);
        expect(deviceObj['Boolean2.Value'].common).to.have.property('max', 100);
        expect(deviceObj['Boolean2.Value'].common).to.have.property('def', 20);
    });

    it('Test addButton without additionalCommon parameter', function () {
        const deviceObj = {};
        virtualHelper.addButton(deviceObj, 0, undefined);

        // Check that Button0.Value is created
        expect(deviceObj).to.have.property('Button0.Value');
        expect(deviceObj['Button0.Value']).to.have.property('common');
        expect(deviceObj['Button0.Value'].common).to.have.property('read', false);
        expect(deviceObj['Button0.Value'].common).to.have.property('write', true);
        expect(deviceObj['Button0.Value'].common).to.have.property('type', 'boolean');
        expect(deviceObj['Button0.Value'].common).to.have.property('role', 'button');

        // Check that additional properties do not exist
        expect(deviceObj['Button0.Value'].common).to.not.have.property('unit');
    });

    it('Test addButton with additionalCommon parameter containing unit', function () {
        const deviceObj = {};
        virtualHelper.addButton(deviceObj, 1, undefined, { unit: 's' });

        // Check that Button1.Value is created
        expect(deviceObj).to.have.property('Button1.Value');
        expect(deviceObj['Button1.Value']).to.have.property('common');

        // Check that read and write are not changed
        expect(deviceObj['Button1.Value'].common).to.have.property('read', false);
        expect(deviceObj['Button1.Value'].common).to.have.property('write', true);

        // Check that additional property is added
        expect(deviceObj['Button1.Value'].common).to.have.property('unit', 's');
    });

    it('Test addNumber without additionalCommon parameter', function () {
        const deviceObj = {};
        virtualHelper.addNumber(deviceObj, 0, 'crw');

        // Check that Number0.Value is created
        expect(deviceObj).to.have.property('Number0.Value');
        expect(deviceObj['Number0.Value']).to.have.property('common');
        expect(deviceObj['Number0.Value'].common).to.have.property('read', true);
        expect(deviceObj['Number0.Value'].common).to.have.property('write', true);
        expect(deviceObj['Number0.Value'].common).to.have.property('type', 'number');
        expect(deviceObj['Number0.Value'].common).to.have.property('role', 'level');

        // Check that additional properties do not exist
        expect(deviceObj['Number0.Value'].common).to.not.have.property('unit');
    });

    it('Test addNumber with additionalCommon parameter containing unit', function () {
        const deviceObj = {};
        virtualHelper.addNumber(deviceObj, 1, 'cr', { unit: '%' });

        // Check that Number1.Value is created
        expect(deviceObj).to.have.property('Number1.Value');
        expect(deviceObj['Number1.Value']).to.have.property('common');

        // Check that read and write are not changed
        expect(deviceObj['Number1.Value'].common).to.have.property('read', true);
        expect(deviceObj['Number1.Value'].common).to.have.property('write', false);

        // Check that additional property is added
        expect(deviceObj['Number1.Value'].common).to.have.property('unit', '%');
    });

    it('Test addNumber with additionalCommon parameter containing multiple properties', function () {
        const deviceObj = {};
        virtualHelper.addNumber(deviceObj, 2, 'crw', {
            unit: 'kWh',
            min: 0,
            max: 1000,
            step: 0.1,
        });

        // Check that Number2.Value is created
        expect(deviceObj).to.have.property('Number2.Value');
        expect(deviceObj['Number2.Value']).to.have.property('common');

        // Check that read and write are not changed
        expect(deviceObj['Number2.Value'].common).to.have.property('read', true);
        expect(deviceObj['Number2.Value'].common).to.have.property('write', true);

        // Check that additional properties are added
        expect(deviceObj['Number2.Value'].common).to.have.property('unit', 'kWh');
        expect(deviceObj['Number2.Value'].common).to.have.property('min', 0);
        expect(deviceObj['Number2.Value'].common).to.have.property('max', 1000);
        expect(deviceObj['Number2.Value'].common).to.have.property('step', 0.1);
    });

    it('Test addNumber with additionalCommon parameter containing nested objects', function () {
        const deviceObj = {};
        virtualHelper.addNumber(deviceObj, 3, 'crw', {
            unit: 'W',
            states: {
                0: 'Off',
                1: 'On',
            },
        });

        // Check that Number3.Value is created
        expect(deviceObj).to.have.property('Number3.Value');
        expect(deviceObj['Number3.Value']).to.have.property('common');

        // Check that additional properties including nested objects are added
        expect(deviceObj['Number3.Value'].common).to.have.property('unit', 'W');
        expect(deviceObj['Number3.Value'].common).to.have.property('states');
        expect(deviceObj['Number3.Value'].common.states).to.deep.equal({ 0: 'Off', 1: 'On' });
    });

    it('Test that existing properties are not overwritten by additionalCommon', function () {
        const deviceObj = {};
        // Try to overwrite 'read' and 'write' properties
        virtualHelper.addNumber(deviceObj, 4, 'cr', {
            unit: 'V',
            read: false, // This should NOT overwrite the existing 'read' property
            write: true, // This should NOT overwrite the existing 'write' property
        });

        // Check that Number4.Value is created
        expect(deviceObj).to.have.property('Number4.Value');

        // Check that read and write are kept as per access parameter 'cr' (read-only)
        // With spread operator before read/write, the function's read/write values take precedence
        expect(deviceObj['Number4.Value'].common).to.have.property('read', true);
        expect(deviceObj['Number4.Value'].common).to.have.property('write', false);
        expect(deviceObj['Number4.Value'].common).to.have.property('unit', 'V');
    });
});
