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

## Supported devices (Gen 1)

| Shelly Device                        | CoAP      | MQTT      | Tested firmware version                  |
| ------------------------------------ | --------- | --------- | ---------------------------------------- |
| Shelly 1 (SHSW-1)                    | >= v3.3.0 | >= v3.3.0 | 20230503-095514/v1.13.0-g9aed950         |
| Shelly 1 PM (SHSW-PM)                | >= v3.3.0 | >= v3.3.0 | 20230503-101420/v1.13.0-g9aed950         |
| Shelly 1L (SHSW-L)                   | >= v4.0.5 | >= v4.0.5 | n/a                                      |
| Shelly 2 (SHSW-21/SHSW-22)           | >= v3.3.0 | >= v3.3.0 | 20230503-095658/v1.13.0-g9aed950         |
| Shelly 2.5 (SHSW-25)                 | >= v3.3.0 | >= v3.3.0 | 20230503-095750/v1.13.0-g9aed950         |
| Shelly 4 Pro (SHSW-44)               | >= v3.3.5 | >= v3.3.5 | n/a                                      |
| Shelly Dimmer (SHDM-1)               | >= v3.3.0 | >= v3.3.0 | 20230503-101627/v1.13.0-g9aed950         |
| Shelly Dimmer 2 (SHDM-2)             | >= v3.3.4 | >= v3.3.4 | n/a                                      |
| Shelly RGBW (SHRGBWW-01)             | < v3.4.0  | < v3.4.0  | n/a                                      |
| Shelly RGBW 2 (SHRGBW2)              | >= v3.3.0 | >= v3.3.0 | 20230503-101036/v1.13.0-g9aed950         |
| Shelly i3 (SHIX3-1)                  | >= v3.3.0 | >= v3.3.0 | 20230503-102158/v1.13.0-g9aed950         |
| Shelly EM (SHEM)                     | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly 3EM (SHEM-3)                  | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly H&T (SHHT-1)                  | >= v3.3.0 | >= v3.3.0 | 20230503-100134/v1.13.0-g9aed950         |
| Shelly Smoke (SHSM-01)               | >= v3.3.0 | >= v3.3.0 | 20230503-095905/v1.13.0-g9aed950         |
| Shelly Flood (SHWT-1)                | >= v3.3.0 | >= v3.3.0 | 20230503-100249/v1.13.0-g9aed950         |
| Shelly Gas (SHGS-1)                  | >= v3.3.3 | >= v3.3.3 | 20230503-102300/v1.13.0-g9aed950         |
| Shelly Door/Window Sensor (SHDW-1)   | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Door/Window Sensor 2 (SHDW-2) | >= v3.3.5 | >= v3.3.5 | 20230503-100505/v1.13.0-g9aed950         |
| Shelly2LED (SH2LED)                  | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Plug (SHPLG-1)                | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Plug S (SHPLG-S)              | >= v3.3.0 | >= v3.3.0 | 20230503-101129/v1.13.0-g9aed950         |
| Shelly Plug 2 (SHPLG-2)              | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Sense (SHSEN-1)               | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Bulb (SHBLB)                  | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Bulb Duo (SHBDUO-1)           | >= v3.3.0 | >= v3.3.0 | 20221027-090712/v1.12.1-ga9117d3         |
| Shelly Color Bulb (SHCB-1)           | >= v4.0.5 | >= v4.0.5 | 20230503-095009/v1.13.0-g9aed950         |
| Shelly Vintage (SHVIN-1)             | >= v3.3.0 | >= v3.3.0 | n/a                                      |
| Shelly Uni (SHUNI-1)                 | >= v4.0.4 | >= v4.0.4 | 20230503-102354/v1.13.0-g9aed950         |
| Shelly Button (SHBTN-1)              | >= v3.3.3 | >= v3.3.3 | 20220809-124206/v1.12-g99f7e0b           |
| Shelly Button (SHBTN-2)              | >= v4.0.5 | >= v4.0.5 | n/a                                      |
| Shelly Motion (SHMOS-01)             | >= v4.0.6 | >= v4.0.6 | 20220811-152232/v2.1.8@5afc928c          |
| Shelly TRV (SHTRV-01)                | >= v6.0.0 | >= v6.0.0 | 20220811-152343/v2.1.8@5afc928c          |
| Shelly Motion 2 (SHMOS-02)           | => v6.2.0 | >= v6.2.0 | 20220811-152232/v2.1.8@5afc928c          |

## Supported devices (Gen 2)

| Shelly Device                             | CoAP | MQTT      | Tested firmware version         |
|-------------------------------------------| ---- | --------- | ------------------------------- |
| Shelly Plus 1 (shellyplus1)               | ❌   | >= v5.0.0 | 20230308-091529/0.14.1-g22a4cb7 |
| Shelly Plus 1 PM (shellyplus1pm)          | ❌   | >= v5.0.0 | 20230308-091612/0.14.1-g22a4cb7 |
| Shelly Plus 2 PM (shellyplus2pm)          | ❌   | >= v5.2.0 | 20230308-091102/0.14.1-g22a4cb7 |
| Shelly Plus i4 (shellyplusi4)             | ❌   | >= v5.3.0 | 20230308-091236/0.14.1-g22a4cb7 |
| Shelly Plus i4 DC (shellyplusi4)          | ❌   | >= v5.3.0 | 20221206-142532/0.12.0-gafc2404 |
| Shelly Pro 1 (shellypro1)                 | ❌   | >= v5.2.0 | 20230308-091929/0.14.1-g22a4cb7 |
| Shelly Pro 1 PM (shellypro1pm)            | ❌   | >= v5.2.0 | 20230308-091936/0.14.1-g22a4cb7 |
| Shelly Pro 2 (shellypro2)                 | ❌   | >= v5.2.0 | 20230308-092019/0.14.1-g22a4cb7 |
| Shelly Pro 2 PM (shellypro2pm)            | ❌   | >= v5.2.0 | 20230308-091222/0.14.1-g22a4cb7 |
| Shelly Pro 3 (shellypro3)                 | ❌   | >= v6.2.0 | 20230308-092019/0.14.1-g22a4cb7 |
| Shelly Pro 4 PM (shellypro4pm)            | ❌   | >= v5.0.0 | 20230308-091950/0.14.1-g22a4cb7 |
| Shelly Pro 3 EM (shellypro3em)            | ❌   | >= v6.4.0 | n/a                             |
| Shelly Plus H&T (shellyplusht)            | ❌   | >= v6.2.0 | 20230308-091102/0.14.1-g22a4cb7 |
| Shelly Plus Smoke (shellyplussmoke)       | ❌   | >= v6.5.0 | 20230912-082250/1.0.3-g6176478  |
| Shelly Bluetooth Gateway (shellyblugw)    | ❌   | >= v6.5.0 | 20230912-081940/1.0.3-g6176478  |
| Shelly Plus Plug S (shellyplusplugs)      | ❌   | >= v6.4.0 | n/a                             |
| Shelly Plus PM Mini (shellypmmini)        | ❌   | >= v6.4.2 | n/a                             |
| Shelly Plus 1 Mini (shellyplus1mini)      | ❌   | >= v6.4.2 | n/a                             |
| Shelly Plus 1 PM Mini (shellyplus1pmmini) | ❌   | >= v6.4.2 | n/a                             |

## Supported devices (Bluetooth/BLU)

**Experimental** - see [documentation](https://github.com/iobroker-community-adapters/ioBroker.shelly/blob/master/docs/en/ble-devices.md) for details (Shelly Scripting required)

Adapter version >= v6.6.0 required!

- BLU Button 1,
- BLU Door/Window
- BLU Motion

## NOT Supported devices

- Shelly Wall Display
- Shelly Plus Wall Dimmer US
- Shelly Plus Plug US
- Shelly Pro EM 2x50A
- USB powered UVC LED strip

## Sentry

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

## Troubleshooting after installation

### TypeError: xmlserializer.Builder is not a constructor

execute

`cd /opt/iobroker/node_modules/iobroker.shelly npm install xml2js@0.4.23`

## Changelog

<!--
  Placeholder for the next version (at the beginning of the line):
  ### **WORK IN PROGRESS**
-->
### 6.6.0 (2023-10-17)

* (klein0r) Added BLE devices as states to `shelly.0.ble.*` (Shelly Scripting required)

### 6.5.0 (2023-10-17)

* (klein0r) Added Shelly Plus Smoke
* (klein0r) Added Shelly Bluetooth Low Energy Gateway
* (theimo1221) More Shelly TRV Datapoints

### 6.4.5 (2023-09-26)

* (klein0r) Added Shelly Pro Dual Cover/Shutter PM
* (klein0r) Added Shelly Pro 3 EM 400A
* (JuniperChris929) Added support of Shelly Plus 1 Mini + Shelly Plus 1 PM Mini
* (BooosesThaSnipper) Added support of Shelly Plus AddOn for Gen2 Devices.
* (D1gitaldad) Added support of Plus PM Mini

### 6.4.1 (2023-04-23)

* (viper4gh) Added Shelly Pro 3 EM energy data
* (klein0r) Fixed IP handling in Docker containers

### 6.4.0 (2023-02-09)

* (klein0r) Added Shelly Plus Plug S
* (klein0r) Added Shelly Pro 3 EM
* (klein0r) Reduced checks for firmware updates
* (klein0r) Shelly TV profile is now changeable

## License

The MIT License (MIT)

Copyright (c) 2018-2023 Thorsten Stueben <thorsten@stueben.de>,
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
