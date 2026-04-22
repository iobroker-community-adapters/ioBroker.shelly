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

# Run a single test file
npx mocha path/to/file.test.js

# Compile TypeScript (src/lib/deviceManager.ts, src/lib/objectHelper.ts → build/lib/)
npx tsc -p tsconfig.build.json

# Generate translations after modifying admin/jsonConfig.json
npm run translate

# Generate SVG icons for admin config
npm run update-svg
```

## Architecture

### Entry Point & Adapter Lifecycle

`main.js` is the adapter entry point. It extends `utils.Adapter` and uses an EventEmitter-based architecture. Key lifecycle methods: `onReady()` (init servers/protocols), `onStateChange()`, `onObjectChange()`, `onUnload()`.

### Protocol Layer (`lib/protocol/`)

- `base.js` - Base classes `BaseClient` and `BaseServer`
- `mqtt.js` - MQTT server; JSON-RPC messages for Gen2+ devices
- `coap.js` - CoAP/CoIoT server; binary protocol for Gen1 devices
- HTTP is used supplementarily for device configuration and firmware updates

### Device Definitions (`lib/devices/`)

Organized by generation: `gen1/`, `gen2/`, `gen3/`, `gen4/`, `poweredbyshelly/`. Each file defines one device model's capabilities, states, and mappings. Generation-specific shared logic lives in `gen1-helper.js`, `gen2-helper.js`, `virtual-helper.js`. `default.js` provides a fallback template.

### Key Modules

- `lib/datapoints.js` - Central registry mapping device models to supported states/capabilities
- `lib/shelly-helper.js` - Utilities: temperature/color conversion, HTTP API calls, icon generation, state management
- `lib/ble-decoder.js` - BTHome protocol BLE message decoding
- `lib/colorconv.js` - Color space conversions (RGB, RGBW, HSV)
- `src/lib/deviceManager.ts` - TypeScript module extending `@iobroker/dm-utils` for device lifecycle management (compiled output: `build/lib/deviceManager.js`, `build/lib/deviceManager.d.ts`)
- `src/lib/objectHelper.ts` - TypeScript helper for ioBroker object/state management (compiled output: `build/lib/objectHelper.js`, `build/lib/objectHelper.d.ts`)

### Admin UI

`admin/jsonConfig.json` defines the configuration UI. Translations are in `admin/i18n/{lang}/translations.json` (11 languages). After modifying jsonConfig labels/help text, run `npm run translate`.

## Code Conventions

- JavaScript codebase with TypeScript source files in `src/lib/` (compiled to `build/lib/`)
- 4-space indentation (ioBroker standard)
- ESLint config: `@iobroker/eslint-config` via `eslint.config.mjs`
- JSDoc requirements are disabled
- Use `adapter.log.{debug,info,warn,error}()` for logging, never `console.log`
- Unused variables: remove or prefix with underscore
- `build/lib/deviceManager.js` and `build/lib/objectHelper.js` are compiled outputs - edit files in `src/lib/` instead
- Node.js >=20 required

## Testing

Uses Mocha with `@iobroker/testing` framework. Test setup in `test/mocha.setup.js`. Integration tests use the harness pattern: configure adapter via `harness.objects.setObject()`, start via `harness.startAdapterAndWait()`, verify via `harness.states.getState()`.

## CI/CD

GitHub Actions workflow (`.github/workflows/test-and-release.yml`): lint-first, then adapter tests across Node 20/22/24 on ubuntu/windows/macos. Deploys to npm on version tags via Trusted Publishing. Releases managed by `@alcalzone/release-script`.
