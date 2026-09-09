import React from 'react';

import { Box, Checkbox, FormControlLabel, IconButton, Tooltip, Typography } from '@mui/material';
import { CenterFocusStrong } from '@mui/icons-material';

// important to make from package and not from some children.
import { ConfigGeneric, type ConfigGenericProps, type ConfigGenericState } from '@iobroker/json-config';
import { I18n } from '@iobroker/gui-components';

import BleNetworkGraph, { type BleGraphEdge, type BleGraphNode } from './BleNetworkGraph';

/** Colors of the connection lines, by signal strength. */
const SIGNAL_COLORS = {
    strong: { color: '#4caf50', highlight: '#2e7d32' },
    medium: { color: '#ff9800', highlight: '#ef6c00' },
    weak: { color: '#f44336', highlight: '#c62828' },
    unknown: { color: '#9e9e9e', highlight: '#616161' },
};

/**
 * The nodes are drawn as `circularImage`: the device icon sits inside a filled circle with a colored
 * ring. That distinguishes a gateway from a received device at a glance and avoids the rectangular
 * selection frame which vis-network draws around a plain `image` node.
 */
const GATEWAY_COLOR = {
    background: '#ffffff',
    border: '#1976d2',
    highlight: { background: '#ffffff', border: '#64b5f6' },
    hover: { background: '#ffffff', border: '#64b5f6' },
};

const DEVICE_COLOR = {
    background: '#ffffff',
    border: '#7e57c2',
    highlight: { background: '#ffffff', border: '#b39ddb' },
    hover: { background: '#ffffff', border: '#b39ddb' },
};

const SIGNAL_STRONG_THRESHOLD = -70;
const SIGNAL_MEDIUM_THRESHOLD = -85;

/**
 * A gateway that did not report the device for this long is drawn as a dashed line. It must stay
 * below `bleReceivedByTtlMs` of the adapter, which drops such an entry completely after an hour.
 */
const STALE_MS = 15 * 60 * 1000;

/** RSSI range mapped to the distance of a device from its gateway (strong = close). */
const RSSI_RANGE = { strong: -50, weak: -100 };

/** Space reserved on the ring per device, so that the labels of neighbours do not overlap. */
const RING_SPACING = 70;

/** Smallest ring around a gateway, and how much a weak signal pushes a device outwards. */
const RING_MIN_RADIUS = 200;
const RING_WEAK_FACTOR = 0.45;

/** Free space between the rings of two neighbouring gateways. */
const RING_GAP = 160;

/** Opacity of everything which does not belong to the selected gateway. */
const DIMMED_OPACITY = 0.3;

/** One gateway that received a BLE advertisement, as stored in `ble.<mac>.receivedBy`. */
interface BleLink {
    rssi: number | null;
    ts: number | null;
    scriptVersion?: string;
}

interface BleDeviceInfo {
    /** Object ID without namespace, e.g. `ble.aa:bb:cc:dd:ee:ff` */
    id: string;
    mac: string;
    name: string;
    icon?: string;
    /** Shelly device ID of the gateway (e.g. `shellyplusht-a1b2c3`) -> reception info */
    links: Record<string, BleLink>;
}

interface GatewayInfo {
    name: string;
    icon?: string;
}

interface BleMapState extends ConfigGenericState {
    devices: BleDeviceInfo[];
    nodes: BleGraphNode[];
    edges: BleGraphEdge[];
    ready: boolean;
    /** Show every gateway which receives a device instead of only the one with the best signal */
    allLinks: boolean;
    /** Write the RSSI onto the connection lines */
    rssiLabels: boolean;
    /** Increased whenever a filter changes, so that the graph zooms to the new result */
    refitToken: number;
    /** Gateway selected by a click - all other nodes and connections are dimmed */
    selectedGateway: string | null;
}

export default class BleMap extends ConfigGeneric<ConfigGenericProps, BleMapState> {
    private namespace = '';
    /** Serial part of the Shelly device ID (lower case) -> name/icon of the ioBroker device object */
    private gatewaysBySerial: Record<string, GatewayInfo> = {};
    private readonly graphRef = React.createRef<BleNetworkGraph>();
    private reloadTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: ConfigGenericProps) {
        super(props);
        this.state = {
            ...this.state,
            devices: [],
            nodes: [],
            edges: [],
            ready: false,
            allLinks: false,
            rssiLabels: false,
            refitToken: 0,
            selectedGateway: null,
        };
    }

    async componentDidMount(): Promise<void> {
        await super.componentDidMount();
        this.namespace = `${this.props.oContext.adapterName}.${this.props.oContext.instance}`;
        await this.loadData();
        await this.props.oContext.socket.subscribeState(`${this.namespace}.ble.*.receivedBy`, this.onStateChange);
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this.reloadTimeout) {
            clearTimeout(this.reloadTimeout);
            this.reloadTimeout = null;
        }
        this.props.oContext.socket.unsubscribeState(`${this.namespace}.ble.*.receivedBy`, this.onStateChange);
    }

    /**
     * Reads the translated name of an object in the language of the admin UI.
     *
     * @param name
     * @param fallback
     */
    private static getName(name: ioBroker.StringOrTranslated | undefined, fallback: string): string {
        if (!name) {
            return fallback;
        }
        if (typeof name === 'string') {
            return name;
        }
        return name[I18n.getLanguage()] || name.en || fallback;
    }

    /**
     * Turns the `common.icon` of an object into a URL usable in the admin UI.
     *
     * @param icon
     */
    private getIconUrl(icon: string | undefined): string | undefined {
        if (!icon) {
            return undefined;
        }
        if (icon.startsWith('data:') || icon.startsWith('http')) {
            return icon;
        }
        return `${this.props.oContext.imagePrefix ?? '.'}/adapter/${this.props.oContext.adapterName}/${icon}`;
    }

    private static parseLinks(value: ioBroker.StateValue | undefined): Record<string, BleLink> {
        if (typeof value !== 'string' || !value) {
            return {};
        }
        try {
            const parsed = JSON.parse(value) as Record<string, Partial<BleLink>>;
            const links: Record<string, BleLink> = {};
            for (const [src, info] of Object.entries(parsed)) {
                links[src] = {
                    rssi: typeof info?.rssi === 'number' ? info.rssi : null,
                    ts: typeof info?.ts === 'number' ? info.ts : null,
                    scriptVersion: info?.scriptVersion,
                };
            }
            return links;
        } catch {
            return {};
        }
    }

    /**
     * Reads all device objects of this instance: the `ble.*` ones are the BLE devices of the map,
     * every other one is a potential gateway. The gateways are indexed by the serial part of their
     * object ID (`SNSN-0013A#a1b2c3#1`), because that is the only part shared with the Shelly device
     * ID reported by the gateway script (`shellyplusht-a1b2c3`).
     */
    private async loadData(): Promise<void> {
        const socket = this.props.oContext.socket;
        const objects = await socket.getObjectViewSystem('device', `${this.namespace}.`, `${this.namespace}.香`);
        const states = await socket.getForeignStates(`${this.namespace}.ble.*.receivedBy`);

        const gatewaysBySerial: Record<string, GatewayInfo> = {};
        const devices: BleDeviceInfo[] = [];

        for (const obj of Object.values(objects)) {
            const id = obj._id.substring(this.namespace.length + 1);

            if (id.startsWith('ble.')) {
                const mac = id.substring(4);
                devices.push({
                    id,
                    mac,
                    name: BleMap.getName(obj.common?.name, mac),
                    icon: this.getIconUrl(obj.common?.icon),
                    links: BleMap.parseLinks(states[`${obj._id}.receivedBy`]?.val),
                });
            } else {
                const serial = id.split('#')[1];
                if (serial) {
                    gatewaysBySerial[serial.toLowerCase()] = {
                        name: BleMap.getName(obj.common?.name, id),
                        icon: this.getIconUrl(obj.common?.icon),
                    };
                }
            }
        }

        devices.sort((a, b) => a.name.localeCompare(b.name));
        this.gatewaysBySerial = gatewaysBySerial;
        this.setState({ devices, ready: true, ...this.buildGraph(devices) });
    }

    private onStateChange = (id: string, state: ioBroker.State | null | undefined): void => {
        const deviceId = id.substring(this.namespace.length + 1).replace(/\.receivedBy$/, '');
        const index = this.state.devices.findIndex(device => device.id === deviceId);

        if (index === -1) {
            // A device that was not there when the map was loaded - reload the objects as well.
            if (!this.reloadTimeout) {
                this.reloadTimeout = setTimeout(() => {
                    this.reloadTimeout = null;
                    void this.loadData();
                }, 1000);
            }
            return;
        }

        const devices = [...this.state.devices];
        devices[index] = { ...devices[index], links: BleMap.parseLinks(state?.val) };
        this.setState({ devices, ...this.buildGraph(devices) });
    };

    private static getSignalColor(rssi: number | null): { color: string; highlight: string } {
        if (rssi === null) {
            return SIGNAL_COLORS.unknown;
        }
        if (rssi > SIGNAL_STRONG_THRESHOLD) {
            return SIGNAL_COLORS.strong;
        }
        if (rssi > SIGNAL_MEDIUM_THRESHOLD) {
            return SIGNAL_COLORS.medium;
        }
        return SIGNAL_COLORS.weak;
    }

    /**
     * How weak a signal is, from 0 (strong) to 1 (weak). Used as the distance of a device from its
     * gateway, so that the ring also shows the signal strength and not only the assignment.
     *
     * @param rssi signal strength in dBm, `null` if unknown
     */
    private static getWeakness(rssi: number | null): number {
        if (rssi === null) {
            return 1;
        }
        const clamped = Math.min(RSSI_RANGE.strong, Math.max(RSSI_RANGE.weak, rssi));

        return (RSSI_RANGE.strong - clamped) / (RSSI_RANGE.strong - RSSI_RANGE.weak);
    }

    /** Radius of the ring on which the devices of one gateway are placed. */
    private static getRingRadius(deviceCount: number): number {
        return Math.max(RING_MIN_RADIUS, (deviceCount * RING_SPACING) / (2 * Math.PI));
    }

    /**
     * Name/icon of the ioBroker device object behind a Shelly device ID like `shellyplusht-a1b2c3`.
     *
     * @param src
     */
    private resolveGateway(src: string): GatewayInfo {
        const serial = src.split('-').pop();
        return (serial && this.gatewaysBySerial[serial.toLowerCase()]) || { name: src };
    }

    /**
     * Build the nodes and edges for the graph. The whole layout is calculated here and every node
     * gets a fixed position, the physics engine is switched off: the gateways sit on a circle and
     * the devices of a gateway on a ring around it, the weaker the signal the further out. That is
     * stable (nothing moves when a value changes) and much easier to read than a force layout,
     * which pulled the gateways into one cluster and let the connections cross each other.
     *
     * @param devices the BLE devices with their reception info
     * @param options which connections and labels to draw
     */
    private buildGraph(
        devices: BleDeviceInfo[],
        options?: { allLinks?: boolean; rssiLabels?: boolean; selectedGateway?: string | null },
    ): { nodes: BleGraphNode[]; edges: BleGraphEdge[] } {
        const allLinks = options?.allLinks ?? this.state.allLinks;
        const rssiLabels = options?.rssiLabels ?? this.state.rssiLabels;
        const selected = options?.selectedGateway !== undefined ? options.selectedGateway : this.state.selectedGateway;

        // Devices which are received by the selected gateway stay fully visible, everything else is
        // dimmed - including devices which have nothing to do with that gateway.
        const highlighted = new Set<string>();
        if (selected) {
            for (const device of devices) {
                if (device.links[selected]) {
                    highlighted.add(device.id);
                }
            }
        }

        const dark = this.props.oContext.themeType === 'dark';
        const fontColor = dark ? '#e0e0e0' : '#333333';
        const dimmedFontColor = dark ? 'rgba(224, 224, 224, 0.35)' : 'rgba(51, 51, 51, 0.35)';

        const nodes: BleGraphNode[] = [];
        const edges: BleGraphEdge[] = [];
        const gateways: string[] = [];

        for (const device of devices) {
            for (const src of Object.keys(device.links)) {
                if (!gateways.includes(src)) {
                    gateways.push(src);
                }
            }
        }
        gateways.sort((a, b) => this.resolveGateway(a).name.localeCompare(this.resolveGateway(b).name));

        // Version of the gateway script - it is part of every message a gateway forwards
        const gatewayVersions: Record<string, string> = {};
        for (const device of devices) {
            for (const [src, link] of Object.entries(device.links)) {
                if (link.scriptVersion) {
                    gatewayVersions[src] = link.scriptVersion;
                }
            }
        }

        // Every device belongs to the gateway which receives it best - that is the gateway it is
        // drawn around. Additional connections (if switched on) only add lines, they do not move it.
        const byGateway: Record<string, BleDeviceInfo[]> = {};
        const unassigned: BleDeviceInfo[] = [];

        for (const device of devices) {
            const links = Object.entries(device.links);
            if (!links.length) {
                unassigned.push(device);
                continue;
            }
            const best = links.reduce((a, b) => ((b[1].rssi ?? -999) > (a[1].rssi ?? -999) ? b : a));
            (byGateway[best[0]] ||= []).push(device);
        }

        // The gateways sit on a circle which is exactly wide enough that the rings around two
        // neighbours do not touch: their distance is 2 * R * sin(PI / n).
        const maxRing =
            gateways.reduce(
                (max, src) => Math.max(max, BleMap.getRingRadius((byGateway[src] ?? []).length)),
                RING_MIN_RADIUS,
            ) *
            (1 + RING_WEAK_FACTOR);
        const gatewayCircleRadius =
            gateways.length < 2
                ? 0
                : Math.max(400, (2 * maxRing + RING_GAP) / (2 * Math.sin(Math.PI / gateways.length)));

        // Devices which all have the same name (e.g. several "BLU H&T Sensor") get the end of their
        // MAC address appended, otherwise they cannot be told apart in the graph.
        const nameCount: Record<string, number> = {};
        for (const device of devices) {
            nameCount[device.name] = (nameCount[device.name] || 0) + 1;
        }

        /**
         * Add one BLE device at the given position.
         *
         * @param device the device to add
         * @param x horizontal position
         * @param y vertical position
         */
        const addDeviceNode = (device: BleDeviceInfo, x: number, y: number): void => {
            const dimmed = !!selected && !highlighted.has(device.id);

            nodes.push({
                id: `ble_${device.id}`,
                label:
                    nameCount[device.name] > 1
                        ? `${device.name} (${device.mac.split(':').slice(-2).join(':')})`
                        : device.name,
                title: `${I18n.t('shelly_blemap_ble_device')}: ${device.name}\nMAC: ${device.mac}\n${I18n.t('shelly_blemap_received_by')}: ${Object.keys(device.links).length}`,
                shape: device.icon ? 'circularImage' : 'dot',
                image: device.icon,
                size: 20,
                borderWidth: 2,
                borderWidthSelected: 4,
                color: DEVICE_COLOR,
                opacity: dimmed ? DIMMED_OPACITY : 1,
                font: { color: dimmed ? dimmedFontColor : fontColor },
                x: Math.round(x),
                y: Math.round(y),
                fixed: true,
            });
        };

        gateways.forEach((src, index) => {
            const gateway = this.resolveGateway(src);
            const dimmed = !!selected && src !== selected;
            const gatewayAngle = (2 * Math.PI * index) / gateways.length - Math.PI / 2;
            const gatewayX = Math.cos(gatewayAngle) * gatewayCircleRadius;
            const gatewayY = Math.sin(gatewayAngle) * gatewayCircleRadius;

            nodes.push({
                id: `gw_${src}`,
                label: gateway.name,
                title:
                    `${I18n.t('shelly_blemap_gateway')}: ${gateway.name}\n${I18n.t('shelly_blemap_device_id')}: ${src}` +
                    (gatewayVersions[src]
                        ? `\n${I18n.t('shelly_blemap_script_version')}: ${gatewayVersions[src]}`
                        : ''),
                shape: gateway.icon ? 'circularImage' : 'dot',
                image: gateway.icon,
                size: 34,
                x: Math.round(gatewayX),
                y: Math.round(gatewayY),
                fixed: true,
                font: { size: 16, color: dimmed ? dimmedFontColor : fontColor },
                borderWidth: 4,
                borderWidthSelected: 6,
                color: GATEWAY_COLOR,
                opacity: dimmed ? DIMMED_OPACITY : 1,
            });

            // Devices of this gateway on a ring around it, sorted by signal strength so that the
            // ring runs from the best to the worst reception instead of jumping back and forth.
            const own = (byGateway[src] ?? [])
                .slice()
                .sort((a, b) => (b.links[src]?.rssi ?? -999) - (a.links[src]?.rssi ?? -999));
            const ringRadius = BleMap.getRingRadius(own.length);

            own.forEach((device, deviceIndex) => {
                const angle = (2 * Math.PI * deviceIndex) / own.length + gatewayAngle;
                const distance = ringRadius * (1 + RING_WEAK_FACTOR * BleMap.getWeakness(device.links[src].rssi));

                addDeviceNode(device, gatewayX + Math.cos(angle) * distance, gatewayY + Math.sin(angle) * distance);
            });
        });

        // Devices which are currently not received by any gateway: on a ring around everything
        const outerRadius = gatewayCircleRadius + maxRing + RING_MIN_RADIUS;
        unassigned.forEach((device, index) => {
            const angle = (2 * Math.PI * index) / unassigned.length - Math.PI / 2;

            addDeviceNode(device, Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
        });

        for (const device of devices) {
            let links = Object.entries(device.links);

            // By default only the gateway with the best signal is drawn. That answers "which device
            // belongs to which gateway" without turning the map into a hairball.
            if (!allLinks && links.length > 1) {
                const strongest = links.reduce((best, link) =>
                    (link[1].rssi ?? -999) > (best[1].rssi ?? -999) ? link : best,
                );

                // A selected gateway always shows all of its own connections, also the weaker ones
                links =
                    selected && device.links[selected] && strongest[0] !== selected
                        ? [strongest, [selected, device.links[selected]]]
                        : [strongest];
            }

            for (const [src, link] of links) {
                const color = BleMap.getSignalColor(link.rssi);
                const stale = link.ts !== null && Date.now() - link.ts > STALE_MS;
                const lastSeen = link.ts ? new Date(link.ts).toLocaleString() : '?';
                const version = link.scriptVersion
                    ? `\n${I18n.t('shelly_blemap_script_version')}: ${link.scriptVersion}`
                    : '';

                const dimmed = !!selected && src !== selected;

                edges.push({
                    id: `${device.id}_${src}`,
                    from: `gw_${src}`,
                    to: `ble_${device.id}`,
                    label: rssiLabels && link.rssi !== null ? `${link.rssi} dBm` : undefined,
                    title: `${this.resolveGateway(src).name} \u2192 ${device.name}\n${I18n.t('shelly_blemap_signal')}: ${link.rssi ?? '?'} dBm\n${I18n.t('shelly_blemap_last_seen')}: ${lastSeen}${version}`,
                    color: { ...color, opacity: dimmed ? DIMMED_OPACITY : 1 },
                    font: { color: dimmed ? dimmedFontColor : fontColor },
                    dashes: stale,
                    width: stale ? 1 : 2,
                });
            }
        }

        return { nodes, edges };
    }

    private renderLegend(): React.JSX.Element {
        const entries: { color: string; label: string }[] = [
            {
                color: SIGNAL_COLORS.strong.color,
                label: `${I18n.t('shelly_blemap_strong')} (> ${SIGNAL_STRONG_THRESHOLD} dBm)`,
            },
            {
                color: SIGNAL_COLORS.medium.color,
                label: `${I18n.t('shelly_blemap_medium')} (> ${SIGNAL_MEDIUM_THRESHOLD} dBm)`,
            },
            {
                color: SIGNAL_COLORS.weak.color,
                label: `${I18n.t('shelly_blemap_weak')} (≤ ${SIGNAL_MEDIUM_THRESHOLD} dBm)`,
            },
        ];

        return (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {entries.map(entry => (
                    <Box
                        key={entry.label}
                        sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}
                    >
                        <Box sx={{ width: 20, height: 3, borderRadius: 1, backgroundColor: entry.color }} />
                        <Typography variant="caption">{entry.label}</Typography>
                    </Box>
                ))}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 20,
                            height: 0,
                            borderTop: '3px dashed',
                            borderColor: SIGNAL_COLORS.unknown.color,
                        }}
                    />
                    <Typography variant="caption">{I18n.t('shelly_blemap_stale')}</Typography>
                </Box>
            </Box>
        );
    }

    /**
     * A node was clicked: selecting a gateway highlights it with all its connections, every other
     * click (another gateway node, a device or the background) clears the selection again.
     *
     * @param nodeId id of the clicked node or `null` for a click next to a node
     */
    private onSelectNode = (nodeId: string | null): void => {
        const clicked = nodeId?.startsWith('gw_') ? nodeId.substring(3) : null;
        const selectedGateway = clicked && clicked !== this.state.selectedGateway ? clicked : null;

        if (selectedGateway === this.state.selectedGateway) {
            return;
        }

        this.setState({ selectedGateway, ...this.buildGraph(this.state.devices, { selectedGateway }) });
    };

    /**
     * Toggle one of the two filters and rebuild the graph with it.
     *
     * @param key the filter to toggle
     */
    private toggleFilter(key: 'allLinks' | 'rssiLabels'): void {
        const options = { allLinks: this.state.allLinks, rssiLabels: this.state.rssiLabels, [key]: !this.state[key] };

        this.setState({
            ...options,
            refitToken: this.state.refitToken + 1,
            ...this.buildGraph(this.state.devices, options),
        });
    }

    renderItem(): React.JSX.Element {
        const gatewayCount = this.state.nodes.filter(node => node.id.startsWith('gw_')).length;

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 400 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', px: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                        {I18n.t('shelly_blemap_summary', String(this.state.devices.length), String(gatewayCount))}
                    </Typography>
                    <Tooltip title={I18n.t('shelly_blemap_fit')}>
                        <IconButton
                            size="small"
                            onClick={() => this.graphRef.current?.fit()}
                        >
                            <CenterFocusStrong />
                        </IconButton>
                    </Tooltip>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={this.state.allLinks}
                                onChange={() => this.toggleFilter('allLinks')}
                            />
                        }
                        label={<Typography variant="caption">{I18n.t('shelly_blemap_all_links')}</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={this.state.rssiLabels}
                                onChange={() => this.toggleFilter('rssiLabels')}
                            />
                        }
                        label={<Typography variant="caption">{I18n.t('shelly_blemap_signal')}</Typography>}
                    />
                    {this.renderLegend()}
                </Box>
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    {this.state.ready && !this.state.devices.length ? (
                        <Typography sx={{ p: 2 }}>{I18n.t('shelly_blemap_no_devices')}</Typography>
                    ) : (
                        <BleNetworkGraph
                            ref={this.graphRef}
                            nodes={this.state.nodes}
                            edges={this.state.edges}
                            darkMode={this.props.oContext.themeType === 'dark'}
                            backgroundColor={this.props.oContext.theme.palette.background.default}
                            refitToken={this.state.refitToken}
                            onSelectNode={this.onSelectNode}
                        />
                    )}
                </Box>
            </Box>
        );
    }
}
