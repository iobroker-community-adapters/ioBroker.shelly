![Logo](admin/shelly.png)

# ioBroker.shelly

[![NPM version](https://img.shields.io/npm/v/iobroker.shelly?style=flat-square)](https://www.npmjs.com/package/iobroker.shelly)
[![Downloads](https://img.shields.io/npm/dm/iobroker.shelly?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/iobroker.shelly)
![node-lts](https://img.shields.io/node/v-lts/iobroker.shelly?style=flat-square)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/iobroker.shelly?label=npm%20dependencies&style=flat-square)

![GitHub](https://img.shields.io/github/license/iobroker-community-adapters/iobroker.shelly?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/iobroker-community-adapters/iobroker.shelly/test-and-release.yml?branch=master&logo=github&style=flat-square)

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.shelly.svg?color=red&label=beta)
![Stable](http://iobroker.live/badges/shelly-stable.svg)
![Installed](http://iobroker.live/badges/shelly-installed.svg)

The adapter communicates with Shelly devices by REST API and the CoAP or MQTT protocol.

It uses the default Shelly firmware (no flashing of firmware needed!). You will find more and detailed information about the device here: [Shelly](https://shelly.cloud/)

## Documentation

[🇺🇸 Documentation](./docs/en/README.md)

[🇩🇪 Dokumentation](./docs/de/README.md)

## Supported devices

Note that devices connected using **Shellies Range Extender** functionality are **not supported**.  
Please connect you devices directly to your (W)LAN and use a classic WLAN Repeater if required.

### Generation 1 (Gen 1)

| Shelly Device                        | CoAP      | MQTT      |
| ------------------------------------ | --------- | --------- |
| Shelly 1 (SHSW-1)                    | >= v3.3.0 | >= v3.3.0 |
| Shelly 1 PM (SHSW-PM)                | >= v3.3.0 | >= v3.3.0 |
| Shelly 1L (SHSW-L)                   | >= v4.0.5 | >= v4.0.5 |
| Shelly 2 (SHSW-21/SHSW-22)           | >= v3.3.0 | >= v3.3.0 |
| Shelly 2.5 (SHSW-25)                 | >= v3.3.0 | >= v3.3.0 |
| Shelly 4 Pro (SHSW-44)               | >= v3.3.5 | >= v3.3.5 |
| Shelly Dimmer (SHDM-1)               | >= v3.3.0 | >= v3.3.0 |
| Shelly Dimmer 2 (SHDM-2)             | >= v3.3.4 | >= v3.3.4 |
| Shelly RGBW (SHRGBWW-01)             | < v3.4.0  | < v3.4.0  |
| Shelly RGBW 2 (SHRGBW2)              | >= v3.3.0 | >= v3.3.0 |
| Shelly i3 (SHIX3-1)                  | >= v3.3.0 | >= v3.3.0 |
| Shelly EM (SHEM)                     | >= v3.3.0 | >= v3.3.0 |
| Shelly 3EM (SHEM-3)                  | >= v3.3.0 | >= v3.3.0 |
| Shelly H&T (SHHT-1)                  | >= v3.3.0 | >= v3.3.0 |
| Shelly Smoke (SHSM-01)               | >= v3.3.0 | >= v3.3.0 |
| Shelly Flood (SHWT-1)                | >= v3.3.0 | >= v3.3.0 |
| Shelly Gas (SHGS-1)                  | >= v3.3.3 | >= v3.3.3 |
| Shelly Door/Window Sensor (SHDW-1)   | >= v3.3.0 | >= v3.3.0 |
| Shelly Door/Window Sensor 2 (SHDW-2) | >= v3.3.5 | >= v3.3.5 |
| Shelly2LED (SH2LED)                  | >= v3.3.0 | >= v3.3.0 |
| Shelly Plug (SHPLG-1)                | >= v3.3.0 | >= v3.3.0 |
| Shelly Plug S (SHPLG-S)              | >= v3.3.0 | >= v3.3.0 |
| Shelly Plug 2 (SHPLG-2)              | >= v3.3.0 | >= v3.3.0 |
| Shelly Sense (SHSEN-1)               | >= v3.3.0 | >= v3.3.0 |
| Shelly Bulb (SHBLB)                  | >= v3.3.0 | >= v3.3.0 |
| Shelly Bulb Duo (SHBDUO-1)           | >= v3.3.0 | >= v3.3.0 |
| Shelly Color Bulb (SHCB-1)           | >= v4.0.5 | >= v4.0.5 |
| Shelly Vintage (SHVIN-1)             | >= v3.3.0 | >= v3.3.0 |
| Shelly Uni (SHUNI-1)                 | >= v4.0.4 | >= v4.0.4 |
| Shelly Button (SHBTN-1)              | >= v3.3.3 | >= v3.3.3 |
| Shelly Button (SHBTN-2)              | >= v4.0.5 | >= v4.0.5 |
| Shelly Motion (SHMOS-01)             | >= v4.0.6 | >= v4.0.6 |
| Shelly TRV (SHTRV-01)                | >= v6.0.0 | >= v6.0.0 |
| Shelly Motion 2 (SHMOS-02)           | => v6.2.0 | >= v6.2.0 |

### Generation 2 (Gen 2)

| Shelly Device                                  | CoAP | MQTT       |
|------------------------------------------------| ---- |------------|
| Shelly Bluetooth Gateway (shellyblugw)         | ❌   | >= v6.5.0  |
| Shelly Plus 0-10V (shellyplus010v)             | ❌   | >= v6.9.0  |
| Shelly Plus 1 (shellyplus1)                    | ❌   | >= v5.0.0  |
| Shelly Plus 1 Mini (shellyplus1mini)           | ❌   | >= v6.4.5  |
| Shelly Plus 1 PM Mini (shellyplus1pmmini)      | ❌   | >= v6.4.5  |
| Shelly Plus 1 PM (shellyplus1pm)               | ❌   | >= v5.0.0  |
| Shelly Plus 2 PM (shellyplus2pm) (2)           | ❌   | >= v5.2.0  |
| Shelly Plus i4 (shellyplusi4)                  | ❌   | >= v5.3.0  |
| Shelly Plus i4 DC (shellyplusi4)               | ❌   | >= v5.3.0  |
| Shelly Plus H&T (shellyplusht)                 | ❌   | >= v6.2.0  |
| Shelly Plus Plug S (shellyplusplugs)           | ❌   | >= v6.4.0  |
| Shelly Plus PM Mini (shellypmmini)             | ❌   | >= v6.4.5  |
| Shelly Plus RGBW PM (shellyplusrgbwpm)         | ❌   | >= v8.2.0  |
| Shelly Plus Smoke (shellyplussmoke)            | ❌   | >= v6.5.0  |
| Shelly Plus Uni (shellyplusuni)                | ❌   | >= v9.5.1  |
| Shelly Pro 1 (shellypro1)                      | ❌   | >= v5.2.0  |
| Shelly Pro 1 PM (shellypro1pm)                 | ❌   | >= v5.2.0  |
| Shelly Pro 2 (shellypro2)                      | ❌   | >= v5.2.0  |
| Shelly Pro 2 PM (shellypro2pm) (2)             | ❌   | >= v5.2.0  |
| Shelly Pro 3 (shellypro3)                      | ❌   | >= v6.2.0  |
| Shelly Pro 3 EM (shellypro3em) (3)             | ❌   | >= v6.4.0  |
| Shelly Pro 3 EM (400A) (shellypro3em400) (3)   | ❌   | >= v10.4.1 |
| Shelly Pro 3 EM 63 (shellypro3em63) (3)        | ❌   | >= v9.1.0  |
| Shelly Pro 4 PM (shellypro4pm)                 | ❌   | >= v5.0.0  |
| Shelly Pro Dimmer 0/1-10V PM (shellypro0110pm) | ❌   | >= v9.5.0  |
| Shelly Pro Dimmer 1 PM (shellyprodm1pm)        | ❌   | >= v8.0.0  |
| Shelly Pro Dimmer 2 PM (shellyprodm2pm)        | ❌   | >= v7.0.0  |
| Shelly Pro Dual Cover PM (shellypro2cover) (2) | ❌   | >= v6.5.0  | 
| Shelly Pro EM 2x50A                            | ❌   | >= v8.1.0  |
| Shelly Pro RGBWW PM (shellyprorgbwwpm) (1)     | ❌   | >= v9.5.0  |
| Shelly Wall Display (shellywalldisplay)        | ❌   | >= v7.0.0  |

Notes:
(1) CCT component not yet available
(2) slat control requires >= v10.4.0
(3) monophase support requires >= 10.5.2

### Generation 3 (Gen 3)

| Shelly Device                                 | CoAP | MQTT       |
|-----------------------------------------------| ---- | ---------- |
| Shelly 0/1-10V PM Gen3 (shelly0110dimg3)      | ❌   | >= v8.4.0  |
| Shelly 1 Mini Gen3 (shelly1minig3)            | ❌   | >= v7.0.0  |
| Shelly 1 PM Mini Gen3 (shelly1pmminig3)       | ❌   | >= v7.0.0  |
| Shelly 1 PM Gen3 (shelly1pmg3)                | ❌   | >= v8.0.0  |
| Shelly 1 Gen3 (shelly1g3)                     | ❌   | >= v8.0.0  |
| Shelly 1L Gen3 (shelly1lg3)                   | ❌   | >= v10.2.0 |
| Shelly 2L Gen3 (shelly2lg3)                   | ❌   | >= v10.2.0 |
| Shelly 2 PM Gen3 (shelly2pmg3) (1)            | ❌   | >= v8.3.0  |
| Shelly 3EM-63 Gen3 (shelly3em63g3)            | ❌   | >= v9.2.0  |
| Shelly AZ Plug (shellyazplug)                 | ❌   | >= v9.5.0  |
| Shelly BLU Gateway Gen3 (shellyblugwg3)       | ❌   | >= v8.5.0  |
| Shelly DALI Dimmer Gen3 (shellyddimmerg3)     | ❌   | >= v10.2.0 |
| Shelly Dimmer Gen3 (shellydimmerg3)           | ❌   | >= v9.2.0  |
| Shelly EM Gen 3 (shellyemg3)                  | ❌   | >= v9.5.0  |
| Shelly H&T Gen3 (shellyhtg3)                  | ❌   | >= v8.0.0  |
| Shelly I4 / I4DC Gen3 (shellyi4g3)            | ❌   | >= v8.5.0  |
| Shelly Plug PM Gen3 (shellyplugpmg3)          | ❌   | >= v10.5.0 |
| Shelly Plug S Gen3 (shellyplugsg3)            | ❌   | >= v8.5.0  |
| Shelly PM Mini Gen3 (shellypmminig3)          | ❌   | >= v7.0.0  |
| Shelly Outdoor Plug S Gen3 (shellyoutdoorsg3) | ❌   | >= v9.3.0  |
| Shelly Shutter (shellyshutter) (1)            | ❌   | >= v10.2.0 |

Notes:
(1) slat control requires >= v10.4.0

### Generation 4 (Gen 4)

| Shelly Device                                 | CoAP | MQTT       |
|-----------------------------------------------| ---- | ---------- |
| Shelly 1 Gen4 (shelly1g4)                     | ❌   | >= v9.4.0  |
| Shelly 1 PM Gen4 (shelly1pmg4)                | ❌   | >= v9.4.0  |
| Shelly 1 Mini Gen4 (shelly1minig4)            | ❌   | >= v9.4.0  |
| Shelly 1 PM Mini Gen4 (shelly1pmminig4)       | ❌   | >= v9.4.0  |
| Shelly 2 PM Gen4 (shelly2pmg4) (1)            | ❌   | >= v10.2.0 |
| Shelly Dimmer Gen4 (shellydimmerg4) (*)       | ❌   | >= v10.5.0 |
| Shelly Flood Gen4 (shellyfloodg4)             | ❌   | >= v10.3.0 |
| Shelly Power Strip Gen4 (shellypstripg4) (*)  | ❌   | >= v10.3.0 |

Notes:
(1) slat control requires >= v10.4.0
(*) only partial support, full implementation work in progress

### Powered By Shelly

| Device                                        | CoAP | MQTT      |
|-----------------------------------------------| ---- | --------- |
| Ogemray 25A (ogemray25a)                      | ❌   | >= v9.5.0 |

### Bluetooth Low Energy (BLU)

**Experimental** - see [documentation (en)](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/master/docs/en/ble-devices.md) / [documentation (de)](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/master/docs/de/ble-devices.md) for details (Shelly Scripting required)

| Shelly Device                                 | Version     |
|-----------------------------------------------| ----------- |
| Shelly BLU Button and Button Tough 1          | >= v6.8.0   |
| Shelly BLU Door Window                        | >= v6.8.0   |
| Shelly BLU Motion                             | >= v6.8.0   |
| Shelly BLU H&T                                | >= v6.8.0   |
| Shelly BLU Wall Switch 4                      | >= v8.2.0   |
| Shelly BLU RC Button 4                        | >= v8.2.0   |
| Shelly BLU Distance                           | >= v10.4.1  |
| Shelly BLU WS 90                              | >= v10.5.0  |

## NOT Supported devices

- Shelly Plus Wall Dimmer US
- Shelly Plus Plug US
- USB powered UVC LED strip
- Shelly Wall Display X2
- Shelly LoRa Add-On
- Shelly EM Mini Gen4 (**)
- Shelly LinkedGo Smart Thermost (st1820) (*)
- Shelly Frankever Smart Sprinkler Controller (irrigation) (*)
- Shelly Pill (**)

(*) investigation still in progress
(**) planned
## Sentry

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

## Changelog

<!--
  Placeholder for the next version (at the beginning of the line):
  ### **WORK IN PROGRESS**
-->
### 10.5.2 (2025-12-28)
* (@mcm1957) Monophase profile support has been fixed for shellypro3em and shellypro3em400.

### 10.5.1 (2025-12-27)
* (@mcm1957) Monophase profile support has been added to shellypro3em, shellypro3em63 and shellypro3em400. [#1016]
* (@mcm1957) ResetCounters functionality has been added to components EMData and EM1Data. This effect shellypro3em* but also other shellyem* devices gen2 and later.
* (@mcm1957) Changes to shellypro3em could affect shellyemg3 and shellyproem50.
* (@HGlab01) Several fixes for Shelly Ecowitt WS90 have been implemented. [#1293]

### 10.5.0 (2025-12-13)
* (@mcm1957) Changes to mqtt connect handling have been applied. This should fix error 'Unable to get MQTT.Prefix'[#931].
* (@mcm1957) Addon support has been **removed** from Shelly Dimmer Gen 3 (shellydimmerg3) as it is not supported by shelly for this device.
* (@mcm1957) Missing fields at light component have been added. This will effect several devices but should add additional states below light(n) only.
* (@klein0r) Added speed, dewpoint, uv_index, pressure, direction and precipitation for weather station WS 90
* (@mcm1957) Mqtt qos mode 2 has been removed from configuration as shelly does not support qos mode 2.
* (@mcm1957) Shelly Plug PM Gen 3 (shellyplugpmg3) has been added.
* (@mcm1957) Shelly Dimmer Gen 4 (shellydimmerg4) has been added. Some restrictions still exist. 
* (@mcm1957) Dependencies have been updated

### 10.4.1 (2025-11-03)
* (@mcm1957) Shelly pro 3em400 has been added as dedicated device to improve detectio (shellypro3em400) [#1269].
* (@mcm1957) Missing energy states have been added to Shelly Dimmer Gen 3 (shellydimmerg3) [#1274].
* (@klein0r) Added distance support to ble sensors
* (@mcm1957) Dependencies have been updated

### 10.4.0 (2025-10-13)

* (@mcm1957) Slat control added to Shelly ProDualCoverPM, Shelly Pro2PM, Shelly Shutter, Shelly Plus 2PM, Shelly 2PM Gen 3 and Shelly 2PM Gen 4.
* (@mcm1957) Log adapter version if unknown device is detected.
* (@mcm1957) posControl indicator has been added to devices supporting cover operation.
* (@mcm1957) Shelly Frankever Smart Sprinkler Controller (irrigation) has been added as prototype for diagnostic purposes only.
* (@mcm1957) Shelly LinkedGo Smart Thermost (st1820) has been added as prototype for diagnostic purposes only.
* (@mcm1957) Dependencies have been updated

## License

The MIT License (MIT)

Copyright (c) 2018-2025 Thorsten Stueben <thorsten@stueben.de>,
                        Apollon77 <iobroker@fischer-ka.de> and
                        Matthias Kleine <info@haus-automatisierung.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
