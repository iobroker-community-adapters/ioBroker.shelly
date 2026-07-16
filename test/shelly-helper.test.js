const assert = require('node:assert');
const shellyHelper = require('../build/lib/shelly-helper');

describe('Test Shelly Helper', function () {
    it('Test celsiusToFahrenheit', function () {
        assert.strictEqual(shellyHelper.celsiusToFahrenheit(15), 59);
        assert.strictEqual(shellyHelper.celsiusToFahrenheit(0), 32);
        assert.strictEqual(shellyHelper.celsiusToFahrenheit(100), 212);
        assert.strictEqual(shellyHelper.celsiusToFahrenheit(-20), -4);
    });

    it('Test fahrenheitToCelsius', function () {
        assert.strictEqual(shellyHelper.fahrenheitToCelsius(78.8), 26);
        assert.strictEqual(shellyHelper.fahrenheitToCelsius(59), 15);
        assert.strictEqual(shellyHelper.fahrenheitToCelsius(0), -17.78);
    });

    it('Test getExtTemp', function () {
        const testObj = {
            ext_temperature: {
                0: {
                    hwID: 'XXXXXXXX',
                    tC: 20.5,
                },
                1: {
                    hwID: 'YYYYYYYY',
                    tC: 21.5,
                    tF: 70.7,
                },
                2: {
                    hwID: 'ZZZZZZZZ',
                    tC: 22.5,
                },
            },
        };

        assert.strictEqual(shellyHelper.getExtTemp(null, '0', 'C'), null);
        assert.strictEqual(shellyHelper.getExtTemp({}, '0', 'C'), null);
        assert.strictEqual(shellyHelper.getExtTemp(testObj, '0', 'C'), 20.5);
        assert.strictEqual(shellyHelper.getExtTemp(testObj, '1', 'C'), 21.5);
        assert.strictEqual(shellyHelper.getExtTemp(testObj, '1', 'F'), 70.7);
        assert.strictEqual(shellyHelper.getExtTemp(testObj, '3', 'C'), null);
    });

    it('Test getExtHum', function () {
        const testObj = {
            ext_humidity: {
                0: {
                    hwID: 'XXXXXXXX',
                    hum: 50,
                },
            },
        };

        assert.strictEqual(shellyHelper.getExtHum(null, '0'), null);
        assert.strictEqual(shellyHelper.getExtHum({}, '0'), null);
        assert.strictEqual(shellyHelper.getExtHum(testObj, '0'), 50);
        assert.strictEqual(shellyHelper.getExtHum(testObj, '1'), null);
    });

    it('Test intToHex', function () {
        assert.strictEqual(shellyHelper.intToHex(0), '00');
        assert.strictEqual(shellyHelper.intToHex(1), '01');
        assert.strictEqual(shellyHelper.intToHex(15), '0F');
        assert.strictEqual(shellyHelper.intToHex(255), 'FF');
    });

    it('Test hexToInt', function () {
        assert.strictEqual(shellyHelper.hextoInt('00'), 0);
        assert.strictEqual(shellyHelper.hextoInt('01'), 1);
        assert.strictEqual(shellyHelper.hextoInt('0F'), 15);
        assert.strictEqual(shellyHelper.hextoInt('FF'), 255);
        assert.strictEqual(shellyHelper.hextoInt('FFF'), 4095);
    });
});
