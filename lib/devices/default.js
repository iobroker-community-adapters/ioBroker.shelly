/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

/**
 * returns seconds in format TT:MM:SS
 * @param {number} uptime - seconds
 */
function uptimeString(uptime) {
  if (uptime) {
    let timeDifference = new Date(uptime * 1000);
    let secondsInADay = 60 * 60 * 1000 * 24;
    let secondsInAHour = 60 * 60 * 1000;
    let days = Math.floor(timeDifference / (secondsInADay) * 1);
    let hours = Math.floor((timeDifference % (secondsInADay)) / (secondsInAHour) * 1);
    let mins = Math.floor(((timeDifference % (secondsInADay)) % (secondsInAHour)) / (60 * 1000) * 1);
    let secs = Math.floor((((timeDifference % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000 * 1);
    if (hours < 10) { hours = '0' + hours; }
    if (mins < 10) { mins = '0' + mins; }
    if (secs < 10) { secs = '0' + secs; }
    if (days > 0) {
      uptime = days + 'D' + hours + ':' + mins + ':' + secs;
    } else {
      uptime = hours + ':' + mins + ':' + secs;
    }
  }
  return uptime;
}

let defaults = {
  'online': {
    coap: {
    },
    mqtt: {
      // mqtt_publish: 'shellies/<devicetype>-<deviceid>/online'
    },
    common: {
      'name': 'Online',
      'type': 'boolean',
      'role': 'indicator.reachable',
      'read': true,
      'write': false
    }
  },
  'firmware': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => {
        if (self.adapter.config.autoupdate) await self.firmwareUpdate(value && JSON.parse(value).update.has_update);
        return value ? JSON.parse(value).update.has_update : undefined;
      }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: async (value, self) => {
        if (self.adapter.config.autoupdate) await self.firmwareUpdate(value && JSON.parse(value).new_fw);
        return value ? JSON.parse(value).new_fw : false;
      }
    },
    common: {
      'name': 'New firmware available',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'uptime': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value) => { return value ? uptimeString(JSON.parse(value).uptime) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value) => { return value ? uptimeString(JSON.parse(value).uptime) : undefined; }
    },
    common: {
      'name': 'Uptime',
      'type': 'string',
      'role': 'info',
      'read': true,
      'write': false
    }
  },
  'version': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).fw : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: async (value) => { return value ? JSON.parse(value).fw_ver : undefined; }
    },
    common: {
      'name': 'Firmware version',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'hostname': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? JSON.parse(value).wifi_sta.ip : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/announce',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).ip : false; }
    },
    common: {
      'name': 'Device Hostname',
      'type': 'string',
      'role': 'info.ip',
      'read': true,
      'write': false
    }
  },
  'rssi': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value && JSON.parse(value) && JSON.parse(value).wifi_sta ? JSON.parse(value).wifi_sta.rssi : 0; }
    },
    common: {
      'name': 'Device RSSI status',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false
    }
  },
  'reboot': {
    coap: {
      http_cmd: '/reboot',
    },
    mqtt: {
      http_cmd: '/reboot',
    },
    common: {
      'name': 'Reboot',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'protocol': {
    coap: {
      coap_init_value: 'coap'
    },
    mqtt: {
      mqtt_init_value: 'mqtt'
    },
    common: {
      'name': 'Protocol',
      'type': 'string',
      'role': 'info',
      'read': true,
      'write': false
    }
  }
};

module.exports = {
  defaults: defaults
};
