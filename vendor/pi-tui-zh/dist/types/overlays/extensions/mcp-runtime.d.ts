/**
 * Live MCP runtime view-model for `/extensions`.
 *
 * Discovery yields config (`MCPServer`). `MCPManager` holds the live connection.
 * This module joins them by server name without stuffing runtime objects into
 * `Extension.raw`.
 */
/** Config and connection fields actually consumed by the dashboard. */
export interface MCPServerConfigDisplay {
    type?: string;
    transport?: string;
    command?: string;
    args?: string[];
    url?: string;
    env?: Record<string, unknown>;
}
export interface MCPServerDisplay extends MCPServerConfigDisplay {
    name: string;
    enabled?: boolean;
    _source: unknown;
}
export interface MCPImplementationDisplay {
    name: string;
    version?: string;
    title?: string;
    description?: string;
    websiteUrl?: string;
}
export interface MCPResourceDisplay {
    name: string;
    title?: string;
    description?: string;
    uri?: string;
    uriTemplate?: string;
}
export interface MCPConnectionDisplay {
    name: string;
    config: MCPServerConfigDisplay;
    serverInfo?: MCPImplementationDisplay;
    instructions?: string;
    tools?: Array<{
        name: string;
        title?: string;
        description?: string;
        annotations?: {
            title?: string;
        };
        inputSchema?: unknown;
    }>;
    resources?: MCPResourceDisplay[];
    resourceTemplates?: MCPResourceDisplay[];
    prompts?: MCPResourceDisplay[];
}
export type MCPConnectionHealth = "connected" | "connecting" | "disconnected" | "inactive";
export interface MCPRuntimeCatalogItem {
    name: string;
    title?: string;
    description?: string;
    /** MCP `inputSchema` / bridged `parameters`. Rendered on expand. */
    parameters?: unknown;
}
export interface MCPRuntimeSnapshot {
    health: MCPConnectionHealth;
    transport: "stdio" | "sse" | "http";
    title?: string;
    description?: string;
    websiteUrl?: string;
    implementationName?: string;
    implementationVersion?: string;
    instructions?: string;
    tools: MCPRuntimeCatalogItem[];
    resources: MCPRuntimeCatalogItem[];
    prompts: MCPRuntimeCatalogItem[];
    command?: string;
    args?: string[];
    url?: string;
    envCount: number;
}
/** Narrow manager surface so tests can stub without constructing MCPManager. */
export interface MCPRuntimeSource {
    getConnectionStatus(name: string): "connected" | "connecting" | "disconnected";
    getConnection(name: string): MCPConnectionDisplay | undefined;
    getTools(): Array<{
        mcpServerName?: string;
        mcpToolName?: string;
        description?: string;
        label?: string;
        parameters?: unknown;
    }>;
    getServerResources?(name: string): {
        resources: MCPResourceDisplay[];
        templates: MCPResourceDisplay[];
    } | undefined;
    getServerPrompts?(name: string): MCPResourceDisplay[] | undefined;
}
export declare function isDiscoveredMcpServer(raw: unknown): raw is MCPServerDisplay;
export declare function inferMcpTransport(server: MCPServerDisplay | MCPServerConfigDisplay): "stdio" | "sse" | "http";
export declare function snapshotMcpRuntime(server: MCPServerDisplay, manager: MCPRuntimeSource | undefined, opts?: {
    enabled?: boolean;
    shadowed?: boolean;
}): MCPRuntimeSnapshot;
export declare function formatMcpListHint(snapshot: MCPRuntimeSnapshot): string;
export declare function formatMcpHealthLabel(health: MCPConnectionHealth): string;
export declare function visibleMcpTools(tools: MCPRuntimeCatalogItem[], limit?: number): {
    shown: MCPRuntimeCatalogItem[];
    hidden: number;
};
