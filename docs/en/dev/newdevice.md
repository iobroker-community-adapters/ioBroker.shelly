![Logo](../../../admin/shelly.png)

# New (not supported) Shelly devices - What to do
If you have a Shelly device which is not supported by the Shelly adapter, please inform the developer and create a new [Issue](https://github.com/iobroker-community-adapters/ioBroker.shelly/issues) on GitHub with the following information:

## 1. CoAP Messages (for Gen1 devices)
The new Shelly device has to be in CoAP mode. This is the default position. Start the ioBroker Shelly adapter and search in the log for the following information:

```
1. Send developer following Info: SHRGBW2#662090#1 : {"blk":[{"I":0,"D":"RGBW2"}],"sen":[{"I":118,"T":"S","D":"Input","R":"0/1","L":0},{"I":111,"T":"S","D":"Brightness_0","R":"0/100","L":0},{"I":121,"T":"S","D":"Brightness_1","R":"0/100","L":0},{"I":131,"T":"S","D":"Brightness_2","R":"0/100","L":0},{"I":141,"T":"S","D":"Brightness_3","R":"0/100","L":0},{"I":151,"T":"S","D":"VSwitch_0","R":"0/1","L":0},{"I":161,"T":"S","D":"VSwitch_1","R":"0/1","L":0},{"I":171,"T":"S","D":"VSwitch_2","R":"0/1","L":0},{"I":181,"T":"S","D":"VSwitch_3","R":"0/1","L":0},{"I":211,"T":"P","D":"Power_0","R":"0/288","L":0},{"I":221,"T":"P","D":"Power_1","R":"0/288","L":0},{"I":231,"T":"P","D":"Power_2","R":"0/288","L":0},{"I":241,"T":"P","D":"Power_3","R":"0/288","L":0}]}

2 .Send developer following Info: SHRGBW2#662090#1 : {"G":[[0,111,50],[0,121,50],[0,131,50],[0,141,50],[0,151,0],[0,161,0],[0,171,0],[0,181,0],[0,211,0],[0,221,0],[0,231,0],[0,241,0],[0,118,0]]}
```

## 2. MQTT
Now check if you find your new Shelly device in the  API documentation here: [https://shelly-api-docs.shelly.cloud](https://shelly-api-docs.shelly.cloud/). If you do not find your new Shelly device, you have to install ioBroker `MQTT Broker/Client` adapter. Now change your new Shelly device to the MQTT mode and start and connect it to the ioBroker `MQTT Broker/Client` adapter. Now open the object tab of the ioBroker admin page and copy all new Shelly device entries below mqtt.0

## 3. Status (http)
Open the following website with your browser ```http://<shelly-ip>/status``` and copy all the information.

## 4. Settings (http)
Open the following website with your browser ```http://<shelly-ip>/settings``` and copy all the information.

Copy all the collected information from point 1 to point 4 above and insert it into the GitHub Issue. It is important that you send all the information from point 1 to point 4.
