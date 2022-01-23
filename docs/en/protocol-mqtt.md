![Logo](../../admin/shelly.png)

# ioBroker.shelly

## MQTT

1. Open the Shelly Adapter configuration in ioBroker
2. Choose ```MQTT and HTTP``` as *protocol* in the *general settings*
3. Open the **mqtt settings** tab
4. Choose a secure username and password (you have to configure these information on your Shelly devices)

![iobroker_general](../iobroker_general_mqtt.png)

![iobroker_mqtt](../iobroker_mqtt.png)

Activate MQTT on all your Shelly devices:

1. Open the Shelly web configuration in your webbrowser (not in the Shelly App!)
2. Go to ```Internet & Security settings -> Advanced - Developer settings```
3. Activate MQTT and enter the previously configured username, password and the ip address of your ioBroker installation - followed by port 1882 (e.g. ```192.168.20.242:1882```)
4. Save the configuration - the Shelly will reboot automatically

- For Gen1 devices: Do not change the ```custom MQTT prefix``` (the Adapter will not work if you change the prefix)

![shelly_mqtt1](../shelly_mqtt1.png)

![shelly_mqtt2](../shelly_mqtt2.png)
