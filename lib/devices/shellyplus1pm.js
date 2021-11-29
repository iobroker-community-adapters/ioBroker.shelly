/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Shelly Plus 1 PM / shellyplus1pm
 * CoAP:
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Sensors"}],"sen":[{"I":111,"T":"P","D":"Power","R":"0/3500","L":0},{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":113,"T":"T","D":"Temperature C","R":"-40/300","L":0},{"I":114,"T":"T","D":"Temperature F","R":"-40/300","L":0},{"I":115,"T":"S","D":"Overtemp","R":"0/1","L":0},{"I":118,"T":"S","D":"Input","R":"0(off)/1(on)/2(longpush)","L":0},{"I":211,"T":"S","D":"Energy counter 0 [W-min]","L":0},{"I":212,"T":"S","D":"Energy counter 1 [W-min]","L":0},{"I":213,"T":"S","D":"Energy counter 2 [W-min]","L":0},{"I":214,"T":"S","D":"Energy counter total [W-min]","L":0}]}
  *
 * CoAP Version >= 1.8
 *  Shelly 1PM SHSW-PM with-dht22:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1PM SHSW-PM no-addon:      {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1PM SHSW-PM with-ds1820:   {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}
 *  Shelly 1PM SHSW-PM with-lp-input: {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"sensor_0"},{"I":3,"D":"sensor_1"},{"I":4,"D":"sensor_2"},{"I":5,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":5},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/3500","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":6109,"T":"P","D":"overpowerValue","U":"W","R":["U32","-1"],"L":1},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":5},{"I":3105,"T":"T","D":"deviceTemp","U":"F","R":["-40/572","999"],"L":5},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":5},{"I":3101,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":2},{"I":3102,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":2},{"I":3201,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":3},{"I":3202,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":3},{"I":3301,"T":"T","D":"extTemp","U":"C","R":["-55/125","999"],"L":4},{"I":3302,"T":"T","D":"extTemp","U":"F","R":["-67/257","999"],"L":4},{"I":3103,"T":"H","D":"humidity","R":["0/100","999"],"L":2},{"I":3117,"T":"S","D":"extInput","R":"0/1","L":2}]}


{"ble":{},"cloud":{"connected":false},"input:0":{"id":0,"state":false},"mqtt":{"connected":false},"switch:0":{"id": 0, "source": "init", "output": false, "apower": 0.000, "voltage": 219.549,"aenergy": {"total":0.000,"by_minute":[0.000,0.000,0.000],"minute_ts":1638189037},"temperature":{"tC":44.5, "tF":112.1}},"sys":{"mac":"44179394D4D4","restart_required":false,"time":"13:30","unixtime":1638189039,"uptime":267,"ram_size":249884,"ram_free":177840,"fs_size":414401,"fs_free":262044,"available_updates":{"beta":{"version":"0.9.0-beta3"}}},"wifi":{"sta_ip":"172.16.0.200","status":"got ip","ssid":"PiperNet","rssi":-45}}


 */
let shellyplus1pm = {
  'Relay0.Switch': {
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

module.exports = {
  shellyplus1pm: shellyplus1pm
};
