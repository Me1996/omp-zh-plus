import type { TSchema } from "@oh-my-pi/pi-ai";
import type { EffectiveExtensionRoots, SourceMeta } from "../capability/types.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
import type { AuthStorage } from "../session/auth-storage.js";
import { type LoadMCPConfigsOptions, type LoadMCPConfigsResult } from "./config.js";
import type { McpConnectionStatusEvent } from "./startup-events.js";
import type { MCPToolDetails } from "@oh-my-pi/pi-tui-zh/tools/mcp";
import type { MCPToolCache } from "./tool-cache.js";
import type { MCPAuthChallenge, MCPGetPromptResult, MCPPrompt, MCPRequestOptions, MCPResource, MCPResourceReadResult, MCPResourceTemplate, MCPServerConfig, MCPServerConnection } from "./types.js";
export type McpCatalogChangeEvent = {
    serverName: string;
    kind: "resources" | "prompts";
};
export type MCPConfigLoader = (cwd: string, options?: LoadMCPConfigsOptions) => Promise<LoadMCPConfigsResult>;
/**
 * How {@link MCPManager} paces reconnects after a transport is lost.
 *
 * `ladderMs` are the sleeps between the attempts one `reconnectServer` call
 * makes before giving up; every caller that awaits a reconnect (tool calls,
 * `/mcp reconnect`, {@link MCPManager.waitForConnection}) is bounded by it.
 *
 * When the ladder fails for an `http`/`sse` server that was connected and
 * then lost, the manager keeps trying on its own: one quiet attempt after
 * `retryBaseMs`, doubling up to `retryMaxMs`, until the server answers or the
 * server is disconnected or reconfigured. A remote server that is merely
 * restarting (a redeploy, a laptop waking with the network not yet back)
 * comes back on its own schedule, and until it does the manager's resource
 * subscriptions are dead while nothing else would reconnect them: without the
 * schedule the server stays "not connected" until a tool call happens to hit
 * it or the user notices. Each scheduled attempt is a full connect — auth
 * resolution included — lasting up to the server's `timeout`; a reconnect
 * requested meanwhile shares it, and the server reads `connecting` for that
 * long. Stdio servers stop at the ladder: a process that exited is not
 * brought back by waiting, and re-spawning it on a timer is the fork storm
 * {@link RECONNECT_BURST_LIMIT} exists to stop.
 */
export interface MCPReconnectPolicy {
    readonly ladderMs: readonly number[];
    readonly retryBaseMs: number;
    readonly retryMaxMs: number;
}
/**
 * Stable, total ordering on MCP tools by name.
 *
 * Anthropic prompt caching keys on byte-identical tool definitions: any reorder
 * of the tools array invalidates the tools cache breakpoint and forces a full
 * prefix rebuild on the next request. MCP servers connect/reconnect at arbitrary
 * times, so the natural "insertion order" of `#tools` is non-deterministic.
 * Sorting after every mutation makes the array bytes independent of connection
 * sequence.
 */
export declare function sortMCPToolsByName<T extends {
    name: string;
}>(tools: T[]): T[];
export declare function resolveSubscriptionPostAction(notificationsEnabled: boolean, currentEpoch: number, subscriptionEpoch: number): "rollback" | "ignore" | "apply";
/** Result of loading MCP tools */
export interface MCPLoadResult {
    /** Loaded tools as CustomTool instances */
    tools: CustomTool<TSchema, MCPToolDetails>[];
    /** Connection errors by server name */
    errors: Map<string, string>;
    /** Connected server names */
    connectedServers: string[];
    /** Extracted Exa API keys from filtered MCP servers */
    exaApiKeys: string[];
}
/** Readiness of configured MCP servers after the initial tool handshake. */
export interface MCPStartupStatus {
    /** Servers whose tools have been registered and whose startup callbacks completed. */
    connected: string[];
    /** Servers still loading tools or reconnecting at the deadline. */
    pending: string[];
    /** Servers whose connection or tool handshake failed. */
    failed: Array<{
        name: string;
        error: string;
    }>;
}
/** Options for discovering and connecting to MCP servers */
export interface MCPDiscoverOptions {
    /** Whether to load project-level config (default: true) */
    enableProjectConfig?: boolean;
    /** Whether to filter out Exa MCP servers (default: true) */
    filterExa?: boolean;
    /** Whether to filter out browser MCP servers when the built-in browser capability is enabled (default: false) */
    filterBrowser?: boolean;
    /** Session-local extension roots for post-startup rediscovery (explicit + mode + configured). */
    extensionRoots?: EffectiveExtensionRoots;
    /** Called when MCP server connection state changes. */
    onStatus?: (event: McpConnectionStatusEvent) => void;
    /** Non-blocking discovery window in milliseconds; environment override wins. */
    startupTimeoutMs?: number;
}
/** Handles an MCP `WWW-Authenticate` challenge and returns refreshed config. */
export type MCPAuthHandler = (serverName: string, challenge: MCPAuthChallenge) => Promise<MCPServerConfig | undefined>;
/**
 * MCP Server Manager.
 *
 * Manages connections to MCP servers and provides tools to the agent.
 */
export declare class MCPManager {
    #private;
    private cwd;
    private toolCache;
    private loadConfigs;
    private reconnectPolicy;
    /** Process-global instance shared by internal URL protocol handlers and tools. */
    static instance(): MCPManager | undefined;
    /** Install or clear the process-global instance. */
    static setInstance(value: MCPManager | undefined): void;
    /** Reset the process-global instance. Test-only. */
    static resetForTests(): void;
    constructor(cwd: string, toolCache?: MCPToolCache | null, loadConfigs?: MCPConfigLoader, reconnectPolicy?: MCPReconnectPolicy);
    /**
     * Register a listener for MCP connection lifecycle events
     * (`connecting` / `connected` / `failed`).
     *
     * Returns an unsubscribe function. Listener failures are isolated — a
     * listener that throws does not prevent other listeners from firing.
     */
    addConnectionStatusListener(listener: (event: McpConnectionStatusEvent) => void): () => void;
    /**
     * Register a listener for MCP catalog refreshes (`resources` / `prompts`).
     *
     * Connection lifecycle stays on {@link addConnectionStatusListener}. This
     * fires after a successful catalog refresh so `/extensions` can repaint
     * without treating catalog load as another `connected` event.
     *
     * Returns an unsubscribe function. Listener failures are isolated.
     */
    addCatalogChangeListener(listener: (event: McpCatalogChangeEvent) => void): () => void;
    /**
     * Register a listener for server-initiated MCP notifications.
     *
     * The listener is called for every JSON-RPC notification received from any
     * connected server, AFTER the manager's own handling of known methods
     * (`notifications/tools/list_changed`, `notifications/resources/list_changed`,
     * `notifications/resources/updated`, `notifications/prompts/list_changed`).
     * For list-change methods the internal refresh promise is awaited before
     * fanout, so listeners observe up-to-date manager and tool state. Unknown
     * or server-custom methods are also delivered, letting consumers bridge
     * server-initiated events into session-level behavior (e.g. an extension
     * injecting a steer via `pi.sendMessage`).
     *
     * Notifications received before any listener attached are buffered
     * (bounded FIFO, cap {@link NOTIFICATION_BUFFER_CAP}, drop-oldest) and
     * drained into the first subscriber — matches {@link setOnPromptsChanged}'s
     * replay-on-attach and {@link IrcBus}'s mailbox semantics.
     *
     * Returns an unsubscribe function; call it to remove the listener.
     *
     * Multiple listeners are allowed; each is invoked with independent error
     * isolation — a listener that throws does not prevent other listeners from
     * firing.
     */
    addNotificationListener(listener: (serverName: string, method: string, params: unknown) => void): () => void;
    /**
     * Set a callback to fire when any server's tools change.
     *
     * May return a Promise; if so, {@link refreshServerTools} awaits it so that
     * downstream consumers (e.g. `mcp_notification` listeners for
     * `notifications/tools/list_changed`) observe not just the manager's
     * refreshed tool set but also any session-level rebind driven by the
     * handler (`session.refreshMCPTools`). Other callsites (initial connect,
     * disconnect, reconnect) invoke the handler synchronously — their downstream
     * chains don't need to serialize on the rebind.
     */
    setOnToolsChanged(handler: (tools: CustomTool<TSchema, MCPToolDetails>[]) => void | Promise<void>): void;
    /**
     * Set a callback to fire when any server's resources change.
     */
    setOnResourcesChanged(handler: (serverName: string, uri: string) => void): void;
    /**
     * Set a callback to fire when any server's prompts change.
     */
    setOnPromptsChanged(handler: (serverName: string) => void): void;
    setNotificationsEnabled(enabled: boolean): void;
    /**
     * Set the auth storage for resolving OAuth credentials.
     */
    setAuthStorage(authStorage: AuthStorage): void;
    /** Set the callback used to complete OAuth after a tool-level auth challenge. */
    setAuthHandler(handler: MCPAuthHandler | undefined): void;
    /**
     * Discover and connect to all MCP servers from .mcp.json files.
     * Returns tools and any connection errors.
     */
    discoverAndConnect(options?: MCPDiscoverOptions): Promise<MCPLoadResult>;
    /**
     * Reconcile browser-automation MCP servers with the built-in browser prelude.
     * Calls are serialized so rapid setting toggles cannot reconnect a server
     * after a newer enable has filtered it again.
     */
    reconcileBrowserFilter(enabled: boolean): Promise<void>;
    /**
     * Apply a live `mcp.enableProjectConfig` change: disconnect project-level
     * servers when disabled (restoring any user-level server they shadowed), or
     * connect them when enabled. Serialized with the browser-filter reconcile; a
     * no-op before the first discovery, which reads the flag itself.
     */
    reconcileProjectConfig(enabled: boolean): Promise<void>;
    /**
     * Connect to specific MCP servers.
     * Connections are made in parallel for faster startup.
     *
     * Incremental: tools for already-owned connections stay in {@link getTools}.
     * Each newly resolved server is merged via {@link MCPManager.#replaceServerTools}.
     * Interactive enable (`/mcp enable`, `/extensions`) can pass a single
     * `{ [name]: config }` without wiping the rest of the registry.
     */
    connectServers(configs: Record<string, MCPServerConfig>, sources: Record<string, SourceMeta>, onStatus?: (event: McpConnectionStatusEvent) => void, startupTimeoutMs?: number): Promise<MCPLoadResult>;
    /**
     * Get all loaded tools.
     */
    getTools(): CustomTool<TSchema, MCPToolDetails>[];
    /**
     * Wait for configured servers' initial tools (including timeout-triggered reconnects).
     * Zero disables the barrier deadline; an unresponsive server can then wait indefinitely.
     * Tool-change callbacks are drained before returning; callers should still refresh their
     * session with the final tool snapshot before sending a prompt.
     */
    waitForStartup(timeoutMs: number): Promise<MCPStartupStatus>;
    /**
     * Get a specific connection.
     */
    getConnection(name: string): MCPServerConnection | undefined;
    /**
     * Get current connection status for a server.
     */
    getConnectionStatus(name: string): "connected" | "connecting" | "disconnected";
    /**
     * Get the source metadata for a server.
     */
    getSource(name: string): SourceMeta | undefined;
    /**
     * Get the preserved (pre-auth) config for a known server — whether currently
     * connected or merely discovered (a connect was attempted but may have failed,
     * e.g. an OAuth server that has not been authorized yet). Mirrors the
     * reconnect lookup at {@link reconnectServer} so callers like `/mcp reauth`
     * can recover a discovered server's config without re-reading config files.
     */
    getServerConfig(name: string): MCPServerConfig | undefined;
    /**
     * Wait for a connection to complete (or fail).
     */
    waitForConnection(name: string): Promise<MCPServerConnection>;
    /**
     * Wait for every in-flight connect, tool load, and reconnect to settle.
     *
     * One-shot callers (e.g. `omp read <mcp-resource>`) discover servers and read
     * immediately; a server whose handshake outlasts the {@link connectServers}
     * startup race is still tracked in {@link #pendingConnections} /
     * {@link #pendingToolLoads} and therefore invisible to
     * {@link getConnectedServers}. Awaiting the pending work lets those callers
     * observe the final attached/failed state instead of racing mid-handshake.
     * Rejections are swallowed — the caller re-reads state afterwards.
     */
    waitForPendingConnections(): Promise<void>;
    /**
     * Resolve auth and shell-command substitutions in config before connecting.
     * Pass `oauth: false` to skip OAuth credential injection (used by reauth's
     * unauthenticated probe, which must observe the server's bare 401).
     */
    prepareConfig(config: MCPServerConfig, options?: {
        oauth?: boolean;
    }): Promise<MCPServerConfig>;
    /**
     * Get all connected server names.
     */
    getConnectedServers(): string[];
    /**
     * Get all known server names (connected, connecting, or discovered).
     */
    getAllServerNames(): string[];
    /**
     * Disconnect from a specific server.
     */
    disconnectServer(name: string): Promise<void>;
    /**
     * Disconnect from all servers.
     */
    disconnectAll(): Promise<void>;
    /**
     * Reconnect to a server after a connection failure.
     *
     * Tears down the stale connection, re-resolves auth, establishes a new
     * connection, reloads tools, and notifies consumers. Concurrent calls for
     * the same server share one reconnection attempt. Returns the new
     * connection, or `null` if reconnection failed or the per-server crash
     * burst limit (see {@link RECONNECT_BURST_LIMIT}) is exceeded. A failed
     * reconnect of a remote server that was connected keeps being retried in
     * the background (see {@link MCPReconnectPolicy}).
     * @param options.manual - When `true`, resets the crash-burst window so a
     *   user-driven retry (e.g. `/mcp reconnect`) is never blocked by an
     *   earlier storm. Defaults to `false`; the transport `onClose` callback
     *   and the per-tool-call retry path in `tool-bridge` MUST NOT set it.
     */
    reconnectServer(name: string, options?: {
        manual?: boolean;
        authChallenge?: MCPAuthChallenge;
    }): Promise<MCPServerConnection | null>;
    /**
     * Refresh tools from a specific server.
     */
    refreshServerTools(name: string): Promise<void>;
    /**
     * Refresh tools from all servers.
     */
    refreshAllTools(): Promise<void>;
    /**
     * Refresh resources from a specific server.
     */
    refreshServerResources(name: string): Promise<void>;
    /**
     * Wait until a connected server's resource catalog has been loaded.
     * Coalesces with initial loading and notification-driven refreshes.
     */
    ensureServerResources(name: string): Promise<void>;
    /**
     * Refresh prompts from a specific server.
     */
    refreshServerPrompts(name: string): Promise<void>;
    /**
     * Get resources and templates for a specific server.
     */
    getServerResources(name: string): {
        resources: MCPResource[];
        templates: MCPResourceTemplate[];
    } | undefined;
    /**
     * Read a specific resource from a server.
     */
    readServerResource(name: string, uri: string, options?: MCPRequestOptions): Promise<MCPResourceReadResult | undefined>;
    /**
     * Get prompts for a specific server.
     */
    getServerPrompts(name: string): MCPPrompt[] | undefined;
    /**
     * Get a specific prompt from a server.
     */
    executePrompt(name: string, promptName: string, args?: Record<string, string>, options?: MCPRequestOptions): Promise<MCPGetPromptResult | undefined>;
    /**
     * Get server instructions allowed by config (for prompt injection and rebuild signatures).
     */
    getServerInstructions(): Map<string, string>;
    /**
     * Get notification state for display.
     */
    getNotificationState(): {
        enabled: boolean;
        subscriptions: Map<string, ReadonlySet<string>>;
    };
}
/**
 * Create an MCP manager and discover servers.
 * Convenience function for quick setup.
 */
export declare function createMCPManager(cwd: string, options?: MCPDiscoverOptions): Promise<{
    manager: MCPManager;
    result: MCPLoadResult;
}>;
