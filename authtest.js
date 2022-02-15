const axios = require('axios');
const crypto = require('crypto');

// https://shelly-api-docs.shelly.cloud/gen2/Overview/CommonDeviceTraits/#authentication

// https://github.com/axios/axios/issues/686#issuecomment-611210438

async function get(base, uri) {
    return new Promise((resolve, reject) => {
        let count = 0;

        axios(
            {
                method: 'get',
                responseType: 'text',
                transformResponse: (res) => {
                    return res;
                },
                baseURL: base,
                timeout: 2000,
                url: uri
            }
        )
        .then(response => {
            console.log(`Received response: ${response.data}`);
            resolve(response.data);
        })
        .catch(err => {
            if (err.response.status === 401) {
                const authDetails = err.response.headers['www-authenticate'].split(', ').map(v => v.split('='));

                console.log(`Response: ${JSON.stringify(authDetails)}`);

                const username = 'admin';
                const password = 'test';

                count++;
                const nonceCount = ('00000000' + count).slice(-8);
                const cnonce = crypto.randomBytes(24).toString('hex');

                const realm = authDetails[1][1].replace(/"/g, '');
                const nonce = authDetails[2][1].replace(/"/g, '');

                const sha256 = str => crypto.createHash('sha256').update(str).digest('hex');

                const HA1 = sha256(`${username}:${realm}:${password}`);
                const HA2 = sha256(`GET:${uri}`);
                const response = sha256(`${HA1}:${nonce}:${nonceCount}:${cnonce}:auth:${HA2}`);

                const authorization = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", cnonce="${cnonce}", nc=${nonceCount}, qop=auth, response="${response}", algorithm=SHA-256`;

                console.log(`HA1: ${HA1}`);
                console.log(`HA2: ${HA2}`);
                console.log(`Authorization-Header: ${authorization}`);

                axios(
                    {
                        method: 'get',
                        responseType: 'text',
                        transformResponse: (res) => {
                            return res;
                        },
                        baseURL: base,
                        timeout: 2000,
                        url: uri,
                        headers: {
                            'Authorization': authorization
                        }
                    }
                ).then(response => {
                    console.log(`Received auth response: ${response.data}`);
                    resolve(response.data);
                })
                .catch(reject);
            } else {
                // Rethrow err if reponse status != 401
                reject(err);
            }
        })
        .catch(reject);
    });
};

async function test() {
    try {
        const responseData = await get('http://192.168.188.24', '/rpc/Shelly.GetStatus');
        console.log(`Response: ${JSON.stringify(responseData)}`);
    } catch (err) {
        console.log(`Error: ${JSON.stringify(err)}`);
    }
}

test();

/**

HA1 => admin:shellyplus1pm-44179394d4d4:test => a894e20a7584ea0306ec0da8171e2e7ad80ab4083d72bf0465d631d6c20aaa09
HA2 => GET:/rpc/Shelly.GetStatus => fbcb1141164e668ba1e33b1fd7e81c2318ef3058b838c3330c28d1ff15c88b7a
response => a894e20a7584ea0306ec0da8171e2e7ad80ab4083d72bf0465d631d6c20aaa09:603:00000001:OWQ5M2JjZTFlYTk2ZDNjZTYzZmMxMjFmYTc5YzkxMjQ=:auth:fbcb1141164e668ba1e33b1fd7e81c2318ef3058b838c3330c28d1ff15c88b7a

curl -v --digest -u admin:test http://192.168.188.24/rpc/Shelly.GetStatus

*   Trying 192.168.188.24:80...
* Connected to 192.168.188.24 (192.168.188.24) port 80 (#0)
* Server auth using Digest with user 'admin'
> GET /rpc/Shelly.GetStatus HTTP/1.1
> Host: 192.168.188.24
> User-Agent: curl/7.74.0
> Accept: 
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 401 Unauthorized
< Server: Mongoose/6.18
< Content-Type: application/json
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Headers: *
< Content-Length: 0
< Connection: close
< WWW-Authenticate: Digest qop="auth", realm="shellyplus1pm-44179394d4d4", nonce="603", algorithm=SHA-256
< 
* Closing connection 0
* Issue another request to this URL: 'http://192.168.188.24/rpc/Shelly.GetStatus'
* Hostname 192.168.188.24 was found in DNS cache
*   Trying 192.168.188.24:80...
* Connected to 192.168.188.24 (192.168.188.24) port 80 (#1)
* Server auth using Digest with user 'admin'
> GET /rpc/Shelly.GetStatus HTTP/1.1
> Host: 192.168.188.24
> Authorization: Digest username="admin", realm="shellyplus1pm-44179394d4d4", nonce="603", uri="/rpc/Shelly.GetStatus", cnonce="OWQ5M2JjZTFlYTk2ZDNjZTYzZmMxMjFmYTc5YzkxMjQ=", nc=00000001, qop=auth, response="116fbbf9833d348fae9cc69ea96b4706949de269c3c459145ea850248e9692ef", algorithm=SHA-256
> User-Agent: curl/7.74.0
> Accept:
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Server: Mongoose/6.18
< Content-Type: application/json
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Headers: *
< Content-Length: 552
< Connection: close
< 
{"ble":{},"cloud":{"connected":false},"input:0":{"id":0,"state":false},"mqtt":{"connected":false},"switch:0":{"id":0, "source":"init", "output":false, "apower":0.0, "voltage":224.1, "current":0.000, "aenergy":{"total":0.000},"temperature":{"tC":47.7, "tF":117.8}},"sys":{"mac":"44179394D4D4","restart_required":false,"time":null,"unixtime":null,"uptime":1539,"ram_size":248956,"ram_free":173544,"fs_size":458752,"fs_free":229376,"cfg_rev":5,"available_updates":{}},"wifi":{"sta_ip":"192.168.188.24","status":"got ip","ssid":"HausAutoDev","rssi":-32}}
* Closing connection 1

*/
