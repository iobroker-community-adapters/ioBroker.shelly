# HTTP Polling PR Readiness

## Manual Test Matrix

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

## Pull Request Description

### Goal

Add production-ready HTTP polling support for Shelly devices in environments where ioBroker can reach devices by HTTP but CoAP packets or MQTT callback paths are not usable.

### Motivation

Docker and NAS installations often cannot receive CoAP traffic or incoming MQTT/device callbacks without additional network changes. HTTP polling allows these installations to integrate Shelly devices while keeping Shelly Cloud usable because MQTT does not need to be enabled on the device.

### Main Features

- HTTP polling mode with manual devices and optional IP range discovery.
- Gen1 discovery and capability detection through classic REST endpoints.
- Gen2, Gen3, and Gen4 discovery and capability detection through RPC endpoints.
- Fallback from `Sys.GetConfig` to `Shelly.GetConfig`.
- Generic capability profile for unknown devices.
- Global and per-device HTTP authentication with Basic/Digest negotiation.
- Startup loading from the ioBroker device registry when discovery is disabled.
- HTTP command support for switch/relay, light, RGB/RGBW, and cover capabilities.
- Device Manager support for direct controls, live values, HTTP connection tests, rediscovery, config reload, state recreation, and diagnostics.
- Device Manager controls report success only after command acknowledgement.
- Polling hardening with retries, offline detection, online recovery, and isolated per-device failures.

### Security

- Passwords are stored through ioBroker protected/encrypted native configuration entries.
- Credentials and Authorization headers are not written to logs, state names, object IDs, raw JSON states, diagnostics, or error messages.
- Administrative HTTP commands are disabled by default.
- Reboot, reset, WiFi, firmware update, and factory-reset operations are not automatically exposed by the generic HTTP profile.

### Compatibility

- Existing CoAP and MQTT behavior is unchanged.
- Known HTTP devices reuse existing adapter profiles where possible.
- Unknown HTTP devices receive conservative generic states.
- Breaking changes: none.

### Tests

- `npm install`
- `npm run build`
- `npm run lint`
- `npm test`

Additional covered areas include Gen1 discovery, Gen2+ RPC discovery, polling, offline/online behavior, global HTTP authentication, per-device HTTP authentication, auth override, command mapping for switch/light/RGB/RGBW/cover, Device Manager HTTP actions, and credential sanitizing.

### Known Limitations

- HTTP discovery is an active IP scan; ranges should be kept narrow.
- The generic profile is conservative. Adding a dedicated device definition still gives the most complete object model.
- Device Manager direct controls are shown only when the corresponding writable states exist.

### Screenshots / Manual Test Notes

Screenshots should be added from a neutral test setup before merge if maintainers require UI evidence. The manual test matrix above covers installation, discovery, authentication modes, object control, Device Manager control, adapter restart, offline handling, and raw JSON behavior.
