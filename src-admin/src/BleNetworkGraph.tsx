import React from 'react';
import { Network, type Edge, type Node, type Options } from 'vis-network';
import { DataSet } from 'vis-data';

export type BleGraphNode = Node & { id: string };
export type BleGraphEdge = Edge & { id: string };

export interface BleNetworkGraphProps {
    nodes: BleGraphNode[];
    edges: BleGraphEdge[];
    darkMode: boolean;
    /** Background of the panel - used as outline of the labels so they stay readable above edges */
    backgroundColor: string;
    /** Every change of this value zooms to the whole graph again after the layout has settled */
    refitToken: number;
    /** Called with the id of the clicked node, or `null` if the click was next to a node */
    onSelectNode: (nodeId: string | null) => void;
}

/**
 * Renders the gateway/BLE-device star topology with vis-network. Nodes and edges are updated in
 * place (and not rebuilt) so that a new RSSI value only recolors an edge instead of rebuilding the
 * graph and making it jump around.
 *
 * All positions come from the caller and the physics engine is switched off - see `buildGraph()`.
 */
export default class BleNetworkGraph extends React.Component<BleNetworkGraphProps> {
    private readonly containerRef = React.createRef<HTMLDivElement>();
    private network?: Network;
    private nodesDataSet?: DataSet<BleGraphNode>;
    private edgesDataSet?: DataSet<BleGraphEdge>;
    private resizeObserver?: ResizeObserver;
    private fitDone = false;

    componentDidMount(): void {
        if (!this.containerRef.current) {
            return;
        }

        this.nodesDataSet = new DataSet<BleGraphNode>();
        this.edgesDataSet = new DataSet<BleGraphEdge>();

        this.network = new Network(
            this.containerRef.current,
            { nodes: this.nodesDataSet, edges: this.edgesDataSet },
            this.getNetworkOptions(),
        );

        this.network.on('click', params => this.props.onSelectNode((params.nodes?.[0] as string) ?? null));

        this.resizeObserver = new ResizeObserver(() => {
            const container = this.containerRef.current;
            if (this.network && container && container.clientWidth > 0 && container.clientHeight > 0) {
                this.network.setSize(`${container.clientWidth}px`, `${container.clientHeight}px`);
                this.network.redraw();
            }
        });
        this.resizeObserver.observe(this.containerRef.current);

        this.updateGraph();
    }

    componentDidUpdate(prevProps: BleNetworkGraphProps): void {
        if (prevProps.nodes !== this.props.nodes || prevProps.edges !== this.props.edges) {
            this.updateGraph();
        }
        if (prevProps.darkMode !== this.props.darkMode) {
            this.network?.setOptions(this.getNetworkOptions());
        }
        if (prevProps.refitToken !== this.props.refitToken) {
            // A filter was switched - show the new result completely
            this.fitDone = false;
            this.updateGraph();
        }
    }

    componentWillUnmount(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        this.network?.destroy();
        this.network = undefined;
    }

    /** Zoom the viewport to all nodes. Called from the toolbar button. */
    fit(): void {
        this.network?.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }

    private getNetworkOptions(): Options {
        const fontColor = this.props.darkMode ? '#e0e0e0' : '#333333';
        const strokeColor = this.props.backgroundColor;

        return {
            nodes: {
                shape: 'dot',
                size: 22,
                borderWidth: 2,
                // The outline keeps the labels readable where they cross a connection line
                font: { size: 13, color: fontColor, strokeWidth: 4, strokeColor },
            },
            edges: {
                width: 2,
                font: { size: 11, color: fontColor, strokeWidth: 4, strokeColor, align: 'top' },
                // Straight lines: with the gateways on a circle the curves only added visual noise
                smooth: false,
            },
            // The caller calculates every position, so no force layout is needed. That keeps the
            // picture stable: a new RSSI value recolors a line instead of moving the whole graph.
            physics: { enabled: false },
            interaction: { hover: true, tooltipDelay: 200, hideEdgesOnDrag: true, navigationButtons: false },
            layout: { improvedLayout: false },
        };
    }

    /**
     * IDs that are in the data set but no longer in the given items, so they must be removed.
     *
     * @param dataSet
     * @param items
     */
    private static getObsoleteIds(
        dataSet: DataSet<BleGraphNode> | DataSet<BleGraphEdge>,
        items: { id: string }[],
    ): string[] {
        const ids = new Set<string>(items.map(item => item.id));
        return dataSet
            .getIds()
            .map(String)
            .filter(id => !ids.has(id));
    }

    private updateGraph(): void {
        if (!this.nodesDataSet || !this.edgesDataSet) {
            return;
        }
        const { nodes, edges } = this.props;

        const obsoleteNodes = BleNetworkGraph.getObsoleteIds(this.nodesDataSet, nodes);
        if (obsoleteNodes.length) {
            this.nodesDataSet.remove(obsoleteNodes);
        }
        this.nodesDataSet.update(nodes);

        const obsoleteEdges = BleNetworkGraph.getObsoleteIds(this.edgesDataSet, edges);
        if (obsoleteEdges.length) {
            this.edgesDataSet.remove(obsoleteEdges);
        }
        this.edgesDataSet.update(edges);

        // Zoom to the whole graph the first time it has content, and again after a filter change.
        // Later updates must not move the viewport - the user may have panned or zoomed by then.
        if (!this.fitDone && nodes.length) {
            this.fitDone = true;
            this.fit();
        }
    }

    render(): React.JSX.Element {
        return (
            <div
                ref={this.containerRef}
                style={{ width: '100%', height: '100%' }}
            />
        );
    }
}
