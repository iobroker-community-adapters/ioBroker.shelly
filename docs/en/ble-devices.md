![Logo](../../admin/shelly.png)

# ioBroker.shelly

**This feature is experimental!**

You have to create a new script (see below) on a Plus or Pro device (Gen 2+) to get Events in this state as JSON: `shelly.0.<device>.BLE.Event`.

Devices status of all known BLE-Devices will be collected in `shelly.0.ble.<macAddress>`. *Feel free to change the name of the device object to identify the device.*

Since adapter version 7.1.0 you will get a list of all devices (JSON object) which received the Bluetooth message in `shelly.0.ble.<macAddress>.receivedBy`. Example format:

```json
{
  "shelly1pmminig3-3030f9e512ac": {
    "rssi": -49,
    "ts": 1714383830316
  },
  "shellypmminig3-84fce63c5d7c": {
    "rssi": -39,
    "ts": 1714383830416
  }
}
```

### Requirements

- A custom script on the Shelly Gen2+ Device (see below, just copy/paste)
- Shelly BLU device
- The correct script version for the used adapter version

| Adapter version                                                                                                 | Script version |
|-----------------------------------------------------------------------------------------------------------------|----------------|
| [>= 10.0.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v10.0.0/docs/en/ble-devices.md) | v1.0           |
| [>= 9.1.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v9.1.0/docs/en/ble-devices.md)   | v0.5           |
| [>= 8.2.1](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v8.2.1/docs/en/ble-devices.md)   | v0.4           |
| [>= 8.0.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v8.0.0/docs/en/ble-devices.md)   | v0.3           |
| [>= 6.8.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v6.8.0/docs/en/ble-devices.md)   | v0.2           |
| [>= 6.6.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v6.6.0/docs/en/ble-devices.md)   | v0.1           |

## Encryption

Encryption is supported since adapter version >10.0.0

- Use the Shelly Debug App (e.g. on an Android smart phone) to encrypt the device
- Copy the encryption key
- Raise a new BLE event to generate the required states
- Save the encryption key in `shelly.0.ble.<macAddress>.encryptionKey`

After that, the next BLE event can be decrypted.

## JavaScript (Shelly Scripting)

Add this script in the Shelly Scripting section of a Shelly Plus or Pro device (Gen 2+) and start it:

```javascript
// v1.0
const SCRIPT_VERSION = '1.0';
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

    // create MQTT-Payload
    let message = {
        scriptVersion: SCRIPT_VERSION,
        src: SHELLY_ID,
        srcBle: {
            type: result.local_name,
            mac: result.addr
        },
        payload: convertToHex(result.service_data[BTHOME_SVC_ID_STR])
    };

    console.log('Received ' + JSON.stringify(unpackedData));

    if (MQTT.isConnected()) {
        MQTT.publish(SHELLY_ID + '/events/ble', JSON.stringify(message));
    }
}

// Initializes the script and performs the necessary checks and configurations
function init() {
    // get the config of ble component
    let bleConfig = Shelly.getComponentConfig('ble');

    // exit if the BLE isn't enabled
    if (!bleConfig.enable) {
        console.log('Error: The Bluetooth is not enabled, please enable it in the settings');
        return;
    }

    // check if the scanner is already running
    if (BLE.Scanner.isRunning()) {
        console.log('Info: The BLE gateway is running, the BLE scan configuration is managed by the device');
    } else {
        // start the scanner
        let bleScanner = BLE.Scanner.Start({
            duration_ms: BLE.Scanner.INFINITE_SCAN,
            active: true
        });

        if (!bleScanner) {
            console.log('Error: Can not start new scanner');
        }
    }

    BLE.Scanner.Subscribe(bleScanCallback);
}

Shelly.call('Mqtt.GetConfig', '', function (res, err_code, err_msg, ud) {
    SHELLY_ID = res['topic_prefix'];

    init();
});
```

## Example Payloads (just for development)

**Shelly BLU Button (and Tough 1)**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/button
- Tested with firmware: `20241106-091020/v1.0.20-rc8@3771fa9d`

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 6,
  "battery": 70,
  "button": 1, // 1 = single press, 2 = double press, 3 = triple press, 4 = long press
  "rssi": -76,
  "address": "5c:c7:c1:f2:e4:7c"
}
```

**Shelly BLU H&T**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/ht
- Tested with firmware: `20240408-184609/v1.0.16@716b307b`

```json

```

**Shelly BLU Door/Window**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/dw
- Tested with firmware: `20240408-184602/v1.0.16@716b307b`

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 12,
  "battery": 100,
  "illuminance": 13,
  "window": 0, // 1 = open, 0 = closed
  "rotation": 0,
  "rssi": -55,
  "address": "60:ef:ab:42:ed:25"
}
```

**Shelly BLU Motion**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/motion
- Tested with firmware: `20240408-184613/v1.0.16@716b307b`

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 182,
  "battery": 100,
  "temperature": 25.9,
  "illuminance": 427,
  "motion": 1, // 1 = motion, 0 = motion ended
  "rssi": -51,
  "address": "bc:02:6e:c3:93:c3"
}
```
