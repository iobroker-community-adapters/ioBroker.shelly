![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the English documentation - [🇩🇪 German version](../de/faq.md)

## Can I use CoAP and MQTT at the same time?

No, but you can create a second instance of the Shelly adapter which is configured with MQTT (and the other one with CoAP).

## I don't know anything about MQTT, is it hard to use?

No, just configure your Shelly devices as documented [here](protocol-mqtt.md) and the Shelly adapter will handle everything else.

## Can I switch between CoAP and MQTT? What will happen?

You can re-configure your instance at any time. You will not loose any objects or states and everything will stay the same. Just the communication method changes changes in the background.

## Is it possible to connect the Shelly adapter to an existing MQTT broker?

It is not possible to connect the Shelly adapter to an existing MQTT broker in your network. The Shelly adapter starts an own MQTT broker which is running on the (non default) port ``1882`` to avoid conflicts with other MQTT brokers on the same system.

## Can I still use the cloud connection when using the adapter?

If you use **generation 1 (Gen1)** devices, it is not possible to use MQTT and the Shelly cloud at the same time. You have to use CoAP/CoIoT for ioBroker integration if you want to keep the cloud connection.

**Generation 2 (Gen2)** devices are able to connect via MQTT and keep the cloud connection running.
