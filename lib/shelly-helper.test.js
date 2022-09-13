const expect = require('chai').expect;
const shellyHelper = require('../lib/shelly-helper');

describe('Test Shelly Helper', function () {

    it('Test celsiusToFahrenheit', function () {
        expect(shellyHelper.celsiusToFahrenheit(15)).to.be.equal(59);
        expect(shellyHelper.celsiusToFahrenheit(0)).to.be.equal(32);
        expect(shellyHelper.celsiusToFahrenheit(100)).to.be.equal(212);
        expect(shellyHelper.celsiusToFahrenheit(-20)).to.be.equal(-4);
    });

    it('Test getExtTemp', function () {
        const testObj = {
            ext_temperature: {
                '0': {
                    'hwID': 'XXXXXXXX',
                    'tC': 20.5,
                },
                '1': {
                    'hwID': 'YYYYYYYY',
                    'tC': 21.5,
                    'tF': 70.7,
                },
                '2': {
                    'hwID': 'ZZZZZZZZ',
                    'tC': 22.5,
                },
            },
        };

        expect(shellyHelper.getExtTemp(null, '0', 'C')).to.be.equal(null);
        expect(shellyHelper.getExtTemp({}, '0', 'C')).to.be.equal(null);
        expect(shellyHelper.getExtTemp(testObj, '0', 'C')).to.be.equal(20.5);
        expect(shellyHelper.getExtTemp(testObj, '1', 'C')).to.be.equal(21.5);
        expect(shellyHelper.getExtTemp(testObj, '1', 'F')).to.be.equal(70.7);
        expect(shellyHelper.getExtTemp(testObj, '3', 'C')).to.be.equal(null);
    });

    it('Test getExtHum', function () {
        const testObj = {
            ext_humidity: {
                '0': {
                    'hwID': 'XXXXXXXX',
                    'hum': 50,
                },
            },
        };

        expect(shellyHelper.getExtHum(null, '0')).to.be.equal(null);
        expect(shellyHelper.getExtHum({}, '0')).to.be.equal(null);
        expect(shellyHelper.getExtHum(testObj, '0')).to.be.equal(50);
        expect(shellyHelper.getExtHum(testObj, '1')).to.be.equal(null);
    });

    it('Test intToHex', function () {
        expect(shellyHelper.intToHex(0)).to.be.equal('00');
        expect(shellyHelper.intToHex(1)).to.be.equal('01');
        expect(shellyHelper.intToHex(15)).to.be.equal('0F');
        expect(shellyHelper.intToHex(255)).to.be.equal('FF');
    });

    it('Test hextoInt', function () {
        expect(shellyHelper.hextoInt('00')).to.be.equal(0);
        expect(shellyHelper.hextoInt('01')).to.be.equal(1);
        expect(shellyHelper.hextoInt('0F')).to.be.equal(15);
        expect(shellyHelper.hextoInt('FF')).to.be.equal(255);
        expect(shellyHelper.hextoInt('FFF')).to.be.equal(4095);
    });

});