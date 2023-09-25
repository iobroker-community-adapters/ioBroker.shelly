![Logo](../../../admin/shelly.png)

# ioBroker.shelly DEV documentation

## Device definitions

Example:

```javascript
const shelly1 = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: (value) => { return value == 1; },
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => { return value === true ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') } : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
            mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
        },
        common: {
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Vertaling:',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Switch',
                uk: 'Перемикач',
                'zh-cn': '目 录',
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
};
```

Each state is defined as an object attribute. It contains the `common` attributes for the ioBroker state and the definition for each protocol.

### Receive data

To **receive** values via different protocols, you can add the following properties to the device definition:

- `coap_publish` + `coap_publish_funct`
- `mqtt_publish` + `mqtt_publish_funct`

The `xxxx_publish` attribute contains the trigger of the action which should be listened to. When a new message arrives, it is possible to manipulate the received value in the `xxxx_publish_funct` attribute, by defining a new function which returns the value, which should be stored in the state.

If the requested value isn't published automatically by the client device, you can request/poll it via HTTP manually by using:

- `http_publish` + `http_publish_funct`

These commands will be executed regularly in the `httpIoBrokerState()` to get current state from the device via http. **Authentication is handled automatically!** When you use the same URL more than once, the request will be executed just one time.

### Send data

To **publish** values/changes to the client, you can use:

- `http_cmd` + `http_cmd_funct`
- `mqtt_cmd` + `mqtt_cmd_funct`

These functions will be executed when the value of the state changes. You can use `xxxx_cmd_funct` to manipulate the state before the command is executed by defining a new function which returns the value, which should be send to the client.

Important notes:

- You cannot define/execute multiple `xxxx_cmd` types for one state
- For CoAP, there is no `coap_cmd` function like `coap_cmd_funct`

### Init values

If you want to define an initial value to a state, you can define a static value or call a function to calculate a value with the properties `init_value` and `init_funct`.

The init function will be called, every time `createObjects()` is executed. This happens

- On device init
- When the device mode changes

### Hide values

To **hide** a specific state, you can use the `no_display` flag on each type. Example:

```javascript
const shelly1 = {
    'Relay0.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: async (value, self) => { return await shellyHelper.getSetDuration(self, 'Relay0.Timer'); },
        },
        mqtt: {
            no_display: true,
        },
        common: {
            name: {
                en: 'Duration',
                de: 'Dauer',
                ru: 'Продолжительность',
                pt: 'Duração',
                nl: 'Vertaling:',
                fr: 'Durée',
                it: 'Durata',
                es: 'Duración',
                pl: 'Duracja',
                uk: 'Тривалість',
                'zh-cn': '期间',
            },
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    },
};
```

This object won't be available when using MQTT.

### Hide by mode

Some shellies support different modes (like "relay" vs "shutter" or "color" vs "white"). You can hide options (depending on the mode) by using `device_mode`:

```javascript
const shelly1 = {
    'lights.Switch': {
        device_mode: 'color',
        coap: {
            coap_publish: '1101',
            coap_publish_funct: async (value) => { return value == 1; },
            http_cmd: '/color/0',
            http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/color/0',
            mqtt_publish_funct: (value) => { return value === 'on'; },
            mqtt_cmd: 'shellies/<mqttprefix>/color/0/command',
            mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
        },
        common: {
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Vertaling:',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Switch',
                uk: 'Перемикач',
                'zh-cn': '目 录',
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
};
```

## Onboarding Process

Required information:

- `DeviceID` (used in object IDs)
- IP address (used for http requests in `httpIoBrokerState`)


### CoAP

TODO

### MQTT

1. Device connects to internal MQTT broker
2. Password and username of instance configuration are validated
3. 
