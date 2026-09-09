import { I18n } from '@iobroker/adapter-core';
import {
    DeviceManagement,
    type ActionContext,
    type ConfigItemAny,
    type DeviceControl,
    type DeviceDetails,
    type DeviceInfo,
    type DeviceLoadContext,
    type DeviceRefresh,
    type DeviceStatus,
    type InstanceDetails,
    type BackEndCommandJsonFormOptions,
    ACTIONS,
} from '@iobroker/dm-utils';
// It must be exported to index in dm-utils
import type { ControlState } from '@iobroker/dm-utils/build/types/base';
import * as crypto from 'node:crypto';
import * as dgram from 'node:dgram';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import * as datapoints from './datapoints';
import type { ShellyAdapter } from '../main';
import { bleGatewayScriptVersion } from './ble-gateway-script';
import type { ShellyAdapterConfig } from './types';

/**
 * Icon of the BLE actions. Action icons are either one of the names known by the device manager or
 * an image - a path relative to the admin is not resolved there, so the SVG is inlined once.
 */
const bleActionIcon = ((): string => {
    try {
        const svg = fs.readFileSync(path.join(__dirname, '..', '..', 'admin', 'icons', 'ble.svg'), 'utf8');
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    } catch {
        return 'settings';
    }
})();

/**
 * Appearance of the instance actions in the toolbar above the device list. The device manager applies
 * `style` as MUI `sx` to the label and tints the icon with `color`, so both have to be set - `color`
 * alone would only change the icon. `primary.light` is resolved from the theme.
 */
const instanceActionStyle = { color: 'primary.light', fontWeight: 600 };
const instanceActionIconColor = '#4dabf5';

class HttpAuthError extends Error {
    constructor() {
        super('Device is password-protected');
        this.name = 'HttpAuthError';
    }
}

/** Digits to round to, per ioBroker role, for energy-related states (power, voltage, current, energy, frequency) */
const ENERGY_ROLE_DIGITS: Record<string, number> = {
    'value.power': 1,
    'value.power.active': 1,
    'value.power.reactive': 1,
    'value.power.consumed': 1,
    'value.power.produced': 1,
    'value.power.consumption': 2, // deprecated, still used by Gen1 devices
    'value.energy': 2,
    'value.energy.active': 2,
    'value.energy.reactive': 2,
    'value.energy.consumed': 2,
    'value.energy.produced': 2,
    'value.voltage': 1,
    'value.current': 2,
    'value.frequency': 2,
};

/** Roles considered "power" for the compact main tile - voltage/current/energy are only shown in the device info panel */
const ENERGY_TILE_ROLES = ['value.power', 'value.power.active', 'value.power.consumed', 'value.power.produced'];

/**
 * Units kept off the compact main tile. 'value.power' is used for both active power (W) and
 * apparent power (VA), so without this a three-phase meter would list every value twice.
 */
const ENERGY_TILE_EXCLUDED_UNITS = ['VA', 'kVA', 'VAR', 'kVAR', 'var', 'kvar'];

/** Group metadata: display name key (for i18n) and representative icon */
const groupMeta: Record<string, { nameKey: string; icon: string }> = {
    relay: { nameKey: 'Relays & Switches', icon: 'adapter/shelly/icons/shellyplus1.png' },
    dimmer: { nameKey: 'Dimmers', icon: 'adapter/shelly/icons/shellydimmerg3.png' },
    plug: { nameKey: 'Plugs', icon: 'adapter/shelly/icons/shellyplusplugs.png' },
    light: { nameKey: 'Lights', icon: 'adapter/shelly/icons/shellybulbduo.png' },
    meter: { nameKey: 'Energy Meters', icon: 'adapter/shelly/icons/shellyem3.png' },
    sensor: { nameKey: 'Sensors', icon: 'adapter/shelly/icons/shellyhtg3.png' },
    cover: { nameKey: 'Shutters & Covers', icon: 'adapter/shelly/icons/shellyshutter.png' },
    input: { nameKey: 'Buttons & Inputs', icon: 'adapter/shelly/icons/shellyplusi4.png' },
    climate: { nameKey: 'Climate', icon: 'adapter/shelly/icons/shellytrv.png' },
    gateway: { nameKey: 'Gateways', icon: 'adapter/shelly/icons/shellyblugw.png' },
    ble: { nameKey: 'BLE Devices', icon: 'adapter/shelly/icons/ble.svg' },
    other: { nameKey: 'Other', icon: 'adapter/shelly/icons/shellyplus1.png' },
};

/**
 * DeviceManager Class
 */
export default class ShellyDeviceManagement extends DeviceManagement<ShellyAdapter> {
    private config: ShellyAdapterConfig;
    private readonly states: { [id: string]: ioBroker.State } = {};
    private readonly objects: { [id: string]: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject } =
        {};

    constructor(adapter: ShellyAdapter) {
        // `true` creates `info.deviceManager` - the channel through which the adapter can update an
        // open device manager. Without it the cards keep the values they had when the list was loaded.
        super(adapter, true);

        this.config = adapter.config;

        this.init().catch(e => this.adapter.log.error(`Cannot init manager: ${e}`));
    }

    private async init(): Promise<void> {
        const devices = await this.adapter.getDevicesAsync();
        const stateObjects = await this.adapter.getStatesOfAsync();
        const states = await this.adapter.getStatesAsync('*');
        for (const device of devices) {
            this.objects[device._id] = device;
        }
        for (const state of stateObjects) {
            this.objects[state._id] = state;
        }
        for (const id in states) {
            this.states[id] = states[id];
        }

        // Set icon on existing devices if not yet set or still using old base64 SVG icon
        for (const device of devices) {
            if (!device.common.icon || String(device.common.icon).startsWith('data:')) {
                const shortDeviceId = device._id.substring(this.adapter.namespace.length + 1);
                const deviceClass = this.states[`${this.adapter.namespace}.${shortDeviceId}.class`]?.val as
                    | string
                    | undefined;
                if (deviceClass) {
                    const iconName = datapoints.getDeviceIcon(deviceClass);
                    await this.adapter.extendObjectAsync(device._id, { common: { icon: `icons/${iconName}.png` } });
                    device.common.icon = `icons/${iconName}.png`;
                }
            }
        }

        await this.adapter.subscribeStatesAsync('*');
        await this.adapter.subscribeObjectsAsync('*');
    }

    protected getInstanceInfo(): InstanceDetails {
        const protocol = this.config.protocol || 'coap';
        const actions =
            protocol === 'coap'
                ? []
                : [
                      {
                          id: 'discover',
                          icon: 'search',
                          title: I18n.getTranslatedObject('Discover devices'),
                          description: I18n.getTranslatedObject('Scan network for Shelly devices via mDNS'),
                          color: instanceActionIconColor,
                          style: instanceActionStyle,
                          timeout: 40_000,
                          handler: async (context: ActionContext): Promise<{ refresh: boolean }> =>
                              await this.handleDiscoverDevices(context),
                      },
                      {
                          id: 'updateBleScripts',
                          icon: bleActionIcon,
                          title: I18n.getTranslatedObject('Update BLE scripts'),
                          description: I18n.getTranslatedObject(
                              'Update the BLE gateway script on all devices which already have it installed',
                          ),
                          color: instanceActionIconColor,
                          style: instanceActionStyle,
                          timeout: 300_000,
                          handler: async (context: ActionContext): Promise<{ refresh: boolean }> =>
                              await this.handleUpdateAllBleScripts(context),
                      },
                  ];

        return {
            apiVersion: 'v3',
            actions,
            smallCards: true,
            communicationStateId: `${this.adapter.namespace}.info.deviceManager`,
        };
    }

    public onStateChange(id: string, state: ioBroker.State | null): void {
        const previous = this.states[id];

        if (state) {
            if (!previous) {
                // trigger DM update
                this.states[id] = state;
            } else if (previous.val !== state.val) {
                // trigger DM update
                this.states[id] = state;
            }
        } else if (previous) {
            // trigger DM update
            delete this.states[id];
        }

        // An open device manager does not poll, so a device which goes offline would keep its green
        // connection symbol until the list is reloaded. Push the new status instead.
        if (id.endsWith('.online') && previous?.val !== state?.val) {
            const deviceId = id.substring(0, id.length - '.online'.length);

            this.sendCommandToGui({
                command: 'statusUpdate',
                deviceId,
                status: this.buildDeviceStatus(deviceId.substring(this.adapter.namespace.length + 1)),
            }).catch((e: unknown) => this.adapter.log.debug(`[DeviceManager] Cannot update GUI: ${String(e)}`));
        }
    }

    /**
     * Connection, signal strength and battery of a device, as shown in the header of its card.
     *
     * @param shortDeviceId device id without the namespace, e.g. `SNSN-0013A#a1b2c3#1`
     */
    private buildDeviceStatus(shortDeviceId: string): DeviceStatus {
        const ns = this.adapter.namespace;
        const isOnline = !!this.states[`${ns}.${shortDeviceId}.online`]?.val;

        return {
            connection: isOnline ? 'connected' : 'disconnected',
            rssi: isOnline ? ((this.states[`${ns}.${shortDeviceId}.rssi`]?.val as number) ?? undefined) : undefined,
            battery:
                (this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`]?.val as number) ??
                (this.states[`${ns}.${shortDeviceId}.sensor.battery`]?.val as number) ??
                (this.states[`${ns}.${shortDeviceId}.battery`]?.val as number) ??
                undefined,
        };
    }

    public onObjectChange(
        id: string,
        obj: ioBroker.DeviceObject | ioBroker.StateObject | ioBroker.ChannelObject | null,
    ): void {
        if (obj) {
            this.objects[id] = obj;
        } else {
            delete this.objects[id];
        }
    }

    /**
     * Load all shelly devices
     *
     * @param context
     */
    async loadDevices(context: DeviceLoadContext<string>): Promise<void> {
        for (const deviceId in this.objects) {
            const device = this.objects[deviceId];
            if (device.type !== 'device') {
                continue;
            }
            const shortDeviceId = device._id.substring(this.adapter.namespace.length + 1);

            const ns = this.adapter.namespace;
            const isBle = shortDeviceId.startsWith('ble.');
            const isOnline = isBle || !!this.states[`${ns}.${shortDeviceId}.online`]?.val;
            const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val as string | undefined;
            const firmwareUpdate = this.states[`${ns}.${shortDeviceId}.firmware`]?.val as boolean | undefined;
            const firmwareVersion = this.states[`${ns}.${shortDeviceId}.version`]?.val as string | undefined;
            const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val as number | undefined;

            const battery = this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`]
                ? (this.states[`${ns}.${shortDeviceId}.DevicePower0.BatteryPercent`].val as number)
                : (this.states[`${ns}.${shortDeviceId}.sensor.battery`]?.val as number) ||
                  (this.states[`${ns}.${shortDeviceId}.battery`]?.val as number) ||
                  undefined;

            const rssi = isOnline
                ? (this.states[`${ns}.${shortDeviceId}.rssi`]?.val as number) || undefined
                : undefined;

            const bleInfo = isBle ? this.classifyBleDevice(shortDeviceId) : undefined;

            const deviceClass = this.states[`${ns}.${shortDeviceId}.class`]?.val as string | undefined;
            const group = this.getDeviceGroup(deviceClass, isBle);

            const res: DeviceInfo<string> = {
                id: device._id,
                identifier: hostname || undefined,
                name: device.common.name,
                icon: isBle ? `adapter/shelly/icons/${bleInfo!.icon}.png` : this.getIcon(device._id),
                color: !isBle && !isOnline ? '#fff' : undefined,
                backgroundColor: !isBle && !isOnline ? '#f44336' : undefined,
                group,
                model: isBle
                    ? bleInfo!.model
                    : (this.states[`${ns}.${shortDeviceId}.model`]?.val as string) ||
                      (this.states[`${ns}.${shortDeviceId}.type`]?.val as string) ||
                      I18n.getTranslatedObject('unknown'),
                status: {
                    connection: isBle ? undefined : isOnline ? 'connected' : 'disconnected',
                    rssi,
                    battery,
                },
                // Firmware update indicator. BLE devices are updated through their gateway, not here.
                // `available` is read live from the firmware state, so the indicator stays in sync
                // without a full device-list refresh and the device can be filtered by "update available".
                update: isBle
                    ? undefined
                    : {
                          available: { stateId: `${ns}.${shortDeviceId}.firmware` },
                          version: firmwareVersion || undefined,
                      },
                hasDetails: true,
                customInfo: this.buildCustomInfo(device._id, shortDeviceId, isBle),
                controls: await this.buildControls(shortDeviceId, isBle),
                actions: [
                    {
                        id: 'rename',
                        icon: 'edit',
                        description: I18n.getTranslatedObject('Rename this device'),
                        handler: async (
                            deviceId: string,
                            context: ActionContext,
                        ): Promise<{
                            refresh: DeviceRefresh;
                        }> => await this.handleRenameDevice(deviceId, context),
                    },
                    ...(this.states[`${this.adapter.namespace}.${shortDeviceId}.hostname`]?.val
                        ? [
                              {
                                  id: 'web',
                                  icon: 'web',
                                  description: I18n.getTranslatedObject('Open device interface'),
                                  url: `http://${
                                      this.states[`${this.adapter.namespace}.${shortDeviceId}.hostname`]?.val as string
                                  }`,
                              },
                          ]
                        : []),
                    ...(isOnline && firmwareUpdate
                        ? [
                              {
                                  id: ACTIONS.UPDATE,
                                  icon: 'update' as const,
                                  description: I18n.getTranslatedObject('Update firmware'),
                                  handler: async (
                                      deviceId: string,
                                      context: ActionContext,
                                  ): Promise<{ refresh: DeviceRefresh }> =>
                                      await this.handleFirmwareUpdate(deviceId, context),
                              },
                          ]
                        : []),
                    // The BLE gateway script needs MQTT (it publishes the advertisements by MQTT) and
                    // the script API, which only exists on Gen2+ devices.
                    ...(isOnline && !isBle && (gen ?? 0) >= 2 && this.config.protocol !== 'coap'
                        ? [
                              {
                                  id: 'bleScript',
                                  icon: bleActionIcon,
                                  description: I18n.getTranslatedObject('Install or update the BLE gateway script'),
                                  confirmation: I18n.getTranslatedObject(
                                      'The BLE gateway script will be written to the device. Continue?',
                                  ),
                                  timeout: 60_000,
                                  handler: async (
                                      deviceId: string,
                                      context: ActionContext,
                                  ): Promise<{ refresh: DeviceRefresh }> =>
                                      await this.handleBleScriptInstall(deviceId, context),
                              },
                          ]
                        : []),
                    // Deleting is only offered for devices that are currently unreachable (offline).
                    // Reachable devices would immediately recreate their objects, so they must not be deletable here.
                    ...(!isOnline
                        ? [
                              {
                                  id: 'delete',
                                  icon: 'delete' as const,
                                  description: I18n.getTranslatedObject('Delete this unreachable device'),
                                  handler: async (
                                      deviceId: string,
                                      context: ActionContext,
                                  ): Promise<{ refresh: DeviceRefresh } | { delete: string }> =>
                                      await this.handleDeleteDevice(deviceId, context),
                              },
                          ]
                        : []),
                ],
            };

            context.addDevice(res);
        }
    }

    getDeviceDetails(deviceId: string): DeviceDetails<string> | null {
        const device = this.objects[deviceId];
        if (device?.type !== 'device') {
            return null;
        }

        const shortDeviceId = device._id.substring(this.adapter.namespace.length + 1);
        const ns = this.adapter.namespace;
        const isBle = shortDeviceId.startsWith('ble.');

        if (isBle) {
            return this.getBleDeviceDetails(deviceId, shortDeviceId);
        }

        const hostname = this.states[`${ns}.${shortDeviceId}.hostname`]?.val as string | undefined;
        const version = this.states[`${ns}.${shortDeviceId}.version`]?.val as string | undefined;
        const model = this.states[`${ns}.${shortDeviceId}.model`]?.val as string | undefined;
        const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val as number | undefined;
        const id = this.states[`${ns}.${shortDeviceId}.id`]?.val as string | undefined;
        const type = this.states[`${ns}.${shortDeviceId}.type`]?.val as string | undefined;
        const rssi = this.states[`${ns}.${shortDeviceId}.rssi`]?.val as number | undefined;
        const uptime = this.states[`${ns}.${shortDeviceId}.uptime`]?.val as number | undefined;
        const firmware = this.states[`${ns}.${shortDeviceId}.firmware`]?.val as boolean | undefined;
        const protocol = this.states[`${ns}.${shortDeviceId}.protocol`]?.val as string | undefined;

        const items: Record<string, ConfigItemAny> = {};

        if (hostname) {
            items._deviceLink = {
                // @ts-expect-error staticLink is OK
                type: 'staticLink',
                href: `http://${hostname}`,
                label: I18n.getTranslatedObject('Open device web interface'),
                button: true,
                icon: 'web',
                newLine: true,
            };
        }

        if (id) {
            items.id = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Device ID'),
                data: id,
                addColon: true,
                copyToClipboard: true,
            };
        }

        if (model) {
            items.model = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Model'),
                data: model,
                addColon: true,
            };
        }

        if (type) {
            items.deviceType = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Type'),
                data: type,
                addColon: true,
            };
        }

        if (gen) {
            items.gen = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Generation'),
                data: gen,
                addColon: true,
            };
        }

        if (hostname) {
            items.hostname = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('IP address'),
                data: hostname,
                addColon: true,
                copyToClipboard: true,
            };
        }

        if (version) {
            items.version = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Firmware version'),
                data: version,
                addColon: true,
            };
        }

        if (firmware !== undefined) {
            items.firmware = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Firmware update available'),
                data: firmware ? '✓' : '✗',
                addColon: true,
            };
        }

        if (protocol) {
            items.protocol = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Protocol'),
                data: protocol,
                addColon: true,
            };
        }

        const bleScriptVersion = this.states[`${ns}.${shortDeviceId}.BLE.scriptVersion`]?.val as string | undefined;
        if (bleScriptVersion) {
            items.bleScriptVersion = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('BLE gateway script'),
                // An outdated script is shown as "1.3.0 → 1.4.0" to point at the available update
                data:
                    bleScriptVersion === bleGatewayScriptVersion
                        ? bleScriptVersion
                        : `${bleScriptVersion} → ${bleGatewayScriptVersion}`,
                addColon: true,
            };
        }

        if (rssi !== undefined) {
            items.rssi = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('RSSI'),
                data: rssi,
                unit: 'dBm',
                addColon: true,
            };
        }

        if (uptime !== undefined) {
            items.uptime = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Uptime'),
                data: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                addColon: true,
            };
        }

        // Power, voltage, current and energy: shown here in full (the main tile only shows power,
        // to keep it compact), for any channel that reports them, based on the state's role rather
        // than a fixed list of channel names, so this works for every device generation.
        Object.assign(items, this.buildEnergyValueItems(shortDeviceId, Object.keys(ENERGY_ROLE_DIGITS)));

        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items,
            },
        };
    }

    /**
     * Build customInfo/details items for energy-related states (power, voltage, current, energy,
     * frequency) of a device, based on the state's ioBroker role. Works for any channel naming
     * scheme, so it applies automatically to every device generation that reports these values.
     *
     * @param shortDeviceId device id without adapter namespace
     * @param allowedRoles roles to include (a subset of the keys of ENERGY_ROLE_DIGITS)
     * @param excludedUnits units to skip, e.g. to keep apparent power off the main tile
     */
    private buildEnergyValueItems(
        shortDeviceId: string,
        allowedRoles: readonly string[],
        excludedUnits?: readonly string[],
    ): Record<string, ConfigItemAny> {
        const prefix = `${this.adapter.namespace}.${shortDeviceId}.`;
        const items: Record<string, ConfigItemAny> = {};

        const matches: { suffix: string; role: string; common: ioBroker.StateCommon }[] = [];

        for (const stateId in this.states) {
            if (!stateId.startsWith(prefix)) {
                continue;
            }
            const common = this.objects[stateId]?.common as ioBroker.StateCommon | undefined;
            const role = common?.role;
            if (!role || !allowedRoles.includes(role) || !(role in ENERGY_ROLE_DIGITS)) {
                continue;
            }
            if (excludedUnits && common.unit && excludedUnits.includes(common.unit)) {
                continue;
            }

            matches.push({ suffix: stateId.substring(prefix.length), role, common });
        }

        // The key order of this.states is not guaranteed, so sort to keep the panel order stable
        matches.sort((a, b) => a.suffix.localeCompare(b.suffix, undefined, { numeric: true }));

        for (const { suffix, role, common } of matches) {
            const channel = suffix.substring(0, suffix.lastIndexOf('.'));
            const colon = channel.indexOf(':');
            // 'Relay0' -> 'Relay 0'; 'EM1:0' -> 'EM1 0', where the colon already separates the instance
            const channelLabel = (
                colon >= 0
                    ? `${channel.substring(0, colon)} ${channel.substring(colon + 1)}`
                    : channel.replace(/([a-zA-Z])([0-9]+)$/, '$1 $2')
            ).trim();

            items[`energy_${suffix.replace(/[.:]/g, '_')}`] = {
                type: 'state',
                oid: `${shortDeviceId}.${suffix}`,
                control: 'text',
                unit: common.unit,
                digits: ENERGY_ROLE_DIGITS[role],
                label: this.buildEnergyLabel(channelLabel, suffix, common.name),
                size: 12,
                style: { opacity: 0.7 },
            };
        }

        return items;
    }

    /**
     * Compose the label of an energy item as `<channel> <datapoint name>`.
     *
     * common.name of a created object is always a translation object (objectHelper resolves the
     * English key on creation), so the channel prefix has to be merged into every language.
     * Multi-phase meters name all phases alike (VoltageA/B/C are all called "Voltage"), therefore a
     * trailing phase letter of the state id is appended unless the name already carries it ('Current N').
     *
     * @param channelLabel readable channel name, e.g. 'EM 0'
     * @param suffix state id without the device prefix, e.g. 'EM0.VoltageA'
     * @param name common.name of the state object
     */
    private buildEnergyLabel(
        channelLabel: string,
        suffix: string,
        name: ioBroker.StringOrTranslated,
    ): ioBroker.StringOrTranslated {
        const leaf = suffix.substring(suffix.lastIndexOf('.') + 1);
        const phaseMatch = leaf.match(/[a-z]([A-Z])$/);

        const compose = (text: string): string => {
            const phase = phaseMatch && !text.trim().endsWith(phaseMatch[1]) ? ` ${phaseMatch[1]}` : '';
            return `${channelLabel} ${text}${phase}`.trim();
        };

        if (typeof name === 'string') {
            return compose(name);
        }

        const translated: ioBroker.Translated = { en: compose(name.en) };
        for (const [lang, text] of Object.entries(name)) {
            translated[lang as ioBroker.Languages] = compose(text);
        }

        return translated;
    }

    private getBleDeviceDetails(deviceId: string, shortDeviceId: string): DeviceDetails<string> {
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const items: Record<string, ConfigItemAny> = {};

        // Collect all states for this BLE device and show them as staticInfo
        const stateEntries: { name: string; obj: ioBroker.StateObject }[] = [];

        for (const id in this.objects) {
            if (!id.startsWith(prefix) || this.objects[id].type !== 'state') {
                continue;
            }
            stateEntries.push({
                name: id.substring(prefix.length),
                obj: this.objects[id],
            });
        }

        stateEntries.sort((a, b) => a.name.localeCompare(b.name));

        for (const entry of stateEntries) {
            const state = this.states[`${prefix}${entry.name}`];
            const common = entry.obj.common;
            const val = state?.val;

            if (val === undefined || val === null || entry.name === 'ReceivedBy' || entry.name === 'pid') {
                continue;
            }

            // Format the label from state name (e.g. "temperature" -> "Temperature")
            const label = entry.name.charAt(0).toUpperCase() + entry.name.slice(1).replace(/_/g, ' ');

            // Format value: use common.states mapping if available, otherwise format by type
            let displayVal: string | number | boolean;
            const states = common.states as Record<string, string> | undefined;
            if (states && String(val) in states) {
                displayVal = states[String(val)] !== undefined ? `${states[String(val)]}(${String(val)})` : String(val);
            } else if (typeof val === 'number') {
                displayVal = common.unit
                    ? `${Math.round(val * 100) / 100} ${common.unit}`
                    : Math.round(val * 100) / 100;
            } else if (typeof val === 'boolean') {
                displayVal = val ? '✓' : '✗';
            } else {
                displayVal = String(val);
            }

            items[entry.name] = {
                type: 'staticInfo',
                label,
                data: displayVal,
                addColon: true,
            };
        }

        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items,
            },
        };
    }

    private classifyBleDevice(shortDeviceId: string): { model: string; icon: string } {
        const prefix = `${this.adapter.namespace}.${shortDeviceId}.`;
        const stateNames = new Set<string>();

        for (const id in this.states) {
            if (id.startsWith(prefix)) {
                stateNames.add(id.substring(prefix.length));
            }
        }
        // Also check objects for states that may not have a value yet
        for (const id in this.objects) {
            if (id.startsWith(prefix) && this.objects[id].type === 'state') {
                stateNames.add(id.substring(prefix.length));
            }
        }

        if (stateNames.has('precipitation') || stateNames.has('gust_speed') || stateNames.has('rain_status')) {
            return { model: 'BLU Outdoor Weather Station', icon: 'ble-ht' };
        }
        if (stateNames.has('motion')) {
            return { model: 'BLU Motion Sensor', icon: 'ble-motion' };
        }
        if (stateNames.has('window') || stateNames.has('rotation')) {
            return { model: 'BLU Door/Window Sensor', icon: 'ble-door-window' };
        }
        if (stateNames.has('humidity') && stateNames.has('temperature')) {
            return { model: 'BLU H&T Sensor', icon: 'ble-ht' };
        }
        if (stateNames.has('button_4')) {
            return { model: 'BLU Button Tough 4', icon: 'ble-button4' };
        }
        if (stateNames.has('button_1')) {
            return { model: 'BLU Button 1', icon: 'ble-button1' };
        }

        return { model: 'Bluetooth', icon: 'ble-button1' };
    }

    private getDeviceGroup(
        deviceClass: string | undefined,
        isBle: boolean,
    ): { key: string; name: ioBroker.StringOrTranslated; icon?: string } {
        const groupKey = isBle ? 'ble' : datapoints.getDeviceGroupByClass(deviceClass || '');
        const meta = groupMeta[groupKey] || groupMeta.other;

        return {
            key: groupKey,
            name: I18n.getTranslatedObject(meta.nameKey),
            icon: meta.icon,
        };
    }

    /**
     * Age of a timestamp in a short readable form: `45 s`, `12 min`, `3 h`, `2 d`.
     *
     * @param ts timestamp in milliseconds
     */
    private static formatAge(ts: number): string {
        const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
        if (seconds < 60) {
            return `${seconds} s`;
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours} h`;
        }

        return `${Math.floor(hours / 24)} d`;
    }

    private buildCustomInfo(
        deviceId: string,
        shortDeviceId: string,
        isBle: boolean,
    ): DeviceDetails<string> | undefined {
        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const items: Record<string, ConfigItemAny> = {};

        if (isBle) {
            // BLE devices use direct state names
            if (this.states[`${prefix}temperature`] !== undefined) {
                items.temperature = {
                    type: 'state',
                    oid: `${shortDeviceId}.temperature`,
                    control: 'text',
                    unit: '°C',
                    digits: 2,
                    label: I18n.getTranslatedObject('Temperature'),
                    size: 12,
                    style: {
                        opacity: 0.7,
                    },
                };
            }
            if (this.states[`${prefix}humidity`] !== undefined) {
                items.humidity = {
                    type: 'state',
                    oid: `${shortDeviceId}.humidity`,
                    control: 'text',
                    unit: '%',
                    digits: 1,
                    label: I18n.getTranslatedObject('Humidity'),
                    size: 12,
                    style: { opacity: 0.7 },
                };
            }
            if (this.states[`${prefix}illuminance`] !== undefined) {
                items.illuminance = {
                    type: 'state',
                    oid: `${shortDeviceId}.illuminance`,
                    control: 'text',
                    unit: 'lux',
                    digits: 0,
                    label: I18n.getTranslatedObject('Illuminance'),
                    size: 12,
                    style: { opacity: 0.7 },
                };
            }
            // BLE boolean/alarm sensor states
            const bleBoolSensors: {
                stateId: string;
                key: string;
                label: string;
                trueText: string;
                falseText: string;
                trueColor: string;
            }[] = [
                {
                    stateId: 'motion',
                    key: 'motion',
                    label: 'Motion',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'green',
                },
                {
                    stateId: 'door',
                    key: 'door',
                    label: 'Door',
                    trueText: 'Opened',
                    falseText: 'Closed',
                    trueColor: 'orange',
                },
                {
                    stateId: 'window',
                    key: 'window',
                    label: 'Window',
                    trueText: 'Opened',
                    falseText: 'Closed',
                    trueColor: 'orange',
                },
                {
                    stateId: 'smoke',
                    key: 'smoke',
                    label: 'Smoke',
                    trueText: 'Alarm',
                    falseText: 'OK',
                    trueColor: 'red',
                },
                {
                    stateId: 'vibration',
                    key: 'vibration',
                    label: 'Vibration',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'orange',
                },
            ];

            for (const sensor of bleBoolSensors) {
                if (this.states[`${prefix}${sensor.stateId}`] !== undefined) {
                    items[sensor.key] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${sensor.stateId}`,
                        readOnly: true,
                        options: [
                            { label: I18n.getTranslatedObject(sensor.falseText), value: 0 },
                            { label: I18n.getTranslatedObject(sensor.trueText), value: 1, color: sensor.trueColor },
                        ],
                        trueText: I18n.getTranslatedObject(sensor.trueText),
                        falseText: I18n.getTranslatedObject(sensor.falseText),
                        trueTextStyle: { color: sensor.trueColor },
                        blinkOnUpdate: true,
                        label: I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
            }

            // BLE numeric sensors
            if (this.states[`${prefix}rotation`] !== undefined) {
                items.rotation = {
                    type: 'state',
                    oid: `${shortDeviceId}.rotation`,
                    control: 'text',
                    unit: '°',
                    label: I18n.getTranslatedObject('Tilt'),
                    size: 12,
                    style: { opacity: 0.7 },
                };
            }
        } else {
            // Gen1 sensor paths
            // Gen1 numeric sensors
            const gen1NumericSensors: { stateId: string; key: string; label: string; unit: string; digits?: number }[] =
                [
                    { stateId: 'tmp.temperatureC', key: 'temperature', label: 'Temperature', unit: '°C', digits: 2 },
                    {
                        stateId: 'sensor.temperatureC',
                        key: 'sensorTemperature',
                        label: 'Temperature',
                        unit: '°C',
                        digits: 2,
                    },
                    { stateId: 'hum.value', key: 'humidity', label: 'Humidity', unit: '%', digits: 1 },
                    { stateId: 'sensor.humidity', key: 'sensorHumidity', label: 'Humidity', unit: '%', digits: 1 },
                    { stateId: 'sensor.lux', key: 'lux', label: 'Illuminance', unit: 'lux', digits: 0 },
                    { stateId: 'sensor.tilt', key: 'tilt', label: 'Tilt', unit: '°', digits: 0 },
                    { stateId: 'tmp.valvePosition', key: 'valve', label: 'Valve position', unit: '%', digits: 0 },
                ];

            for (const sensor of gen1NumericSensors) {
                if (this.states[`${prefix}${sensor.stateId}`] !== undefined) {
                    items[sensor.key] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${sensor.stateId}`,
                        control: 'text',
                        unit: sensor.unit,
                        digits: sensor.digits,
                        label: I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
            }

            // Gen1 boolean sensors (true/false values - use trueText/falseText)
            const gen1BoolSensors: {
                stateId: string;
                key: string;
                label: string;
                trueText: string;
                falseText: string;
                trueColor: string;
            }[] = [
                {
                    stateId: 'sensor.motion',
                    key: 'motion',
                    label: 'Motion',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'green',
                },
                {
                    stateId: 'sensor.door',
                    key: 'door',
                    label: 'Door',
                    trueText: 'Opened',
                    falseText: 'Closed',
                    trueColor: 'orange',
                },
                {
                    stateId: 'sensor.vibration',
                    key: 'vibration',
                    label: 'Vibration',
                    trueText: 'Detected',
                    falseText: 'Clear',
                    trueColor: 'orange',
                },
                {
                    stateId: 'sensor.flood',
                    key: 'flood',
                    label: 'Flood',
                    trueText: 'Alarm',
                    falseText: 'OK',
                    trueColor: 'red',
                },
                {
                    stateId: 'smoke.value',
                    key: 'smoke',
                    label: 'Smoke',
                    trueText: 'Alarm',
                    falseText: 'OK',
                    trueColor: 'red',
                },
            ];

            for (const sensor of gen1BoolSensors) {
                if (this.states[`${prefix}${sensor.stateId}`] !== undefined) {
                    items[sensor.key] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${sensor.stateId}`,
                        options: [
                            { label: I18n.getTranslatedObject(sensor.falseText), value: 0 },
                            { label: I18n.getTranslatedObject(sensor.trueText), value: 1, color: sensor.trueColor },
                        ],
                        trueText: I18n.getTranslatedObject(sensor.trueText),
                        falseText: I18n.getTranslatedObject(sensor.falseText),
                        trueTextStyle: { color: sensor.trueColor },
                        blinkOnUpdate: true,
                        label: I18n.getTranslatedObject(sensor.label),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }
            }

            // Gen2+: scan for Temperature{id}.Celsius, Humidity{id}.Relative, Illuminance{id}.Lux
            for (const stateId of Object.keys(this.states)) {
                if (!stateId.startsWith(prefix)) {
                    continue;
                }
                const suffix = stateId.substring(prefix.length);

                const tempMatch = suffix.match(/^(Temperature\d+)\.Celsius$/);
                if (tempMatch) {
                    items[`temp_${tempMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '°C',
                        digits: 2,
                        label: I18n.getTranslatedObject('Temperature'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }

                const humMatch = suffix.match(/^(Humidity\d+)\.Relative$/);
                if (humMatch) {
                    items[`hum_${humMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '%',
                        digits: 1,
                        label: I18n.getTranslatedObject('Humidity'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }

                const luxMatch = suffix.match(/^(Illuminance\d+)\.Lux$/);
                if (luxMatch) {
                    items[`lux_${luxMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: 'lux',
                        digits: 0,
                        label: I18n.getTranslatedObject('Illuminance'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }

                // Flood alarm
                const floodMatch = suffix.match(/^(Flood\d+)\.alarm$/);
                if (floodMatch) {
                    items[`flood_${floodMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        readOnly: true,
                        options: [
                            { label: I18n.getTranslatedObject('OK'), value: 0 },
                            { label: I18n.getTranslatedObject('Alarm'), value: 1, color: 'red' },
                        ],
                        trueText: I18n.getTranslatedObject('OK'),
                        falseText: I18n.getTranslatedObject('Alarm'),
                        trueTextStyle: { color: 'red' },
                        blinkOnUpdate: true,
                        label: I18n.getTranslatedObject('Flood'),
                        size: 12,
                        style: { opacity: 0.7 },
                    };
                }

                // Cover position
                const coverMatch = suffix.match(/^(Cover\d+)\.Position$/);
                if (coverMatch) {
                    items[`cover_${coverMatch[1]}`] = {
                        type: 'state',
                        oid: `${shortDeviceId}.${suffix}`,
                        control: 'text',
                        unit: '%',
                        label: I18n.getTranslatedObject('Cover position'),
                        size: 12,
                        style: {
                            opacity: 0.7,
                        },
                    };
                }
            }

            // Power values are shown directly on the compact main tile so it does not get
            // overloaded; voltage, current and energy are shown separately in the device info panel.
            Object.assign(
                items,
                this.buildEnergyValueItems(shortDeviceId, ENERGY_TILE_ROLES, ENERGY_TILE_EXCLUDED_UNITS),
            );
        }

        // "Last seen": for a BLE device the time of the last received advertisement, for a normal
        // device the time it went offline. An online device is reachable right now, there is nothing
        // to show for it.
        const lastSeenTs = isBle
            ? this.states[`${prefix}receivedBy`]?.ts
            : this.states[`${prefix}online`]?.val === false
              ? this.states[`${prefix}online`]?.lc
              : undefined;

        if (lastSeenTs) {
            items.lastSeen = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('Last seen'),
                data: I18n.translate('%s ago', ShellyDeviceManagement.formatAge(lastSeenTs)),
                addColon: true,
                size: 12,
                style: { opacity: 0.7 },
            };
        }

        // Version of the BLE gateway script, so it can be seen without opening the device details
        const bleScriptVersion = this.states[`${prefix}BLE.scriptVersion`]?.val as string | undefined;
        if (!isBle && bleScriptVersion) {
            items.bleScriptVersion = {
                type: 'staticInfo',
                label: I18n.getTranslatedObject('BLE gateway script'),
                data:
                    bleScriptVersion === bleGatewayScriptVersion
                        ? bleScriptVersion
                        : `${bleScriptVersion} → ${bleGatewayScriptVersion}`,
                addColon: true,
                size: 12,
                style: { opacity: 0.7 },
            };
        }

        if (Object.keys(items).length === 0) {
            return undefined;
        }

        return {
            id: deviceId,
            schema: {
                type: 'panel',
                items,
            },
        };
    }

    private async buildControls(shortDeviceId: string, isBle: boolean): Promise<DeviceControl<string>[]> {
        if (isBle) {
            return [];
        }

        const ns = this.adapter.namespace;
        const prefix = `${ns}.${shortDeviceId}.`;
        const controls: DeviceControl<string>[] = [];
        let labelForFirstControl: ioBroker.StringOrTranslated | undefined;

        // Check device mode to filter controls for multi-mode devices
        const deviceMode = this.states[`${ns}.${shortDeviceId}.Sys.deviceMode`]?.val as string | undefined;

        // Map device mode to allowed channel prefixes
        const allowedChannels: Record<string, string[]> = {
            rgb: ['RGB'],
            rgbw: ['RGBW'],
            light: ['Light'],
            color: ['lights'],
            white: ['white'],
            switch: ['Relay'],
            relay: ['Relay'],
            cover: ['Cover'],
            roller: ['Relay'], // Gen1 roller mode still uses Relay channels
        };

        const allowed = deviceMode ? allowedChannels[deviceMode] : undefined;

        const ownStates: string[] = [];
        const usedStates: string[] = [];
        // Collect all switch states for this device
        const keys = Object.keys(this.objects);
        for (const stateId of keys) {
            if (!stateId.startsWith(prefix)) {
                continue;
            }

            const obj = this.objects[stateId];
            if (obj?.type !== 'state') {
                continue;
            }
            ownStates.push(obj._id);
            const common = obj.common;
            if (
                !common ||
                common.role !== 'switch' ||
                common.type !== 'boolean' ||
                common.write === false ||
                common.read === false ||
                usedStates.includes(stateId)
            ) {
                continue;
            }

            const suffix = stateId.substring(prefix.length);

            // Match Relay{id}.Switch, Light{id}.Switch, RGB{id}.Switch, RGBW{id}.Switch
            const match = suffix.match(/^(Relay|Light|RGB|RGBW|lights|white)(\d*)\.Switch$/);
            if (!match) {
                continue;
            }

            const channelType = match[1];

            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }
            const channelIdx = match[2];

            // Build a label like "Relay 0", "Light 1", etc.
            let label: string;
            if (channelType === 'lights') {
                label = 'Light';
            } else if (channelType === 'white') {
                label = `White ${channelIdx}`;
            } else {
                label = channelIdx ? `${channelType} ${channelIdx}` : channelType;
            }

            const control: DeviceControl<string> = {
                id: suffix.replace('.', '_'),
                type: 'switch',
                stateId: `${shortDeviceId}.${suffix}`,
                state:
                    (await this.adapter.getForeignStateAsync(obj._id)) ||
                    ({ val: null, ts: Date.now(), ack: true } as ioBroker.State),
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };
            usedStates.push(obj._id);
            if (!controls.length) {
                // If control has no label, it will be shown directly on
                labelForFirstControl = label;
                controls.push(control);
                continue;
            } else if (controls.length === 1 && labelForFirstControl) {
                controls[0].label = labelForFirstControl;
            }
            control.label = label;
            controls.push(control);
        }

        // Collect slider states (brightness, cover position)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common as ioBroker.StateCommon;
            if (
                common?.type !== 'number' ||
                common?.write === false ||
                (common.max === undefined && common.unit !== '%') ||
                usedStates.includes(stateId)
            ) {
                continue;
            }

            const role = common.role || '';
            if (!role.startsWith('level.') && role !== 'level') {
                continue;
            }

            const suffix = stateId.substring(prefix.length);

            // Match brightness: Light{id}.Brightness, RGB{id}.Brightness, RGBW{id}.Brightness, lights.brightness, white{id}.brightness
            // Match cover: Cover{id}.Position
            const match = suffix.match(
                /^(Light|RGB|RGBW|lights|white|Cover|Number)(\d*)\.(Brightness|brightness|Position|Value)$/,
            );
            if (!match) {
                continue;
            }

            const channelType = match[1];
            const channelIdx = match[2];

            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }

            let label: string;
            if (channelType === 'Cover') {
                label = channelIdx ? `Cover ${channelIdx}` : 'Cover';
            } else if (channelType === 'lights') {
                label = 'Brightness';
            } else if (channelType === 'white') {
                label = `White ${channelIdx}`;
            } else {
                label = channelIdx ? `${channelType} ${channelIdx}` : channelType;
            }

            usedStates.push(obj._id);
            const control: DeviceControl<string> = {
                id: suffix.replace('.', '_'),
                type: 'slider',
                stateId: `${shortDeviceId}.${suffix}`,
                min: common.min ?? 0,
                max: common.max ?? 100,
                unit: common.unit || (common.max ?? 100) === 100 ? '%' : undefined,
                label,
                state:
                    (await this.adapter.getForeignStateAsync(obj._id)) ||
                    ({ val: null, ts: Date.now(), ack: true } as ioBroker.State),
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };

            controls.push(control);
        }

        // Collect color controls (hex color states)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common as ioBroker.StateCommon;
            if (common?.type !== 'string' || !common?.write || usedStates.includes(stateId)) {
                continue;
            }

            const suffix = stateId.substring(prefix.length);

            // Match Gen2+: RGB{id}.Color, RGBW{id}.Color; Gen1: lights.rgbw
            const match = suffix.match(/^(RGB|RGBW)(\d*)\.Color$/) || suffix.match(/^(lights)\.(rgbw)$/);
            if (!match) {
                continue;
            }

            const channelType = match[1];

            // Filter by device mode if set
            if (allowed && !allowed.includes(channelType)) {
                continue;
            }

            const control: DeviceControl<string> = {
                id: suffix.replace('.', '_'),
                type: 'color',
                stateId: `${shortDeviceId}.${suffix}`,
                label: I18n.getTranslatedObject('Color'),
                state:
                    (await this.adapter.getForeignStateAsync(obj._id)) ||
                    ({ val: null, ts: Date.now(), ack: true } as ioBroker.State),
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };

            controls.push(control);
        }

        let group: DeviceControl<string> | null = {
            id: 'group_settings',
            type: 'group',
            label: I18n.getTranslatedObject('Settings'),
        };

        // Collect writable number states without common.max (not sliders)
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common as ioBroker.StateCommon;
            if (
                common?.write === false ||
                (common.type !== 'number' && common.type !== 'string') ||
                usedStates.includes(stateId)
            ) {
                continue;
            }

            const suffix = stateId.substring(prefix.length);

            // Skip states already handled above
            if (controls.some(c => c.id === suffix.replace('.', '_'))) {
                continue;
            }

            // Extract channel type for device mode filtering
            const channelMatch = suffix.match(/^(Relay|Light|RGB|RGBW|lights|white|Cover)(\d*)\./);
            if (channelMatch) {
                const channelType = channelMatch[1];
                if (allowed && !allowed.includes(channelType)) {
                    continue;
                }
            }

            // Build label from state name: "Relay0.transition" → "Relay 0 transition"
            const label = suffix.replace(/(\d+)/, ' $1 ').replace(/\./g, ' ').trim();

            let options: { label: string; value: string }[] | undefined;
            if (common.states) {
                if (Array.isArray(common.states)) {
                    options = [];
                    common.states.forEach((state: string) => options!.push({ value: state, label: state }));
                } else {
                    options = [];
                    Object.keys(common.states).forEach(key =>
                        options!.push({
                            value: key,
                            label: String((common.states as Record<string, string>)[key]),
                        }),
                    );
                }
            }
            usedStates.push(obj._id);

            const control: DeviceControl<string> = {
                group: 'group_settings',
                id: suffix.replace('.', '_'),
                type: options ? 'select' : common.type === 'number' ? 'number' : 'text',
                stateId: `${shortDeviceId}.${suffix}`,
                min: common.min,
                max: common.max,
                unit: common.unit,
                options,
                label,
                state:
                    (await this.adapter.getForeignStateAsync(obj._id)) ||
                    ({ val: null, ts: Date.now(), ack: true } as ioBroker.State),
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };
            if (group) {
                controls.push(group);
                group = null;
            }
            controls.push(control);
        }

        // Collect buttons
        for (const stateId of ownStates) {
            const obj = this.objects[stateId];
            const common = obj.common as ioBroker.StateCommon;
            if (common?.write === false || common.type !== 'boolean' || usedStates.includes(stateId)) {
                continue;
            }

            const suffix = stateId.substring(prefix.length);

            // Skip states already handled above
            if (controls.some(c => c.id === suffix.replace('.', '_'))) {
                continue;
            }

            // Extract channel type for device mode filtering
            const channelMatch = suffix.match(/^(Relay|Light|RGB|RGBW|lights|white|Cover)(\d*)\./);
            if (channelMatch) {
                const channelType = channelMatch[1];
                if (allowed && !allowed.includes(channelType)) {
                    continue;
                }
            }

            // Build label from state name: "Relay0.transition" → "Relay 0 transition"
            const label = suffix.replace(/(\d+)/, ' $1 ').replace(/\./g, ' ').trim();

            usedStates.push(obj._id);
            const control: DeviceControl<string> = {
                group: 'group_settings',
                id: suffix.replace('.', '_'),
                type: 'button',
                stateId: `${shortDeviceId}.${suffix}`,
                label,
                variant: 'outlined',
                handler: async (_deviceId: string, _actionId: string, state: ControlState): Promise<ioBroker.State> => {
                    await this.adapter.setForeignStateAsync(obj._id, state);
                    return { val: state, ts: Date.now(), ack: true } as ioBroker.State;
                },
            };
            if (group) {
                controls.push(group);
                group = null;
            }
            controls.push(control);
        }

        // Sort by ID for consistent order
        // controls.sort((a, b) => a.id.localeCompare(b.id));

        return controls;
    }

    getIcon(deviceId: string): string {
        const device = this.objects[deviceId];
        if (device && 'icon' in device.common && device.common.icon) {
            const icon = String(device.common.icon);
            if (icon.startsWith('data:')) {
                // Old base64 SVG icon - skip, will be migrated on next restart
                return 'node';
            }
            return `adapter/shelly/${icon}`;
        }
        return 'node';
    }

    /**
     *
     * @param id ID to rename
     * @param context context sendet from Backend
     */
    async handleRenameDevice(id: string, context: ActionContext): Promise<{ refresh: DeviceRefresh }> {
        const result = await context.showForm(
            {
                type: 'panel',
                items: {
                    newName: {
                        type: 'text',
                        trim: false,
                        placeholder: '',
                    },
                },
            },
            {
                data: {
                    newName: '',
                },
                title: I18n.getTranslatedObject('Enter new name'),
            },
        );
        if (result?.newName === undefined || result?.newName === '') {
            return { refresh: 'none' };
        }
        const obj = {
            common: {
                name: result.newName,
            },
        };

        const res = await this.adapter.extendForeignObjectAsync(id, obj);
        if (res === null) {
            this.adapter.log.warn(`Can not rename device ${id}: ${JSON.stringify(res)}`);
            return { refresh: 'none' };
        }
        // 'device' is not a valid value - the GUI only knows 'all', 'instance' and 'devices'
        return { refresh: 'devices' };
    }

    /**
     * Delete an unreachable device and all of its objects/states.
     * Only offered for offline devices – a reachable device would just recreate its objects.
     *
     * @param id full object id of the device (e.g. shelly.0.shellyplus1-xxxxxx)
     * @param context context sent from the backend, used to confirm the destructive action
     */
    async handleDeleteDevice(
        id: string,
        context: ActionContext,
    ): Promise<{ refresh: DeviceRefresh } | { delete: string }> {
        const shortDeviceId = id.substring(this.adapter.namespace.length + 1);
        const device = this.objects[id];
        const deviceName = typeof device?.common?.name === 'string' ? device.common.name : shortDeviceId;

        const confirmed = await context.showConfirmation(
            I18n.getTranslatedObject(
                'Do you really want to delete the unreachable device "%s" and all its objects?',
                deviceName,
            ),
        );
        if (!confirmed) {
            return { refresh: 'none' };
        }

        try {
            // Recursively removes the device object together with all channels and states below it
            await this.adapter.delObjectAsync(shortDeviceId, { recursive: true });
        } catch (err) {
            this.adapter.log.error(`[DeviceManager] Could not delete device ${shortDeviceId}: ${err}`);
            await context.showMessage(I18n.getTranslatedObject('Could not delete device: %s', String(err)));
            return { refresh: 'none' };
        }

        // Drop the device from the local caches so it does not reappear until it comes back online
        const prefix = `${id}.`;
        for (const objId of Object.keys(this.objects)) {
            if (objId === id || objId.startsWith(prefix)) {
                delete this.objects[objId];
            }
        }
        for (const stateId of Object.keys(this.states)) {
            if (stateId === id || stateId.startsWith(prefix)) {
                delete this.states[stateId];
            }
        }

        this.adapter.log.info(`[DeviceManager] Deleted unreachable device ${shortDeviceId}`);
        return { delete: id };
    }

    /**
     * While a progress dialog is open, the device manager GUI waits only five seconds for the next
     * message from the adapter and otherwise reports "No response from the backend". Installing a
     * script takes longer than that, so the dialog is updated regularly - every update is such a
     * message. The returned function stops the heartbeat again.
     *
     * @param progress the open progress dialog
     * @param label text to show in the dialog
     */
    private static startProgressHeartbeat(
        progress: Awaited<ReturnType<ActionContext['openProgress']>>,
        label: () => string,
    ): () => void {
        let running = false;

        const timer = setInterval(() => {
            if (running) {
                return;
            }
            running = true;
            progress
                .update({ label: label() })
                .catch(() => {
                    /* the dialog may have been closed in the meantime */
                })
                .finally(() => (running = false));
        }, 2000);

        return () => clearInterval(timer);
    }

    /**
     * Install or update the BLE gateway script on one device.
     *
     * @param id full object id of the device
     * @param context action context of the device manager
     */
    async handleBleScriptInstall(id: string, context: ActionContext): Promise<{ refresh: DeviceRefresh }> {
        const shortDeviceId = id.substring(this.adapter.namespace.length + 1);
        const progress = await context.openProgress('Installing BLE gateway script...', { indeterminate: true });
        const stopHeartbeat = ShellyDeviceManagement.startProgressHeartbeat(progress, () =>
            I18n.translate('Installing BLE gateway script...'),
        );

        let result: { status: string; version?: string; message: string; restartRequired?: boolean };
        try {
            result = await this.installBleGatewayScript(shortDeviceId);
        } finally {
            stopHeartbeat();
            // The progress dialog must be closed before a message dialog can be opened
            await progress.close();
        }

        if (result.status === 'error') {
            await context.showMessage(
                I18n.getTranslatedObject('Could not install the BLE gateway script: %s', result.message),
            );
        } else if (result.status === 'uptodate') {
            await context.showMessage(
                I18n.getTranslatedObject(
                    'The BLE gateway script is already up to date (version %s)',
                    result.version ?? '',
                ),
            );
        } else {
            await context.showMessage(
                I18n.getTranslatedObject(
                    'The BLE gateway script (version %s) has been installed',
                    result.version ?? '',
                ),
            );
        }

        // Bluetooth was switched off on the device - it applies that only after a restart
        if (result.restartRequired) {
            await context.showMessage(
                I18n.getTranslatedObject('Bluetooth has been enabled - please restart the device to activate it'),
            );
        }

        // 'device' is not a valid value - the GUI only knows 'all', 'instance' and 'devices'
        return { refresh: 'devices' };
    }

    /**
     * Update the BLE gateway script on every device which already has it installed. Devices without
     * the script are not touched - installing it everywhere is done per device on purpose.
     *
     * @param context action context of the device manager
     */
    async handleUpdateAllBleScripts(context: ActionContext): Promise<{ refresh: boolean }> {
        const ns = this.adapter.namespace;
        const progress = await context.openProgress('Updating BLE gateway scripts...', { indeterminate: true });

        let currentLabel = I18n.translate('Updating BLE gateway scripts...');
        const stopHeartbeat = ShellyDeviceManagement.startProgressHeartbeat(progress, () => currentLabel);

        const updated: string[] = [];
        const failed: string[] = [];
        let upToDate = 0;

        try {
            for (const deviceId of Object.keys(this.objects)
                .filter(objectId => this.objects[objectId].type === 'device')
                .map(objectId => objectId.substring(ns.length + 1))
                .filter(deviceId => !deviceId.startsWith('ble.'))) {
                // Only devices which are online and already report a script version are candidates.
                // Everything else would need an HTTP request per device just to find out.
                const installedVersion = this.states[`${ns}.${deviceId}.BLE.scriptVersion`]?.val as string | undefined;
                if (!installedVersion || !this.states[`${ns}.${deviceId}.online`]?.val) {
                    continue;
                }
                if (installedVersion === bleGatewayScriptVersion) {
                    this.adapter.log.debug(
                        `[DeviceManager] ${deviceId}: BLE gateway script ${installedVersion} is up to date`,
                    );
                    upToDate++;
                    continue;
                }

                const name = this.objects[`${ns}.${deviceId}`]?.common?.name;
                const label = typeof name === 'string' && name ? name : deviceId;

                currentLabel = I18n.translate('Updating %s...', label);

                this.adapter.log.info(
                    `[DeviceManager] ${deviceId}: updating the BLE gateway script from ${installedVersion} to ${bleGatewayScriptVersion}`,
                );

                const result = await this.installBleGatewayScript(deviceId);
                if (result.status === 'error') {
                    this.adapter.log.warn(`[DeviceManager] ${deviceId}: ${result.message}`);
                    failed.push(label);
                } else {
                    updated.push(label);
                }
            }
        } finally {
            stopHeartbeat();
            await progress.close();
        }

        this.adapter.log.info(
            `[DeviceManager] BLE gateway scripts: ${updated.length} updated, ${failed.length} failed, ${upToDate} already up to date`,
        );

        if (!updated.length && !failed.length) {
            await context.showMessage(
                I18n.getTranslatedObject('All %s installed BLE gateway scripts are up to date', String(upToDate)),
            );
        } else if (!failed.length) {
            await context.showMessage(
                I18n.getTranslatedObject('Updated the BLE gateway script on: %s', updated.join(', ')),
            );
        } else {
            await context.showMessage(
                I18n.getTranslatedObject(
                    'Updated the BLE gateway script on: %s. Failed for: %s - see the log for details',
                    updated.join(', ') || '-',
                    failed.join(', '),
                ),
            );
        }

        return { refresh: true };
    }

    /**
     * Run the script installation on the connected client of a device.
     *
     * @param shortDeviceId device id without the namespace, e.g. `SNSN-0013A#a1b2c3#1`
     */
    private async installBleGatewayScript(
        shortDeviceId: string,
    ): Promise<{ status: string; version?: string; message: string; restartRequired?: boolean }> {
        const client = this.adapter.getClientByDeviceId(shortDeviceId);

        if (!client) {
            return { status: 'error', message: `Device ${shortDeviceId} is not connected` };
        }

        this.adapter.log.info(`[DeviceManager] Installing BLE gateway script on ${shortDeviceId}`);

        return await client.installBleGatewayScript();
    }

    async handleFirmwareUpdate(id: string, context: ActionContext): Promise<{ refresh: DeviceRefresh }> {
        const shortDeviceId = id.substring(this.adapter.namespace.length + 1);
        const ns = this.adapter.namespace;
        const stateId = `${ns}.${shortDeviceId}.firmwareupdate`;

        const gen = this.states[`${ns}.${shortDeviceId}.gen`]?.val as number | undefined;
        const hasProgress = gen !== undefined && gen >= 2;

        const progress = await context.openProgress('Updating firmware...', {
            indeterminate: !hasProgress,
            value: hasProgress ? 0 : undefined,
            label: I18n.getTranslatedObject('Starting update...'),
        });

        try {
            await this.adapter.setStateAsync(stateId, true, false);
            this.adapter.log.info(`[DeviceManager] Firmware update triggered for ${shortDeviceId}`);

            const progressStateId = `${ns}.${shortDeviceId}.firmwareupdateProgress`;
            const firmwareStateId = `${ns}.${shortDeviceId}.firmware`;
            const TIMEOUT = 5 * 60 * 1000; // 5 minutes

            await new Promise<void>(resolve => {
                const startTime = Date.now();

                const checkInterval = setInterval(async () => {
                    // Timeout
                    if (Date.now() - startTime > TIMEOUT) {
                        clearInterval(checkInterval);
                        resolve();
                        return;
                    }

                    // Check progress for Gen2+
                    if (hasProgress) {
                        const progressState = this.states[progressStateId];
                        if (progressState?.val !== undefined && progressState?.val !== null) {
                            const pct = Number(progressState.val);
                            await progress.update({
                                value: pct,
                                label: `${pct}%`,
                            });
                        }
                    }

                    // Check if firmware update flag cleared (update complete)
                    const firmwareState = this.states[firmwareStateId];
                    if (firmwareState?.val === false) {
                        clearInterval(checkInterval);
                        await progress.update({
                            value: 100,
                            label: I18n.getTranslatedObject('Firmware update complete'),
                        });
                        resolve();
                    }

                    // Check if device went offline and came back (Gen1 reboot after update)
                    if (!hasProgress) {
                        const online = this.states[`${ns}.${shortDeviceId}.online`];
                        if (online?.val === false) {
                            await progress.update({
                                label: I18n.getTranslatedObject('Device is rebooting...'),
                            });
                        }
                    }
                }, 2000);
            });
        } catch (err) {
            this.adapter.log.error(`[DeviceManager] Error during firmware update for ${shortDeviceId}: ${err}`);
        }

        await progress.close();
        // 'device' is not a valid value - the GUI only knows 'all', 'instance' and 'devices'
        return { refresh: 'devices' };
    }

    private mdnsScan(timeout: number): Promise<{ name: string; ip: string }[]> {
        return new Promise(resolve => {
            const MDNS_ADDRESS = '224.0.0.251';
            const MDNS_PORT = 5353;
            const devices = new Map<string, { name: string; ip: string }>();

            let socket: dgram.Socket;
            try {
                socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            } catch {
                resolve([]);
                return;
            }

            const cleanup = (): void => {
                try {
                    socket.close();
                } catch {
                    // ignore
                }
                resolve([...devices.values()]);
            };

            socket.on('error', () => cleanup());

            socket.on('message', (msg: Buffer) => {
                if (msg.length < 12) {
                    return;
                }

                // Parse all records for A records with "shelly" in the name
                const qdCount = msg.readUInt16BE(4);
                const anCount = msg.readUInt16BE(6);
                const nsCount = msg.readUInt16BE(8);
                const arCount = msg.readUInt16BE(10);

                let offset = 12;
                // Skip questions
                for (let i = 0; i < qdCount && offset < msg.length; i++) {
                    while (offset < msg.length && msg[offset] !== 0 && (msg[offset] & 0xc0) !== 0xc0) {
                        offset += msg[offset] + 1;
                    }
                    if (offset < msg.length && (msg[offset] & 0xc0) === 0xc0) {
                        offset += 2;
                    } else {
                        offset += 1;
                    }
                    offset += 4;
                }

                const totalRecords = anCount + nsCount + arCount;
                for (let i = 0; i < totalRecords && offset < msg.length; i++) {
                    const nameResult = this.parseDnsName(msg, offset);
                    offset = nameResult.nextOffset;
                    if (offset + 10 > msg.length) {
                        break;
                    }

                    const rType = msg.readUInt16BE(offset);
                    offset += 8; // skip type(2) + class(2) + ttl(4)
                    const rdLength = msg.readUInt16BE(offset);
                    offset += 2;

                    // A record (type=1) with 4 bytes
                    if (rType === 1 && rdLength === 4 && nameResult.name.toLowerCase().includes('shelly')) {
                        const ip = `${msg[offset]}.${msg[offset + 1]}.${msg[offset + 2]}.${msg[offset + 3]}`;
                        const deviceName = nameResult.name.replace('.local', '');
                        devices.set(deviceName, { name: deviceName, ip });
                    }

                    offset += rdLength;
                }
            });

            socket.bind(MDNS_PORT, () => {
                try {
                    socket.addMembership(MDNS_ADDRESS);
                    socket.setMulticastTTL(255);
                } catch {
                    cleanup();
                    return;
                }

                // Build mDNS query for _http._tcp.local (PTR type=12)
                const query = this.buildMdnsQuery('_http._tcp.local');
                socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS);

                // Re-send after 2s
                setTimeout(() => {
                    try {
                        socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS);
                    } catch {
                        // ignore
                    }
                }, 2000);

                setTimeout(cleanup, timeout);
            });
        });
    }

    private buildMdnsQuery(name: string): Buffer {
        const parts = name.split('.');
        const bufParts: Buffer[] = [];
        for (const part of parts) {
            const len = Buffer.alloc(1);
            len.writeUInt8(part.length);
            bufParts.push(len, Buffer.from(part));
        }
        bufParts.push(Buffer.alloc(1)); // null terminator

        const header = Buffer.alloc(12);
        header.writeUInt16BE(1, 4); // 1 question

        const qFooter = Buffer.alloc(4);
        qFooter.writeUInt16BE(12, 0); // PTR
        qFooter.writeUInt16BE(1, 2); // IN

        return Buffer.concat([header, ...bufParts, qFooter]);
    }

    private parseDnsName(buf: Buffer, offset: number): { name: string; nextOffset: number } {
        const parts: string[] = [];
        let pos = offset;
        let jumped = false;
        let savedPos = 0;

        while (pos < buf.length) {
            const len = buf[pos];
            if (len === 0) {
                pos++;
                break;
            }
            if ((len & 0xc0) === 0xc0) {
                if (!jumped) {
                    savedPos = pos + 2;
                }
                pos = ((len & 0x3f) << 8) | buf[pos + 1];
                jumped = true;
                continue;
            }
            pos++;
            if (pos + len > buf.length) {
                break;
            }
            parts.push(buf.subarray(pos, pos + len).toString());
            pos += len;
        }

        return { name: parts.join('.'), nextOffset: jumped ? savedPos : pos };
    }

    async handleDiscoverDevices(context: ActionContext): Promise<{ refresh: boolean }> {
        const progress = await context.openProgress(I18n.getTranslatedObject('Searching for Shelly devices...'), {
            indeterminate: true,
        });

        try {
            const found = await this.mdnsScan(5000);
            await progress.close();

            if (!found.length) {
                await context.showMessage(I18n.getTranslatedObject('No new Shelly devices found'));
                return { refresh: false };
            }

            // Filter out devices already known
            const knownIps = new Set<string>();
            for (const stateId in this.states) {
                if (stateId.endsWith('.hostname')) {
                    const ip = this.states[stateId]?.val;
                    if (typeof ip === 'string' && ip) {
                        knownIps.add(ip);
                    }
                }
            }

            const unknownDevices = found.filter(d => !knownIps.has(d.ip));
            const existingDevices = found.filter(d => knownIps.has(d.ip));

            // Exclude Gen 1 devices – they use CoAP and must not be configured for MQTT via Device Manager
            const gen1Devices = unknownDevices.filter(d => this.isGen1DeviceByName(d.name));
            const newDevices = unknownDevices.filter(d => !this.isGen1DeviceByName(d.name));
            if (gen1Devices.length > 0) {
                this.adapter.log.debug(
                    `[DeviceManager] Excluded ${gen1Devices.length} Gen 1 device(s) from MQTT discovery (use CoAP instead): ${gen1Devices.map(d => d.name).join(', ')}`,
                );
            }

            if (!newDevices.length && existingDevices.length) {
                await context.showMessage(
                    I18n.getTranslatedObject(
                        'All %s found devices are already known',
                        existingDevices.length.toString(),
                    ),
                );
            } else {
                // Build a form with checkbox + name input per new device
                const items: Record<string, ConfigItemAny> = {};
                const data: Record<string, unknown> = {};
                const anyChecked: string[] = [];

                if (newDevices.length > 0) {
                    // Fetch real device names from devices
                    const deviceNames = await Promise.all(
                        newDevices.map(dev => this.fetchDeviceName(dev.ip, this.config.httppassword || '')),
                    );

                    items._newHeader = {
                        type: 'header',
                        text: `New devices (${newDevices.length})`,
                        size: 4,
                    };

                    if (newDevices.length > 1) {
                        items.selectAll = {
                            newLine: true,
                            type: 'checkbox',
                            label: I18n.getTranslatedObject('Select all'),
                            xs: 12,
                        };
                    }
                    data.selectAll = false;

                    for (let i = 0; i < newDevices.length; i++) {
                        items[`add_${i}`] = {
                            newLine: true,
                            type: 'checkbox',
                            label: `${newDevices[i].name} — ${newDevices[i].ip}`,
                            xs: 12,
                            md: 6,
                            onChange: {
                                alsoDependsOn: ['selectAll'],
                                calculateFunc: 'data.selectAll',
                                ignoreOwnChanges: true,
                            },
                        };
                        data[`add_${i}`] = false;

                        items[`name_${i}`] = {
                            type: 'text',
                            label: I18n.getTranslatedObject('Device name'),
                            hidden: `!data.add_${i}`,
                            validator: `!data.add_${i} || !!data.name_${i}`,
                            validatorNoSaveOnError: true,
                            validatorErrorText: 'Name must be filled',
                            xs: 12,
                            md: 6,
                        };
                        data[`name_${i}`] = deviceNames[i] || newDevices[i].name;
                        anyChecked.push(`!data["add_${i}"]`);
                    }
                }

                if (existingDevices.length > 0) {
                    items._knownHeader = {
                        type: 'header',
                        text: `Known devices (${existingDevices.length})`,
                        size: 4,
                    };

                    for (let i = 0; i < existingDevices.length; i++) {
                        items[`known_${i}`] = {
                            type: 'staticInfo',
                            label: existingDevices[i].name,
                            data: existingDevices[i].ip,
                            addColon: true,
                        };
                    }
                }

                const options: BackEndCommandJsonFormOptions = {
                    data,
                    title: I18n.getTranslatedObject('Configure selected devices'),
                };
                if (anyChecked.length) {
                    options.applyDisabledRule = anyChecked.join(' && ');
                } else {
                    options.ignoreApplyDisabled = true;
                }

                const result = await context.showForm({ type: 'panel', items }, options);

                if (result) {
                    const selected: { name: string; ip: string; customName: string }[] = [];
                    for (let i = 0; i < newDevices.length; i++) {
                        if (result[`add_${i}`]) {
                            selected.push({
                                ...newDevices[i],
                                customName: (result[`name_${i}`] as string) || '',
                            });
                        }
                    }
                    if (selected.length > 0) {
                        await this.provisionDevices(selected, context);
                    }
                }
            }
        } catch (err) {
            await progress.close();
            this.adapter.log.error(`[DeviceManager] Discovery error: ${err}`);
            await context.showMessage(`Error: ${err}`);
        }

        return { refresh: false };
    }

    /**
     * Extract device type prefix from mDNS name, e.g. "ShellyPlusI4-841FE8F9D9E8" → "shellyplusi4-"
     *
     * @param name
     */
    private getDevicePrefix(name: string): string {
        const idx = name.lastIndexOf('-');
        if (idx > 0) {
            return name.substring(0, idx + 1).toLowerCase();
        }
        return name.toLowerCase();
    }

    /**
     * Determine if a device found via mDNS is a Gen 1 device.
     * Gen 1 devices use CoAP and should not be offered for MQTT provisioning via the Device Manager.
     * Returns true only if the device is positively identified as Gen 1 in the known device list.
     * Unknown devices return false (they will pass through and fail gracefully at provisioning if needed).
     *
     * @param name mDNS device name (e.g. "shelly1-AABBCC" or "ShellyPlus1-XXXXXXXXXXXX")
     */
    private isGen1DeviceByName(name: string): boolean {
        const prefix = this.getDevicePrefix(name);
        const deviceClass = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
        const lowerClass = deviceClass.toLowerCase();

        // Case-insensitive lookup in the known device generation map
        const deviceGenMap = datapoints.deviceGen;
        for (const [key, gen] of Object.entries(deviceGenMap)) {
            if (key.toLowerCase() === lowerClass) {
                return gen < 2;
            }
        }

        // Unknown device – do not filter out (provisioning will fail gracefully if it turns out to be Gen 1)
        return false;
    }

    /**
     * Compute the MQTT ID from device mDNS name and custom name.
     * Returns empty string if no custom name is provided.
     *
     * @param deviceName mDNS device name (e.g. "ShellyPlus1-44179394D4D4")
     * @param customName User-provided custom name
     */
    private computeMqttId(deviceName: string, customName: string): string {
        const devicePrefix = this.getDevicePrefix(deviceName);
        let suffix = customName ? customName.toLowerCase() : '';
        if (suffix.startsWith(devicePrefix)) {
            suffix = suffix.substring(devicePrefix.length);
        }
        suffix = suffix
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
        return suffix ? `${devicePrefix}${suffix}` : '';
    }

    private async provisionDevices(
        devices: { name: string; ip: string; customName: string }[],
        context: ActionContext,
    ): Promise<void> {
        const mqttPort = this.config.port || 1882;
        const mqttUser = this.config.mqttusername || '';
        const mqttPass = this.config.mqttpassword || '';
        const httpPass = this.config.httppassword || '';
        const localIp = this.getLocalIp(devices[0].ip);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (!localIp) {
            await context.showMessage(I18n.getTranslatedObject('Could not determine local IP address'));
            return;
        }

        const mqttServer = `${localIp}:${mqttPort}`;

        // Collect existing device IDs to detect MQTT ID conflicts
        const usedMqttIds = new Set<string>();
        for (const id in this.objects) {
            if (this.objects[id].type === 'device') {
                usedMqttIds.add(id.substring(this.adapter.namespace.length + 1));
            }
        }

        // Pre-compute MQTT IDs and check for conflicts before provisioning
        const mqttIds: (string | undefined)[] = [];
        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            const mqttId = this.computeMqttId(dev.name, dev.customName.trim());
            if (mqttId) {
                if (usedMqttIds.has(mqttId)) {
                    await context.showMessage(
                        `MQTT ID "${mqttId}" is already used by another device. Please choose a different name for "${dev.customName.trim()}".`,
                    );
                    return;
                }
                usedMqttIds.add(mqttId);
            }
            mqttIds.push(mqttId || undefined);
        }

        let progress = await context.openProgress('Configuring devices...', { value: 0 });
        const results: string[] = [];

        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            await progress.update({
                value: Math.round(((i + 1) / devices.length) * 100),
                label: dev.name,
            });

            try {
                await this.provisionSingleDevice(dev, mqttServer, mqttUser, mqttPass, httpPass, timeZone, mqttIds[i]);
                results.push(`✓ ${dev.name}${dev.customName.trim() ? ` → ${dev.customName.trim()}` : ''}`);
                this.adapter.log.info(`[DeviceManager] Provisioned ${dev.name} (${dev.ip})`);
            } catch (err) {
                if (err instanceof HttpAuthError) {
                    // Try with configured password first
                    if (httpPass) {
                        this.adapter.log.info(`[DeviceManager] ${dev.ip}: 401 - retrying with configured password`);
                        try {
                            await this.provisionSingleDevice(
                                dev,
                                mqttServer,
                                mqttUser,
                                mqttPass,
                                httpPass,
                                timeZone,
                                mqttIds[i],
                                httpPass,
                            );
                            results.push(`✓ ${dev.name}${dev.customName.trim() ? ` → ${dev.customName.trim()}` : ''}`);
                            this.adapter.log.info(
                                `[DeviceManager] Provisioned ${dev.name} (${dev.ip}) with configured password`,
                            );
                            continue;
                        } catch (cfgErr) {
                            if (!(cfgErr instanceof HttpAuthError)) {
                                const msg = cfgErr instanceof Error ? cfgErr.message : String(cfgErr);
                                results.push(`✗ ${dev.name}: ${msg}`);
                                this.adapter.log.error(
                                    `[DeviceManager] Failed to provision ${dev.name} (${dev.ip}): ${msg}`,
                                );
                                continue;
                            }
                            // Configured password also failed, ask user
                            this.adapter.log.info(`[DeviceManager] ${dev.ip}: Configured password failed, asking user`);
                        }
                    }

                    // Ask user for password
                    await progress.close();
                    const formResult = await context.showForm(
                        {
                            type: 'panel',
                            items: {
                                _info: {
                                    type: 'staticInfo',
                                    label: dev.name,
                                    data: I18n.getTranslatedObject('Device is password-protected'),
                                    addColon: true,
                                },
                                devicePassword: {
                                    type: 'text',
                                    label: I18n.getTranslatedObject('Enter device password'),
                                },
                            },
                        },
                        { data: { devicePassword: '' }, title: dev.name },
                    );

                    if (formResult?.devicePassword) {
                        const devPass = formResult.devicePassword as string;
                        progress = await context.openProgress('Configuring devices...', {
                            value: Math.round(((i + 1) / devices.length) * 100),
                        });
                        try {
                            await this.provisionSingleDevice(
                                dev,
                                mqttServer,
                                mqttUser,
                                mqttPass,
                                httpPass,
                                timeZone,
                                mqttIds[i],
                                devPass,
                            );
                            results.push(`✓ ${dev.name}${dev.customName.trim() ? ` → ${dev.customName.trim()}` : ''}`);
                            this.adapter.log.info(`[DeviceManager] Provisioned ${dev.name} (${dev.ip}) with password`);
                        } catch (retryErr) {
                            const msg = retryErr instanceof Error ? retryErr.message : String(retryErr);
                            results.push(`✗ ${dev.name}: ${msg}`);
                            this.adapter.log.error(
                                `[DeviceManager] Failed to provision ${dev.name} (${dev.ip}): ${msg}`,
                            );
                        }
                    } else {
                        results.push(`✗ ${dev.name}: Skipped (no password provided)`);
                        progress = await context.openProgress('Configuring devices...', {
                            value: Math.round(((i + 1) / devices.length) * 100),
                        });
                    }
                } else {
                    const msg = err instanceof Error ? err.message : String(err);
                    results.push(`✗ ${dev.name}: ${msg}`);
                    this.adapter.log.error(`[DeviceManager] Failed to provision ${dev.name} (${dev.ip}): ${msg}`);
                }
            }
        }

        await progress.close();

        // Show results
        const items: Record<string, ConfigItemAny> = {};
        for (let i = 0; i < results.length; i++) {
            items[`result_${i}`] = {
                type: 'staticInfo',
                label: results[i],
                data: '',
            };
        }
        await context.showForm(
            { type: 'panel', items },
            { title: I18n.getTranslatedObject('Configuration results'), buttons: ['apply'], ignoreApplyDisabled: true },
        );
    }

    private async provisionSingleDevice(
        dev: { name: string; ip: string; customName: string },
        mqttServer: string,
        mqttUser: string,
        mqttPass: string,
        httpPass: string,
        timeZone: string,
        mqttId?: string,
        devicePassword?: string,
    ): Promise<void> {
        const auth = devicePassword ? { user: 'admin', pass: devicePassword } : undefined;
        const { gen, id: deviceId } = await this.detectDeviceGen(dev.ip, auth);
        const customName = dev.customName.trim();

        // Gen1 devices must not be provisioned to MQTT — it disconnects them from Shelly Cloud and App
        if (gen < 2) {
            throw new Error(
                'Gen1 devices cannot be provisioned via MQTT. Enabling MQTT on Gen1 devices disconnects them from Shelly Cloud and the Shelly App. Use CoAP protocol instead.',
            );
        }

        // Step 1: Configure MQTT, device name, timezone (no auth change yet)
        let needsRestart: boolean;
        if (gen >= 2) {
            needsRestart = await this.provisionGen2(
                dev.ip,
                mqttServer,
                mqttUser,
                mqttPass,
                timeZone,
                customName,
                mqttId,
                auth,
            );
        } else {
            needsRestart = await this.provisionGen1(
                dev.ip,
                mqttServer,
                mqttUser,
                mqttPass,
                httpPass,
                timeZone,
                customName,
                mqttId,
                auth,
            );
        }

        // Step 2: Reboot if needed (before setting auth, so old/no auth still works)
        if (needsRestart) {
            try {
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Rebooting device...`);
                let rebootResult: string;
                if (gen >= 2) {
                    rebootResult = await this.httpGet(`http://${dev.ip}/rpc/Shelly.Reboot`, auth);
                } else {
                    rebootResult = await this.httpGet(`http://${dev.ip}/reboot`, auth);
                }
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Reboot response: ${rebootResult || 'OK'}`);
            } catch (err) {
                // Device may disconnect immediately during reboot
                this.adapter.log.info(
                    `[DeviceManager] ${dev.ip}: Reboot sent (${err instanceof Error ? err.message : err})`,
                );
            }

            // Wait for device to come back up before setting auth
            if (httpPass && gen >= 2) {
                this.adapter.log.info(`[DeviceManager] ${dev.ip}: Waiting for device to restart...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        // Step 3: Set auth password last (after reboot, so reboot doesn't need the new password)
        if (httpPass && gen >= 2) {
            this.adapter.log.info(`[DeviceManager] ${dev.ip}: Setting auth (deviceId=${deviceId})`);
            const ha1 = crypto.createHash('sha256').update(`admin:${deviceId}:${httpPass}`).digest('hex');
            const authResult = await this.httpPost(
                `http://${dev.ip}/rpc/Shelly.SetAuth`,
                JSON.stringify({ user: 'admin', realm: deviceId, ha1 }),
                auth,
            );
            this.adapter.log.debug(`[DeviceManager] ${dev.ip}: Shelly.SetAuth response: ${authResult}`);
        }
    }

    private async provisionGen1(
        ip: string,
        mqttServer: string,
        mqttUser: string,
        mqttPass: string,
        httpPass: string,
        timeZone: string,
        deviceName: string,
        mqttId: string | undefined,
        auth?: { user: string; pass: string },
    ): Promise<boolean> {
        const params: Record<string, string> = {
            mqtt_enable: 'true',
            mqtt_server: mqttServer,
            mqtt_user: mqttUser,
            mqtt_pass: mqttPass,
            timezone: timeZone,
        };

        if (deviceName) {
            params.name = deviceName;
        }
        if (mqttId) {
            params.mqtt_id = mqttId;
        }
        if (httpPass) {
            params.login_enabled = 'true';
        }

        const url = `http://${ip}/settings?${new URLSearchParams(params).toString()}`;
        this.adapter.log.info(
            `[DeviceManager] ${ip}: Setting Gen1 config (server=${mqttServer}, name=${deviceName || 'unchanged'}, tz=${timeZone})`,
        );
        const result = await this.httpGet(url, auth);
        this.adapter.log.debug(`[DeviceManager] ${ip}: Gen1 /settings response: ${result.substring(0, 200)}`);

        // Gen1 always needs reboot after MQTT config change
        return true;
    }

    private async provisionGen2(
        ip: string,
        mqttServer: string,
        mqttUser: string,
        mqttPass: string,
        timeZone: string,
        deviceName: string,
        mqttId: string | undefined,
        auth?: { user: string; pass: string },
    ): Promise<boolean> {
        let restartRequired = false;

        // Configure MQTT
        this.adapter.log.info(
            `[DeviceManager] ${ip}: Setting MQTT config (server=${mqttServer}, prefix=${mqttId || 'default'})`,
        );
        const mqttConfig: Record<string, unknown> = {
            enable: true,
            server: mqttServer,
            user: mqttUser,
            pass: mqttPass,
            rpc_ntf: true,
            status_ntf: true,
        };
        if (mqttId) {
            mqttConfig.topic_prefix = mqttId;
            mqttConfig.client_id = mqttId;
        }
        const mqttResult = await this.httpPost(
            `http://${ip}/rpc/Mqtt.SetConfig`,
            JSON.stringify({ config: mqttConfig }),
            auth,
        );
        this.adapter.log.debug(`[DeviceManager] ${ip}: Mqtt.SetConfig response: ${mqttResult}`);
        if (JSON.parse(mqttResult).restart_required) {
            restartRequired = true;
        }

        // Configure device name and timezone
        this.adapter.log.info(
            `[DeviceManager] ${ip}: Setting Sys config (tz=${timeZone}, name=${deviceName || 'unchanged'})`,
        );
        const sysConfig: Record<string, unknown> = {
            location: { tz: timeZone },
        };
        if (deviceName) {
            sysConfig.device = { name: deviceName };
        }
        const sysResult = await this.httpPost(
            `http://${ip}/rpc/Sys.SetConfig`,
            JSON.stringify({ config: sysConfig }),
            auth,
        );
        this.adapter.log.debug(`[DeviceManager] ${ip}: Sys.SetConfig response: ${sysResult}`);
        if (JSON.parse(sysResult).restart_required) {
            restartRequired = true;
        }

        this.adapter.log.info(`[DeviceManager] ${ip}: Provisioning complete (restart_required=${restartRequired})`);
        return restartRequired;
    }

    private getLocalIp(targetIp: string): string | undefined {
        const targetSubnet = targetIp.split('.').slice(0, 3).join('.');
        const interfaces = os.networkInterfaces();

        // First try: find interface on same subnet
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]!) {
                if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith(`${targetSubnet}.`)) {
                    return iface.address;
                }
            }
        }

        // Fallback: any non-internal IPv4
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]!) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }

        return undefined;
    }

    /**
     * Fetch the device name from the device. Try without auth first, then with configured password.
     * Returns empty string if the name cannot be read.
     *
     * @param ip
     * @param httpPass
     */
    private async fetchDeviceName(ip: string, httpPass: string): Promise<string> {
        // /shelly is always public (no auth required) and returns name on Gen2+
        try {
            const data = await this.httpGet(`http://${ip}/shelly`);
            const json = JSON.parse(data);
            if (json.name) {
                return json.name;
            }
        } catch {
            // ignore
        }

        // Gen1 fallback: /settings requires auth
        const trySettings = async (auth?: { user: string; pass: string }): Promise<string> => {
            try {
                const data = await this.httpGet(`http://${ip}/settings`, auth);
                const json = JSON.parse(data);
                return json?.name || '';
            } catch {
                return '';
            }
        };

        const name = await trySettings();
        if (name) {
            return name;
        }

        // Try Gen1 with configured password
        if (httpPass) {
            return trySettings({ user: 'admin', pass: httpPass });
        }

        return '';
    }

    private async detectDeviceGen(
        ip: string,
        auth?: { user: string; pass: string },
    ): Promise<{ gen: number; id: string }> {
        this.adapter.log.debug(`[DeviceManager] ${ip}: Detecting device generation...`);
        const data = await this.httpGet(`http://${ip}/shelly`, auth);
        const json = JSON.parse(data);
        const gen = json.gen || 1;
        const id = json.id || json.mac || '';
        this.adapter.log.info(`[DeviceManager] ${ip}: Detected Gen${gen}, id=${id}`);
        return { gen, id };
    }

    private httpGet(url: string, auth?: { user: string; pass: string }): Promise<string> {
        return new Promise((resolve, reject) => {
            const parsed = new URL(url);
            const headers: Record<string, string> = { Connection: 'close' };
            if (auth) {
                headers.Authorization = `Basic ${Buffer.from(`${auth.user}:${auth.pass}`).toString('base64')}`;
            }
            const req = http.get(
                {
                    hostname: parsed.hostname,
                    port: parsed.port || 80,
                    path: `${parsed.pathname}${parsed.search}`,
                    timeout: 10000,
                    headers,
                },
                res => {
                    let data = '';
                    res.on('data', (chunk: Buffer) => {
                        data += chunk.toString();
                    });
                    res.on('end', () => {
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(data);
                        } else if (res.statusCode === 401) {
                            reject(new HttpAuthError());
                        } else {
                            reject(new Error(`HTTP GET ${parsed.pathname} → ${res.statusCode}: ${data}`));
                        }
                    });
                },
            );
            req.on('error', err => reject(new Error(`HTTP GET ${parsed.pathname} → ${err.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`HTTP GET ${parsed.pathname} → Timeout`));
            });
        });
    }

    private httpPost(url: string, body: string, auth?: { user: string; pass: string }): Promise<string> {
        return new Promise((resolve, reject) => {
            const parsed = new URL(url);
            const headers: Record<string, string | number> = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                Connection: 'close',
            };
            if (auth) {
                headers.Authorization = `Basic ${Buffer.from(`${auth.user}:${auth.pass}`).toString('base64')}`;
            }
            const req = http.request(
                {
                    hostname: parsed.hostname,
                    port: parsed.port || 80,
                    path: parsed.pathname,
                    method: 'POST',
                    timeout: 10000,
                    headers,
                },
                res => {
                    let data = '';
                    res.on('data', (chunk: Buffer) => {
                        data += chunk.toString();
                    });
                    res.on('end', () => {
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(data);
                        } else if (res.statusCode === 401) {
                            reject(new HttpAuthError());
                        } else {
                            reject(new Error(`HTTP POST ${parsed.pathname} → ${res.statusCode}: ${data}`));
                        }
                    });
                },
            );
            req.on('error', err => reject(new Error(`HTTP POST ${parsed.pathname} → ${err.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`HTTP POST ${parsed.pathname} → Timeout`));
            });
            req.write(body);
            req.end();
        });
    }

    /**
     * Scan for new Shelly devices and return names/IPs of unknown ones.
     */
    public async scanForNewDevices(): Promise<{ name: string; ip: string }[]> {
        const found = await this.mdnsScan(5000);

        const knownIps = new Set<string>();
        for (const stateId in this.states) {
            if (stateId.endsWith('.hostname')) {
                const ip = this.states[stateId]?.val;
                if (typeof ip === 'string' && ip) {
                    knownIps.add(ip);
                }
            }
        }

        return found.filter(d => !knownIps.has(d.ip) && !this.isGen1DeviceByName(d.name));
    }

    public async destroy(): Promise<void> {
        await this.adapter.unsubscribeObjectsAsync('*');
        await this.adapter.unsubscribeStatesAsync('*');
    }
}
