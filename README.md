![Logo](admin/shelly.png)
# ioBroker.shelly
=================

[![Build Status](https://travis-ci.org/schmupu/ioBroker.shelly.svg?branch=master)](https://travis-ci.org/schmupu/ioBroker.shelly)
[![NPM version](http://img.shields.io/npm/v/iobroker.shelly.svg)](https://www.npmjs.com/package/iobroker.shelly)
[![Downloads](https://img.shields.io/npm/dm/iobroker.shelly.svg)](https://www.npmjs.com/package/iobroker.shelly)

[![NPM](https://nodei.co/npm/iobroker.shelly.png?downloads=true)](https://nodei.co/npm/iobroker.shelly/)

Requires node.js 6.0 or higher and Admin v3!

The adapter communicates with Shelly devices by REST api and the CoAP protocol with the default Shelly firmware (no flashing of firmware needed!).
Because CoAP use multicast UDP packages, the Shelly devices has to be in the same subnet like ioBroker.
If you use ioBroker in a docker container, the container has to run in host or macvlan modus.  

You will find more and detailed information about the device here : [Shelly](https://shelly.cloud/)

## Installation

1. Install the adapter
2. No configuration needed. Shelly devices will be detected and added automatically. Sometimes you have to restart the shelly device or control it once using the app before it appear initially in ioBroker.

## Supported/Tested devices
* Shelly1 (SHSW-1, Verified)
* Shelly2 (SHSW-21/SHSW-22, Verified)
* ShellyPlug (SHPLG-1, Verified)
* Shelly4Pro (SHSW-44, Reading works, Controlling not verified)
* Shelly Sense (SHSEN-1, Reading not verified)

## More details needed to fully implement (Debug log)
* ShellyBulb (SHBLB-1, reading some data may work, no control)
* Shelly2LED (SH2LED-1, reading some data may work, no control)
* ShellyRGBW (SHRGBWW-01, reading some data may work, no control)

## Changelog

### 0.1.1 (21.09.2018)
* Bugfixing

### 0.1.0 (20.09.2018)
* First Version. Supports all Shelly switches like Shelly 1, Shelly 2, Shelly 4 and the power sockets.


## License
The MIT License (MIT)

Copyright (c) 2018 Thorsten Stueben <thorsten@stueben.de>, Apollon77 <iobroker@fischer-ka.de>

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
