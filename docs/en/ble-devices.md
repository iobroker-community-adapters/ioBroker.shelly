![Logo](../../admin/shelly.png)

# ioBroker.shelly

**This feature is experimental!**

You have to create a new script (see below) on a Plus or Pro device (Gen 2) to get Events in this state as JSON: `shelly.0.<device>.BLE.Event`.

Devices status of all known BLE-Devices will be collected in `shelly.0.ble.<macAddress>`. *Feel free to change the name of the device object to identify the device.*

Requirements:

- A custom script (see below) on the Shelly Gen2 Device (copy/paste)
- Shelly BLU device (encryption must be disabled!)
- Adapter-Version > 6.6.0

## Example Payloads

**Shelly BLU Button 1**

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

**Shelly BLU Door/Window**

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

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 182,
  "battery": 100,
  "illuminance": 232,
  "motion": 1,
  "rssi": -66,
  "address": "bc:02:6e:c3:93:c3"
}
```

## JavaScript (Shelly Scripting)

Add this script in the Shelly Scripting section of a Shelly Plus or Pro device (Gen 2) and start it:

```javascript
// v0.1
let SCRIPT_VERSION = '0.1';
let BTHOME_SVC_ID_STR = 'fcd2';

let uint8 = 0;
let int8 = 1;
let uint16 = 2;
let int16 = 3;
let uint24 = 4;
let int24 = 5;

let BTH = {};
let SHELLY_ID = undefined;

BTH[0x00] = { n: 'pid', t: uint8 };
BTH[0x01] = { n: 'battery', t: uint8, u: '%' };
BTH[0x02] = { n: 'temperature', t: int16, f: 0.01, u: 'tC' };
BTH[0x03] = { n: 'humidity', t: uint16, f: 0.01, u: '%' };
BTH[0x05] = { n: 'illuminance', t: uint24, f: 0.01 };
BTH[0x1a] = { n: 'door', t: uint8 };
BTH[0x20] = { n: 'moisture', t: uint8 };
BTH[0x21] = { n: 'motion', t: uint8 };
BTH[0x2d] = { n: 'window', t: uint8 };
BTH[0x3a] = { n: 'button', t: uint8 };
BTH[0x3f] = { n: 'rotation', t: int16, f: 0.1 };

function getByteSize(type) {
    if (type === uint8 || type === int8) return 1;
    if (type === uint16 || type === int16) return 2;
    if (type === uint24 || type === int24) return 3;
    // impossible as advertisements are much smaller
    return 255;
}

let BTHomeDecoder = {
    utoi: function (num, bitsz) {
        let mask = 1 << (bitsz - 1);
        return num & mask ? num - (1 << bitsz) : num;
    },
    getUInt8: function (buffer) {
        return buffer.at(0);
    },
    getInt8: function (buffer) {
        return this.utoi(this.getUInt8(buffer), 8);
    },
    getUInt16LE: function (buffer) {
        return 0xffff & ((buffer.at(1) << 8) | buffer.at(0));
    },
    getInt16LE: function (buffer) {
        return this.utoi(this.getUInt16LE(buffer), 16);
    },
    getUInt24LE: function (buffer) {
        return (
            0x00ffffff & ((buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0))
        );
    },
    getInt24LE: function (buffer) {
        return this.utoi(this.getUInt24LE(buffer), 24);
    },
    getBufValue: function (type, buffer) {
        if (buffer.length < getByteSize(type)) return null;
        let res = null;
        if (type === uint8) res = this.getUInt8(buffer);
        if (type === int8) res = this.getInt8(buffer);
        if (type === uint16) res = this.getUInt16LE(buffer);
        if (type === int16) res = this.getInt16LE(buffer);
        if (type === uint24) res = this.getUInt24LE(buffer);
        if (type === int24) res = this.getInt24LE(buffer);
        return res;
    },
    unpack: function (buffer) {
        // beacons might not provide BTH service data
        if (typeof buffer !== 'string' || buffer.length === 0) return null;
        let result = {};
        let _dib = buffer.at(0);
        result['encryption'] = _dib & 0x1 ? true : false;
        result['BTHome_version'] = _dib >> 5;
        if (result['BTHome_version'] !== 2) return null;
        // can not handle encrypted data
        if (result['encryption']) return result;
        buffer = buffer.slice(1);

        let _bth;
        let _value;
        while (buffer.length > 0) {
            _bth = BTH[buffer.at(0)];
            if (typeof _bth === 'undefined') {
                console.log('Error: unknown type');
                break;
            }
            buffer = buffer.slice(1);
            _value = this.getBufValue(_bth.t, buffer);
            if (_value === null) break;
            if (typeof _bth.f !== 'undefined') _value = _value * _bth.f;
            result[_bth.n] = _value;
            buffer = buffer.slice(getByteSize(_bth.t));
        }
        return result;
    },
};

let lastPacketId = 0x100;

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
        // console.log('Error: Missing service_data member');
        return;
    }

    let unpackedData = BTHomeDecoder.unpack(
        result.service_data[BTHOME_SVC_ID_STR]
    );

    // exit if unpacked data is null or the device is encrypted
    if (
        unpackedData === null ||
        typeof unpackedData === "undefined" ||
        unpackedData["encryption"]
    ) {
        console.log('Error: Encrypted devices are not supported');
        return;
    }

    // exit if the event is duplicated
    if (lastPacketId === unpackedData.pid) {
        return;
    }

    lastPacketId = unpackedData.pid;

    unpackedData.rssi = result.rssi;
    unpackedData.address = result.addr;

    // create MQTT-Payload
    let message = {
        scriptVersion: SCRIPT_VERSION,
        src: SHELLY_ID,
        srcBle: {
            type: result.local_name,
            mac: result.addr
        },
        payload: unpackedData
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