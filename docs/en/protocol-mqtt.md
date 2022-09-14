![Logo](../../admin/shelly.png)

# ioBroker.shelly

## MQTT

![iobroker_general_mqtt](./img/iobroker_general_mqtt.png)

### Important notes

- It is not possible to connect the Shelly adapter to an existing MQTT broker in your network
- The Shelly adapter starts an own MQTT broker which is running on the (non default) port ``1882`` to avoid conflicts with other MQTT brokers on the same system (the default port for MQTT is 1883)
- It is not possible to connect a MQTT client (like MQTT-Explorer) to the internal MQTT broker
- You can change the port of the MQTT broker in the adapter settings
- **You don't need any knowledge about MQTT to use it** - everything is handled internally

### Configuration

1. Open the Shelly Adapter configuration in ioBroker
2. Choose ```MQTT (and HTTP)``` as *protocol* in the *general settings*
3. Open the **MQTT Settings** tab
4. Choose a username and a secure password (you have to configure these information on all Shelly devices)

![iobroker_mqtt](./img/iobroker_mqtt.png)

Activate MQTT on all your Shelly devices.

### Generation 1 devices

1. Open the Shelly web configuration in your webbrowser (not in the Shelly App!)
2. Go to ```Internet & Security settings -> Advanced - Developer settings```
3. Enable MQTT and enter the previously configured username, password and the ip address of your ioBroker installation - followed by the configured port (e.g. ```192.168.1.2:1882```)
4. Save the configuration - the Shelly will reboot automatically

![shelly_mqtt gen1](./img/shelly_mqtt-gen1.png)

### Generation 2 devices (Plus and Pro)

1. Open the Shelly web configuration in your webbrowser (not in the Shelly App!)
2. Go to ```Networks -> Mqtt```
3. Enable MQTT and enter the previously configured username, password and the ip address of your ioBroker installation - followed by the configured port (e.g. ```192.168.1.2:1882```)
4. Apply the configuration - the Shelly will reboot automatically

- **Do not change the "client id" in this configuration**
- **You have to enable all RPC notification options for gen 2 devices (see screenshot)!**
- SSL has to be disabled!

![shelly_mqtt gen2](./img/shelly_mqtt-gen2.png)

### MQTTS / TLS

1. Generate a new private and public key (e.g. with ``openssl``):

```
$ openssl genrsa -out broker.pem 2048

$ openssl req -new -key broker.pem -out csr.pem

    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) []:DE
    State or Province Name (full name) []:Germany
    Locality Name (eg, city) []:Paderborn
    Organization Name (eg, company) []:iobroker
    Organizational Unit Name (eg, section) []:
    Common Name (eg, fully qualified host name) []:localhost
    Email Address []:info@haus-automatisierung.com

    Please enter the following 'extra' attributes
    to be sent with your certificate request
    A challenge password []:

$ openssl x509 -req -in csr.pem -signkey broker.pem -out public.pem

$ cat broker.pem
$ cat public.pem
```

2. Save these certificates to the 