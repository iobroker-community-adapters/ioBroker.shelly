/* jshint -W097 */// jshint strict:false
/*jslint node: true */
/*jshint expr: true*/
const expect = require('chai').expect;
const shellyHelper = require('../lib/shelly-helper');

describe('Test Shelly Helper', function() {

    it('Test uptime string', function () {
        expect(shellyHelper.uptimeString(-1)).to.be.equal('00:00:00');
        expect(shellyHelper.uptimeString(0)).to.be.equal('00:00:00');
        expect(shellyHelper.uptimeString(1)).to.be.equal('00:00:01');
        expect(shellyHelper.uptimeString(59)).to.be.equal('00:00:59');
        expect(shellyHelper.uptimeString(60)).to.be.equal('00:01:00');
        expect(shellyHelper.uptimeString(42394)).to.be.equal('11:46:34');
        expect(shellyHelper.uptimeString(42394)).to.be.equal('11:46:34');
        expect(shellyHelper.uptimeString(86399)).to.be.equal('23:59:59');
        expect(shellyHelper.uptimeString(86400)).to.be.equal('1D00:00:00');
        expect(shellyHelper.uptimeString(172800)).to.be.equal('2D00:00:00');
        expect(shellyHelper.uptimeString(190478)).to.be.equal('2D04:54:38');

        expect(shellyHelper.uptimeString('10')).to.be.equal('00:00:10');
    });

});