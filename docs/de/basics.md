![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Anforderungen

1. nodejs 12.0 (oder neuer)
2. js-controller 3.3.0 (oder neuer)
4. Admin Adapter 5.1.25 (oder neuer)

## Geräte-Generationen

Für mehr Informationen, siehe *supported devices*.

- **Gen1**: ESP8266 Geräte, CoAP oder MQTT
- **Gen2**: ESP32 Geräte, RCP oder MQTT

## Wichtige Hinweise

### Shelly Firmware 1.8.0 (oder neuer)

- Falls Du das CoAP-Protokoll nutzt, muss ab dieser Version der Adapter in Version 4.0.0 (oder neuer) genutzt werden.
- Für Geräte mit älterer Firmware (außer Shelly 4 Pro) muss der Adapter in Version 3.3.6 (oder älter) genutzt werden. Die Adapter-Version 4.0.0 (oder neuer) ist nicht mit älteren Firmware-Versionen kompatibel!

### Shelly Firmware 1.9.4 (oder neuer)

- Ab dieser Version muss ein CoIoT-Server auf jedem Shelly hinterlegt werden, falls das CoAP-Protokoll genutzt wird. Mehr Details im CoAP-Abschnitt in dieser Dokumentation.

## Allgemein

Der Adapter kann über CoAP oder MQTT mit den Geräten kommunizieren. Der Standard ist CoAP - in diesem Fall muss nichts weiter konfiguriert werden. **Falls Gen2-Geräte integriert werden sollen, muss MQTT konfiguriert werden!**

![iobroker_general](../iobroker_general.png)
