![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Requirements

1. nodejs 12.0 (or later)
2. js-controller 3.3.0 (or later)
4. Admin Adapter 5.1.25 (or later)

## Device generations

Check the list of *supported devices* for more details.

- **Gen1**: ESP8266 devices, CoAP or MQTT
- **Gen2**: ESP32 devices, RCP or MQTT

## Important notes

### Shelly Firmware 1.8.0 (or later)

- If you use the CoAP protocol, you have to use adapter version 4.0.0 or above.
- If you use devices with firmware below 1.8.0 (except Shelly 4 Pro) you have have to use adapter version 3.3.6 or below. The adapter version 4.0.0 (or later) would not work in this case!

### Shelly Firmware 1.9.4 (or later)

- You have to enter a CoIoT server for CoAP. For more information, see CoAp section in this documentation.

## General

You can use the adapter in CoAP or MQTT mode. The default mode is CoAP and you do not have to do anything. **If you want to use Gen2 devices, you must use MQTT!**

![iobroker_general](../iobroker_general.png)
