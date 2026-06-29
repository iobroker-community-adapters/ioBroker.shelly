# HTTP Polling

The HTTP polling protocol is intended for installations where ioBroker can reach Shelly devices by TCP/80, but Shelly CoAP multicast/unicast packets or an MQTT broker callback path are not usable. This is common for ioBroker instances running in Docker on a NAS.

HTTP polling does not require enabling MQTT on Shelly devices, so the Shelly Cloud connection can remain active.

## Architecture

When `HTTP polling` is selected as the adapter protocol, the adapter starts an HTTP polling server instead of a CoAP or MQTT listener.

The HTTP polling server builds its device list from two sources:

- Manually configured devices in `HTTP polling devices`
- Optional HTTP discovery scans over configured IP ranges

For every device the adapter calls `/shelly` first. It then reads the status and configuration endpoints to analyze the available capabilities:

- Gen1 devices are analyzed through classic endpoints such as `/status` and `/settings`.
- Gen2, Gen3, and Gen4 devices are analyzed through RPC endpoints such as `/rpc/Shelly.GetStatus` and `/rpc/Sys.GetConfig`. If `Sys.GetConfig` is not available, the adapter falls back to `Shelly.GetConfig`.
- Known devices reuse the existing adapter profiles so object names remain consistent with MQTT/CoAP operation.
- Unknown devices get a generic HTTP capability profile.

The implementation reuses the adapter's existing datapoint definitions wherever possible. This avoids a second, parallel state model for HTTP.

## Capability Detection

The generic HTTP profile can create states for:

- Switches and relays
- Inputs
- Lights
- RGB/RGBW lights
- Covers and rollers
- Power, voltage, current, and energy
- Temperature and humidity
- Network status
- System status
- Basic configuration and diagnostics

Raw JSON states are only created when `Create raw JSON states` is enabled. Unknown devices still receive generic capability states when raw JSON is disabled.

## Configuration

Use the HTTP authentication fields in the HTTP polling settings. The adapter supports Basic Auth for Gen1 classic REST requests and Gen2+ RPC requests. Gen2+ digest authentication is still handled when a device requests it.

HTTP-specific settings:

- `Use global HTTP Basic Auth`: Enable default HTTP credentials for all HTTP polling devices.
- `Default HTTP username` and `Default HTTP password`: Global credentials. Use these when all Shelly devices share the same restricted-login password.
- `Discover devices by HTTP scan`: Probe configured IP ranges for Shelly devices.
- `Automatically create discovered devices`: Start polling clients for discovered devices. Disable this if you only want the scan result in the log and prefer manual entries.
- `HTTP discovery network ranges`: IP ranges to scan. Supported formats are a single IP, `192.168.1.10-192.168.1.30`, `192.168.1.10-30`, and CIDR ranges from `/24` to `/32`.
- `HTTP timeout in ms`: Timeout for HTTP requests.
- `HTTP retries`: Number of retry attempts after a failed request.
- `Parallel discovery probes`: Maximum number of concurrent discovery requests.
- `Create raw JSON states`: Also store raw info/status/config payloads below the device.
- `Allow administrative HTTP functions`: Allow potentially disruptive calls such as firmware update, reboot, network configuration, MQTT/cloud configuration, and script writes.

Manual HTTP devices support an authentication mode:

- `No auth`: Never send credentials for this device.
- `Use global auth`: Use the global default credentials.
- `Custom auth`: Use the username/password configured on this manual device.

Custom device credentials take precedence over global credentials. If neither custom nor global credentials are active, requests are sent without authentication.

During discovery the adapter first probes without credentials. If that request fails or returns `401` and global HTTP authentication is enabled, it retries with the global credentials.

Passwords and authorization headers are never written to logs, object IDs, state names, or raw JSON states. Raw JSON payloads are sanitized before they are stored.

## Commands

Gen1 command states use the existing classic REST command definitions.

Gen2+ command states reuse the existing MQTT command functions. The generated JSON-RPC payload is translated into an HTTP RPC request, for example `Switch.Set` becomes `/rpc/Switch.Set?id=0&on=true`.

Generic commands are created only when the analyzed status contains the matching component. The generic profile supports:

- Switch/relay on, off, and toggle
- Light on/off and brightness
- RGB/RGBW on/off, brightness, color, white, gain, effect, and transition
- Cover open, close, stop, and position

Administrative RPC methods are blocked unless `Allow administrative HTTP functions` is enabled. For known adapter profiles the HTTP layer also marks configuration and maintenance command states as non-writable by default. No factory reset, WiFi reset, or firmware update commands are exposed automatically by the generic profile.

## Device Manager

HTTP polling devices are shown in the ioBroker Device Manager together with CoAP, MQTT, and BLE devices. The cards reuse the existing ioBroker states and can show online/offline state, current switch state, power, energy, temperature, RSSI, IP/hostname, model, firmware, and the last observed poll timestamp when those states exist.

Supported direct controls are shown only when the detected capability exists:

- Switch/relay and plug devices: on, off, and toggle
- Light/dimmer devices: on/off and brightness
- RGB/RGBW devices: on/off, brightness/gain, color, white channel, effect, and transition states where supported
- Cover/roller devices: open, close, stop, and position
- Sensors: values only, no command buttons

Device Manager commands write to the same writable ioBroker states that are used outside the Device Manager. The HTTP layer then performs the existing Gen1 REST or Gen2+ RPC command mapping and resolves credentials with the same custom/global/no-auth logic used for polling.

The device menu contains HTTP-specific diagnostics:

- Test HTTP connection: checks reachability, authentication, detected generation, status endpoint, config endpoint, response time, and a sanitized error message.
- Rediscover device: restarts the HTTP polling client for this device and reruns capability detection.
- Reload configuration: refreshes status/config data without a full adapter restart.
- Recreate states: reruns object creation for the current HTTP device.

The details dialog shows device information, detected capabilities, current values, polling status derived from state timestamps, and last sanitized errors when available. Raw info/status/config JSON is shown only when `Create raw JSON states` is enabled.

## Polling and Offline Handling

Polling uses the configured adapter poll interval. HTTP timeout, retry count, and discovery concurrency are configurable. State values are cached and only written again when they changed, unless `Update objects even if there is no value change` is enabled.

A failed request affects only the device that failed. After repeated failures the device is marked offline. A later successful request marks it online again. All polling timers are stopped when the adapter instance stops.

## Limitations

HTTP discovery is an active IP scan. Keep ranges narrow on large networks.

The fallback profile is intentionally conservative. Adding a dedicated device definition to `lib/devices` still provides the most complete object model for a device.
