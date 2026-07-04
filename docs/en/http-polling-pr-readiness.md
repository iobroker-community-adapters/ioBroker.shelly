# HTTP Polling PR Readiness

## Pull Request Description

### Motivation

Docker and NAS installations often cannot receive Shelly CoAP traffic or provide a reliable MQTT/device callback path without additional network changes. HTTP polling allows these installations to integrate Shelly devices over outbound HTTP while keeping Shelly Cloud usable because MQTT does not need to be enabled on the device.

### Summary

This PR adds HTTP polling as an additional adapter protocol next to the existing CoAP and MQTT modes. It focuses on installations where ioBroker can reach Shelly devices by HTTP, but multicast, inbound UDP, or MQTT callbacks are not usable.

Existing CoAP and MQTT behavior is unchanged. Known HTTP devices reuse the existing adapter profiles where possible, and unknown devices receive conservative generic capability states.

### Main Features

- HTTP polling mode with manual devices and optional IP range discovery.
- Gen1 discovery and capability detection through classic REST endpoints.
- Gen2, Gen3, and Gen4 discovery and capability detection through RPC endpoints.
- Fallback from `Sys.GetConfig` to `Shelly.GetConfig`.
- Generic capability profile for unknown devices.
- HTTP command support for switch/relay, light, RGB/RGBW, and cover capabilities.
- Polling hardening with retries, offline detection, online recovery, changed-value writes, and isolated per-device failures.
- Raw JSON states and raw response debug output only when explicitly enabled.

### Auth And Security

- Global HTTP authentication credentials can be configured once for all HTTP polling devices.
- Manual devices can override global credentials or explicitly disable authentication.
- The adapter negotiates Basic or Digest authentication from the device response.
- Credentials and Authorization headers are not written to logs, state names, object IDs, raw JSON states, diagnostics, or error messages.
- Administrative HTTP functions are disabled by default.
- Reboot, reset, WiFi, firmware update, and factory-reset operations are not automatically exposed by the generic HTTP profile.

### Registry Load With Disabled Discovery

HTTP discovery can be enabled once to create device objects. After that, discovery can be disabled again. On adapter start the HTTP polling server loads known devices from the ioBroker device registry when they have a `hostname` or `Network.ip` state, initializes them as full HTTP polling clients, creates objects, registers writable command handlers, and starts polling without running another network scan.

### Device Manager Controls

The Device Manager shows HTTP polling devices together with the existing device types. It can display live values, run an HTTP connection test, rediscover a device, reload configuration, recreate states, and expose direct controls for supported switch/relay, light, RGB/RGBW, and cover capabilities.

Device Manager commands use the same writable ioBroker states and HTTP/RPC command path as normal object control. A command is reported as successful only after the target state is acknowledged with `ack=true`; missing command handlers or failed HTTP/RPC commands are reported as errors.

### Tests

Automated checks run for this PR preparation:

- `npm run build`: passed.
- `npm test`: passed.
- Targeted ESLint on changed files: passed.
- `git diff --check`: passed.

Additional covered areas include Gen1 discovery, Gen2+ RPC discovery, polling, offline/online behavior, global HTTP authentication, per-device HTTP authentication, auth override, command mapping for switch/light/RGB/RGBW/cover, Device Manager HTTP actions, registry startup loading, and credential sanitizing.

### Manual Test Matrix

- Install the adapter from the GitHub branch `feature/http-polling-discovery`.
- Start a fresh adapter instance and verify that the default protocol remains unchanged until HTTP polling is selected.
- Select HTTP polling mode with discovery disabled and add one manual device.
- Select HTTP polling mode with discovery enabled and scan a small neutral range such as `192.168.1.0/24`.
- Disable HTTP discovery after devices have been created, restart the adapter, and verify that known devices are loaded from the ioBroker registry.
- Test a device without authentication.
- Test a device using global HTTP authentication with Basic or Digest.
- Test a device using per-device HTTP authentication with Basic or Digest.
- Verify that per-device credentials override global credentials.
- Switch a supported device from ioBroker object states.
- Switch the same supported device from the Device Manager.
- Test Device Manager controls for switch/relay, light/dimmer, RGB/RGBW, and cover capabilities where matching devices are available.
- Run the Device Manager HTTP connection test and verify reachability, authentication result, generation, status/config readability, and response time.
- Rediscover a device from the Device Manager and verify that states are recreated without a full adapter restart.
- Stop and start the adapter and verify timers and online states recover cleanly.
- Disconnect or block one HTTP device and verify that it is marked offline after repeated failed polls while other devices continue polling.
- Reconnect the device and verify it returns online after a successful poll.
- Enable raw JSON states and verify sanitized info/status/config payloads are shown.
- Disable raw JSON states and verify raw payloads are not created or shown in the Device Manager.
- Review logs for absence of passwords and Authorization headers.

### Compatibility

- Existing CoAP and MQTT behavior is unchanged.
- Existing BLE/device-manager behavior is unchanged.
- Known HTTP devices reuse existing adapter profiles where possible.
- Unknown HTTP devices receive conservative generic states.
- The supported-device tables in the README continue to describe established CoAP/MQTT profile support; HTTP polling behavior is documented separately in `docs/en/protocol-http.md`.

### Breaking Changes

None.

### Known Limitations

- HTTP discovery is an active IP scan; ranges should be kept narrow.
- The generic profile is conservative. Adding a dedicated device definition still gives the most complete object model.
- Device Manager direct controls are shown only when the corresponding writable states exist.
- HTTP polling depends on the device's HTTP/RPC API being reachable from the adapter host.

### Lint Note

`npm run lint` still fails repo-wide on existing CRLF/Prettier findings in unchanged legacy files. This PR intentionally does not apply a global CRLF-only rewrite because that would create a large unrelated diff.

Representative unchanged files reported by the repo-wide lint run:

- `lib/ble-decoder.js`
- `lib/colorconv.js`
- `lib/datapoints.js`
- `lib/devices/default.js`
- `lib/devices/gen1-helper.js`
- `lib/devices/gen1/shelly1.js`
- `lib/devices/gen1/shelly1pm.js`
- `lib/devices/gen1/shellyplugs.js`
- Additional unchanged `lib/devices/gen1/*` profile files

The changed files were linted separately and passed.

### Screenshots / Manual Test Notes

Screenshots should be added from a neutral test setup before merge if maintainers require UI evidence. The manual test matrix above covers installation, discovery, authentication modes, object control, Device Manager control, adapter restart, offline handling, and raw JSON behavior.
