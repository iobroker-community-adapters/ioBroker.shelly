![Logo](admin/shelly.png)
# ioBroker.shelly

[![Build Status](https://travis-ci.org/schmupu/ioBroker.shelly.svg?branch=master)](https://travis-ci.org/schmupu/ioBroker.shelly)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/schmupu/ioBroker.shelly?branch=master&svg=true)](https://ci.appveyor.com/project/schmupu/ioBroker-shelly/)

![Number of Installations](http://iobroker.live/badges/shelly-installed.svg) ![Number of Installations](http://iobroker.live/badges/shelly-stable.svg) [![NPM version](http://img.shields.io/npm/v/iobroker.shelly.svg)](https://www.npmjs.com/package/iobroker.shelly)
[![Downloads](https://img.shields.io/npm/dm/iobroker.shelly.svg)](https://www.npmjs.com/package/iobroker.shelly)

[![NPM](https://nodei.co/npm/iobroker.shelly.png?downloads=true)](https://nodei.co/npm/iobroker.shelly/)

Requires node.js 8.0 or higher and Admin v3!

The adapter communicates with Shelly devices by REST api and the CoAP or MQTT protocol.    
By the default Shelly firmware (no flashing of firmware needed!). You will find more and detailed information about the device here : [Shelly](https://shelly.cloud/)

## Installation
You find a detailed installation documentation here:
[Instalation Documentation](./docs/EN/INSTALL.md)

## Supported devices
* Shelly1 (SHSW-1, verified)
* Shelly2 (SHSW-21/SHSW-22, verified)
* ShellyBulb (SHBLB, verified)
* Shelly H&T (SHHT-1, verified)
* Shelly Smoke (SHSM-01, verified)
* Shelly 1 1PM (SHSW-PM, verified)  
* Shelly 2.5 (SHSW-25, verified)  
* ShellyRGBW (SHRGBWW-01, verified)
* ShellyRGBW2 (SHRGBW2, verified)
* Shelly2LED (SH2LED, verified)
* ShellyPlug (SHPLG-1, verified) 
* ShellyPlug S (SHPLG-1, verified) 
* ShellySense (SHSEN-1, not verified)
* Shelly4Pro (SHSW-44, not verified)


## More details needed to implement (Debug log

## Changelog

### 3.0.0 (12.05.2019)
* (Stübi) Redesign of the adapter. You can choose now between CoAP and MQTT protocol  
* (Stübi) MQTT and CoAP suport for Shelly1 (SHSW-1, verified)
* (Stübi) MQTT and CoAP suport for Shelly2 (SHSW-21/SHSW-22, verified)
* (Stübi) MQTT and CoAP suport for Shelly 1 1PM (SHSW-PM, verified)  
* (Stübi) MQTT and CoAP suport for Shelly 2.5 (SHSW-25, verified)  
* (Stübi) MQTT and CoAP suport for Shelly H&T (SHHT-1, verified)
* (Stübi) MQTT and CoAP suport for Shelly Smoke (SHSM-01, verified)
* (Stübi) MQTT and CoAP suport for Shelly Bulb (SHBLB, verified)
* (Stübi) MQTT and CoAP suport for Shelly RGBW (SHRGBWW-01, verified)
* (Stübi) MQTT and CoAP suport for Shelly RGBW2 (SHRGBW2, verified)
* (Stübi) MQTT and CoAP suport for Shelly 2 LED (SH2LED, verified)
* (Stübi) MQTT and CoAP suport for Shelly Plug (SHPLG-1, verified)
* (Stübi) MQTT and CoAP suport for Shelly Plug S (SHPLG-S, verified)
* (Stübi) MQTT and CoAP suport for Shelly 4 Pro (SHSW-44, not verified)
* (Stübi) MQTT and CoAP suport for Shelly Sense (SHSEN-1, not verified)

### 2.2.0 (13.04.2019)
* Add devices Shelly 2.5 and Shelly 1 PM 

### 2.1.9 (31.03.2019)
* Add status 'firmware update' for Shelly RGBW, RGBW2 and Bulb

### 2.1.8 (19.03.2019)
* Consider roller (shutter) position in CoAP message 
* Support of Shelly Sensor

### 2.1.7 (15.03.2019)
* Changing all RGBWW2 colors at the same time
* new RGBWW2 State color.rgbw with the format #RRGGBBWW

### 2.1.6 (08.03.2019)
* Shelly RGBWW2 bug fixing (whit did not work in color mode)

### 2.1.5 (05.03.2019)
* Shelly Smoke Support

### 2.1.4 (20.02.2019)
* Bugfixing of Shelly RGBW2 Support. If you have installed version 2.1.3, please delete all RGBW2 objects first, because the objects will be renamed from lights to color and white in version 2.1.4.   

### 2.1.3 (16.02.2019)
* Support of Shelly RGBW2

### 2.1.0 (09.02.2019)
* New Status 'new firmware available' for Shely1, Shelly2, Shelly4Pro and ShellyPlug 

### 2.0.8 (31.01.2019)
* Bugfixing, polling new Shelly status must be at least 1 sec ago 

### 2.0.7 (21.01.2019)
* Bugfixing for objects AutoTimerOn and AutoTimeroff

### 2.0.6 (12.01.2019)
* Getting faster online status for Shelly devices, excluded H&T. Fix of power status for Shelly Plug.

### 2.0.5 (07.01.2019)
* Fixing an error if Shelly device is not reachable (offline)

### 2.0.4 (04.01.2018)
* Support of js-controller compact mode and performance optimizing. Relay status changes will be shown much faster in ioBroker for Shelly 1, 2 and 4Pro

### 2.0.3 (02.01.2018)
* Shows RSSI Status for Shelly 1 & 2. You need Firmware 1.4.4 


## License
The MIT License (MIT)

Copyright (c) 2018-2019 Thorsten Stueben <thorsten@stueben.de>, Apollon77 <iobroker@fischer-ka.de>

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
