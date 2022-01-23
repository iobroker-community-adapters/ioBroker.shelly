/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const shellyHelper = require('../shelly-helper');

/**
 * Default, used from all Shelly devices Gen 1
 * https://shelly-api-docs.shelly.cloud/gen1/
 */
let defaultsgen1 = {
  'gen': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value, self) => { return self.getDeviceGen(); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value, self) => { return self.getDeviceGen(); }
    },
    common: {
      'name': 'Device generation',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'online': {
    coap: {
    },
    mqtt: {
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
  'firmwareupdate': {
    coap: {
      http_cmd: '/ota?update=true',
    },
    mqtt: {
      http_cmd: '/ota?update=true',
    },
    common: {
      'name': 'Update Firmware',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'uptime': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value) => { return value ? shellyHelper.uptimeString(JSON.parse(value).uptime) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value) => { return value ? shellyHelper.uptimeString(JSON.parse(value).uptime) : undefined; }
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
    },
    mqtt: {
    },
    common: {
      'name': 'Device Hostname',
      'type': 'string',
      'role': 'info.ip',
      'read': true,
      'write': false
    }
  },
  'id': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value, self) => { return self.getDeviceId(); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value, self) => { return self.getDeviceId(); }
    },
    common: {
      'name': 'Device Id',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'type': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value, self) => { return self.getDeviceType(); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value, self) => { return self.getDeviceType(); }
    },
    common: {
      'name': 'Device type',
      'type': 'string',
      'role': 'state',
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
      'unit': 'db',
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
  },
  'name': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: async (value, self) => { return value ? await shellyHelper.setDeviceName(self, JSON.parse(value).name) : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { name: value }; }
    },
    common: {
      'name': 'Device Name',
      'type': 'string',
      'role': 'info.name',
      'read': true,
      'write': true
    }
  }
};

/**
 * Default, used from all Shelly devices Gen 2
 * https://shelly-api-docs.shelly.cloud/gen2/
 */
let defaultsgen2 = {
  'gen': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: async (value) => { return value ? JSON.parse(value).gen : undefined; }
    },
    common: {
      'name': 'Device generation',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'online': {
    mqtt: {
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
    mqtt: {
      http_publish: '/rpc/Shelly.GetStatus',
      http_publish_funct: (value) => {
        if (value) {
          const valueObj = JSON.parse(value);
          if (
            Object.prototype.hasOwnProperty.call(valueObj.sys, 'available_updates') &&
            Object.prototype.hasOwnProperty.call(valueObj.sys.available_updates, 'stable') &&
            Object.prototype.hasOwnProperty.call(valueObj.sys.available_updates.stable, 'version')
          ) {
            return true;
          }
        }
        return false;
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
  'firmwareupdate': {
    mqtt: {
      http_cmd: '/rpc/Shelly.Update',
    },
    common: {
      'name': 'Update Firmware',
      'type': 'boolean',
      'role': 'button',
      'read': false,
      'write': true
    }
  },
  'uptime': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetStatus',
      http_publish_funct: async (value) => { return value ? shellyHelper.uptimeString(JSON.parse(value).sys.uptime) : undefined; }
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
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: async (value) => { return value ? JSON.parse(value).ver : undefined; }
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
    mqtt: {
    },
    common: {
      'name': 'Device Hostname',
      'type': 'string',
      'role': 'info.ip',
      'read': true,
      'write': false
    }
  },
  'id': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: (value, self) => { return self.getDeviceId(); }
    },
    common: {
      'name': 'Device Id',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'type': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: (value, self) => { return self.getDeviceType(); }
    },
    common: {
      'name': 'Device type',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'model': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: (value, self) => { return value ? JSON.parse(value).model : undefined; }
    },
    common: {
      'name': 'Authentication enabled',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'authEnabled': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: (value, self) => { return value ? JSON.parse(value).auth_en : undefined; }
    },
    common: {
      'name': 'Authentication enabled',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
  'rssi': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetStatus',
      http_publish_funct: async (value) => { return value ? JSON.parse(value).wifi.rssi : undefined; }
    },
    common: {
      'name': 'Device RSSI status',
      'type': 'number',
      'role': 'value',
      'unit': 'db',
      'read': true,
      'write': false
    }
  },
  'reboot': {
    mqtt: {
      http_cmd: '/rpc/Shelly.Reboot',
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
  },
  'name': {
    mqtt: {
      http_publish: '/rpc/Shelly.GetDeviceInfo',
      http_publish_funct: async (value) => { return value ? JSON.parse(value).id : undefined; }
    },
    common: {
      'name': 'Device Name',
      'type': 'string',
      'role': 'info.name',
      'read': true,
      'write': true
    }
  }
};

module.exports = {
  defaultsgen1: defaultsgen1,
  defaultsgen2: defaultsgen2
};
