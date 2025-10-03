const expect = require('chai').expect;
const EventEmitter = require('events');
const BaseClient = require('./base').BaseClient;

describe('Test Base Protocol', function () {
    let mockAdapter;
    let mockObjectHelper;
    let mockEventEmitter;
    let baseClient;

    beforeEach(function () {
        mockAdapter = {
            log: {
                debug: () => {},
                info: () => {},
                warn: () => {},
                error: () => {},
            },
            config: {},
        };
        mockObjectHelper = {};
        mockEventEmitter = new EventEmitter();
        baseClient = new BaseClient('test', mockAdapter, mockObjectHelper, mockEventEmitter);
    });

    describe('isValidMacAddress', function () {
        it('Should validate correct MAC addresses', function () {
            // Valid MAC addresses (hexadecimal)
            expect(baseClient.isValidMacAddress('8CAAB5616291')).to.be.true;
            expect(baseClient.isValidMacAddress('D88040')).to.be.true;
            expect(baseClient.isValidMacAddress('A4CF12F454A3')).to.be.true;
            expect(baseClient.isValidMacAddress('C45BBE798F0F')).to.be.true;
            expect(baseClient.isValidMacAddress('30c6f7850a64')).to.be.true;
            expect(baseClient.isValidMacAddress('44179394d4d4')).to.be.true;
            expect(baseClient.isValidMacAddress('ABCDEF')).to.be.true;
            expect(baseClient.isValidMacAddress('123456')).to.be.true;
            expect(baseClient.isValidMacAddress('1234567890ABCDEF')).to.be.true;
        });

        it('Should reject invalid MAC addresses', function () {
            // Invalid MAC addresses (non-hexadecimal characters)
            expect(baseClient.isValidMacAddress('regentonne')).to.be.false;
            expect(baseClient.isValidMacAddress('test123')).to.be.false;
            expect(baseClient.isValidMacAddress('GHIJKL')).to.be.false;
            expect(baseClient.isValidMacAddress('my-device')).to.be.false;
            expect(baseClient.isValidMacAddress('device_name')).to.be.false;
            expect(baseClient.isValidMacAddress('12345G')).to.be.false;
        });

        it('Should reject empty or invalid inputs', function () {
            expect(baseClient.isValidMacAddress('')).to.be.false;
            expect(baseClient.isValidMacAddress(null)).to.be.false;
            expect(baseClient.isValidMacAddress(undefined)).to.be.false;
            expect(baseClient.isValidMacAddress(123)).to.be.false;
        });

        it('Should reject MAC addresses that are too short', function () {
            // Minimum length should be 6 characters
            expect(baseClient.isValidMacAddress('12345')).to.be.false;
            expect(baseClient.isValidMacAddress('ABC')).to.be.false;
            expect(baseClient.isValidMacAddress('1')).to.be.false;
        });
    });

    describe('validateDeviceId', function () {
        it('Should log warning for invalid MAC addresses', function () {
            const warnings = [];
            mockAdapter.log.warn = (msg) => warnings.push(msg);

            // Create a mock serial ID getter
            baseClient.getSerialId = () => 'regentonne';
            baseClient.getDeviceId = () => 'SHELLY#regentonne#1';

            baseClient.validateDeviceId();

            expect(warnings.length).to.be.equal(1);
            expect(warnings[0]).to.include('invalid MAC address format');
            expect(warnings[0]).to.include('regentonne');
        });

        it('Should not log warning for valid MAC addresses', function () {
            const warnings = [];
            mockAdapter.log.warn = (msg) => warnings.push(msg);

            // Create a mock serial ID getter
            baseClient.getSerialId = () => '8CAAB5616291';
            baseClient.getDeviceId = () => 'SHBDUO-1#8CAAB5616291#2';

            baseClient.validateDeviceId();

            expect(warnings.length).to.be.equal(0);
        });

        it('Should handle missing serial ID gracefully', function () {
            const warnings = [];
            mockAdapter.log.warn = (msg) => warnings.push(msg);

            baseClient.getSerialId = () => null;
            baseClient.getDeviceId = () => null;

            baseClient.validateDeviceId();

            // Should not throw error and should not log warning
            expect(warnings.length).to.be.equal(0);
        });
    });
});
