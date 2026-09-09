const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');

const {
    bleGatewayScriptCode,
    bleGatewayScriptVersion,
} = require('../build/lib/ble-gateway-script');

/**
 * Read the javascript block out of one of the ble-devices documentation files.
 *
 * @param lang language of the documentation, e.g. `en`
 */
function readScriptFromDocs(lang) {
    const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', lang, 'ble-devices.md'), 'utf8');
    const match = /```javascript\n([\s\S]*?)```/.exec(doc);

    return match ? match[1] : null;
}

describe('Test BLE gateway script', function () {
    it('The version in the script matches the exported version', function () {
        const match = /SCRIPT_VERSION\s*=\s*'([^']+)'/.exec(bleGatewayScriptCode);

        expect(match, 'SCRIPT_VERSION not found in the script').to.be.an('array');
        expect(match[1]).to.equal(bleGatewayScriptVersion);
    });

    // The script is installed on the device by the adapter, but users still copy it out of the
    // documentation - both must stay identical.
    for (const lang of ['en', 'de']) {
        it(`The script in docs/${lang}/ble-devices.md is identical to the installed one`, function () {
            expect(readScriptFromDocs(lang), `no javascript block in docs/${lang}/ble-devices.md`).to.equal(
                bleGatewayScriptCode,
            );
        });
    }
});
