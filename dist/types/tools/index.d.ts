import type { AgentOptions, AgentTelemetryConfig, AgentTool, AgentToolContext } from "@oh-my-pi/pi-agent-core";
import type { EditStore } from "@oh-my-pi/pi-natives";
import type { FetchImpl, ImageContent, Model, ServiceTierByFamily, ToolChoice } from "@oh-my-pi/pi-ai";
import type { AsyncJobManager } from "../async/job-manager.js";
import type { Rule } from "../capability/rule.js";
import type { EffectiveExtensionRoots } from "../capability/types.js";
import type { EvalPreludeDefinition } from "../eval/preludes.js";
import type { PromptTemplate } from "../config/prompt-templates.js";
import type { Settings } from "../config/settings.js";
import type { ToolPathWithSource } from "../extensibility/custom-tools/index.js";
import type { BeforeSubagentSpawnEvent, BeforeSubagentSpawnEventResult, PreparedExtension } from "../extensibility/extensions/types.js";
import type { Skill } from "../extensibility/skills.js";
import type { GoalModeState, GoalRuntime } from "../goals/index.js";
import type { HindsightSessionState } from "../hindsight/state.js";
import type { LocalProtocolOptions } from "../internal-urls/index.js";
import type { DaemonCompletionNotification } from "../launch/protocol.js";
import type { MCPManager } from "../mcp/index.js";
import type { MnemopiSessionState } from "../mnemopi/state.js";
import type { PlanModeState } from "../plan-mode/state.js";
import type { AgentLifecycleManager } from "../registry/agent-lifecycle.js";
import type { AgentRegistry } from "../registry/agent-registry.js";
import type { ArtifactManager } from "../session/artifacts.js";
import type { ClientBridge } from "../session/client-bridge.js";
import type { CustomMessage } from "../session/messages.js";
import type { UsageStatistics } from "../session/session-entries.js";
import type { SessionManager } from "../session/session-manager.js";
import type { ToolChoiceQueue } from "../session/tool-choice-queue.js";
import type { AgentOutputManager } from "../task/output-manager.js";
import { type AgentDefinition } from "../task/types.js";
import { type StructuredSubagentSchemaMode } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { WorkPoolYieldItem } from "../task/workpool-yield.js";
import type { EventBus } from "../utils/event-bus.js";
import type { WorkspaceTree } from "../workspace-tree.js";
import { type BuiltinToolName, type HiddenToolName } from "./builtin-names.js";
import { type CheckpointState, type CompletedRewindState } from "./checkpoint.js";
import type { PlanProposalHandler } from "./resolve.js";
import { type TodoPhase } from "@oh-my-pi/pi-tui-zh/tools/todo";
import { type XdevState } from "./xdev.js";
export * from "../edit/index.js";
export * from "../goals/index.js";
export * from "../lsp/index.js";
export * from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
export * from "../task/index.js";
export * from "../web/search/index.js";
export * from "./ask.js";
export * from "./ast-edit.js";
export * from "./ast-grep.js";
export * from "./bash.js";
export type { BashToolDetails, BashRenderArgs, BashRenderContext, ShellRendererConfig, } from "@oh-my-pi/pi-tui-zh/tools/bash";
export * from "./browser.js";
export * from "./checkpoint.js";
export * from "./computer.js";
export * from "./computer/supervisor.js";
export * from "./context-notes.js";
export * from "./debug.js";
export * from "./ida.js";
export * from "./essential-tools.js";
export * from "./eval.js";
export * from "./eval-backends.js";
export * from "./file-write-fallback.js";
export * from "./gh.js";
export * from "./glob.js";
export * from "./grep.js";
export * from "./jfind/index.js";
export type { AgentActivitySnapshot, CoordinationDetails, JobSnapshot } from "@oh-my-pi/pi-tui-zh/tools/wait";
export * from "./image-gen.js";
export * from "./learn.js";
export * from "./manage-skill.js";
export * from "./memory-edit.js";
export * from "./memory-recall.js";
export * from "./memory-reflect.js";
export * from "./memory-retain.js";
export * from "./read.js";
export * from "./report-tool-issue.js";
export * from "./resolve.js";
export type { FindingPriority, FindingPriorityInfo, FindingDetails, SubmitReviewDetails, } from "@oh-my-pi/pi-tui-zh/tools/task";
export * from "./security-scan.js";
export * from "./think.js";
export * from "./todo.js";
export * from "./tts.js";
export * from "./vibe.js";
export * from "./wait.js";
export type { VibeToolDetails } from "@oh-my-pi/pi-tui-zh/tools/vibe";
export * from "./write.js";
export * from "./xdev.js";
export * from "./yield.js";
/** Tool type (AgentTool from pi-ai) */
export type Tool = AgentTool<any, any, any>;
export type ContextFileEntry = {
    path: string;
    content: string;
    depth?: number;
};
/** Image attachment handle exposed to tools for user-facing labels such as `Image #1`. */
export type ImageAttachmentEntry = {
    label: string;
    uri: string;
    image: ImageContent;
    /** Existing content-addressed file path containing the original image bytes. */
    sourcePath: string;
};
/**
 * A late LSP diagnostics result that arrived after the edit/write tool already
 * returned. Surfaced to the model and the transcript via
 * {@link ToolSession.queueDeferredDiagnostics}, batched through the session
 * yield queue like background-job results.
 */
export interface DeferredDiagnosticsEntry {
    /** Absolute path the diagnostics belong to (the renderer shortens it). */
    path: string;
    /** One-line severity summary, e.g. "2 errors". */
    summary: string;
    /** Formatted, ready-to-display diagnostic lines. */
    messages: string[];
    /** True when any message is error severity. */
    errored: boolean;
    /**
     * Evaluated at injection time (in the dispatcher's stale check): drop the entry
     * when a newer mutation to the same file has superseded it, so the model never
     * sees diagnostics for stale content.
     */
    isStale(): boolean;
}
/** Session context for tool factories */
export interface ToolSession {
    /** Current working directory */
    cwd: string;
    /** Additional workspace directories beyond cwd (multi-root), forwarded to subagents. */
    additionalDirectories?: string[];
    /** Whether UI is available */
    hasUI: boolean;
    /** Whether `ask` can reach a human. Defaults to `hasUI`. */
    canPromptUser?: boolean;
    /** The user approves `cfg://` writes for this session (top-level TUI session only). */
    settingsApproval?: boolean;
    /** Whether this session has begun disposal. */
    isDisposed?: () => boolean;
    /**
     * Suppress the spawn specialization/coordination advisory appended to `task`
     * results. Set by internal/programmatic callers (e.g. the commit agent's
     * file-analysis fan-out) whose results are consumed by code — not by a model
     * orchestrating further spawns — so the nudge would only be noise.
     */
    suppressSpawnAdvisory?: boolean;
    /** Optional fetch implementation injected into the URL read pipeline (tests, proxies). Defaults to global fetch. */
    fetch?: FetchImpl;
    /** Provider credential resolver forwarded unchanged to restricted child sessions. */
    getApiKey?: AgentOptions["getApiKey"];
    /** Current session whose stored credential affinities should seed a child session. */
    getCredentialSourceSessionId?: () => string | undefined;
    /** Skip subprocess-kernel availability checks and warmup */
    skipPythonPreflight?: boolean;
    /** Pre-loaded context files (AGENTS.md, etc) */
    contextFiles?: ContextFileEntry[];
    /** Pre-loaded workspace tree (forwarded to subagents to skip re-scanning) */
    workspaceTree?: WorkspaceTree;
    /** Pre-loaded skills */
    skills?: readonly Skill[];
    /**
     * Frozen skill-URI hint visibility: snapshot taken at the last system-prompt
     * rebuild. Tools with a provider-side `skill://` hint read this instead of
     * the live `skillful` setting so the tool prefix stays byte-stable between
     * rebuilds (mid-session `/skillful` toggles ride the prompt, not the prefix).
     */
    skillHintVisible?: boolean;
    /** Rediscover live session skills after a tool mutates their backing files. */
    refreshSkills?: () => Promise<void>;
    /** Pre-loaded prompt templates */
    promptTemplates?: PromptTemplate[];
    /** Pre-loaded rules (forwarded to subagents to skip re-discovery). */
    rules?: Rule[];
    /**
     * This session's agent-scoped applicable rule set — rulebook + always-apply
     * + triggered TTSR rules, already bucketed against this session's `agents`
     * frontmatter. Distinct from {@link rules} (the full unfiltered discovery
     * result forwarded to children): this is what `rule://` resolution needs so
     * a subagent-only rule stays readable from inside that subagent, instead of
     * only from the top-level session's process-global snapshot.
     */
    activeRules?: readonly Rule[];
    /**
     * Pre-discovered extension source paths. Forwarded to subagents so they
     * skip the FS scan but still re-bind extensions to their own session-scoped
     * `ExtensionAPI` (cwd, eventBus, runtime). Inline extension factories
     * (`<inline-N>`) are NOT included — those are session-local.
     */
    extensionPaths?: string[];
    /** Imported extension factories safe to rebind in child sessions. */
    preparedExtensions?: PreparedExtension[];
    /**
     * Session-local extension roots for post-startup sub-discovery: explicit SDK
     * roots, discovery mode, and configured `extensions:`. A provider (not a
     * stored value) so it is materialized live per discovery call — a runtime
     * override or settings reload is reflected, never a construction-time
     * snapshot. Keeps the task surface byte-identical to the scoped load.
     */
    effectiveExtensionRoots?(): EffectiveExtensionRoots;
    /**
     * Pre-discovered custom-tool source paths from `.omp/tools/`, `.claude/tools/`,
     * plugins, etc. Forwarded to subagents so they skip the FS scan but still
     * re-bind tools to their own session-scoped `CustomToolAPI`.
     */
    customToolPaths?: ToolPathWithSource[];
    /** Whether LSP integrations are enabled */
    enableLsp?: boolean;
    /** Whether LSP is limited to navigation and diagnostics. */
    lspReadOnly?: boolean;
    /** Whether this invocation may expose IRC. `false` removes it even for subagents. */
    enableIrc?: boolean;
    /**
     * Whether MCP capabilities may be forwarded to child sessions. `false`
     * prohibits inherited-manager and process-global MCP fallback.
     */
    enableMCP?: boolean;
    /** Whether an edit-capable tool is available in this session (controls hashline output) */
    hasEditTool?: boolean;
    /** Event bus for tool/extension communication */
    eventBus?: EventBus;
    /**
     * Root-scoped bus for `task:subagent:*` observability frames. The root
     * session creates it; every spawned subagent session inherits it, so RPC
     * and HUD surfaces see spawns at any depth without crossing into another
     * root session's traffic.
     */
    subagentEventBus?: EventBus;
    /** Output schema for structured completion (subagents). */
    outputSchema?: unknown;
    /** Enforcement policy for {@link outputSchema}; defaults to legacy permissive behavior. */
    outputSchemaMode?: StructuredSubagentSchemaMode;
    /** Whether to include the yield tool by default */
    requireYieldTool?: boolean;
    /** Session starts with a prewalk hand-off armed. Keeps `todo` in yield-gated
     *  (subagent) registries: the prewalk plan nudge + todo gate need it. */
    prewalkArmed?: boolean;
    /**
     * Constrain the active set to the caller's explicit built-in names (plus a
     * required yield tool). Suppresses automatic tool-set expansion.
     */
    restrictToolNames?: boolean;
    /** Task recursion depth (0 = top-level, 1 = first child, etc.) */
    taskDepth?: number;
    /** Get this agent's eval executor session ID; keys its retained JS/Python/Ruby/Julia state. */
    getEvalSessionId?: () => string | null;
    /** Get session file */
    getSessionFile: () => string | null;
    /**
     * Owning journal; full SDK managers also supply registered identity and the
     * cost ledger (`appendModelUsage`) without changing advisor-local IDs.
     */
    sessionManager?: Pick<SessionManager, "appendCustomEntry" | "ensureOnDisk" | "flush" | "getBranch" | "getEntries"> & Partial<Pick<SessionManager, "getSessionId" | "getLeafId" | "appendModelUsage">>;
    /** Get eval kernel owner ID for session-scoped retained-kernel cleanup. */
    getEvalKernelOwnerId?: () => string | null;
    /** Current enabled eval prelude definitions. */
    getEvalPreludes?: () => readonly EvalPreludeDefinition[];
    /**
     * Eval preludes frozen into the system prompt and eval description at the
     * last base rebuild. Mid-session toggles ride a hidden notice instead of
     * rewriting the provider cache prefix.
     */
    getAdvertisedEvalPreludes?: () => readonly EvalPreludeDefinition[];
    /** Reject new eval work once session disposal has started. */
    assertEvalExecutionAllowed?: () => void;
    /** Track tool-owned eval work so session disposal can await/abort it like direct session eval runs. */
    trackEvalExecution?<T>(execution: Promise<T>, abortController: AbortController): Promise<T>;
    /** Get tool-state session ID (distinct from the owning session for advisors). */
    getSessionId?: () => string | null;
    /** Get Hindsight runtime state for this agent session. */
    getHindsightSessionState?: () => HindsightSessionState | undefined;
    /** Get Mnemopi runtime state for this agent session. */
    getMnemopiSessionState?: () => MnemopiSessionState | undefined;
    /** Agent identity used for IRC routing. Returns the registry id (e.g. "Main", "AuthLoader"). */
    getAgentId?: () => string | null;
    /** Look up a registered tool by name (used by the eval js backend's tool bridge). */
    getToolByName?: (name: string) => AgentTool | undefined;
    /** Look up an enabled tool through the eval bridge's normal permission pipeline. */
    getToolForEvalBridge?: (name: string) => AgentTool | undefined;
    /** Current session context for eval-bridged tool execution. */
    getToolContext?: () => AgentToolContext | undefined;
    /** Names currently authorized for invocation through the eval bridge. */
    getEvalBridgeToolNames?: () => readonly string[];
    /** Direct partition of the active Code Mode surface; undefined when Code Mode is inactive. */
    getCodeModeDirectToolNames?: () => readonly string[] | undefined;
    /** Return whether a built-in tool is active in this turn's tool set. */
    isToolActive?: (name: string) => boolean;
    /** Update the active built-in tool predicate when a session changes tools mid-run. */
    setActiveToolNames?: (names: Iterable<string>) => void;
    /** Canonical map containing every registered tool exactly once. */
    toolRegistry?: Map<string, Tool>;
    /** `xd://` presentation state backed by {@link toolRegistry}. */
    xdev?: XdevState;
    /**
     * Set when this session's `write` tool was granted only as the `xd://`
     * transport: `write xd://<tool>` dispatches mounted devices, but filesystem
     * writes are rejected. Granted by {@link createTools} to sessions whose
     * explicit tool list includes `read` but omits `write`, so xd:// mounting
     * can engage without expanding the write contract.
     */
    deviceOnlyWrite?: boolean;
    /**
     * Prompt-only preview used while a full-write activation rebuilds. It changes
     * the advertised schema without relaxing {@link deviceOnlyWrite}; execution
     * remains restricted until the activation commits.
     */
    pendingFullWriteDescription?: boolean;
    /** Agent registry for IRC routing across live sessions. */
    agentRegistry?: AgentRegistry;
    /** Idle→parked→revive lifecycle owner; lets explicit cancellation stop a non-job-backed agent registration. Default: AgentLifecycleManager.global(). */
    agentLifecycle?: () => AgentLifecycleManager;
    /** Get artifacts directory for artifact:// URLs */
    getArtifactsDir?: () => string | null;
    /** Get the ArtifactManager backing this session (shared across parent + subagents). */
    getArtifactManager?: () => ArtifactManager | null;
    /** Allocate a new artifact path and ID for session-scoped truncated output. */
    allocateOutputArtifact?: (toolType: string) => Promise<{
        id?: string;
        path?: string;
    }>;
    /** Get session spawns */
    getSessionSpawns: () => string | null;
    /** Session-scoped agent definitions (user-tagged model pseudonyms) merged after discovered agents. */
    getSessionAgents?: () => readonly AgentDefinition[];
    /**
     * Session agents baked into the current base prompt surface. The task
     * description lists these instead of the live set so tagging a model
     * mid-session does not mutate the provider tool prefix; the delta rides a
     * hidden notice. Absent when the embedder has no base-prompt surface.
     */
    advertisedSessionAgents?: () => readonly AgentDefinition[];
    /** Get resolved model string if explicitly set for this session */
    getModelString?: () => string | undefined;
    /** Get the current session model string, regardless of how it was chosen */
    getActiveModelString?: () => string | undefined;
    /** Get the current session model object (provider/api capabilities), regardless of how it was chosen. */
    getActiveModel?: () => Model | undefined;
    /** Get the session's live per-family service tiers (undefined = none). Source of truth for subagent `tier.subagent: inherit`. */
    getServiceTierByFamily?: () => ServiceTierByFamily | undefined;
    /**
     * Fires `before_subagent_spawn` on this session's extensions before a child's
     * model resolves. `signal` cancels awaiting handlers. Undefined when the
     * session has no extension runner.
     */
    emitBeforeSubagentSpawn?(event: BeforeSubagentSpawnEvent, signal?: AbortSignal): Promise<BeforeSubagentSpawnEventResult | undefined>;
    /** Auth storage for passing to subagents (avoids re-discovery) */
    authStorage?: import("../session/auth-storage.js").AuthStorage;
    /** Model registry for passing to subagents (avoids re-discovery) */
    modelRegistry?: import("../config/model-registry.js").ModelRegistry;
    /** Agent output manager for unique agent:// IDs across task invocations */
    agentOutputManager?: AgentOutputManager;
    /**
     * Async job manager scoped to this session.
     *
     * - Top-level session that constructed one: its own manager.
     * - Subagent (`parentTaskPrefix` set): the parent's manager, so background
     *   bash/task work and `onJobComplete` deliveries flow into the conversation
     *   that spawned it.
     * - Secondary in-process top-level session that found a singleton already
     *   installed (issue #1923): `undefined`. Tools refuse async work rather
     *   than silently route completions into the owning session's `yieldQueue`.
     *
     * Tools MUST use this instead of `AsyncJobManager.instance()` so a secondary
     * session never borrows the owning session's manager by accident.
     */
    asyncJobManager?: AsyncJobManager;
    /** MCP manager visible to subagents without relying on the process-global singleton. */
    mcpManager?: MCPManager;
    /** Local protocol root to propagate to nested subagents and eval-created agents. */
    localProtocolOptions?: LocalProtocolOptions;
    /** Settings instance for passing to subagents */
    settings: Settings;
    /** Plan mode state (if active) */
    getPlanModeState?: () => PlanModeState | undefined;
    /** Path of the session's active plan reference (e.g. `local://<title>.md`); defaults to `local://PLAN.md`. */
    getPlanReferencePath?: () => string;
    /** Goal mode state (if active or paused) */
    getGoalModeState?: () => GoalModeState | undefined;
    /** Goal runtime for the active agent session. */
    getGoalRuntime?: () => GoalRuntime | undefined;
    /** Get cumulative session usage statistics (input/output tokens, cost). */
    getUsageStatistics?: () => UsageStatistics;
    /** Current per-turn token budget {total, spent, hard} for the eval `budget` helper. */
    getTurnBudget?: () => {
        total: number | null;
        spent: number;
        hard: boolean;
    };
    /** Record output tokens consumed by an eval-spawned subagent toward the current turn budget. */
    recordEvalSubagentUsage?: (output: number) => void;
    /** Bridge to the connected client (e.g. ACP editor host). Tools should route fs/terminal/permission requests through this when available. */
    getClientBridge?: () => ClientBridge | undefined;
    /** Get cached todo phases for this session. */
    getTodoPhases?: () => TodoPhase[];
    /** Replace cached todo phases for this session. */
    setTodoPhases?: (phases: TodoPhase[]) => void;
    /**
     * Record todo phases on the session branch. Direct `todo` calls persist via
     * their toolResult entry; callers that produce none (the eval bridge) use this
     * so branch rehydration agrees with the in-memory list.
     */
    persistTodoPhases?: (phases: TodoPhase[]) => void;
    /** Active workpool items whose incremental yields complete the current turn. */
    getWorkPoolYieldItems?: () => readonly WorkPoolYieldItem[];
    /**
     * Trimmed text of the most recent assistant message, or `undefined` when the
     * turn carries no text (e.g. thinking-only). The yield tool uses it to reject
     * a data-less `useLastTurn` finalize that would assemble to an empty result.
     */
    getLastAssistantText?: () => string | undefined;
    /** Resolve a terminal yield's current or immediately preceding report, bound to its call ID. */
    getYieldReportText?: (toolCallId: string) => string | undefined;
    /** Replace the active workpool item contract and refresh its provider-facing prompt. */
    setWorkPoolYieldItems?: (items: readonly WorkPoolYieldItem[]) => Promise<void>;
    /** The tool-choice queue used to force forthcoming tool invocations and carry invocation handlers. */
    getToolChoiceQueue?(): ToolChoiceQueue;
    /** Build a model-provider-specific ToolChoice that targets the named tool, or undefined if unsupported. */
    buildToolChoice?(toolName: string): ToolChoice | undefined;
    /** Steer a hidden custom message into the conversation (e.g. a preview reminder). */
    steer?(message: {
        customType: string;
        content: string;
        details?: unknown;
    }): void;
    /** Peek the currently in-flight tool-choice queue directive's invocation handler. Used by
     *  the `xd://resolve` and `xd://reject` dispatch to reach the pending action. */
    peekQueueInvoker?(): ((input: unknown) => Promise<unknown> | unknown) | undefined;
    /** Peek the most-recently registered non-forcing pending preview invoker. A `write` to
     *  `xd://resolve` or `xd://reject` dispatches to it so a staged preview resolves
     *  WITHOUT forcing tool_choice — the agent-loop's SoftToolRequirement lifecycle owns
     *  reminder injection and escalation. */
    peekPendingInvoker?(): ((input: unknown) => Promise<unknown> | unknown) | undefined;
    /** Clear stale pending preview markers when a resolution dispatch cannot run them. */
    clearPendingInvokers?(): void;
    /** Peek the plan-proposal handler installed by plan mode. `xd://propose` dispatches the
     *  written plan title to it. */
    peekPlanProposalHandler?(): PlanProposalHandler | undefined;
    /** Register or clear the plan-proposal handler. Passing `null` clears it. */
    setPlanProposalHandler?(handler: PlanProposalHandler | null): void;
    /** Get active checkpoint state if any. */
    getCheckpointState?: () => CheckpointState | undefined;
    /** Set or clear active checkpoint state. */
    setCheckpointState?: (state: CheckpointState | null) => void;
    /** Get the most recent completed rewind, if this session just rewound a checkpoint. */
    getLastCompletedRewind?: () => CompletedRewindState | undefined;
    /** Native snapshots, clipboard registers, and no-op guard shared by edit calls. */
    editStore?: EditStore;
    /** Per-session log of unresolved git merge conflict regions surfaced by
     *  `read`. Each entry gets a stable id N referenced by `write conflict://N`
     *  to splice the recorded region with replacement content. Lazily initialized
     *  by `getConflictHistory`. */
    conflictHistory?: import("./conflict-detect.js").ConflictHistory;
    /** Per-session ledger of post-edit LSP diagnostics already surfaced to the
     *  model for each file. Lazily initialized by `getDiagnosticsLedger`. */
    diagnosticsLedger?: import("../lsp/diagnostics-ledger.js").DiagnosticsLedger;
    /** Queue a hidden message to be injected at the next agent turn. */
    queueDeferredMessage?(message: CustomMessage): void;
    /** Queue a broker supervised-process completion for the owning session. */
    queueLaunchCompletion?(notification: DaemonCompletionNotification): Promise<void>;
    /** Register cleanup that runs when this session is disposed; returns a handle that removes the cleanup. */
    registerDisposeCallback?(callback: () => void): (() => void) | void;
    /** Register cleanup that runs when this ToolSession adopts a different session ID. */
    registerSessionChangeCallback?(callback: () => void): (() => void) | void;
    /** Queue late LSP diagnostics (arrived after an edit/write returned) to be shown
     *  in the transcript and delivered to the model at the next yield, like background
     *  job results. */
    queueDeferredDiagnostics?(entry: DeferredDiagnosticsEntry): void;
    /** Bump and return the session-global mutation counter for `path`. Edit/write
     *  tools call this on every file mutation so stale late-diagnostics can be dropped. */
    bumpFileMutationVersion?(path: string): number;
    /** Read the current session-global mutation counter for `path` (0 if never mutated). */
    getFileMutationVersion?(path: string): number;
    /** Get the active OpenTelemetry config so subagent dispatch can forward
     *  the parent's tracer/hooks with the subagent's own identity stamped. */
    getTelemetry?: () => AgentTelemetryConfig | undefined;
    /** Return image attachments visible to tools for resolving labels such as `Image #1`. */
    getImageAttachments?: () => ImageAttachmentEntry[];
}
export type ToolFactory = (session: ToolSession) => Tool | null | Promise<Tool | null>;
/**
 * Public callable factory map. External callers may invoke `BUILTIN_TOOLS.read(session)` or
 * `BUILTIN_TOOLS[name](session)` to construct a tool directly.
 */
export declare const BUILTIN_TOOLS: Record<BuiltinToolName, ToolFactory>;
export declare const HIDDEN_TOOLS: Record<HiddenToolName, ToolFactory>;
export type ToolName = BuiltinToolName;
/**
 * Built-ins whose registration follows live settings through the session's built-in
 * reconcile. Memory-backend tools other than `learn` follow `memory.backend` through
 * the memory backend's own tool replacement instead.
 */
export declare const SETTINGS_GATED_BUILTIN_TOOL_NAMES: readonly BuiltinToolName[];
/** Built-in tool selection {@link createTools} constructs for a session under its current settings. */
export interface BuiltinToolPlan {
    /** Explicit request after auto-includes; undefined selects every allowed built-in. */
    readonly requestedTools: string[] | undefined;
    /** Built-in and hidden tool names to construct, in construction order. */
    readonly names: string[];
    /** Session restriction plus settings gate shared by construction and live reconcile. */
    isAllowed(name: string): boolean;
}
/**
 * Resolve which built-in tools `session` gets for `toolNames` under the current
 * settings. Shared by {@link createTools} and the live settings reconcile so both
 * honor explicit lists, `restrictToolNames`, and task depth identically.
 */
export declare function resolveBuiltinToolPlan(session: ToolSession, toolNames?: string[]): Promise<BuiltinToolPlan>;
/** Allocates `xd://` presentation state over the session's canonical tool map. */
export declare function createXdevState(session: ToolSession, tools: Map<string, Tool>, builtInNames: Set<string>, mountedNames?: Set<string>): XdevState;
/**
 * Create tools from BUILTIN_TOOLS registry.
 */
export declare function createTools(session: ToolSession, toolNames?: string[]): Promise<Tool[]>;
export type { AskToolDetails, QuestionResult } from "@oh-my-pi/pi-tui-zh/tools/ask";
export { askToolRenderer } from "@oh-my-pi/pi-tui-zh/tools/ask";
export type { TodoStatus, TodoOperation, TodoItem, TodoPhase, TodoCompletionTransition, TodoToolDetails, CollapsedTodoSelection, } from "@oh-my-pi/pi-tui-zh/tools/todo";
export type { ThinkRenderArgs } from "@oh-my-pi/pi-tui-zh/tools/think";
export type { ResolutionDeviceName, ResolveDetails } from "@oh-my-pi/pi-tui-zh/tools/resolve";
export type { GhToolDetails, GhPrCheckoutSummary, GhRunWatchJobDetails, GhRunWatchRunDetails, GhRunWatchFailedLogDetails, GhRunWatchViewDetails, } from "@oh-my-pi/pi-tui-zh/tools/github";
