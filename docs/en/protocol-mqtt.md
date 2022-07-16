![Logo](../../admin/shelly.png)

# ioBroker.shelly

## MQTT

### Important notes

- It is not possible to connect the Shelly adapter to an existing MQTT broker in your network
- The Shelly adapter starts an own broker which is running on the (non default) port ``1882`` to avoid conflicts with other MQTT brokers on the same system
- You can change the port of the MQTT broker in the adapter settings
- You don't need any knowledge about MQTT to use it - everything is handled internally

### Configuration

1. Open the Shelly Adapter configuration in ioBroker
2. Choose ```MQTT and HTTP``` as *protocol* in the *general settings*
3. Open the **mqtt settings** tab
4. Choose a secure username and password (you have to configure these information on your Shelly devices)

![iobroker_general](./img/iobroker_general_mqtt.png)

![iobroker_mqtt](./img/iobroker_mqtt.png)

Activate MQTT on all your Shelly devices:

1. Open the Shelly web configuration in your webbrowser (not in the Shelly App!)
2. Go to ```Internet & Security settings -> Advanced - Developer settings```
3. Activate MQTT and enter the previously configured username, password and the ip address of your ioBroker installation - followed by port 1882 (e.g. ```192.168.20.242:1882```)
4. Save the configuration - the Shelly will reboot automatically

**Do not change the ```(custom) MQTT prefix``` - the adapter will not work if you change the prefix!**

![shelly gen1](./img/shelly_mqtt-gen1.png)

- **Do not change the "client id" in this configuration**
- **You have to enable all RPC notification options for gen 2 devices (see screenshot)!**
- SSL has to be disabled!

![shelly gen2](./img/shelly_mqtt-gen2.png)
