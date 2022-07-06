![Logo](../../admin/shelly.png)

# ioBroker.shelly DEV documentation

## Device definitions

Example:

```javascript
const shelly1 = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101', // Coap >= FW 1.8
            coap_publish_funct: (value) => { return value == 1 ? true : false; },
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; }
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
            mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
        },
        common: {
            'name': 'Switch',
            'type': 'boolean',
            'role': 'switch',
            'read': true,
            'write': true,
            'def': false
        }
    }
};
```

Each state is defined as an object attribute. It contains the ``common`` attributes for the ioBroker state and the defition for each protocol.

### Receive data

To **receive** values via different protocols, you can add the following properties to the device definition:

- ``coap_publish`` + ``coap_publish_funct``
- ``mqtt_publish`` + ``mqtt_publish_funct``

The ``xxxx_publish`` attribute contains the trigger of the action which should be listened to. When a new message arrives, it is possible to manipulate the received value in the ``xxxx_publish_funct`` attribute, by defining a new function which returns the value, which should be stored in the state.

If the requested value isn't published automatically by the client device, you can request/poll it via HTTP manually by using:

- ``http_publish`` + ``http_publish_funct``

These commands will be executed regularly in the ``httpIoBrokerState()`` to get current state from the device via http. **Authentication is handled automatically!** When you use the same URL more than once, the request will be executed just one time.

### Send data

To **publish** values/changes to the client, you can use:

- ``http_cmd`` + ``http_cmd_funct``
- ``mqtt_cmd`` + ``mqtt_cmd_funct``

These functions will be executed when the value of the state changes. You can use ``xxxx_cmd_funct`` to manipulate the state before the command is executed by defining a new function which returns the value, which should be send to the client.

Important notes:

- You cannot define/execute multiple ``xxxx_cmd`` types for one state
- For CoAP, there is no ``coap_cmd`` function like ``coap_cmd_funct``

To **hide** a specific function, you can use the ``no_display`` flag on each type. Example:

```javascript
'Relay0.Timer': {
    coap: {
        http_publish: '/settings',
        http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay0.Timer'); }
    },
    mqtt: {
        no_display: true
    },
    common: {
        'name': 'Duration',
        'type': 'number',
        'role': 'level.timer',
        'read': true,
        'write': true,
        'def': 0,
        'unit': 's'
    }
}
```

This object won't be available when using MQTT.
