# Older changes
## 6.4.1 (2023-04-23)

* (viper4gh) Added Shelly Pro 3 EM energy data
* (klein0r) Fixed IP handling in Docker containers

## 6.4.0 (2023-02-09)

* (klein0r) Added Shelly Plus Plug S
* (klein0r) Added Shelly Pro 3 EM
* (klein0r) Reduced checks for firmware updates
* (klein0r) Shelly TV profile is now changeable

## 6.3.1 (2023-01-02)

* (klein0r) Updated MQTT topic prefix handling
* (klein0r) Added temperature for generation 2 devices in cover mode
* (klein0r) Added boost start/stop for Shelly TRV
* (klein0r) Added external power for Shelly H&T

## 6.3.0 (2022-12-22)

* (klein0r) Added more TRV features
* (jlegen) Improved Shelly TRV integration
* (klein0r) Updated knowledge base urls
* (klein0r) Added Ukrainian language

## 6.2.4 (2022-10-23)

* (klein0r) IP address of CoAP devices is unknown in some cases
* (klein0r) Optimized destroy process

## 6.2.3 (2022-10-20)

* (klein0r) Use unique ID for each command - generation 2 devices
* (klein0r) Fix: Ack state if value is unchanged

## 6.2.2 (2022-10-13)

* (klein0r) Fixed state updates for CoAP integration

## 6.2.1 (2022-10-11)
* (klein0r) Warn user if a device is not protected via restricted login
* (klein0r) Added duration for generation 2 devices in cover mode
* (klein0r) Added temperature data of Shelly Motion 2
* (klein0r) Added knowledge base urls for all devices

## 6.2.0 (2022-09-15)
* (klein0r) Added Shelly Motion 2
* (klein0r) Added Shelly Plus H&T
* (klein0r) Added Shelly Pro 3
* (klein0r) Fixed channel name and long push duration handling for Shelly i3
* (klein0r) Fixed (automatic) firmware update process for generation 2 devices
* (klein0r) Get correct IP address in Docker environment
* (klein0r) Added temperature offset configuration for Shelly UNI
* (klein0r) Updated online indicator handling
* (klein0r) Fixed temperature of Shelly Door / Window 2
* (klein0r) Added icons for some states
* (klein0r) Translated (some) object names

## 6.1.0 (2022-09-02)
* (klein0r) **Breaking:** Added device modes (just display relevant states for current mode)
* (klein0r) **Breaking:** Moved "mode" setting of some devices to "Sys.deviceMode"
* (klein0r) Added ext temperature offset configuration
* (klein0r) Added mqtt status states and checks for generation 2 devices
* (klein0r) Send unchanged state to device, ack state if value is unchanged
* (klein0r) Fixed total power of RGBW2 when in color mode

## 6.0.0 (2022-07-07)
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

## 5.3.2 (2022-03-06)
* (klein0r) Added cover position status for generation 2 devices
* (klein0r) Added cover power, voltage, current and energy for generation 2 devices
* (klein0r) Updated switch roles for material ui (switch.power to switch)

## 5.3.1 (2022-03-02)
* (klein0r) Don't ack new values directly after change

## 5.3.0 (2022-02-27)
* (klein0r) Added Shelly Plus I4
* (klein0r) Added more objects for power metering channels (current, voltage, limits, ...)
* (klein0r) Moved device temperature of generation 2 devices to relays (this is the official way)
* (klein0r) Added Sys channel (eco mode, timezone, ...) for generation 1 devices
* (klein0r) Fixed datatype error of Shelly 1/PM ext switch
* (klein0r) Added option to enable/disable WiFi access point (generation 2 devices)
* (klein0r) Added power limits and position control for covers (generation 2 devices)
* (klein0r) Removed colors for online state indication on device objects

## 5.2.0 (2022-02-16)
* (klein0r) Added Shelly Pro 1
* (klein0r) Added Shelly Pro 1 PM
* (klein0r) Added Shelly Pro 2
* (klein0r) Added Shelly Pro 2 PM
* (klein0r) Added Shelly Plus 2 PM
* (klein0r) Allow to change device and channel names of generation 2 devices
* (klein0r) Added auto on/off timers for generation 2 devices
* (klein0r) Added input mode, events and initial state for generation 2 devices
* (klein0r) Added support of covers / shutters for generation 2 devices
* (klein0r) Replaced node-fetch with axios (also for digest auth)

## 5.1.3 (2022-02-13)
* (klein0r) Changed common.states strings to objects
* (klein0r) Just perform firmware update if an available update was detected
* (klein0r) Extended logging for CoAP

## 5.1.2 (2022-01-29)
* (klein0r) Fixed Shelly UNI ADC voltage
* (klein0r) Fixed dimmer brightness values handling
* (klein0r) Logging improvements for offline devices

## 5.1.1 (2022-01-26)
* (klein0r) Fixed firmware auto update
* (klein0r) Updated timeouts
* (klein0r) Added command source for shelly 2.5
* (klein0r) Added color for device objects as online indicator

## 5.1.0 (2022-01-25)
* (klein0r) Added input states for generation 2 devices
* (klein0r) Fixed online state management and adapter indicator
* (klein0r) Fixed long push data type for some devices
* (klein0r) Fixed fahrenheit temperature states
* (klein0r) Code refactoring
* (klein0r) Updated documentation

## 5.0.0 (2021-12-08)
Important: The adapter now requires at least Node.js 12.x, js-controller 3.3+ and Admin 5.1.25+
* (klein0r) Shelly Plus Support (1, 1 PM)
* (klein0r) Shelly Pro Support (4 PM)
* (klein0r) Updated logo
* (klein0r) Use class definition instead
* (klein0r) Use internal encryption methods
* (klein0r) Admin 5 config

## 4.1.2 (2021-11-14)
* (sbormann) Fix the online checks to stay online

## 4.1.1 (2021-11-13)
* (Apollon77) Try to prevent State changes after adapter is stopped

## 4.1.0 (2021-11-06)
* (HGlab) several fixes and adjustments
* (turbolift) fix temperature maximum warning
* (Apollon77) Destroy Coap and MQTT server on unload

## 4.0.8 (2021-05-06)
* (Stübi) - Online Status (beta, does not work correct)
* (Stübi) - Temperature greater min/max - Issue #370

## 4.0.7 (2021-02-07)
* (Stübi) - fixing the wrong identifier name from green to blue - Issue #334
* (Stübi) - renamed Shelly Motion MQTT name 
* (Stübi) - Because polling for battery devices is only permieted every 60 sec., the online state will not supported anymore. 
* (Stübi) - Polling for all battery devices changed to 60 sec. This can not be changed to any other value, still if you a power supply.
* (Stübi) - Add state for led light control for Shelly Plug S - Issue #344
* (quedrum) - Shelly1 Garage with ADDon and reed switch - Issue #276

## 4.0.6 (2021-02-02)
* (Stübi) - add min, max to state transiton for Shelly RGBW2 
* (Stübi) - if a property in the returned json for a http request does not exist, it will not shown as an error anymore
* (Stübi) - Bugfixing Shelly 1L
* (klein0r) - Added shelly motion (SHMOS-01)

## 4.0.5 (2021-02-01)
* (Matze2010) - Add Support for Shelly Uni (SHSW-L)
* (Matze2010) - Shelly 2.5 Roller: Support for favorite positions 
* (Stübi) - Bugfixing TypeError in Shelly Plug implementation (Issue #281)
* (Stübi) - Support of Shelly Color Bulb (SHCB-1) - Issue #317
* (Stübi) - Support of Shelly Button 1 (SHBTN-2) - Issue #316, #302, #303
* (Stübi) - add state Total_Returned for Shelly EM3 - Issue #299
* (Stübi) - add state transiton and fade_rate to Shelly Dimmer - Issue #260
* (Stübi) - add state transiton for Shelly RGBW2 - Issue #289

## 4.0.4 (2020-11-15)
* (Apollon77) update dependencies and shelly-iot lib
* (Stübi) - Bugfix EM3, unit of comsumed power Wh instead of kWH
* (Stübi) - optimize the destroy function (Bugfixing)
* (Stübi) - Bugfixing Relay0.Event error for Shelly I3 in MQTT mode (Issue #241)
* (harrym67) - Shelly 2.5 Roller mode. According to Shelly API: changed existing state swap to swap_input and add state swap.(Issue #240)
* (Stübi) - Allow setting of customer MQTT prefix (Issue #244)
* (harrym67) - Add Support for Shelly Uni (SHUNI-1)
* (harrym67) - Bugfix EM3 (Issue #256)
* (foxriver76) - Bugfix MQTT password check (Issue #264)

## 4.0.3 (2020-08-19)
* (Stübi) - Add a checkbox, to optionally enable updates of objects even if they have not changed (Issue #209)
* (Stübi) - Calculate temperature fahrenheit for Shelly 1PM and Plug S in MQTT mode
* (Stübi) - Fixed longpush time for MQTT (Shelly 1, 1PM, 2 and 2.5) 
* (Stübi) - Add State for changing temperature unit for Shelly HT and DW2
* (Stübi) - Delete external temperature 4 and external humidity 4 states for Shelly 1 and 1PM because they do not exist
* (Stübi) - Renamed state temperature to temperatureC for Shelly 1, 1PM, 2, 2.5, Plug S
* (Stübi) - Add tmperature in Celsius and Fahrenheit for Shelly HT and DW2
* (Stübi) - Bugfixing. Add missing states to MQTT, which exist for CoAP (Shelly 2, 2.5) 
* (Stübi) - Polltime for http optimized. 
* (Stübi) - removed min and max values for temperature states (Issue #236)
* (Stübi) - Bugfixing. Add timer to Shelly 1, 1PM for CoAP and removed it for MQTT (Shelly 1, 1PM, 2, 2.5) because it is not supported by MQTT
* (Stübi) - Add overpower value to Shelly 1, 1PM, 2, 2.5 and Plug, Plug S
* (Stübi) - Removed channel name from Shelly 4 Pro (Issue #238)

## 4.0.2 (2020-08-16)
* (Stübi) - Bugfixing Shelly DW2 (Issue #220)
* (Stübi) - Bugfixing manually set object name is overwritten (Issue #224)

## 4.0.1 (2020-08-15)
* (Stübi) Major Change!! If you use the CoAP protocol only Shelly devices with Firmware 1.8.x or above supported! All devices with Firmware below 1.8.x except Shelly 4Pro will not working with this release!
* Official release to npm/latest

## 4.0.0 (05.08.2020)
* (Stübi)     - Major Change!! If you use the CoAP protocol only Shelly devices with Firmware 1.8.x or above supported! All devices with Firmware below 1.8.x except Shelly 4Pro will not working with this release!
* (@harrym67) - Changing device files 
* (Stübi)     - Since Firmware 1.8. the Shelly device names like shelly.0.SHBTN-1#A4CF12F454A3#2 ends with #2. It will be changed back to #1 like shelly.0.SHBTN-1#A4CF12F454A3#1. 
* (@harrym67) - Add state factoryResetFromSwitch for Shelly 1, 1pm, 2, 2.5, Dimmer, Dimmer 2 and RGBW2
* (@harrym67) - Add states longpushDurationMsMin, longpushDurationMsMax and multipushTimeBetweenPushesMsMax for Shelly IX3
* (@harrym67) - Add state ChannelName for Shelly 1, 1pm, 2, 2.5, Dimmer, Dimmer 2, 4Pro, EM and 3EM
* (@harrym67) - Add state StopReason for Shelly 2 and 2.5 in Shuttermode
* (@harrym67) - Add state name to all Devices (Device Name)

## 3.3.6 (26.07.2020)
* (Stübi) - Bugfixing temperature for Shelly Dimmer (Issue #201)
* (Stübi) - Tried to fix high CPU load by replacing ping with tpcping (Issue #196, #202)
* (Stübi) - correct spelling mistake for Shelly DW2 (Issue #205)

## 3.3.5 (04.07.2020)
* (Stübi) - Add Shelly 4 Pro
* (Stübi) - Bugfixing Shelly RGBW2, sate lights.switch color mode
* (Stübi) - Add Shelly DW2
* (Stübi) - Add states longpush and input to Shelly Dimmer 1 (CoAP and MQTT)
* (Stübi) - Add states longpush and input to Shelly Dimmer 2 (CoAP and MQTT)
* (Stübi) - Add states longpush and input to Shelly 1, 1 PM, 2, 2.5 (CoAP)
* (Stübi) - Add state input to Shelly RGBW2 (CoAP)
* (Stübi) - Add state deviceid (Issue #193)

## 3.3.4 (23.06.2020)
* (Stübi) - Add Shelly Dimmer 2
* (Stübi) - Add states longpush and input to Shelly Dimmer 1 (MQTT)
* (Stübi) - Add states power and energy to Shelly Duo
* (Stübi) - Get power and energy by CoAP instead of http for Shelly 1 PM
* (Stübi) - Bugfixing Shelly Button 
* (Stübi) - Bugfixing Shelly 1 humidity MQTT
* (Stübi) - Fixed typo error (external temperature) / Shelly 1, 1 PM 
* (Stübi) - Fixed role for external temperature / Shelly 1, 1 PM 
* (Stübi) - Changed CoAP concept, because Shelly will change the CoAP payload in one of the future firmware versions. This makes the adjustments later easier. 
* (Stübi) - Shelly 4 Pro not supported anymore. If you need it please create an GitHub issue.
* (Stübi) - Shelly RGBW not supported anymore. If you need it please create an GitHub issue .

## 3.3.3 (18.06.2020)
* (Stübi) - Add Shelly Button
* (Stübi) - Add Shelly Gas

## 3.3.2 (13.06.2020)
* (Stübi) - Bugfixing Shelly RGBW2

## 3.3.1 (13.06.2020)
* (Stübi) - Change readme
* (Stübi) - Add state external humidity to Shelly 1 (Bug in  3.3.0)
* (Stübi) - Renamed state color to lights for Shelly RGBW2 - Issue #169
* (Stübi) - Renamed state light to lights for Shelly Dimmer
* (Stübi) - Bugfixng Shelly RGBW, RGBW and Bulb. State ligths.rgbw did not work - Issue #169

## 3.3.0 (04.06.2020)
* (Stübi) - Use only version with Shelly firmware greater equal v1.7.0 . Shelly firmware less v1.7.0 will not be supported by this Shelly adapter version anymore
* (Stübi) - Add state vibration and tilt to Shelly DW
* (Stübi) - Add polltime to index_m.html  
* (Stübi) - Fix RGBW2 with FW 1.7 - Issue #161
* (Stübi) - Add state Button Type for Shelly  1, 1PM, 2, 2.5 - Issue #157
* (Stübi) - Add state Button Reverse for Shelly 1, 1PM, 2, 2.5
* (Stübi) - Add firmware update button
* (Stübi) - Fix auto firmware update
* (Stübi) - Add state external humidity to Shelly 1 / 1PM - Issue #160
* (Stübi) - Add helper library and cleanup source code
* (Stübi) - Add Shelly I3

## 3.2.8 (09.05.2020)
* (c7j3X) - Add device Shelly Vintage
* (Stübi) - Add state vibration and tilt to Shelly DW

## 3.2.7 (28.04.2020)
* (Stübi) - User can enable/disable sentry logging

## 3.2.6 (27.04.2020)
* (Apollon77)  - Update Dependencies incl shelly-lib to prevent exceptions
* (Apollon77)  - Add Sentry for error/crash reporting (active with js-controller 3.0)
* (Stübi       - Add for hue two new datapoints for Shelly Bulb and RGBW2
* (@SamLowrie) - Add option to set a specific multicast interface for CoAP server

## 3.2.4 (11.04.2020)
* (Stübi) - Bugfixing MQTT ext_temperature for Shelly 1

## 3.2.3 (03.03.2020)
* (Stübi) - Bugfixing Shelly 3EMfor MQTT support (fixed datapoints for total and total_returned)
* (Stübi) - Bugfixing MQTT support for door and windows sensor (issue #135)

## 3.2.2 (03.03.2020)
* (Stübi) - Bugfixing, if Shelly sends a string instead of number and boolean (issue #131)

## 3.2.1 (02.03.2020)
* (Stübi) - Bugfixing Shelly 3EMfor MQTT support

## 3.2.0 (13.02.2020)
* (Simon W.) - Add device Shelly 3EM
* (Stübi)    - Add device Shelly Door/Windows sensor 
* (Stübi)    - Add external temperature sensor for Shelly 1, 1PM and 2.5 (only CoAP)

## 3.1.9 (25.01.2020)
* (Stübi) - Bugfixing, auto update new firmware

## 3.1.7 (08.01.2020)
* (Stübi) - Add state energy to Shelly dimmer

## 3.1.6 (30.12.2019)
* (Stübi) - Add device Shelly Door/Windows sensor 
* (Stübi) - Bugfixing, auto update new firmware

## 3.1.5 (23.12.2019)
* (Stübi) - Add device Shelly Plug S2. It will be shown as Shelly Plug S (SHPLG-1) in MQTT

## 3.1.4 (11.12.2019)
* (Stübi) - Bugfixing, auto update new firmware

## 3.1.3 (07.12.2019)
* (Stübi) - Bugfixing. Add power state to Shelly dimmer in MQTT mode

## 3.1.2 (11.10.2019)
* (Stübi) - Bugfixing. Error message will not only be shown in debug modus

## 3.1.1 (14.09.2019)
* (Stübi) - Add device Shelly Dimmer

## 3.1.0 (03.09.2019)
* (Stübi) - Add device Shelly flood

## 3.0.9 (06.08.2019)
* (Stübi) - Bugfixing, with the new firmware, Shelly HT sends the humidity by CoAP as it should. Division by 2 removed!
* (Stübi) - Add status Duration in roller (shutter) mode for CoAP (not working with MQTT) 
* (Stübi) - Changed role from level to level.brightness for state Gain

## 3.0.8 (27.07.2019)
* (Stübi) - Add device Shelly EM 
* (Stübi) - Add state energy for Shelly Plug S, Shelly PM and Shelly 2.5 in CoAP mode 
* (Stübi) - Add state temperature for Shelly Plug S, Shelly PM and Shelly 2.5 in CoAP mode
* (Stübi) - Add state overtemperature for Shelly Plug S, Shelly PM and Shelly 2.5 in CoAP and MQTT mode
* (Stübi) - Bugfixing, the Shelly HT sends by CoAP the humidity multiply with 2. The fix divides the value by 2.

## 3.0.7 (03.07.2019)
* (Stübi) - correct spelling error 
* (Stübi) - Adjust IP address after IP change in CoAP Modus (Issue 70)
* (Stübi) - Bugfixing for datapoint power (rounding method was wrong)
* (Stübi) - Fixed Buffer() is deprecated due to security and usability issues for Node >= 10

## 3.0.6 (29.06.2019)
* (Stübi) - State reboot and uptime added

## 3.0.5 (16.06.2019)
* (Stübi) - Bugfixing 
* (Stübi) - Add Blacklist

## 3.0.4 (04.06.2019)
* (Stübi) - Bugfixing (Issue #60)

## 3.0.3 (02.06.2019)
* (Stübi) - Support of MQTT QoS 1 and 2. Add auto firmware update to the menu

## 3.0.2 (25.05.2019)
* (Stübi) - Bugfixing and longpush and input states for Shelly 1, 2, 1pm, 2.5 and Shelly RGBWW2 added. Add state temperature to Shelly 1pm, 2.5 and Plug S.

## 3.0.1 (21.05.2019)
* (Stübi) - Redesign of the adapter. You can choose now between CoAP and MQTT protocol. The Shellys use this protocolls to send there state changes to ioBroker in realtime. Out of the Box the Shelly works with the CoAP protocol. You do not have to configure anything. The Shelly will be found by the Shelly Adapter itself. If you want to use MQTT, you have configure all your Shelly devices. You find a detailed installing documentation here: [Installation Documentation](./docs/EN/INSTALL.md). If you have problems with the version 3.0.1 please change back to 2.2.0 and leave an Issue (bug report) here: [GitHub Issues](https://github.com/iobroker-community-adapters/ioBroker.shelly/issues).

## 2.2.0 (13.04.2019)
* Add devices Shelly 2.5 and Shelly 1 PM

## 2.1.9 (31.03.2019)
* Add status 'firmware update' for Shelly RGBW, RGBW2 and Bulb

## 2.1.8 (19.03.2019)
* Consider roller (shutter) position in CoAP message 
* Support of Shelly Sensor

## 2.1.7 (15.03.2019)
* Changing all RGBWW2 colors at the same time
* new RGBWW2 State color.rgbw with the format #RRGGBBWW

## 2.1.6 (08.03.2019)
* Shelly RGBWW2 bug fixing (whit did not work in color mode)

## 2.1.5 (05.03.2019)
* Shelly Smoke Support

## 2.1.4 (20.02.2019)
* Bugfixing of Shelly RGBW2 Support. If you have installed version 2.1.3, please delete all RGBW2 objects first, because the objects will be renamed from lights to color and white in version 2.1.4.

## 2.1.3 (16.02.2019)
* Support of Shelly RGBW2

## 2.1.0 (09.02.2019)
* New Status 'new firmware available' for Shely1, Shelly2, Shelly4Pro and ShellyPlug

## 2.0.8 (31.01.2019)
* Bugfixing, polling new Shelly status must be at least 1 sec ago

## 2.0.7 (21.01.2019)
* Bugfixing for objects AutoTimerOn and AutoTimeroff

## 2.0.6 (12.01.2019)
* Getting faster online status for Shelly devices, excluded H&T. Fix of power status for Shelly Plug.

## 2.0.5 (07.01.2019)
* Fixing an error if Shelly device is not reachable (offline)

## 2.0.4 (04.01.2018)
* Support of js-controller compact mode and performance optimizing. Relay status changes will be shown much faster in ioBroker for Shelly 1, 2 and 4Pro

## 2.0.3 (02.01.2018)
* Shows RSSI Status for Shelly 1 & 2. You need Firmware 1.4.4
