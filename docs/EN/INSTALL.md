![Logo](../../admin/shelly.png)
# ioBroker.shelly

## Installation

1. Requires node.js 8.0 or higher and Admin v3!
2. Install the Shelly adapter
2. If use the Shelly CoAP protocoll (default) you do not have to do soemething. If use MQTT as protocoll, you have to configure a few things in ioBroker and on your Shelly devices.

### CoAP
By default, the CoAP protocoll is used. You do not have to configure anything. Your Shelly devices will be found by it self.  Because CoAP use multicast UDP packages, the Shelly devices has to be in the same subnet like ioBroker.
If you use ioBroker in a docker container, the container has to run in host or macvlan modus. If ioBroker runs in the docker container in bridge modus your Shelly devices will not be found, 
If you protect you Shelly device with a restricted login, you have to enter this username and password in the ioBroker configuration on the general settings tab. The username, password are not the cloud or MQTT login credentials!

![shelly_restrict_login](../shelly_restrict_login.png) 

![iobroker_restrict_login](../iobroker_general_coap.png) 

Different to the MQTT protocoll where you can choose the Shelly devices that shall be shown in ioBroker, CoAP will show all devices in your network. If you want to exclude some Shelly devices, you can put them on a blacklist.

#### Trouble Shooting 
Sometimes Shelly devices will not be found by the Shelly adapter in CoAP mode. Please do following and disable the ioBroker Shelly Adapter instance. Do not uninstall the Shelly Adapter! But it is important to disable the Shelly instance. Now open a terminal window and enter following statements:

```
cd /opt/iobroker/node_modules/iobroker.shelly/
node coaptest.js 
```
or 
```
# tcpdump with IP address of Shelly device on network device eth1
sudo tcpdump -i eth1 src <IP-OF-SHELLY> and port 5683 -A   

# tcpdump with IP address of Shelly device 
sudo tcpdump src <IP-OF-SHELLY> and port 5683 -A

# tcpdump of all Shelly devices on network device eth1
sudo tcpdump  -i eth1 port 5683 -A

 # tcpdump of all Shelly devices
sudo tcpdump port 5683 -A
```

Now you shall see all CoAP messages from the Shelly. Look for you Shelly device in the output. If you can not find it, you have a network problem with UDP or multicast messages.  

CoAP Messages looks like that:
``` 
UDP Server listening on 0.0.0.0:5683
2020-08-19T19:33:29.484Z - 192.168.20.233:5683 - P-B3citsml	SHBTN-1#AXXXXXXXXXX#2RC{"G":[[0,9103,0],[0,2102,"S"],[0,2103,1],[0,3115,0],[0,3112,0],[0,3111,100],[0,9102,["button"]]]}
2020-08-19T19:33:29.827Z - 192.168.20.233:5683 - P-C3citsml	SHBTN-1#AXXXXXXXXXX#2RC{"G":[[0,9103,0],[0,2102,"S"],[0,2103,1],[0,3115,0],[0,3112,0],[0,3111,100],[0,9102,["button"]]]}
2020-08-19T19:33:33.942Z - 192.168.20.233:5683 - P-D3citsml	SHBTN-1#AXXXXXXXXXX#2RC{"G":[[0,9103,0],[0,2102,"S"],[0,2103,1],[0,3115,0],[0,3112,0],[0,3111,100],[0,9102,["button"]]]}
``` 

![iobroker_coap](../iobroker_coap.png) 


### MQTT
For using MQTT you have to activate MQTT on your Shelly device. Open in your webbrowser (not Shelly App) your Shelly device and activate the MQTT support. For that, go to the internet & security settings -> advanced - developer settings. Activate MQTT and enter a username, password the IP address of ioBroker and the port 1882 for example like 192.168.20.242:1882. It is very important that you do not change tge "custom MQTT prefix". The Adapter will not work if you change the prefix, because the prefix is needed to identify the Shelly device type.

![shelly_mqtt1](../shelly_mqtt1.png) 

![shelly_mqtt2](../shelly_mqtt2.png) 

Now open the Shelly Adapter configuration in ioBroker. Choose MQTT as protocol in the general settings, enter the same MQTT username, password and port from the Shelly device on the MQTT setting tab.

![iobroker_general](../iobroker_general_mqtt.png) 

![iobroker_mqtt](../iobroker_mqtt.png) 

If you protect you Shelly device with a restricted login, you have to enter this username and password in the ioBroker configuration on the gernal settings tab. The username, password are not the cloud or MQTT login credentials!

![shelly_restrict_login](../shelly_restrict_login.png) 

![iobroker_restrict_login](../iobroker_general_mqtt.png) 

### New not supported Shelly devices - What to do
I you have a Shelly device which are not supported by the Shelly Adapter, please inform the developer and create an [Issue](https://github.com/schmupu/ioBroker.shelly/issues) on GitHub with following information: 


**1. CoAP Messages**
The new Shelly device has to be in CoAP mode. This is the default position. Start the ioBroker Shelly Adapter and open
the logfile and search for following information:
```
1. Send developer following Info: SHRGBW2#662090#1 : {"blk":[{"I":0,"D":"RGBW2"}],"sen":[{"I":118,"T":"S","D":"Input","R":"0/1","L":0},{"I":111,"T":"S","D":"Brightness_0","R":"0/100","L":0},{"I":121,"T":"S","D":"Brightness_1","R":"0/100","L":0},{"I":131,"T":"S","D":"Brightness_2","R":"0/100","L":0},{"I":141,"T":"S","D":"Brightness_3","R":"0/100","L":0},{"I":151,"T":"S","D":"VSwitch_0","R":"0/1","L":0},{"I":161,"T":"S","D":"VSwitch_1","R":"0/1","L":0},{"I":171,"T":"S","D":"VSwitch_2","R":"0/1","L":0},{"I":181,"T":"S","D":"VSwitch_3","R":"0/1","L":0},{"I":211,"T":"P","D":"Power_0","R":"0/288","L":0},{"I":221,"T":"P","D":"Power_1","R":"0/288","L":0},{"I":231,"T":"P","D":"Power_2","R":"0/288","L":0},{"I":241,"T":"P","D":"Power_3","R":"0/288","L":0}]}

2 .Send developer following Info: SHRGBW2#662090#1 : {"G":[[0,111,50],[0,121,50],[0,131,50],[0,141,50],[0,151,0],[0,161,0],[0,171,0],[0,181,0],[0,211,0],[0,221,0],[0,231,0],[0,241,0],[0,118,0]]}
```

**2. MQTT**
Now check if you find your new Shelly device in the  API documentation here: [https://shelly-api-docs.shelly.cloud](https://shelly-api-docs.shelly.cloud/). If you do not find your new Shelly device you have to install ioBroker ”MQTT Broker/Client" adapter. Now change your new Shelly device to the MQTT mode and start and connect it to the ioBroker ”MQTT Broker/Client" adapter. Now open the object tab of the ioBroker admin page and copy all new Shelly device entries under mqtt.0 you find.

**3. Status (http)**
Open following page http://ip-shelly/status and copy all the information.

**4. Settings (http)**
Open following page  http://ip-shelly/settings and copy all the information.

Copy all the collected  information from point 1 to point 4 above and insert it into the GitHub Issue. It is important that you send all the information from point 1 to point 4. We will alway provide CoAP and MQTT for new devices and not only once of them.