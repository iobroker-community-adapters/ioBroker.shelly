![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Inhaltsverzeichnis

- [MQTT Protokoll](protocol-mqtt.md)
- [CoAP Protokoll](protocol-coap.md)
- [Geschützter Login](restricted-login.md)
- [Zustandsänderungen](state-changes.md)
- [Debug](debug.md)
- [FAQ](faq.md)

## Anforderungen

1. nodejs 14.5 (oder neuer)
2. js-controller 3.3.22 (oder neuer)
4. Admin Adapter 5.1.25 (oder neuer)

## Geräte-Generationen

Für mehr Informationen, siehe *supported devices*.

- **Gen1**: ESP8266 Geräte, [CoAP](protocol-coap.md) oder [MQTT](protocol-mqtt.md)
- **Gen2**: ESP32 Geräte, [MQTT](protocol-mqtt.md)

## Allgemein

Der Adapter kann über CoAP oder MQTT mit den Geräten kommunizieren.

- Der Standard-Modus ist MQTT (siehe [Dokumentation](protocol-mqtt.md) für mehr Informationen)
- CoAP ist ausschließlich mit Generation 1 Geräten kompatibel!
- **Falls Gen2-Geräte integriert werden sollen, muss MQTT konfiguriert werden!**

![iobroker_general](./img/iobroker_general.png)
