import { Agent, type AgentOptions, type AgentTelemetryConfig, type AgentTool, type ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { Effort, Model, ServiceTier, ServiceTierByFamily, SimpleStreamOptions } from "@oh-my-pi/pi-ai";
import type { DiscoverAuthStorageOptions } from "@oh-my-pi/pi-ai/auth-broker/discover";
import type { Dialect } from "@oh-my-pi/pi-ai/dialect";
import { type Rule } from "./capability/rule.js";
import type { EffectiveExtensionRoots } from "./capability/types.js";
import { ModelRegistry } from "./config/model-registry.js";
import { type ModelMatchPreferences } from "./config/model-resolver.js";
import { type PromptTemplate } from "./config/prompt-templates.js";
import { Settings } from "./config/settings.js";
import "./discovery/index.js";
import { type EvalPreludeDefinition } from "./eval/preludes.js";
import { type CustomCommandsLoadResult } from "./extensibility/custom-commands/index.js";
import { type ToolPathWithSource } from "./extensibility/custom-tools/index.js";
import type { CustomTool } from "./extensibility/custom-tools/types.js";
import { type ExtensionFactory, type ExtensionUIContext, type LoadExtensionsResult, type PreparedExtension, type ToolDefinition } from "./extensibility/extensions/index.js";
import { type LoadSkillsOptions, type Skill, type SkillWarning } from "./extensibility/skills.js";
import { type FileSlashCommand } from "./extensibility/slash-commands.js";
import type { HindsightSessionState } from "./hindsight/state.js";
import { type LocalProtocolOptions } from "./internal-urls/index.js";
import { MCPManager, type MCPToolsLoadResult } from "./mcp/index.js";
import type { MnemopiSessionState } from "./mnemopi/state.js";
import { type AgentRef, AgentRegistry } from "./registry/agent-registry.js";
import { AgentSession, type PlanYolo, type Prewalk } from "./session/agent-session.js";
import { type EffectiveSettingsScope } from "./session/auth-broker-config.js";
import type { AuthStorage } from "./session/auth-storage.js";
import { SessionManager } from "./session/session-manager.js";
import { type BuildSystemPromptResult } from "./system-prompt.js";
import type { AgentDefinition } from "./task/types.js";
import type { StructuredSubagentSchemaMode } from "@oh-my-pi/pi-tui-zh/tools/task";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import { BashTool, BUILTIN_TOOLS, createTools, EditTool, EvalTool, GlobTool, GrepTool, HIDDEN_TOOLS, type LspStartupServerInfo, ReadTool, type Tool, type ToolSession, WebSearchTool, WriteTool } from "./tools/index.js";
import { EventBus } from "./utils/event-bus.js";
import { type WorkspaceTree } from "./workspace-tree.js";
import { type SkillsSettings } from "./extensibility/settings.js";
export interface CreateAgentSessionOptions {
    /** Working directory for project-local discovery. Default: getProjectDir() */
    cwd?: string;
    /** Additional workspace directories beyond cwd (multi-root), absolute or cwd-relative. */
    additionalDirectories?: string[];
    /** Global config directory. Default: ~/.omp/agent */
    agentDir?: string;
    /** Spawns to allow. Default: "*" */
    spawns?: string;
    /** User-authorized model agents inherited from the parent session for nested delegation. */
    inheritedSessionAgents?: readonly AgentDefinition[];
    /** Auth storage for credentials. Default: discoverAuthStorage(agentDir) */
    authStorage?: AuthStorage;
    /** Model registry. Default: discoverModels(authStorage, agentDir) */
    modelRegistry?: ModelRegistry;
    /**
     * Request credential resolver. Defaults to the model registry's normal
     * session-affine resolver. Security scans use this narrow seam to keep one
     * durable OAuth row pinned for the operation without changing ordinary
     * provider routing.
     */
    getApiKey?: AgentOptions["getApiKey"];
    /**
     * Session whose stored credential affinities are copied into this session
     * before any child credential operation.
     * @internal
     */
    credentialSourceSessionId?: string;
    /** Model to use. Default: from settings, else first available */
    model?: Model;
    /**
     * Allow an explicit {@link model} to be rebound to its same-selector registry
     * entry after initial background discovery. The CLI enables this for models
     * it resolved from the registry; SDK-supplied model objects default to false
     * so caller-owned routing and limits remain authoritative.
     */
    rebindModelAfterDiscovery?: boolean;
    /**
     * Skip retry.fallbackChains validation while building the session; the host
     * MUST call `session.validateRetryFallbackChains()` once its first frame is
     * up. Validation composes the catalog slice of every provider a chain names,
     * so interactive startup keeps it off the first-frame path.
     */
    deferRetryFallbackValidation?: boolean;
    /** Raw model pattern(s) (e.g. from --model CLI flag) to resolve after extensions load.
     * Used when model lookup is deferred because extension-provided models aren't registered yet. */
    modelPattern?: string | string[];
    /** Authenticated fallback selector for deferred subagent model patterns. */
    modelPatternAuthFallback?: string;
    /** Role name used to install retry fallbacks after deferred subagent patterns resolve. */
    modelPatternFallbackRole?: string;
    /** Validated default retry chain to install when a deferred singleton pattern resolves. */
    modelPatternDefaultFallbackChain?: string[];
    /** Thinking selector. Default: from settings, else unset */
    thinkingLevel?: ConfiguredThinkingLevel;
    /** Hard ceiling on the session's thinking effort (e.g. a task spawn's `task.maxEffort`-capped hint); retry-fallback recovery re-clamps to it. */
    thinkingLevelCeiling?: Effort;
    /** OpenAI service-tier override for this session. `null` omits `service_tier`. */
    openAIServiceTier?: ServiceTier | null;
    /**
     * Enable prompt-cache warming for this session's main loop. Defaults to
     * `true`; one-shot and spawned sessions (task subagents, standalone
     * compaction, agentic commit) pass `false` so short-lived sessions never
     * schedule background warm requests.
     */
    cacheWarming?: boolean;
    /**
     * Per-family service tiers for this session, replacing the `tier.*` settings
     * and any persisted tier history. Called once the initial model is final —
     * after deferred `modelPattern` resolution and auth fallback — so the caller
     * can scope a tier to that model's provider family. The result is always
     * persisted, even when empty, so resume and cold revival restore it instead
     * of re-deriving tiers from settings.
     */
    resolveServiceTierByFamily?: (model: Model | undefined) => ServiceTierByFamily;
    /** Models available for cycling (Ctrl+P in interactive mode) */
    scopedModels?: Array<{
        model: Model;
        thinkingLevel?: ThinkingLevel;
    }>;
    /** Prewalk from the starting model to a fast/cheap target at the first edit/write once the todo list exists. */
    prewalk?: Prewalk;
    /** CLI prewalk selector awaiting extension provider registration; patterns retain role fallback order. */
    deferredPrewalk?: {
        target: string;
        patterns: string[];
    };
    /** Host-owned display sink for non-fatal startup prewalk warnings. */
    onPrewalkWarning?: (warning: string) => void;
    /** Force read-only plan mode at start, auto-approve on the model's first resolve call, then switch to execute. */
    planYolo?: PlanYolo;
    /** Provider-facing system prompt override. Replaces the fully rendered default blocks. */
    systemPrompt?: string | string[] | ((defaultPrompt: string[]) => string | string[]);
    /** Raw Handlebars template replacing the bundled default system prompt rendering. */
    systemPromptTemplate?: string;
    /** Already-loaded custom prompt text rendered through the bundled custom system prompt template. */
    customSystemPrompt?: string;
    /** Already-loaded text appended through the bundled system prompt templates. */
    appendSystemPrompt?: string;
    /**
     * Already-loaded title-generation system prompt override (typically
     * {@link discoverTitleSystemPromptFile} → {@link resolvePromptInput}). When
     * set, every automatic session-title generation path on this session — the
     * first-input title and the replan-driven refresh — uses this prompt
     * instead of the bundled default. Refresh on cwd change via
     * {@link AgentSession.setTitleSystemPrompt}.
     */
    titleSystemPrompt?: string;
    /** Optional provider-facing session identifier for prompt caches and sticky auth selection.
     * Keeps persisted session files isolated while reusing provider-side caches. */
    providerSessionId?: string;
    /** Optional provider-facing prompt cache key, distinct from request lineage. */
    providerPromptCacheKey?: string;
    /** Whether `providerPromptCacheKey` is caller-pinned or inherited from a full fork. */
    providerPromptCacheKeySource?: "explicit" | "fork";
    /** Absolute wall-clock deadline in Unix epoch milliseconds. */
    deadline?: number;
    /** Custom tools to register (in addition to built-in tools). Accepts both CustomTool and ToolDefinition. */
    customTools?: (CustomTool | ToolDefinition)[];
    /** Inline extensions (merged with discovery). */
    extensions?: ExtensionFactory[];
    /** Additional extension paths to load (merged with discovery). */
    additionalExtensionPaths?: string[];
    /** Disable extension discovery (explicit paths still load). */
    disableExtensionDiscovery?: boolean;
    /**
     * Live extension-root policy inherited by a child session. Keeps recursive
     * sub-discovery aligned with the parent while `preloadedExtensionPaths` only
     * optimizes extension-module loading.
     *
     * @internal
     */
    extensionRoots?: () => EffectiveExtensionRoots;
    /**
     * Pre-loaded extensions (skips file discovery and the per-session factory
     * call). Used by the CLI when extensions are loaded early to parse custom
     * flags — the same process owns the returned instances, so reusing them is
     * safe.
     *
     * NEVER pass this across session boundaries (e.g. parent → subagent).
     * `Extension` instances close over a parent-bound `ExtensionAPI` (cwd,
     * eventBus, runtime), and reusing them would route tools/handlers/commands
     * back through the parent. For subagents, forward
     * {@link preloadedPreparedExtensions} instead.
     *
     * @internal
     */
    preloadedExtensions?: LoadExtensionsResult;
    /**
     * Pre-discovered extension source paths. When provided, the filesystem-scan
     * inside `discoverExtensionPaths()` is skipped — the session still calls
     * `loadExtensions()` itself so each `Extension` is bound to THIS session's
     * `ExtensionAPI` (cwd, eventBus, runtime).
     *
     * Compatibility pass-through for callers that do not have prepared factories.
     */
    preloadedExtensionPaths?: string[];
    /**
     * Session-independent imported extension factories. Child sessions, including
     * restricted children, rebind these to their own ExtensionAPI without
     * re-evaluating the module graph. Restricted children retain hooks/providers,
     * but never expose extension-contributed tools.
     * @internal
     */
    preloadedPreparedExtensions?: readonly PreparedExtension[];
    /**
     * Pre-discovered custom-tool source paths from `.omp/tools/`, `.claude/tools/`,
     * plugins, etc. When provided, the filesystem-scan inside
     * `discoverCustomToolPaths()` is skipped — subagents inherit the parent's
     * scan result and call `loadCustomTools()` themselves so each session binds
     * tools to its OWN `CustomToolAPI` (cwd, exec, pushPendingAction, UI).
     *
     * Forwarding the loaded `LoadedCustomTool[]` instances directly would reuse
     * the parent's session-bound API and route tool execution back through the
     * parent — wrong for isolated tasks and for pending-action routing.
     */
    preloadedCustomToolPaths?: ToolPathWithSource[];
    /** Shared event bus for tool/extension communication. Default: creates new bus. */
    eventBus?: EventBus;
    /**
     * Root-scoped bus carrying `task:subagent:*` observability frames for this
     * session and every subagent it spawns. Default: creates a new bus per
     * root session; `buildSubagentSessionOptions` inherits the spawner's.
     */
    subagentEventBus?: EventBus;
    /** Skills. Default: discovered from multiple locations */
    skills?: Skill[];
    /** Rules. Default: discovered from multiple locations */
    rules?: Rule[];
    /** Context files (AGENTS.md content). Default: discovered walking up from cwd */
    contextFiles?: Array<{
        path: string;
        content: string;
    }>;
    /** Pre-built workspace tree (skips re-scanning; passed by parents to subagents). */
    workspaceTree?: WorkspaceTree;
    /** Prompt templates. Default: discovered from cwd/.omp/prompts/ + agentDir/prompts/ */
    promptTemplates?: PromptTemplate[];
    /** File-based slash commands. Default: discovered from commands/ directories */
    slashCommands?: FileSlashCommand[];
    /**
     * Enable MCP capabilities. `false` skips MCP discovery and ignores
     * `mcpManager`, preventing process-global or inherited MCP access. Default:
     * true.
     */
    enableMCP?: boolean;
    /** Existing MCP manager to reuse when MCP is enabled (skips discovery, propagates to toolSession). */
    mcpManager?: MCPManager;
    /** Enable LSP integration (tool, formatting, diagnostics, warmup). Default: true */
    enableLsp?: boolean;
    /** Restrict LSP to navigation and diagnostics even when enabled. Defaults to true for restricted sessions. */
    lspReadOnly?: boolean;
    /** Whether this invocation may expose IRC. `false` removes it even for subagents. */
    enableIrc?: boolean;
    /** Skip subprocess-kernel availability checks and prelude warmup */
    skipPythonPreflight?: boolean;
    /** Tool names explicitly requested (enables disabled-by-default tools) */
    toolNames?: string[];
    /** Limit the session to explicitly supplied tool names, without discovered extras. */
    restrictToolNames?: boolean;
    /**
     * Permit only caller-supplied SDK custom tools inside a restricted session.
     * They must still be named in {@link toolNames}; discovered extensions, MCP,
     * and ambient custom tools remain disabled. Default: false.
     */
    allowRestrictedCustomTools?: boolean;
    /** Output schema for structured completion (subagents). */
    outputSchema?: unknown;
    /** Enforcement policy for {@link outputSchema}; defaults to legacy permissive behavior. */
    outputSchemaMode?: StructuredSubagentSchemaMode;
    /** Whether to include the yield tool by default */
    requireYieldTool?: boolean;
    /**
     * Whether this top-level session takes over, until disposed, the process-global state that
     * follows one settings instance: setting effects and capability provider toggles. Helper
     * sessions a host session spawns on its behalf (security scan, agent-spec generation) pass
     * `false`. Subagents (`parentTaskPrefix`/`taskDepth`) never bind. Default: true.
     */
    bindProcessState?: boolean;
    /** Task recursion depth (for subagent sessions). Default: 0 */
    taskDepth?: number;
    /** Parent Hindsight state to alias for subagent memory tools. */
    parentHindsightSessionState?: HindsightSessionState;
    /** Parent Mnemopi state to alias for subagent memory tools. */
    parentMnemopiSessionState?: MnemopiSessionState;
    /** Pre-allocated agent identity for IRC routing. Default: "Main" for top-level, parentTaskPrefix-derived for sub. */
    agentId?: string;
    /** Display name for the agent in IRC. Default: "main" or "sub". */
    agentDisplayName?: string;
    /**
     * Agent definition name used to evaluate rule `agents` scoping. Defaults to
     * "main" for a top-level session / "sub" for a subagent.
     */
    agentName?: string;
    /** Optional shared agent registry for IRC routing. Default: AgentRegistry.global(). */
    agentRegistry?: AgentRegistry;
    /**
     * Registry generation authorized for this creation. `null` requires the id
     * to be absent; an AgentRef allows a parked revival to reuse only that ref.
     * Undefined preserves legacy unconditional registration for external SDK callers.
     * @internal
     */
    expectedAgentRef?: AgentRef | null;
    /** Parent task ID prefix for nested artifact naming (e.g., "Extensions") */
    parentTaskPrefix?: string;
    /**
     * Registry id of the spawning agent, recorded as this subagent's parent in
     * the agent registry. Distinct from `parentTaskPrefix`, which is this agent's
     * own artifact/output-id prefix (the executor passes the child's own id
     * there, so it must never double as the parent link). Undefined for the
     * top-level "Main" session, which has no parent.
     */
    parentAgentId?: string;
    /** Session manager. Default: session stored under the configured agentDir sessions root */
    sessionManager?: SessionManager;
    /** Override local:// protocol options for subagent local:// sharing. Default: uses the session's own artifacts dir and session ID. */
    localProtocolOptions?: LocalProtocolOptions;
    /** Settings instance. Default: Settings.init({ cwd, agentDir }) */
    settings?: Settings;
    /**
     * Legacy alias for `settings`. Older Pi extensions pass SettingsManager.create(...)
     * through this field; accept it so their SDK calls keep the configured settings.
     */
    settingsManager?: Settings | Promise<Settings>;
    /** Whether UI is available (enables interactive tools like ask). Default: false */
    hasUI?: boolean;
    /**
     * A human can answer synchronous prompts even without a terminal UI (e.g. an
     * ACP client rendering elicitation forms). Enables `ask` without enabling
     * TUI-only session behavior such as eager LSP warmup. Default: `hasUI`.
     */
    interactivePrompts?: boolean;
    /**
     * The user approves agent `cfg://` settings writes through the process-global
     * host (`setCfgApprovalHost`). Only the top-level TUI session sets this; every
     * other session gets no `cfg://` in its prompt and has writes refused. Default: false.
     */
    settingsApproval?: boolean;
    /**
     * Defer `confirm` reserve-policy fallback until AgentSession prompt-time UI is configured.
     * ACP uses this while capabilities are negotiated without enabling UI-only tools.
     */
    deferUsageReserveConfirmation?: boolean;
    /**
     * Opt-in OpenTelemetry instrumentation forwarded to the underlying Agent.
     * Passing `{}` enables the loop's GenAI-semantic-convention spans. See
     * {@link AgentTelemetryConfig} for the full surface (hooks, content capture,
     * cost estimator, agent identity).
     *
     * Safe to enable without an OTEL SDK registered in the host: the
     * `@opentelemetry/api` package returns a no-op tracer in that case.
     */
    telemetry?: AgentTelemetryConfig;
    /**
     * Fired once, when the agent loop hands its first request to the provider
     * transport (i.e. the `streamFn` wrapper is first invoked). Used to measure
     * subagent launch latency — the boundary between "session built" and "model
     * call dispatched". This is the loop's dispatch point, slightly before the
     * actual provider HTTP call (per-request prep, identical across all
     * requests, follows it), which is the right granularity for launch timing.
     */
    onFirstChatDispatch?: () => void;
    /** Whether to auto-approve all tool calls (--auto-approve CLI flag). Default: false */
    autoApprove?: boolean;
}
/** Result from createAgentSession */
export interface CreateAgentSessionResult {
    /** The created session */
    session: AgentSession;
    /** Extensions result (loaded extensions + runtime) */
    extensionsResult: LoadExtensionsResult;
    /** Update tool UI context (interactive mode) */
    setToolUIContext: (uiContext: ExtensionUIContext, hasUI: boolean) => void;
    /** MCP manager for server lifecycle management (undefined if MCP disabled) */
    mcpManager?: MCPManager;
    /** Warning if session was restored with a different model than saved */
    modelFallbackMessage?: string;
    /** LSP servers detected for startup; warmup may continue in the background */
    lspServers?: LspStartupServerInfo[];
    /** Start cache-aware online runtime model discovery after the first UI paint. */
    startBackgroundModelDiscovery?: () => Promise<void>;
    /** Shared event bus for tool/extension communication */
    eventBus: EventBus;
    /** Root-scoped bus carrying this session tree's `task:subagent:*` frames. */
    subagentEventBus?: EventBus;
}
export type DialectFormat = "auto" | "native" | Dialect;
export declare function resolveDialect(format: DialectFormat, model: (Pick<Model, "supportsTools"> & Partial<Pick<Model, "id">>) | undefined): Dialect | undefined;
export type { PromptTemplate } from "./config/prompt-templates.js";
export { Settings } from "./config/settings.js";
export type { SkillsSettings } from "./extensibility/settings.js";
export type { CustomCommand, CustomCommandFactory } from "./extensibility/custom-commands/types.js";
export type { CustomTool, CustomToolFactory } from "./extensibility/custom-tools/types.js";
export type * from "./extensibility/extensions/index.js";
export type { Skill } from "./extensibility/skills.js";
export type { FileSlashCommand } from "./extensibility/slash-commands.js";
export type { MCPManager, MCPServerConfig, MCPServerConnection, MCPToolsLoadResult } from "./mcp/index.js";
export { type AgentRef, AgentRegistry, MAIN_AGENT_ID } from "./registry/agent-registry.js";
export type { Tool } from "./tools/index.js";
export { buildDirectoryTree, buildWorkspaceTree, type DirectoryTree, type WorkspaceTree } from "./workspace-tree.js";
export { BashTool, BUILTIN_TOOLS, createTools, EditTool, EvalTool, GlobTool, GrepTool, HIDDEN_TOOLS, ReadTool, type ToolSession, WebSearchTool, WriteTool, };
/**
 * Create an AuthStorage instance.
 *
 * Default: local SQLite store at `<agentDir>/agent.db`.
 *
 * Broker mode: when `OMP_AUTH_BROKER_URL` is set, credentials are pulled from
 * a remote auth-broker over the wire. Refresh tokens never leave the broker;
 * the client receives access tokens with `refresh = "__remote__"` and calls
 * back into the broker through the {@link AuthStorageOptions.refreshOAuthCredential}
 * override to re-mint access tokens when needed.
 *
 * Account routing (`auth.accountPolicies`, `retry.usageReservePct`) comes from
 * effective settings: `options.settings` when given, else the matching global
 * instance, else a read-only load for `options.cwd`; explicit option values win.
 *
 * Delegates to {@link ./session/auth-broker-config} so the TUI and the catalog
 * generator share the same credential-discovery logic.
 */
export declare function discoverAuthStorage(agentDir?: string, options?: Omit<DiscoverAuthStorageOptions, "agentDir" | "configValueResolver"> & Omit<EffectiveSettingsScope, "agentDir">): Promise<AuthStorage>;
/**
 * Discover extensions from cwd.
 */
export declare function discoverExtensions(cwd?: string): Promise<LoadExtensionsResult>;
type ExtensionDiscoveryOptions = Pick<CreateAgentSessionOptions, "disableExtensionDiscovery" | "additionalExtensionPaths" | "extensionRoots"> & {
    includeAmbientHooks?: boolean;
};
type CliExtensionProviderOptions = ExtensionDiscoveryOptions & {
    /** Discover extension model catalogs after registration (default true); usage-only commands skip it. */
    discoverModels?: boolean;
};
/**
 * Path-only counterpart of {@link loadSessionExtensions}: the FS-heavy scan
 * without the per-session module load. Subagents reuse the parent's path list
 * (cached on {@link ToolSession.extensionPaths}) and rebuild Extension
 * instances themselves so each session's `ExtensionAPI` (cwd, eventBus,
 * runtime) is its own.
 */
export declare function discoverSessionExtensionPaths(options: ExtensionDiscoveryOptions, cwd: string, settings: Settings): Promise<string[]>;
/**
 * Load the discovered/configured extensions for a session — everything {@link
 * createAgentSession} would load except the inline factory extensions it appends
 * itself. Extracted so the CLI can resolve extension-registered flags (and thus
 * classify `@file` arguments extension-aware) *before* a session — and its
 * terminal breadcrumb — is created, then hand the result back through
 * {@link CreateAgentSessionOptions.preloadedExtensions} so the work is not
 * repeated. Keep this the single source of the discovery branch logic.
 */
export declare function loadSessionExtensions(options: ExtensionDiscoveryOptions, cwd: string, settings: Settings, eventBus: EventBus): Promise<LoadExtensionsResult>;
/**
 * Load discovered/configured extensions and register their providers into
 * `modelRegistry`, then discover the dynamic provider catalogs. One-shot CLIs
 * (`omp bench`, dry-balance) build a bare {@link ModelRegistry} that only knows
 * built-in catalog providers; without this, providers contributed by an
 * extension (e.g. a custom OpenAI-compatible provider under
 * `~/.omp/agent/extensions/`) never reach model resolution. Mirrors the
 * session / `omp models` path: drain the queued provider registrations, then
 * `refreshRuntimeProviders` so dynamically-discovered models exist before
 * selectors are resolved, unless `discoverModels: false` (e.g. `omp usage`,
 * which needs only registered usage providers).
 */
export declare function loadCliExtensionProviders(modelRegistry: ModelRegistry, settings: Settings, cwd: string, options?: CliExtensionProviderOptions): Promise<void>;
/** Resolve prewalk with the same ordering before and after extension registration. */
export declare function resolvePrewalkTarget(patterns: readonly string[], target: string, modelRegistry: ModelRegistry, preferences: ModelMatchPreferences, disabledProviders: ReadonlySet<string>, { deferUnregistered, beforeRefresh, }?: {
    deferUnregistered?: boolean;
    beforeRefresh?: () => Promise<void>;
}): Promise<{
    prewalk?: Prewalk;
    warnings: string[];
    deferred: boolean;
}>;
/**
 * Discover skills from cwd and agentDir.
 */
export declare function discoverSkills(cwd?: string, _agentDir?: string, settings?: SkillsSettings & Pick<LoadSkillsOptions, "disabledExtensions">): Promise<{
    skills: Skill[];
    warnings: SkillWarning[];
}>;
/**
 * Discover context files (AGENTS.md) walking up from cwd.
 * Returns files sorted by depth (farther from cwd first, so closer files appear last/more prominent).
 */
export declare function discoverContextFiles(cwd?: string, _agentDir?: string, disabledExtensions?: string[]): Promise<Array<{
    path: string;
    content: string;
    depth?: number;
}>>;
/**
 * Discover prompt templates from cwd and agentDir.
 */
export declare function discoverPromptTemplates(cwd?: string, agentDir?: string): Promise<PromptTemplate[]>;
/**
 * Discover file-based slash commands from commands/ directories.
 */
export declare function discoverSlashCommands(cwd?: string): Promise<FileSlashCommand[]>;
/**
 * Discover custom commands (TypeScript slash commands) from cwd and agentDir.
 */
export declare function discoverCustomTSCommands(cwd?: string, agentDir?: string): Promise<CustomCommandsLoadResult>;
/**
 * Discover MCP servers from .mcp.json files.
 * Returns the manager and loaded tools.
 */
export declare function discoverMCPServers(cwd?: string): Promise<MCPToolsLoadResult>;
export interface BuildSystemPromptOptions {
    tools?: Tool[];
    skills?: Skill[];
    contextFiles?: Array<{
        path: string;
        content: string;
    }>;
    cwd?: string;
    customPrompt?: string;
    /** Raw Handlebars template replacing the bundled default system prompt rendering. */
    systemPromptTemplate?: string;
    appendPrompt?: string;
    inlineToolDescriptors?: boolean;
    includeWorkspaceTree?: boolean;
    /** Include the read-only security:// resource inventory entry. Default: false. */
    securityEnabled?: boolean;
    /** Eval preludes to advertise; each contributes its `guidance` block. Default: none. */
    evalPreludes?: readonly Pick<EvalPreludeDefinition, "name" | "guidance">[];
}
/**
 * Build the default provider-facing system prompt blocks.
 *
 * The returned `systemPrompt` preserves the stable harness prompt and dynamic project context
 * as separate entries so providers can cache prompt prefixes without concatenating blocks.
 */
export declare function buildSystemPrompt(options?: BuildSystemPromptOptions): Promise<BuildSystemPromptResult>;
export declare function customToolToDefinition(tool: CustomTool, sourcePath?: string): ToolDefinition;
/** Dependencies used to construct an isolated auto-learn capture agent. */
export interface AutoLearnCaptureRunnerOptions {
    sourceAgent: Agent;
    /** Resolves the capture tools per run, so live `autolearn.enabled` / backend changes apply. */
    captureTools: () => AgentTool[];
    createAgent: (options: AgentOptions) => Agent;
    onPayload?: SimpleStreamOptions["onPayload"];
    onResponse?: SimpleStreamOptions["onResponse"];
    createSessionId?: () => string;
}
/** Build a private capture runner over a detached message snapshot and provider session. */
export declare function createAutoLearnCaptureRunner(options: AutoLearnCaptureRunnerOptions): (content: string, signal?: AbortSignal) => Promise<void>;
/**
 * Create an AgentSession with the specified options.
 *
 * @example
 * ```typescript
 * // Minimal - uses defaults
 * const { session } = await createAgentSession();
 *
 * // With explicit model
 * import { getModel } from '@oh-my-pi/pi-ai';
 * const { session } = await createAgentSession({
 *   model: getModel('anthropic', 'claude-opus-4-5'),
 *   thinkingLevel: 'high',
 * });
 *
 * // Continue previous session
 * const { session, modelFallbackMessage } = await createAgentSession({
 *   continueSession: true,
 * });
 *
 * // Full control
 * const { session } = await createAgentSession({
 *   model: myModel,
 *   getApiKey: async () => Bun.env.MY_KEY,
 *   systemPrompt: ['You are helpful.'],
 *   tools: codingTools({ cwd: getProjectDir() }),
 *   skills: [],
 *   sessionManager: SessionManager.inMemory(),
 * });
 * ```
 */
export declare function createAgentSession(options?: CreateAgentSessionOptions): Promise<CreateAgentSessionResult>;
