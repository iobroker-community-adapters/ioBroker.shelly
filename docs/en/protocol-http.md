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
- Gen2, Gen3, and Gen4 devices are analyzed through RPC endpoints such as `/rpc/Shelly.GetStatus` and `/rpc/Sys.GetConfig`.
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

Use the regular HTTP credentials fields in the general adapter settings. The adapter uses the configured password for Gen2+ digest authentication and the configured username/password for Gen1 basic authentication.

HTTP-specific settings:

- `Discover devices by HTTP scan`: Probe configured IP ranges for Shelly devices.
- `Automatically create discovered devices`: Start polling clients for discovered devices. Disable this if you only want the scan result in the log and prefer manual entries.
- `HTTP discovery network ranges`: IP ranges to scan. Supported formats are a single IP, `192.168.1.10-192.168.1.30`, `192.168.1.10-30`, and CIDR ranges from `/24` to `/32`.
- `HTTP timeout in ms`: Timeout for HTTP requests.
- `HTTP retries`: Number of retry attempts after a failed request.
- `Parallel discovery probes`: Maximum number of concurrent discovery requests.
- `Create raw JSON states`: Also store raw info/status/config payloads below the device.
- `Allow administrative HTTP functions`: Allow potentially disruptive calls such as firmware update, reboot, network configuration, MQTT/cloud configuration, and script writes.

## Commands

Gen1 command states use the existing classic REST command definitions.

Gen2+ command states reuse the existing MQTT command functions. The generated JSON-RPC payload is translated into an HTTP RPC request, for example `Switch.Set` becomes `/rpc/Switch.Set?id=0&on=true`.

Generic commands are created only when the analyzed status contains the matching component. The generic profile supports:

- Switch/relay on, off, and toggle
- Light on/off and brightness
- RGB/RGBW on/off, brightness, color, white, gain, effect, and transition
- Cover open, close, stop, and position

Administrative RPC methods are blocked unless `Allow administrative HTTP functions` is enabled. For known adapter profiles the HTTP layer also marks configuration and maintenance command states as non-writable by default. No factory reset, WiFi reset, or firmware update commands are exposed automatically by the generic profile.

## Polling and Offline Handling

Polling uses the configured adapter poll interval. HTTP timeout, retry count, and discovery concurrency are configurable. State values are cached and only written again when they changed, unless `Update objects even if there is no value change` is enabled.

A failed request affects only the device that failed. After repeated failures the device is marked offline. A later successful request marks it online again. All polling timers are stopped when the adapter instance stops.

## Limitations

HTTP discovery is an active IP scan. Keep ranges narrow on large networks.

The fallback profile is intentionally conservative. Adding a dedicated device definition to `lib/devices` still provides the most complete object model for a device.
