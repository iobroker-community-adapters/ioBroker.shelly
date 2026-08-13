# HTTP polling

HTTP polling is an alternative to CoAP and MQTT for networks where ioBroker can reach Shelly devices on TCP port 80 but multicast, inbound callbacks, or an MQTT broker are unavailable.

## Discovery, registry startup, and polling

These are separate functions:

- **Discovery** probes only the configured IPv4 addresses or ranges and finds new devices. It is optional.
- **Registry startup** reads known devices and their `hostname` state from the ioBroker object tree. It runs even when discovery is disabled.
- **Polling** periodically reads the HTTP endpoints from the existing device definitions and updates the normal Shelly states.

After initial discovery, discovery may be disabled. Known devices continue to start, poll, and accept writable-state commands after an adapter restart. No separate device registry is created.

Select `HTTP polling` as the protocol. Historic `both` continues to mean MQTT plus CoAP; it does not include HTTP.

## Configuration

- Enable discovery only when new devices must be found.
- Configure individual IPv4 addresses, dash ranges, or CIDR ranges from `/24` to `/32`.
- Discovery is capped at 1,024 hosts and uses bounded parallel requests.
- Set the polling interval and an HTTP timeout appropriate for the network.
- Manual devices can be entered without running discovery.

## Authentication

Global credentials can be enabled for all devices. A manual device can use the global credentials, custom credentials, or no authentication. Gen1 devices use Basic authentication when challenged; Gen2 and newer devices use Shelly RPC Digest authentication. Digest requests support MD5 and SHA-256 challenges, `qop=auth`, nonce counts, cnonce, and at most one authenticated retry per request.

Passwords and Authorization headers are never logged. Redirects are disabled and responses are size-limited.

## Control and Device Manager

The HTTP client reuses the current TypeScript device definitions and object model. Writable relay, switch, light, RGB/RGBW, and cover states therefore use the existing Gen1 REST mappings or the Gen2+ RPC command mappings. State acknowledgement remains handled by the shared ObjectHelper path.

The Device Manager continues to derive controls from writable states and adds HTTP connection test, rediscovery, and known-device reload actions in HTTP mode.

## Troubleshooting

- Confirm that ioBroker can reach the device IPv4 address on TCP port 80.
- Check the configured username/password after a 401 response.
- Keep scan ranges narrow; broad ranges below `/24` are rejected.
- Enable HTTP discovery debug logging only while diagnosing scans. Credentials are still redacted.
- An offline device is retried on later polling cycles and returns online after a successful request.

All discovery workers and polling timers are stopped during adapter shutdown. Poll cycles for one device are sequential, so slow requests do not accumulate overlapping cycles.
