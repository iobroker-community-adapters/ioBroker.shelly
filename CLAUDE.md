# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ioBroker.shelly is an ioBroker adapter that integrates 100+ Shelly smart home device models via MQTT or CoAP protocols. It supports Gen1 (ESP8266), Gen2, Gen3, Gen4, and "Powered by Shelly" devices, plus BLE devices via Shelly gateways.

## Commands

```bash
# Lint
npm run lint

# Run all tests (unit + package validation)
npm test

# Run unit tests only
npm run test:js

# Run package validation tests
npm run test:package

# Run integration tests
npm run test:integration

# Run a single test file (tests stay JS in test/ and import the compiled output from build/lib/)
npx mocha --config test/mocharc.custom.json test/shelly-helper.test.js

# Build: clean build/, copy src/lib/i18n → build/lib/i18n, then compile ALL TS (src/ → build/)
npm run build

# Type-check only, no emit
npm run check

# Generate translations after modifying admin/jsonConfig.json
npm run translate

# Generate SVG icons for admin config
npm run update-svg
```

## Architecture

### Entry Point & Adapter Lifecycle

`src/main.ts` is the adapter entry point, compiled to `build/main.js` (which `package.json`'s `main` field points to). It extends `utils.Adapter` and uses an EventEmitter-based architecture. Key lifecycle methods: `onReady()` (init servers/protocols), `onStateChange()`, `onObjectChange()`, `onUnload()`. The compact-mode footer (`module.parent ? module.exports = … : new Shelly()`) is preserved in the build output — do not remove it, it is how js-controller loads the adapter in compact mode.

### Protocol Layer (`src/lib/protocol/`)

- `base.ts` - Base classes `BaseClient` (implements the `ShellyClient` contract from `deviceTypes.ts`) and `BaseServer`
- `mqtt.ts` - MQTT server; JSON-RPC messages for Gen2+ devices
- `coap.ts` - CoAP/CoIoT server; binary protocol for Gen1 devices (uses the untyped `shelly-iot` package)
- HTTP is used supplementarily for device configuration and firmware updates

### Device Definitions (`src/lib/devices/`)

Organized by generation: `gen1/`, `gen2/`, `gen3/`, `gen4/`, `poweredbyshelly/`. Each file defines one device model's capabilities, states, and mappings. Generation-specific shared logic lives in `gen1-helper.ts`, `gen2-helper.ts`, `virtual-helper.ts`. `default.ts` provides a fallback template. `datapoints.ts` imports every device module and is the registry that maps a model id to its definition. The shared types (`DeviceDefinition`, `DeviceState`, `ProtocolBlock`, `ShellyClient`) live in `src/lib/deviceTypes.ts`; device modules are typed with `: DeviceDefinition`/`satisfies DeviceDefinition` so the embedded callbacks get contextual typing (`value: any`, `self: ShellyClient`).

Each device is a plain object keyed by ioBroker state id (e.g. `'Relay0.Switch'`). Each state holds a `common` block (the ioBroker object definition) plus per-protocol blocks (`coap`, `mqtt`):

- Receiving from device: `coap_publish`/`mqtt_publish` (the trigger/topic) + `*_publish_funct` (transform raw value → state value). Values not pushed by the device can be polled via `http_publish` + `http_publish_funct`.
- Sending to device: `http_cmd` + `http_cmd_funct` or `mqtt_cmd` + `mqtt_cmd_funct` (transform state value → command). Only one `*_cmd` per state; CoAP has no command path.
- Other flags: `init_value`/`init_funct` (value set on `createObjects()`), `no_display` (hide a state for that protocol), `device_mode` (hide unless device is in that mode, e.g. `color` vs `white`).

See `docs/en/dev/dev.md` for the full datapoint contract and `docs/en/dev/newdevice.md` for the info to collect when adding a model.

### Key Modules

- `src/lib/datapoints.ts` - Central registry mapping device models to supported states/capabilities
- `src/lib/deviceTypes.ts` - Shared device-definition contract (`DeviceDefinition`/`DeviceState`/`ProtocolBlock`/`ShellyClient`/`ShellyAdapter`)
- `src/lib/shelly-helper.ts` - Utilities: temperature/color conversion, HTTP API calls, icon generation, state management
- `src/lib/ble-decoder.ts` - BTHome protocol BLE message decoding
- `src/lib/colorconv.ts` - Color space conversions (RGB, RGBW, HSV)
- `src/lib/deviceManager.ts` - Extends `@iobroker/dm-utils` for device lifecycle management
- `src/lib/objectHelper.ts` - Helper for ioBroker object/state management
- `src/lib/types.d.ts` - Ambient `declare module` stubs for untyped deps (`shelly-iot`, `tcp-ping`, `mqtt-connection`)
- `src/lib/adapter-config.d.ts` - Augments `ioBroker.AdapterConfig` from `io-package.json`'s `native` (gives `this.config` its types)

All of the above compile to `build/lib/*.js` (with `.js.map`/`.d.ts`).

### Admin UI

`admin/jsonConfig.json` defines the configuration UI. Translations are in `admin/i18n/{lang}/translations.json` (11 languages). After modifying jsonConfig labels/help text, run `npm run translate`.

## Code Conventions

- Fully TypeScript: all runtime sources live in `src/` (entry `src/main.ts`, modules `src/lib/**`) and compile to `build/`. The adapter runs entirely from `build/` — never edit `build/**` by hand.
- Relative imports must carry an explicit `.js` extension (the package is CommonJS under `moduleResolution: node16`), e.g. `import * as shellyHelper from '../shelly-helper.js'`.
- 4-space indentation (ioBroker standard)
- ESLint config: `@iobroker/eslint-config` via `eslint.config.mjs`. Type-aware rules apply (`explicit-function-return-type` on exported/top-level functions, `no-floating-promises` — mark intentional fire-and-forget with `void`, etc.)
- JSDoc requirements are disabled; do not put `{type}` annotations in `@param` (TS provides types)
- Use `adapter.log.{debug,info,warn,error}()` for logging, never `console.log`
- Unused variables: remove or prefix with underscore
- Run `npm run build` after changing any `src/**` file and before running the adapter, the unit tests, or the integration tests (they all consume `build/`)
- Node.js >=22 required

## Testing

Uses Mocha with `@iobroker/testing` framework. Test setup in `test/mocha.setup.js`. Unit tests stay JavaScript and live in `test/` (`test/datapoints.test.js`, `test/shelly-helper.test.js`); they `require('../build/lib/…')`, so **run `npm run build` before `npm run test:js`**. Integration tests use the harness pattern: configure adapter via `harness.objects.setObject()`, start via `harness.startAdapterAndWait()`, verify via `harness.states.getState()` (they boot `build/main.js`; a separate running js-controller will block them).

## CI/CD

GitHub Actions workflow (`.github/workflows/test-and-release.yml`): lint-first (Node 24), then adapter tests across Node 22/24 on ubuntu/windows/macos. Deploys to npm on version tags via Trusted Publishing. Releases managed by `@alcalzone/release-script`.
