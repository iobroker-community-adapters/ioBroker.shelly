# HTTP Polling

The HTTP polling protocol is intended for installations where ioBroker can reach Shelly devices by TCP/80, but Shelly CoAP multicast/unicast packets or an MQTT broker callback path are not usable. This is common for ioBroker instances running in Docker on a NAS.

HTTP polling does not require enabling MQTT on Shelly devices, so the Shelly Cloud connection can remain active.

## Architecture

When `HTTP polling` is selected as the adapter protocol, the adapter starts an HTTP polling server instead of a CoAP or MQTT listener.

The HTTP polling server builds its device list from two sources:

- Manually configured devices in `HTTP polling devices`
- Optional HTTP discovery scans over configured IP ranges

For every device the adapter calls `/shelly` first. The response decides how the normal ioBroker objects are created:

- Gen1 devices use the existing CoAP/classic REST profile and poll classic endpoints such as `/status` and `/settings`.
- Gen2 and newer devices use the existing MQTT/RPC profile and poll endpoints below `/rpc`, for example `/rpc/Shelly.GetStatus`.
- Unknown devices get a generic fallback profile with raw JSON states.

The implementation reuses the adapter's existing datapoint definitions wherever possible. This avoids a second, parallel state model for HTTP.

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

Administrative RPC methods are blocked unless `Allow administrative HTTP functions` is enabled.

## Limitations

HTTP discovery is an active IP scan. Keep ranges narrow on large networks.

The fallback profile is intentionally conservative. Unknown Shelly devices expose raw JSON first; adding a dedicated device definition to `lib/devices` still provides the best object model.
