+// lib/protocol/rpc.js
+const http = require('http');
+const { URL } = require('url');
+
+class ShellyRpcClient {
+  constructor(log) {
+    this.log = log;
+    this.reqId = 1;
+  }
+
+  async call(host, method, params = {}) {
+    const url = new URL(`http://${host}/rpc`);
+    const payload = { id: this.reqId++, method, params };
+
+    return new Promise((resolve, reject) => {
+      const req = http.request(
+        { hostname: url.hostname, port: url.port || 80, path: url.pathname, method: 'POST',
+          headers: { 'Content-Type': 'application/json' } },
+        res => {
+          const chunks = [];
+          res.on('data', d => chunks.push(d));
+          res.on('end', () => {
+            try {
+              const json = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
+              if (json.error) return reject(new Error(json.error.message));
+              resolve(json.result);
+            } catch (e) { reject(e); }
+          });
+        }
+      );
+      req.on('error', err => reject(err));
+      req.write(JSON.stringify(payload));
+      req.end();
+    });
+  }
+
+  async getDeviceInfo(host) { return this.call(host, 'Shelly.GetDeviceInfo'); }
+  async getSwitchStatus(host, id = 0) { return this.call(host, 'Switch.GetStatus', { id }); }
+}
+
+module.exports = ShellyRpcClient;