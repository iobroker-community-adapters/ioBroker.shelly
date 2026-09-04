/**
 * The BLE gateway script that is installed on a Shelly Gen2+ device to forward the advertisements
 * of Shelly BLU devices to this adapter. It is the single source of truth for the script: the code
 * block in `docs/en/ble-devices.md` and `docs/de/ble-devices.md` must be identical (see
 * `test/ble-gateway-script.test.js`).
 */

/** Name of the script created on the Shelly device. */
export const bleGatewayScriptName = 'ioBroker BLE Gateway';

/** Version of the script. Messages of a device with another major/minor version are reported. */
export const bleGatewayScriptVersion = '1.4.0';

/** Source code of the script, uploaded to the device by `Script.PutCode`. */
export const bleGatewayScriptCode = `// v1.4.0
const SCRIPT_VERSION = '1.4.0';
const BTHOME_SVC_ID_STR = 'fcd2';

let SHELLY_ID = undefined;

function convertToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        h = str.charCodeAt(i).toString(16);
        hex += ('00' + h).slice(-2);
    }
    return hex;
}

// Callback for the BLE scanner object
function bleScanCallback(event, result) {
    // exit if not a result of a scan
    if (event !== BLE.Scanner.SCAN_RESULT) {
        return;
    }

    // exit if service_data member is missing
    if (
        typeof result.service_data === 'undefined' ||
        typeof result.service_data[BTHOME_SVC_ID_STR] === 'undefined'
    ) {
        return;
    }

    if (MQTT.isConnected()) {
        let message = {
            scriptVersion: SCRIPT_VERSION,
            src: SHELLY_ID,
            srcScript: {
                id: Script.id
            },
            srcBle: {
                mac: result.addr,
                rssi: result.rssi
            },
            payload: convertToHex(result.service_data[BTHOME_SVC_ID_STR])
        };

        MQTT.publish(SHELLY_ID + '/events/ble', JSON.stringify(message));
    }
}

// Initializes the script and performs the necessary checks and configurations
function init() {
    // get the config of ble component
    let bleConfig = Shelly.getComponentConfig('ble');

    // exit if Bluetooth isn't enabled
    if (typeof bleConfig.enable !== 'undefined' && bleConfig.enable === false) {
        console.log('Error: Bluetooth is not enabled, please enable it in the settings');
        return;
    }

    BLE.Scanner.Start(
        {
            duration_ms: BLE.Scanner.INFINITE_SCAN,
            active: false,
            interval_ms: 240,
            window_ms: 80
        },
        bleScanCallback
    );
}

Shelly.call('Mqtt.GetConfig', '', function (res, err_code, err_msg, ud) {
    SHELLY_ID = res['topic_prefix'];

    init();
});
`;
