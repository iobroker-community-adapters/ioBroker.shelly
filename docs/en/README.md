![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the English documentation - [🇩🇪 German version](../de/README.md)

## Table of contents

- [Devicemanager support](devicemanager.md)
- [HTTP polling protocol](protocol-http.md)
- [MQTT protocol](protocol-mqtt.md)
- [CoAP/CoIoT protocol](protocol-coap.md)
- [HTTP polling PR readiness](http-polling-pr-readiness.md)
- [BLE device support](ble-devices.md)
- [Restricted login](restricted-login.md)
- [State changes](state-changes.md)
- [Debug](debug.md)
- [FAQ](faq.md)

## Requirements

1. Node.js 22 (or later)
2. js-controller 6.0.11 (or later)
3. Admin Adapter 7.8.20 (or later)

## Device generations

Check the list of [*supported devices*](../../README.md#supported-devices) for more details.

- **Gen 1**: ESP8266 devices, [CoAP/CoIoT](protocol-coap.md), [MQTT](protocol-mqtt.md), or [HTTP polling](protocol-http.md)
- **Gen 2+**: ESP32 devices, [MQTT](protocol-mqtt.md) or [HTTP polling](protocol-http.md)

## General

The adapter can be used in MQTT (recommended), CoAP/CoIoT, or HTTP polling mode.

- The default mode of the adapter is MQTT (see [documentation](protocol-mqtt.md) for details)
- CoAP/CoIoT is just compatible with Gen1 devices!
- HTTP polling is available for installations where ioBroker can reach devices by HTTP but CoAP or MQTT callback paths are not usable.

Questions? Check the [FAQ](faq.md) section first!

![iobroker_general](./img/iobroker_general.png)

## Features

- The adapter integrates with the ioBroker Device Manager. See [Devicemanager support documentation](devicemanager.md).

## Restrictions

- The Shelly adapter does not support Shellies connecting using any sort of NAT, i.e. most vpns and shelly range extender.

