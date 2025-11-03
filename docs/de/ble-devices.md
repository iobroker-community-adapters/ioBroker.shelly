![Logo](../../admin/shelly.png)

# ioBroker.shelly

**Diese Funktion ist experimentell!**

Ein neues Skript (siehe unten) muss auf einem Plus- oder Pro-Gerät (Gen 2+) erstellt werden, um Ereignisse in diesem Zustand als JSON zu erhalten: `shelly.0.<device>.BLE.Event`.

Der Gerätestatus aller bekannten BLE-Geräte wird in `shelly.0.ble.<macAddress>` gesammelt. *Der Name des Geräteobjekts kann geändert werden, um das Gerät zu identifizieren.*

Seit Adapter-Version 7.1.0 wird eine Liste aller Geräte (JSON-Objekt) bereitgestellt, die die Bluetooth-Nachricht empfangen haben, unter `shelly.0.ble.<macAddress>.receivedBy`. Beispielformat:

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
### Video-Tutorials für Shelly BLE auf Youtube (deutsch)

- https://www.youtube.com/watch?v=qOjEFsCjhLg 
- https://www.youtube.com/watch?v=FubPHOsktbU

### Voraussetzungen

- Ein benutzerdefiniertes Skript auf dem Shelly Gen2+ Gerät (siehe unten, einfach kopieren/einfügen)
- Shelly BLU Gerät
- Die korrekte Skriptversion für die verwendete Adapterversion

| Adapterversion                                                                                                 | Skriptversion |
|-----------------------------------------------------------------------------------------------------------------|----------------|
| [>= 10.3.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v10.3.0/docs/en/ble-devices.md) | v1.2           |
| [>= 10.2.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v10.2.0/docs/en/ble-devices.md) | v1.1           |
| [>= 10.0.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v10.1.0/docs/en/ble-devices.md) | v1.0           |
| [>= 9.1.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v9.1.0/docs/en/ble-devices.md)   | v0.5           |
| [>= 8.2.1](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v8.2.1/docs/en/ble-devices.md)   | v0.4           |
| [>= 8.0.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v8.0.0/docs/en/ble-devices.md)   | v0.3           |
| [>= 6.8.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v6.8.0/docs/en/ble-devices.md)   | v0.2           |
| [>= 6.6.0](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/v6.6.0/docs/en/ble-devices.md)   | v0.1           |

*Seit Skriptversion v1.0 wurde die Verarbeitung der BLE-Nachrichten zu ioBroker migriert. Ältere Versionen funktionieren möglicherweise nicht auf Gen3-Geräten, da diese mehr Ressourcen benötigen, um die Bluetooth-Nachrichten zu entpacken.*

## Verschlüsselung

Verschlüsselung wird seit Adapterversion >10.0.0 unterstützt

- Die Shelly Debug App (z. B. auf einem Android-Smartphone) verwenden, um das Gerät zu verschlüsseln
- Den Verschlüsselungsschlüssel kopieren
- Ein neues BLE-Ereignis auslösen, um die erforderlichen Zustände zu generieren
- Den Verschlüsselungsschlüssel in `shelly.0.ble.<macAddress>.encryptionKey` speichern (mit `ack: false`)

Danach kann das nächste BLE-Ereignis entschlüsselt werden.

## JavaScript (Shelly Scripting)

Dieses Skript im Shelly Scripting-Bereich eines Shelly Plus- oder Pro-Geräts (Gen 2+) hinzufügen und starten:

```javascript
// v1.2
const SCRIPT_VERSION = '1.2';
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
            mac: result.addr,
            rssi: result.rssi
        },
        payload: convertToHex(result.service_data[BTHOME_SVC_ID_STR])
    };

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

## Beispiel-Payloads (nur für Entwicklung)

**Shelly BLU Button (und Tough 1)**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/button
- Getestet mit Firmware: `20250314-080633/v1.0.22@cb5ca611`

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 6,
  "battery": 70,
  "button": 1 // 1 = einzelner Druck, 2 = Doppeldruck, 3 = Dreifachdruck, 4 = langer Druck
}
```

**Shelly BLU H&T**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/ht
- Getestet mit Firmware: `20250314-080647/v1.0.22@cb5ca611`

```json

```

**Shelly BLU Door/Window**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/dw
- Getestet mit Firmware: `20250314-080641/v1.0.22@cb5ca611`

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 12,
  "battery": 100,
  "illuminance": 13,
  "window": 0, // 1 = offen, 0 = geschlossen
  "rotation": 0
}
```

**Shelly BLU Motion**

- Docs: https://shelly-api-docs.shelly.cloud/docs-ble/Devices/motion
- Getestet mit Firmware: `20250314-080656/v1.0.22@cb5ca611`

```json
{
  "encryption": false,
  "BTHome_version": 2,
  "pid": 182,
  "battery": 100,
  "temperature": 25.9,
  "illuminance": 427,
  "motion": 1 // 1 = Bewegung, 0 = Bewegung beendet
}
```
