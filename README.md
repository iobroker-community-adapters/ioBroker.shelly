![Logo](admin/shelly.png)

# ioBroker.shelly

[![NPM version](https://img.shields.io/npm/v/iobroker.shelly?style=flat-square)](https://www.npmjs.com/package/iobroker.shelly)
[![Downloads](https://img.shields.io/npm/dm/iobroker.shelly?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/iobroker.shelly)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/iobroker.shelly?label=npm%20vulnerabilities&style=flat-square)
![node-lts](https://img.shields.io/node/v-lts/iobroker.shelly?style=flat-square)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/iobroker.shelly?label=npm%20dependencies&style=flat-square)

![GitHub](https://img.shields.io/github/license/iobroker-community-adapters/iobroker.shelly?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/iobroker-community-adapters/iobroker.shelly?logo=github&style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/iobroker-community-adapters/iobroker.shelly/Test%20and%20Release?label=Test%20and%20Release&logo=github&style=flat-square)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/iobroker-community-adapters/iobroker.shelly?label=repo%20vulnerabilities&logo=github&style=flat-square)

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.shelly.svg?color=red&label=beta)
![Stable](http://iobroker.live/badges/shelly-stable.svg)
![Installed](http://iobroker.live/badges/shelly-installed.svg)

The adapter communicates with Shelly devices by REST API and the CoAP or MQTT protocol.

Uses the default Shelly firmware (no flashing of firmware needed!). You will find more and detailed information about the device here : [Shelly](https://shelly.cloud/)

## Documentation

[🇺🇸 Documentation](./docs/en/README.md)

[🇩🇪 Dokumentation](./docs/de/README.md)

## Supported devices (Gen 1)

| Shelly Device                        | CoAP      | MQTT      | Tested firmware version                 |
| ------------------------------------ | --------- | --------- | --------------------------------------- |
| Shelly 1 (SHSW-1)                    | >= v3.3.0 | >= v3.3.0 | 20220809-123240/v1.12-g99f7e0b          |
| Shelly 1 1PM (SHSW-PM)               | >= v3.3.0 | >= v3.3.0 | 20220809-124723/v1.12-g99f7e0b          |
| Shelly 1L (SHSW-L)                   | >= v4.0.5 | >= v4.0.5 | n/a                                     |
| Shelly 2 (SHSW-21/SHSW-22)           | >= v3.3.0 | >= v3.3.0 | 20220809-123410/v1.12-g99f7e0b          |
| Shelly 2.5 (SHSW-25)                 | >= v3.3.0 | >= v3.3.0 | 20220809-123456/v1.12-g99f7e0b          |
| Shelly 4 Pro (SHSW-44)               | >= v3.3.5 | >= v3.3.5 | n/a                                     |
| Shelly Dimmer (SHDM-1)               | >= v3.3.0 | >= v3.3.0 | 20220825-080609/v1.12-Dimmer1-g0ed8d76  |
| Shelly Dimmer 2 (SHDM-2)             | >= v3.3.4 | >= v3.3.4 | n/a                                     |
| Shelly RGBW (SHRGBWW-01)             | < v3.4.0  | < v3.4.0  | n/a                                     |
| Shelly RGBW 2 (SHRGBW2)              | >= v3.3.0 | >= v3.3.0 | 20220809-124336/v1.12-g99f7e0b          |
| Shelly i3 (SHIX3-1)                  | >= v3.3.0 | >= v3.3.0 | 20220809-125301/v1.12-g99f7e0b          |
| Shelly EM (SHEM)                     | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly 3EM (SHEM-3)                  | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly H&T (SHHT-1)                  | >= v3.3.0 | >= v3.3.0 | 20220324-134040/v1.11.8-HT-fix-g60b9bd1 |
| Shelly Smoke (SHSM-01)               | >= v3.3.0 | >= v3.3.0 | 20220809-123549/v1.12-g99f7e0b          |
| Shelly Flood (SHWT-1)                | >= v3.3.0 | >= v3.3.0 | 20220809-123830/v1.12-g99f7e0b          |
| Shelly Gas (SHGS-1)                  | >= v3.3.3 | >= v3.3.3 | n/a                                     |
| Shelly Door/Window Sensor (SHDW-1)   | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Door/Window Sensor 2 (SHDW-2) | >= v3.3.5 | >= v3.3.5 | 20211109-125737/v1.11.7-g682a0db        |
| Shelly2LED (SH2LED)                  | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Plug (SHPLG-1)                | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Plug S (SHPLG-S)              | >= v3.3.0 | >= v3.3.0 | 20220809-124506/v1.12-g99f7e0b          |
| Shelly Plug 2 (SHPLG-2)              | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Sense (SHSEN-1)               | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Bulb (SHBLB)                  | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Bulb Duo (SHBDUO-1)           | >= v3.3.0 | >= v3.3.0 | 20220809-123026/v1.12-g99f7e0b          |
| Shelly Color Bulb (SHCB-1)           | >= v4.0.5 | >= v4.0.5 | 20220809-122808/v1.12-g99f7e0b          |
| Shelly Vintage (SHVIN-1)             | >= v3.3.0 | >= v3.3.0 | n/a                                     |
| Shelly Uni (SHUNI-1)                 | >= v4.0.4 | >= v4.0.4 | n/a                                     |
| Shelly Button (SHBTN-1)              | >= v3.3.3 | >= v3.3.3 | n/a                                     |
| Shelly Button (SHBTN-2)              | >= v4.0.5 | >= v4.0.5 | n/a                                     |
| Shelly Motion (SHMOS-01)             | >= v4.0.6 | >= v4.0.6 | 20220811-152232/v2.1.8@5afc928c         |
| Shelly TRV (SHTRV-01)                | >= v6.0.0 | >= v6.0.0 | n/a                                     |

NOT Supported:

- Shelly Motion 2
- USB powered UVC LED strip

## Supported devices (Gen 2)

| Shelly Device                    | CoAP | MQTT      | Tested firmware version         |
| -------------------------------- | ---- | --------- | ------------------------------- |
| Shelly Plus 1 (shellyplus1)      | ❌   | >= v5.0.0 | 20220830-130249/0.11.0-gfa1bc37 |
| Shelly Plus 1 PM (shellyplus1pm) | ❌   | >= v5.0.0 | 20220830-130414/0.11.0-gfa1bc37 |
| Shelly Plus 2 PM (shellyplus2pm) | ❌   | >= v5.2.0 | 20220830-130540/0.11.0-gfa1bc37 |
| Shelly Plus i4 (shellyplusi4)    | ❌   | >= v5.3.0 | n/a                             |
| Shelly Pro 1 (shellypro1)        | ❌   | >= v5.2.0 | 20220830-131408/0.11.0-gfa1bc37 |
| Shelly Pro 1 PM (shellypro1pm)   | ❌   | >= v5.2.0 | 20220830-131534/0.11.0-gfa1bc37 |
| Shelly Pro 2 (shellypro2)        | ❌   | >= v5.2.0 | 20220830-131701/0.11.0-gfa1bc37 |
| Shelly Pro 2 PM (shellypro2pm)   | ❌   | >= v5.2.0 | 20220830-131827/0.11.0-gfa1bc37 |
| Shelly Pro 4 PM (shellypro4pm)   | ❌   | >= v5.0.0 | 20220830-132254/0.11.0-gfa1bc37 |

NOT Supported:

- Shelly Plus H&T
- Shelly Plus Wall Dimmer US
- Shelly Plus Plug US

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
### **WORK IN PROGRESS**
* (klein0r) Fixed channel name and long push duration handling for Shelly i3

### 6.1.0 (2022-09-02)
* (klein0r) **Breaking:** Added device modes (just display relevant states for current mode)
* (klein0r) **Breaking:** Moved "mode" setting of some devices to "Sys.deviceMode"
* (klein0r) Added ext temperature offset configuration
* (klein0r) Added mqtt status states and checks for generation 2 devices
* (klein0r) Send unchanged state to device, ack state if value is unchanged
* (klein0r) Fixed total power of RGBW2 when in color mode

### 6.0.0 (2022-07-07)
Important: The adapter now requires at least Node.js 14.5
* (klein0r) Added Shelly TRV (beta)
* (klein0r) Just publish data to Shelly device, if value changed
* (klein0r) **Breaking**: Configuration is only working in the new Admin 5 UI
* (klein0r) **Breaking**: Uptime is now a number (seconds since boot)
* (klein0r) Added channel names for Shelly 3EM
* (klein0r) Debug mode (MQTT) for Gen 2 devices
* (klein0r) Display total power for Shelly RGBW 2
* (klein0r) Save HTTP responses to file system for debugging (if enabled)
* (klein0r) Download scripts from generation 2 devices to files
* (klein0r) Optimized unload process to avoid errors
* (klein0r) Added device status states

### 5.3.2 (2022-03-06)
* (klein0r) Added cover position status for generation 2 devices
* (klein0r) Added cover power, voltage, current and energy for generation 2 devices
* (klein0r) Updated switch roles for material ui (switch.power to switch)

### 5.3.1 (2022-03-02)
* (klein0r) Don't ack new values directly after change

### 5.3.0 (2022-02-27)
* (klein0r) Added Shelly Plus I4
* (klein0r) Added more objects for power metering channels (current, voltage, limits, ...)
* (klein0r) Moved device temperature of generation 2 devices to relays (this is the official way)
* (klein0r) Added Sys channel (eco mode, timezone, ...) for generation 1 devices
* (klein0r) Fixed datatype error of Shelly 1/PM ext switch
* (klein0r) Added option to enable/disable WiFi access point (generation 2 devices)
* (klein0r) Added power limits and position control for covers (generation 2 devices)
* (klein0r) Removed colors for online state indication on device objects

## License

The MIT License (MIT)

Copyright (c) 2018-2022 Thorsten Stueben <thorsten@stueben.de>,
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
