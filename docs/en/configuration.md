![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Add a new Shelly device

### Skeletal structure
Open you browser like chrome and call the following link http://\<ip-of-your-shelly\>/settings like http://192.168.20.131/settings . Now search in the result for type and hostname in the section device. It is important that you did not changed the hostname or MQTT prefix of your Shelly device. With a changed hostname or MQTT prefix the adapter does not work.

```
{
   "device":{
     "type":"SHRGBW2",
      "mac":"B4E62D662090",
      "hostname":"shellyrgbw2-662090",
      "num_outputs":4
   }
   ...
}
```

The value in type describes the CoAP name, the value in hostname describes the MQTT name. The MQTT Name ends with a minus (-).    

Example above: 
- CoAP Name from field type:    **SHRGBW2**
- MQTT Name from filed hostname: **shellyrgbw2**

Now create a new js file for the new Shelly device in the lib/devices directory. The name of the js file is called like the MQTT name. 

Example: 
**/opt/iobroker/node_modules/iobroker.shelly/lib/devices/shellyrgbw2.js** 

Open the new file (**shellyrgbw2.js**) and insert following content:

```
/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly RGBW2
 */
let shellyrgbw2 = {
 // ....
};
```

Now open the file /lib/datapoints.js (**/opt/iobroker/node_modules/iobroker.shelly/lib/datapoints.js**). You have to enter the MQTT, CoAP and the js filename you created.

```
// const MQTT-Name require(__dirname + '/devices/MQTT-Name').MQTT-Name;
const shellyrgbw2 = require(__dirname + '/devices/shellyrgbw2').shellyrgbw2;

// MQTT-Name: MQTT-Name
let devices = {
  shellyrgbw2: shellyrgbw2
};

 // MQTT-Name: ['CoAP-Name']
let devicenames = {
  shellyrgbw2: ['SHRGBW2']
};
```

### Structure of new Shelly device file
Open the Shelly device file in the /lib/devices directory you created.

Example: 
**/opt/iobroker/node_modules/iobroker.shelly/lib/devices/shellyrgbw2.js** 

You have three sections 

```
let shellyrgbw2 = {
  'objectname': {
    coap: {
        // CoAP section
    },
    mqtt: {
        // MQTT section
    },
    common: {
        // Object properties 
    }
  }
};
```

For example we would like to create a state with the name Switch in the channel lights. The object name would be in this case lights.Switch. 

```
let shellyrgbw2 = {
  'lights.Switch': {
      // ...
    }
  }
};
``` 