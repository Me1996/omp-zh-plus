import type { Agent, AgentTool } from "@oh-my-pi/pi-agent-core";
import type { Model } from "@oh-my-pi/pi-ai";
import type { EffectiveExtensionRoots } from "../capability/types.js";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
import type { ExtensionRunner, ToolInfo } from "../extensibility/extensions/index.js";
import { type EvalPreludeDefinition } from "../eval/preludes.js";
import { type Skill, type SkillWarning } from "../extensibility/skills.js";
import { type LocalProtocolOptions } from "../internal-urls/index.js";
import type { MemoryBackendStartOptions } from "../memory-backend/types.js";
import type { AgentDefinition } from "../task/types.js";
import { type XdevState } from "../tools/xdev.js";
import { type EditMode } from "@oh-my-pi/pi-tui-zh/tools/edit";
import type { ClientBridge } from "./client-bridge.js";
import type { CustomMessage } from "./messages.js";
import type { SessionManager } from "./session-manager.js";
import { type SkillsSettings } from "../extensibility/settings.js";
/** Capabilities borrowed from the owning AgentSession. */
export interface SessionToolsHost {
    agent: Agent;
    sessionManager: SessionManager;
    settings: Settings;
    /** Session-local extension roots (explicit + mode + configured) for post-startup reloads. */
    effectiveExtensionRoots(): EffectiveExtensionRoots;
    modelRegistry: ModelRegistry;
    extensionRunner(): ExtensionRunner | undefined;
    clientBridge(): ClientBridge | undefined;
    agentKind(): "main" | "sub";
    isDisposed(): boolean;
    isStreaming(): boolean;
    queuedMessageCount(): number;
    planModeEnabled(): boolean;
    model(): Model | undefined;
    memoryBackendSession(): MemoryBackendStartOptions["session"];
    clearInheritedProviderPromptCacheKey(): void;
    clearMemoryPromotionSnapshot(): void;
    captureMemoryPromotionSnapshot(prompt: string[]): void;
    emitNotice(level: "info" | "warning" | "error", message: string, source?: string): void;
    notifyCommandMetadataChanged(): void;
    localProtocolOptions(): LocalProtocolOptions;
    /** Live enabled eval preludes; candidates for the next base rebuild's advertised snapshot. */
    evalPreludes(): readonly EvalPreludeDefinition[];
    /** Live user-tagged model agents; candidates for the next base rebuild's advertised snapshot. */
    sessionAgents(): readonly AgentDefinition[];
    /** Publishes the current Codex Code Mode tool exposure snapshot for turn metadata; undefined clears it. */
    setCodeModeNamespacesInfo?(info: unknown): void;
}
/** Registry delta applied by the SDK's settings-gated tool reconcile. */
export interface SettingsGatedToolDelta {
    /** Newly registered names: `builtIn` marks built-in factory provenance, `activate` joins the enabled set. */
    readonly added: readonly {
        readonly name: string;
        readonly builtIn: boolean;
        readonly activate: boolean;
    }[];
    /** Names whose registry entries were removed. */
    readonly removed: readonly string[];
    /** `xd://` state after following `tools.xdev`; undefined while mounting is off. */
    readonly xdev: XdevState | undefined;
}
interface SessionToolsOptions {
    autoApprove?: boolean;
    toolRegistry?: Map<string, AgentTool>;
    createVibeTools?: () => AgentTool[];
    /** Creates the private `think` scratchpad tool for runtime setting changes. */
    createThinkTool?: () => Promise<AgentTool | null>;
    builtInToolNames?: Iterable<string>;
    presentationPinnedToolNames?: ReadonlySet<string>;
    /** MCP tool names whose current registry entries came from the manager snapshot. */
    mcpManagerToolNames?: Iterable<string>;
    ensureWriteRegistered?: () => Promise<boolean>;
    isDeviceOnlyWrite?: () => boolean;
    setDeviceOnlyWrite?: (enabled: boolean) => void;
    setPendingFullWriteDescription?: (enabled: boolean) => void;
    /** Registers the hidden `goal` tool when goal mode is enabled at runtime. */
    ensureGoalRegistered?: () => Promise<boolean>;
    /**
     * Re-resolves settings-gated tools against live settings, mutating the shared
     * registry; `isBuiltIn` reports this session's built-in provenance.
     */
    reconcileSettingsGatedTools?: (isBuiltIn: (name: string) => boolean) => Promise<SettingsGatedToolDelta>;
    rebuildSystemPrompt?: (toolNames: string[], tools: Map<string, AgentTool>, options?: {
        directToolNames?: readonly string[];
    }) => Promise<{
        systemPrompt: string[];
        xdevCatalogNames?: readonly string[];
    }>;
    getMcpServerInstructions?: () => Map<string, string> | undefined;
    xdev?: XdevState;
    setActiveToolNames?: (names: Iterable<string>) => void;
    baseSystemPrompt: string[];
    skills?: Skill[];
    skillWarnings?: SkillWarning[];
    skillsSettings?: SkillsSettings;
    skillsReloadable?: boolean;
}
interface SystemPromptPreparation {
    systemPrompt: string[];
    /** Publish staged state at validated delivery; false declines the prepared turn without mutation. */
    commit?(): boolean;
}
export interface MountedMCPToolRouteSource {
    readonly name: string;
    readonly mcpServerName?: unknown;
    readonly mcpToolName?: unknown;
}
export interface MountedMCPToolRoute {
    readonly mcpServerName: string;
    readonly mcpToolName: string;
    readonly name: string;
}
export interface MCPXdevGuidanceMapping extends MountedMCPToolRoute {
    readonly label: string;
    readonly path: string;
}
export interface MCPXdevGuidanceProjection {
    readonly mappings: readonly MCPXdevGuidanceMapping[];
    readonly hasOmittedMappings: boolean;
}
/** Yield exact mounted MCP ownership and route metadata. */
export declare function collectMountedMCPToolRoutes(tools: Iterable<MountedMCPToolRouteSource>): Generator<MountedMCPToolRoute>;
/**
 * Project exact live MCP routes into the bounded, Markdown-safe mapping data
 * rendered by the static MCP guidance prompt.
 */
export declare function projectMountedMCPXdevGuidance(routes: Iterable<MountedMCPToolRoute>): MCPXdevGuidanceProjection;
/**
 * Structured payload persisted on each {@link XDEV_MOUNT_NOTICE_MESSAGE_TYPE}
 * custom message. Lets a resumed session reconstruct which dynamic devices the
 * model has already been told about, so reconnecting hosts do not re-announce
 * (and re-splice a redundant developer message that busts the provider
 * prompt-cache prefix).
 */
interface ToolRosterNoticeDetails {
    added: string[];
    removed: string[];
}
interface XdevMountNoticeDetails {
    added: string[];
    removed: string[];
}
/** Prelude names added/removed by one hidden {@link EVAL_PRELUDE_NOTICE_MESSAGE_TYPE} message. */
interface EvalPreludeNoticeDetails {
    added: string[];
    removed: string[];
}
/** Agent pseudonyms added/removed by one hidden {@link SESSION_AGENT_NOTICE_MESSAGE_TYPE} message. */
interface SessionAgentNoticeDetails {
    added: string[];
    removed: string[];
}
interface PendingNoticePreview<T> {
    notice: CustomMessage<T> | undefined;
    /**
     * Exact rendered content included in the context estimate. Re-projecting and
     * comparing this key after maintenance catches every semantically relevant
     * change — mount membership, base-catalog suppression, summaries, and schemas
     * — without false-invalidating a byte-identical notice after a hidden rebuild.
     */
    contentKey: string;
}
/** Owns tool registration, presentation, prompt rebuilding, skills, and permissions. */
export declare class SessionTools {
    #private;
    constructor(host: SessionToolsHost, options: SessionToolsOptions);
    /** Mutable registry shared with controller hosts that inspect available tools. */
    get registry(): Map<string, AgentTool>;
    /** Current stable base system prompt. */
    get baseSystemPrompt(): string[];
    /** Replaces the controller-owned base prompt without applying it to the agent. */
    setBaseSystemPrompt(prompt: string[]): void;
    /**
     * Registers the per-turn `before_agent_start` system-prompt override and
     * applies it to the agent. Base rebuilds during the turn preserve it until
     * {@link clearTurnSystemPromptOverride}.
     */
    setTurnSystemPromptOverride(prompt: string[]): void;
    /** Drops the active per-turn override; later rebuilds fall back to the base prompt. */
    clearTurnSystemPromptOverride(): void;
    /** Skills currently rendered into the system prompt. */
    get skills(): Skill[];
    /** Diagnostics produced while loading the current skills. */
    get skillWarnings(): SkillWarning[];
    /** Settings snapshot used for the current skill discovery. */
    get skillsSettings(): SkillsSettings | undefined;
    /**
     * Skill-URI hint visibility (see {@link #promptSurface}). Tools read this
     * instead of the live `skillful` setting so the provider tool prefix stays
     * byte-stable between system-prompt rebuilds.
     *
     * Inside a rebuild frame ({@link #promptSurfaceScope}) this returns the
     * candidate so the rendered prompt and computed signature see the new
     * state; outside, the committed snapshot.
     */
    get skillHintVisible(): boolean;
    /**
     * Eval preludes the system prompt and eval description advertise (see
     * {@link #promptSurface}); the candidate inside a rebuild frame.
     */
    get advertisedEvalPreludes(): readonly EvalPreludeDefinition[];
    /**
     * User-tagged model agents the task description advertises (see
     * {@link #promptSurface}); the candidate inside a rebuild frame.
     */
    get advertisedSessionAgents(): readonly AgentDefinition[];
    /** Drops cached per-session ACP `allow_always`/`reject_always` decisions. */
    clearAcpPermissionDecisions(): void;
    /** Drops cached ACP decisions and re-wraps active tools after the client changes. */
    refreshAcpPermissionGates(): void;
    /** Names of tools currently exposed at the top level. */
    getActiveToolNames(): string[];
    /** Enabled top-level, `xd://`, and Code Mode bridge tool names. */
    getEnabledToolNames(): string[];
    /** Names currently presented as `xd://` devices. */
    getMountedXdevToolNames(): string[];
    /** Whether the edit tool is registered. */
    get hasEditTool(): boolean;
    /**
     * Looks up a registered tool by its canonical name or `xd://` alias.
     *
     * An unmatched `mcp__` name is retried under its canonical registry keys: the
     * identity prompt primes the Claude Code spelling `mcp__<server>__<tool>`
     * while `createMCPToolName` mints a single separator, so the doubled form is
     * a dead end for a tool the session does expose. That retry goes through the
     * shared {@link resolveMCPToolAlias}, so an alias two registered tools both
     * answer resolves to nothing here exactly as it does at dispatch — this
     * method is public and also picks transcript renderers, so a first-match
     * shortcut could render or return the wrong tool.
     */
    getToolByName(name: string): AgentTool | undefined;
    /** Looks up an enabled tool through the same ACP permission gate as direct calls. */
    getToolForEvalBridge(name: string): AgentTool | undefined;
    /** Canonical allowlist advertised by and enforced for the eval bridge. */
    getEvalBridgeToolNames(): string[];
    /** Tools left directly model-visible by the last applied Code Mode partition; undefined when inactive. */
    getCodeModeDirectToolNames(): readonly string[] | undefined;
    /**
     * Whether a registry entry came from a built-in factory.
     *
     * Resolves `customWireName` aliases too: a built-in tool may present on the
     * wire under a different name (e.g. `edit` exposes itself as `apply_patch` in
     * apply_patch mode), and tool cards render the call under that wire name. An
     * extension registering the literal alias name shadows it — the agent loop
     * routes exact-name matches ahead of wire aliases — so a registered non-built-in
     * tool with that name wins and the alias no longer counts as built-in.
     */
    hasBuiltInTool(name: string): boolean;
    /** Updates source provenance when a live registry entry is replaced or restored. */
    setToolBuiltIn(name: string, builtIn: boolean): void;
    /** Whether the live registry entry is owned by the RPC host. */
    hasRpcHostTool(name: string): boolean;
    /** Whether the current MCP entry came from the manager snapshot. */
    hasMCPManagerTool(name: string): boolean;
    /** Restores manager ownership after a lifecycle registration rollback. */
    setMCPManagerTool(name: string, managerOwned: boolean): void;
    /** Current extension-owned MCP entry retained across manager refreshes. */
    getExtensionMCPTool(name: string): AgentTool | undefined;
    /** Updates extension ownership when a lifecycle registration commits or rolls back. */
    setExtensionMCPTool(name: string, tool: AgentTool | undefined): void;
    /** Serializes every registry and presentation mutation for this session. */
    runToolRegistryMutation<T>(mutation: () => Promise<T>, signal?: AbortSignal): Promise<T>;
    /** Names of every registered tool. */
    getAllToolNames(): string[];
    /**
     * Full metadata for every registered tool, including source provenance.
     *
     * Backs the `getAllTools()` ExtensionAPI method. Returns {@link ToolInfo}
     * objects (not bare names) so extensions authored against upstream
     * `@earendil-works/pi-coding-agent` — which promises `ToolInfo[]` — can read
     * `sourceInfo.source` unchanged.
     */
    getAllToolInfos(): ToolInfo[];
    /** Installs and activates the ephemeral vibe tool set. */
    activateVibeTools(baseToolNames: string[]): Promise<void>;
    /** Uninstalls vibe tools and activates the replacement set. */
    deactivateVibeTools(nextToolNames: string[]): Promise<void>;
    /** Removes vibe tools without restoring a source-session snapshot. */
    removeVibeToolsPreservingActive(): Promise<void>;
    /** Resolves the edit mode for the active model and settings. */
    resolveActiveEditMode(): EditMode;
    /** Rebuilds model-dependent tool prompts after a model change. */
    syncAfterModelChange(previousEditMode: EditMode): Promise<void>;
    /** Whether a model transition crosses a Code Mode presentation boundary. */
    codeModeChangesBetween(previousModel: Model | undefined, nextModel: Model): boolean;
    codeModeDirectWireMetadataChanged(): boolean;
    /** Reapplies the enabled set after model or Code Mode setting changes. */
    reconcileCodeMode(): Promise<void>;
    /** Enabled MCP tools in their current presentation partition. */
    getSelectedMCPToolNames(): string[];
    /** Applies an enabled tool set and reconciles its `xd://` partition. */
    applyActiveToolsByName(toolNames: string[], forcePromptRefresh?: boolean, signal?: AbortSignal): Promise<void>;
    /**
     * Forget the announced-mount baseline for a replaced transcript. Called when
     * session history is swapped wholesale (`/new`, `switchSession`, `branch`): the
     * previous transcript's persisted notices no longer apply, so the next notice
     * re-seeds from the new history and a device reconnecting into it announces
     * again.
     *
     * The pending delta is deliberately preserved: it holds mounts that are still
     * live but not yet delivered to the model, and `branch()` does not rebuild the
     * base system prompt, so dropping it would leave the branched transcript
     * unaware of a still-mounted device that no later refresh would re-queue.
     */
    resetAnnouncedMounts(): void;
    /**
     * Consumes the hidden provider-visible roster notice for the current pending
     * delta. This carries no meaningful payload (a short tool-name list), so it is
     * never previewed or deferred for context budgeting: it is re-derived from the
     * live delta after pre-prompt maintenance, keeping the model's stated
     * availability in lockstep with the wire tool list.
     *
     * When a rebuilt base is delivered, the notice includes only changes made after
     * that snapshot. A per-turn `before_agent_start` override that hides the rebuilt
     * base instead receives the complete delta from the provider's last known
     * roster.
     */
    takePendingToolRosterNotice(options: {
        baseDelivered: boolean;
    }): CustomMessage<ToolRosterNoticeDetails> | undefined;
    /**
     * Builds the hidden notice reconciling the eval preludes the model knows with
     * the live set. Delivered with the next user prompt instead of rebuilding the
     * system prompt, so a mid-session toggle (`/computer on`) keeps the provider
     * cache prefix intact.
     *
     * Known preludes are the committed base snapshot, then every prelude notice
     * still in context, applied in order. Deriving this from the transcript
     * rather than tracked state stays truthful across base rebuilds (which absorb
     * the live set), compaction (which drops old notices), and resume.
     */
    takeEvalPreludeNotice(): CustomMessage<EvalPreludeNoticeDetails> | undefined;
    /**
     * Builds the hidden notice reconciling the user-tagged model agents the task
     * description advertises with the live set. Delivered with the next user
     * prompt instead of rewriting the task description, so tagging a model
     * mid-session keeps the provider cache prefix intact.
     *
     * Known agents are the committed base snapshot, then every agent notice still
     * in context, applied in order — mirroring {@link takeEvalPreludeNotice}.
     */
    takeSessionAgentNotice(): CustomMessage<SessionAgentNoticeDetails> | undefined;
    /** Previews the hidden `xd://` mount notice and its rendered-content fingerprint. */
    peekPendingXdevMountNotice(options: {
        baseCatalogDelivered: boolean;
    }): PendingNoticePreview<XdevMountNoticeDetails> | undefined;
    /**
     * Consumes the mount notice only when its rendered content still matches the
     * preview included in the context estimate.
     */
    takePendingXdevMountNotice(options: {
        baseCatalogDelivered: boolean;
        expectedContentKey: string;
    }): CustomMessage<XdevMountNoticeDetails> | undefined;
    /** Rediscovers reloadable skills and refreshes prompt metadata. */
    refreshSkills(): Promise<void>;
    /** Selects enabled tools, ignoring names absent from the registry. */
    setActiveToolsByName(toolNames: string[]): Promise<void>;
    /**
     * Restore an enabled tool set with its exact top-level versus `xd://` partition.
     *
     * Both inputs are required because {@link setActiveToolsByName} only receives the
     * enabled name list and classifies mounts from the current presentation set.
     * Rollback/restore callers must pass the snapshotted mounted subset so names that
     * were top-level stay pinned (`#runtimeSelectedToolNames`) and names that were under
     * `xd://` remain mount-eligible, even when the live mount set has drifted.
     *
     * Names outside `mountedToolNames` are pinned top-level for this application;
     * names in the mounted subset remain eligible for xdev mounting. Set
     * `forcePromptRefresh` when an enabled tool's schema or prompt-visible metadata
     * changed without changing its name or presentation.
     *
     * Delegates the actual apply through {@link applyActiveToolsByName} and restores
     * the prior runtime selection if that apply throws.
     */
    setActiveToolPresentation(toolNames: string[], mountedToolNames: string[], forcePromptRefresh?: boolean, signal?: AbortSignal): Promise<void>;
    /** Restores a non-MCP presentation snapshot while retaining the current MCP selection. */
    restoreNonMCPToolPresentation(nonMCPToolNames: string[], nonMCPMountedToolNames: string[]): Promise<void>;
    /** Replaces memory-backend tools while preserving unrelated selections. */
    replaceMemoryTools(tools: AgentTool[]): Promise<void>;
    /**
     * Reconciles the private `think` scratchpad with the `externalThinking`
     * setting and the active model. Enabling constructs the tool once;
     * disabling removes it from the active set but keeps its registry entry.
     *
     * @returns false when enabling was requested but this session cannot build the tool.
     */
    reconcileThinkTool(): Promise<boolean>;
    /**
     * Re-resolves settings-gated tools (built-in factories, image/speech generation,
     * `xd://` mounting) against live settings: registers newly allowed tools,
     * unregisters disallowed ones, and reapplies the enabled set with one forced
     * prompt rebuild — unconditionally unless `refreshPrompt` is false, then only
     * when the tool set changed. Unrelated selections, MCP/extension tools, and the
     * Code Mode partition are preserved.
     */
    reconcileBuiltinTools({ refreshPrompt }?: {
        refreshPrompt?: boolean;
    }): Promise<void>;
    /**
     * Rebuilds the stable base prompt for the current tools and model.
     * `commitIf` lets asynchronous producers discard a stale rebuild atomically
     * after its inputs have been superseded.
     */
    refreshBaseSystemPrompt(commitIf?: () => boolean): Promise<void>;
    /** Stages memory prompt injection; the owning turn commits it together with extension policy. */
    buildSystemPromptForAgentStart(promptText: string, isCurrent: () => boolean, signal?: AbortSignal): Promise<SystemPromptPreparation>;
    /**
     * Replace MCP tools in the registry and enable them immediately. Refreshes
     * are serialized so an older asynchronous prompt rebuild cannot commit
     * after a newer catalog snapshot. Every connected MCP tool becomes available
     * (mounted under `xd://` when that transport is active, else top-level).
     */
    refreshMCPTools(mcpTools: CustomTool[]): Promise<void>;
    /** Replaces RPC host-owned tools and refreshes the active set before the next model call. */
    refreshRpcHostTools(rpcTools: AgentTool[]): Promise<void>;
}
export {};
