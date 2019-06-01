/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

let overall = {
  'version': {
    coap: {
      http_publish: '/settings',
      http_publish_funct:  (value) => { return value ? JSON.parse(value).fw : undefined; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct:  (value) => { return value ? JSON.parse(value).fw : undefined; }
    },
    common: {
      'name': 'Firmware version',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': false
    }
  },
};

module.exports = {
  overall: overall
};
