/**
 * Shared TypeScript contract for the Shelly *device definitions*.
 *
 * Every file under `devices/<generation>/` exports one plain object that describes a single
 * Shelly model: which ioBroker states it exposes and how each state is mapped to/from the
 * device over the CoAP (Gen1) or MQTT (Gen2+) protocol — optionally falling back to HTTP.
 *
 * The protocol layer (`protocol/base.ts` and its `mqtt`/`coap` subclasses) walks these objects
 * at runtime and invokes the embedded callbacks. The types below describe that runtime contract:
 *
 *   - {@link DeviceDefinition} — the exported object: `stateId -> {@link DeviceState}`.
 *   - {@link DeviceState}      — one ioBroker state: its `common` block plus per-protocol mappings.
 *   - {@link ProtocolBlock}    — the `coap`/`mqtt` mapping (publish/command/poll/init fields).
 *   - {@link ShellyClient}     — the `self` argument every callback receives (the live client).
 *
 * Device files apply this contract with `satisfies DeviceDefinition` so the literal keeps its
 * narrow inferred shape (device-specific state ids stay known) while still being type-checked.
 *
 * Note on callback `value` typing: the data flowing through `*_publish_funct` is raw, untyped
 * wire data (a JSON string from MQTT, a response body from HTTP, a scalar from CoAP). Typing it
 * as anything narrower than `any` would force a cast at every one of the thousands of call sites
 * (`JSON.parse(value)`, `value == 1`, …) for no real safety gain, so `value` is intentionally
 * `any`. The safety payoff lives in {@link ShellyClient} (the strongly-typed `self`) and in the
 * `common` block being a real `ioBroker.StateCommon` from the ioBroker type definitions.
 */

import type { ShellyAdapterConfig } from './types';
import type { ShellyAdapter } from '../main';

/**
 * The live protocol client instance passed as `self` to every device-definition callback.
 *
 * This is a structural view of `BaseClient` (see `protocol/base.ts`) deliberately declared here
 * — rather than imported from the protocol layer — so the device files can depend on it without
 * creating a `base -> datapoints -> devices -> base` import cycle. `BaseClient` is declared to
 * `implement` this interface, so the two are kept in sync by the compiler.
 */
export interface ShellyClient {
    config: ShellyAdapterConfig;
    /** Active transport for this client. */
    type: 'mqtt' | 'coap';
    /** The owning ioBroker adapter instance (logging, state/object access, `config`, …). */
    adapter: ShellyAdapter;

    /** Full Shelly device id used as the object-tree root, e.g. `SHRGBW2#1234#1`. */
    deviceId: string | undefined;
    /** Current IP address of the device, e.g. `192.168.1.2`. */
    ip: string | undefined;
    /** Device id reported by the device, e.g. `shellyplug-s-12345`. */
    id: string | undefined;
    /** Hardware type, e.g. `SHRGBW2`. */
    deviceType: string | undefined;
    /** Active operating mode where applicable, e.g. `color`/`white` or `relay`/`roller`. */
    deviceMode: string | undefined;
    /** Device class / model key, e.g. `shellyrgbw2`. */
    deviceClass: string | undefined;
    /** Serial number portion of the device id, e.g. `8CAAB5616291`. */
    serialId: string | undefined;
    /** Protocol generation (1 for CoAP/Gen1, >= 2 for MQTT/Gen2+). */
    deviceGen: number | undefined;

    /** Returns the next rolling 16-bit message id (used for Gen2+ JSON-RPC requests). */
    getNextMsgId: () => number;
    /** Effective poll time for this device in seconds (0 disables polling). */
    getPollTime: () => number | undefined;
    getId: () => string | undefined;
    getSerialId: () => string;
    getDeviceClass: () => string;
    getDeviceType: () => string | undefined;
    getDirectoryName: () => string;
    getDeviceMode: () => string | undefined;
    getIP: () => string | undefined;
    /** Human-readable `ip (class / id / deviceId)` string for log messages. */
    getLogInfo: () => string;
    getDeviceId: () => string | undefined;
    getDeviceGen: () => number;
    /** URL of the Shelly knowledge-base page for this device class, if known. */
    getKnowledgeBaseUrl: () => string | undefined;
    /** The MQTT topic prefix configured for this device (MQTT clients only). */
    getMqttPrefix: () => string;
    /** Whether the adapter currently considers this device online. */
    isOnline: () => boolean;
    /** Performs an authenticated HTTP GET against the device and resolves the raw response body. */
    requestAsync: (url: string) => Promise<string>;
    /** Publishes a value to the device (implemented by the MQTT/CoAP subclasses). */
    publishStateValue: (cmd: string, value: unknown) => void;
}

/**
 * Transforms a value *received from the device* into the value stored in the ioBroker state.
 * Used for `coap_publish_funct`, `mqtt_publish_funct` and `http_publish_funct`. Maybe `async`;
 * the protocol layer awaits it when so. Returning `undefined` skips the state update.
 *
 * @param value - raw, untyped wire payload (see the note in the module doc comment)
 * @param self  - the live {@link ShellyClient}
 */
export type PublishFunct = (value: any, self: ShellyClient) => unknown;

/**
 * Transforms an ioBroker state value being *written by the user* into the payload sent to the
 * device. Used for `http_cmd_funct` and `mqtt_cmd_funct`. Maybe `async`. For Gen1 HTTP the
 * return is typically a query-parameter object; for MQTT it is the (stringified) RPC payload.
 *
 * @param value - the new ioBroker state value
 * @param self  - the live {@link ShellyClient}
 */
export type CmdFunct = (value: any, self: ShellyClient) => unknown;

/**
 * Computes the initial value of a state when objects are (re)created. Called once per
 * `createObjects()` with only the client; see `init_value` for a static alternative.
 */
export type InitFunct = (self: ShellyClient) => ioBroker.StateValue | undefined;

/**
 * Per-protocol mapping for a single state. A {@link DeviceState} carries a `coap` and/or `mqtt`
 * block; the protocol layer reads the block matching the active transport. Not every field is
 * meaningful for every transport (e.g. CoAP has no command function), but they share one shape
 * to keep the device definitions uniform.
 */
export interface ProtocolBlock {
    /** CoAP publish key (sensor id) that triggers an update of this state. */
    coap_publish?: string;
    /** Transforms the CoAP payload into the state value. */
    coap_publish_funct?: PublishFunct;
    /** CoAP command target (rarely used; CoAP has no command transform function). */
    coap_cmd?: string;

    /** MQTT topic whose messages trigger an update of this state. */
    mqtt_publish?: string;
    /** Transforms the MQTT payload into the state value. */
    mqtt_publish_funct?: PublishFunct;
    /** MQTT topic this state publishes to when written. */
    mqtt_cmd?: string;
    /** Transforms the written state value into the MQTT payload. */
    mqtt_cmd_funct?: CmdFunct;

    /** HTTP endpoint polled to obtain this state when the device does not push it. */
    http_publish?: string;
    /** Transforms the HTTP response body into the state value. */
    http_publish_funct?: PublishFunct;
    /** HTTP endpoint called when this state is written (Gen1 only). */
    http_cmd?: string;
    /** Transforms the written state value into HTTP request parameters. */
    http_cmd_funct?: CmdFunct;

    /** Static initial value applied on object creation. */
    init_value?: ioBroker.StateValue;
    /** Dynamic initial value applied on object creation. */
    init_funct?: InitFunct;
    /** When `true`, this state is not created for the given transport. */
    no_display?: boolean;
}

/**
 * One ioBroker state of a device: its `common` definition plus the CoAP/MQTT mappings.
 */
export interface DeviceState {
    /** CoAP (Gen1) mapping for this state. */
    coap?: ProtocolBlock;
    /** MQTT (Gen2+) mapping for this state. */
    mqtt?: ProtocolBlock;
    /** The ioBroker `common` object for the created state. */
    common: ioBroker.StateCommon;
    /** Restricts this state to a specific device mode (e.g. `color` vs `white`). */
    device_mode?: string;
    /** The state id, injected by the protocol layer at runtime (`createObjects()`). */
    state?: string;
}

/**
 * A complete device definition: a map of `stateId` (e.g. `Relay0.Switch`) to its
 * {@link DeviceState}. This is the shape each `devices/**` module exports.
 */
export type DeviceDefinition = Record<string, DeviceState>;
