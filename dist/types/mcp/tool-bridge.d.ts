import { type MCPToolDetails } from "@oh-my-pi/pi-tui-zh/tools/mcp";
/**
 * MCP to CustomTool bridge.
 *
 * Converts MCP tool definitions to CustomTool format for the agent.
 */
import type { AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { TSchema } from "@oh-my-pi/pi-ai";
import type { SourceMeta } from "../capability/types.js";
import type { CustomTool, CustomToolContext, CustomToolResult, RenderResultOptions } from "../extensibility/custom-tools/types.js";
import type { Theme } from "@oh-my-pi/pi-tui-zh/theme";
import type { MCPAuthChallenge, MCPServerConnection, MCPToolDefinition } from "./types.js";
/** Reconnect callback: tears down a stale connection, optionally authorizing first. */
export type MCPReconnect = (options?: {
    authChallenge?: MCPAuthChallenge;
}) => Promise<MCPServerConnection | null>;
export declare function isRetriableConnectionError(error: unknown): boolean;
/**
 * Mint the name {@link createMCPToolName} produced before digits were kept in
 * sanitized parts (`[^a-z_]+` collapsed to `_`). Digit-bearing servers/tools
 * were renamed by that fix, so user config keys written against the old form
 * (`tools.approval`, `tools.xdevInlineDevices`) would no longer match.
 * Approval resolution consults this legacy key as a fail-closed fallback.
 * Returns `undefined` when minting is unchanged (no digits involved).
 */
export declare function createLegacyMCPToolName(serverName: string, toolName: string): string | undefined;
export declare function createMCPToolName(serverName: string, toolName: string): string;
/**
 * Registry keys a model-emitted MCP tool name may have meant, in priority
 * order. Empty when the name is not `mcp__`-prefixed or is already canonical.
 *
 * {@link createMCPToolName} joins the sanitized server and tool with a SINGLE
 * underscore, but OMP presents itself as Claude Code, whose convention is
 * `mcp__<server>__<tool>` — so a primed model reliably emits the doubled
 * separator, often keeping the raw unsanitized server spelling as well
 * (`mcp__seedpatch-client__bank` for a server named `seedpatch-client`). Those
 * names are strictly unregistered, so dispatch dead-ends on a tool the session
 * really does expose.
 *
 * Candidates, because the doubled separator carries information the collapsed
 * form loses:
 *
 * 1. Split at a `__` and re-mint through the whole of `createMCPToolName`.
 *    Re-minting (rather than only sanitizing) is what reproduces
 *    redundant-server-prefix stripping — server `puppeteer` + tool
 *    `puppeteer_screenshot` registers as `mcp__puppeteer_screenshot`, not
 *    `mcp__puppeteer_puppeteer_screenshot` — and the 64-char
 *    {@link capMCPToolNameLength} hash. EVERY `__` is tried as the boundary:
 *    a *sanitized* server segment can never contain one, but the model
 *    routinely emits the RAW server name, which can (`foo__bar`), so the first
 *    occurrence is not necessarily the split. Earlier boundaries rank first
 *    since a server name without `__` is overwhelmingly the common case.
 * 2. Sanitize the whole suffix, for a single-separator name whose punctuation
 *    still differs from the minted key (`mcp__seedpatch-client_bank`). This
 *    candidate is capped too: without a boundary there is nothing to re-mint,
 *    but the registered key was still length-capped, so an overlong spelling
 *    would otherwise never match its hashed form. Unlike a split, it has no
 *    minted fallback shape to reproduce, so a suffix that sanitizes away yields
 *    nothing.
 *
 * This is normalization, not fuzzy matching: every candidate is derived from
 * the emitted name by the same rules that minted the registry, never selected
 * from siblings. `sanitizeMCPToolNamePart` is idempotent and registry keys are
 * already in its output form, so an already-registered name yields no
 * candidates at all and stays on the exact-match path. Callers try each
 * candidate as an exact lookup and keep failing when none is registered.
 */
export declare function canonicalMCPToolNameCandidates(name: string): string[];
/**
 * Resolve a Claude Code-spelled MCP call through an EXPLICIT lookup.
 *
 * The lookup is a required argument rather than something read from ambient
 * state, because the set a call must resolve against is the one offered to the
 * agent that emitted it. A resolver closing over one agent's tools and then
 * shared with another — the primary session's resolver also handed to the
 * isolated auto-learn capture agent, say — would let a capture response reach a
 * main-session tool it was never offered. Naming the source at every call site
 * makes that mistake unrepresentable.
 *
 * A caller whose tools span several presentation sets (mounted `xd://` devices
 * plus advertised top-level tools) MUST pass one lookup covering the union.
 * Checking each set with its own call and taking the first hit would let set
 * order silently break the uniqueness rule below.
 *
 * Resolution requires a UNIQUE match. Two different boundaries can both name a
 * registered tool — server `foo` + tool `bar__foo_bar_baz` and server
 * `foo__bar` + tool `foo_bar_baz` mint distinct keys yet share the spelling
 * `mcp__foo__bar__foo_bar_baz` — and nothing in the emitted name says which was
 * meant. Picking whichever boundary sorts first would execute an MCP operation
 * the model did not ask for, side effects included, so an ambiguous alias
 * resolves to nothing and the call stays a recoverable `not found`.
 *
 * Returns `undefined` unless exactly one {@link canonicalMCPToolNameCandidates}
 * entry resolves, so an already-registered name never reaches here and a
 * non-MCP name can never resolve at all.
 */
export declare function resolveMCPToolAlias<T extends {
    readonly name: string;
}>(name: string, lookup: (candidate: string) => T | undefined): T | undefined;
export interface MCPToolOriginSource {
    readonly name: string;
    readonly mcpServerName?: unknown;
    readonly mcpToolName?: unknown;
}
/** Stable identity for a tool's original MCP route, before its public name was normalized. */
export declare function getMCPToolOriginKey(tool: MCPToolOriginSource): string | undefined;
/**
 * Keeps one MCP tool per minted name and logs collisions between distinct MCP
 * origins. The winner is chosen by a stable origin key (server name + original
 * tool name), NOT array order: MCPManager re-appends a reconnecting server's
 * tools, so insertion order is mutable across reconnects and first-wins would
 * silently flip ownership of the minted name. Non-MCP tools pass through
 * unchanged.
 */
export declare function deduplicateMCPToolsByName<T extends MCPToolOriginSource>(tools: readonly T[]): T[];
/**
 * CustomTool wrapping an MCP tool with an active connection.
 */
export declare class MCPTool implements CustomTool<TSchema, MCPToolDetails> {
    private connection;
    private readonly tool;
    private readonly reconnect?;
    readonly name: string;
    /**
     * Name this tool had before digits were kept in minted names, if different.
     * Approval resolution honors `deny`/`prompt` user policies written against
     * this key so the rename cannot silently unblock a restricted MCP server.
     */
    readonly legacyName?: string;
    readonly label: string;
    readonly description: string;
    readonly parameters: TSchema;
    /** Original MCP tool name (before normalization) */
    readonly mcpToolName: string;
    /** Server name */
    readonly mcpServerName: string;
    readonly approval: "write";
    /** Render completed MCP calls with the result header replacing the pending call header. */
    readonly mergeCallAndResult = true;
    /**
     * MCP-backed tools opt out of strict structured-output grammar. The server
     * owns validation, and strict mode makes OpenAI-family models over-fill
     * mutually exclusive optional fields (#4336/#4340). Serializers preserve an
     * explicit `false`; an omitted flag would leave nothing to preserve.
     */
    readonly strict: false;
    /** Create MCPTool instances for all tools from an MCP server connection */
    static fromTools(connection: MCPServerConnection, tools: MCPToolDefinition[], reconnect?: MCPReconnect): MCPTool[];
    constructor(connection: MCPServerConnection, tool: MCPToolDefinition, reconnect?: MCPReconnect | undefined);
    renderCall(args: unknown, _options: RenderResultOptions, theme: Theme): import("@oh-my-pi/pi-tui-zh").Component;
    renderResult(result: CustomToolResult<MCPToolDetails>, options: RenderResultOptions, theme: Theme, args?: unknown): import("@oh-my-pi/pi-tui-zh").Component;
    describeCall(args: unknown, _options: RenderResultOptions): import("@oh-my-pi/pi-tui-zh/tools").NativeToolView;
    describeResult(result: CustomToolResult<MCPToolDetails>, options: RenderResultOptions, args?: unknown): import("@oh-my-pi/pi-tui-zh/tools").NativeToolView | undefined;
    execute(_toolCallId: string, params: unknown, _onUpdate: AgentToolUpdateCallback<MCPToolDetails> | undefined, _ctx: CustomToolContext, signal?: AbortSignal): Promise<CustomToolResult<MCPToolDetails>>;
}
/**
 * CustomTool wrapping an MCP tool with deferred connection resolution.
 */
export declare class DeferredMCPTool implements CustomTool<TSchema, MCPToolDetails> {
    #private;
    private readonly serverName;
    private readonly tool;
    private readonly getConnection;
    private readonly reconnect?;
    readonly name: string;
    /** See {@link MCPTool.legacyName}. */
    readonly legacyName?: string;
    readonly label: string;
    readonly description: string;
    readonly parameters: TSchema;
    /** Original MCP tool name (before normalization) */
    readonly mcpToolName: string;
    /** Server name */
    readonly mcpServerName: string;
    readonly approval: "write";
    /** Render completed MCP calls with the result header replacing the pending call header. */
    readonly mergeCallAndResult = true;
    /** See {@link MCPTool.strict}: MCP servers own validation, so stay non-strict. */
    readonly strict: false;
    /** Create DeferredMCPTool instances for all tools from an MCP server */
    static fromTools(serverName: string, tools: MCPToolDefinition[], getConnection: () => Promise<MCPServerConnection>, source?: SourceMeta, reconnect?: MCPReconnect): DeferredMCPTool[];
    constructor(serverName: string, tool: MCPToolDefinition, getConnection: () => Promise<MCPServerConnection>, source?: SourceMeta, reconnect?: MCPReconnect | undefined);
    renderCall(args: unknown, _options: RenderResultOptions, theme: Theme): import("@oh-my-pi/pi-tui-zh").Component;
    renderResult(result: CustomToolResult<MCPToolDetails>, options: RenderResultOptions, theme: Theme, args?: unknown): import("@oh-my-pi/pi-tui-zh").Component;
    describeCall(args: unknown, _options: RenderResultOptions): import("@oh-my-pi/pi-tui-zh/tools").NativeToolView;
    describeResult(result: CustomToolResult<MCPToolDetails>, options: RenderResultOptions, args?: unknown): import("@oh-my-pi/pi-tui-zh/tools").NativeToolView | undefined;
    execute(_toolCallId: string, params: unknown, _onUpdate: AgentToolUpdateCallback<MCPToolDetails> | undefined, _ctx: CustomToolContext, signal?: AbortSignal): Promise<CustomToolResult<MCPToolDetails>>;
}
