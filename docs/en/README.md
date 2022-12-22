![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the English documentation - [🇩🇪 German version](../de/README.md)

## Table of contents

- [MQTT protocol](protocol-mqtt.md)
- [CoAP protocol](protocol-coap.md)
- [Restricted login](restricted-login.md)
- [State changes](state-changes.md)
- [Debug](debug.md)
- [FAQ](faq.md)

## Requirements

1. nodejs 14.5 (or later)
2. js-controller 3.3.22 (or later)
4. Admin Adapter 6.0.0 (or later)

## Device generations

Check the list of *supported devices* for more details.

- **Gen1**: ESP8266 devices, [CoAP](protocol-coap.md) or [MQTT](protocol-mqtt.md)
- **Gen2**: ESP32 devices, [MQTT](protocol-mqtt.md)

## General

You can use the adapter in CoAP or MQTT mode.

- The default mode is MQTT (see [documentation](protocol-mqtt.md) for details)
- CoAP is just compatible with devices of generation 1
- **If you want to use Gen2 devices, you must use MQTT!**

Questions? Check the [FAQ](faq.md) section first!

![iobroker_general](./img/iobroker_general.png)
