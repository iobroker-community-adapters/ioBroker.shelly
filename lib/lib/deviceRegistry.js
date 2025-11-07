+// lib/deviceRegistry.js
+const ShellyRpcClient = require('./protocol/rpc');
+const http = require('http');
+
+class DeviceRegistry {
+  constructor(log) {
+    this.log = log;
+    this.rpc = new ShellyRpcClient(log);
+    this.cache = new Map();
+  }
+
+  async detect(host) {
+    try {
+      const info = await this.rpc.getDeviceInfo(host);
+      return { gen: 'gen2', model: info?.model, firmware: info?.fw_id };
+    } catch (e) {
+      return await this.detectGen1(host);
+    }
+  }
+
+  async detectGen1(host) {
+    return new Promise((resolve, reject) => {
+      const req = http.request({ hostname: host, path: '/shelly', method: 'GET' },
+        res => {
+          const chunks = [];
+          res.on('data', d => chunks.push(d));
+          res.on('end', () => {
+            try {
+              const json = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
+              resolve({ gen: 'gen1', model: json?.type, firmware: json?.fw });
+            } catch (e) { reject(e); }
+          });
+        });
+      req.on('error', err => reject(err));
+      req.end();
+    });
+  }
+}
+
+module.exports = DeviceRegistry;