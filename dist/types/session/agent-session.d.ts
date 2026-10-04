/**
 * AgentSession - Core abstraction for agent lifecycle and session management.
 *
 * This class is shared between all run modes (interactive, print, rpc).
 * It encapsulates:
 * - Agent state access
 * - Event subscription with automatic session persistence
 * - Model and thinking level management
 * - Compaction (manual and auto)
 * - Bash execution
 * - Session switching and branching
 *
 * Modes use this class and add their own I/O layer on top.
 */
import { type Agent, type AgentMessage, type AgentState, type AgentTool, type AgentToolContext, type AgentToolResult, type ThinkingLevel, type ToolChoiceDirective } from "@oh-my-pi/pi-agent-core";
import { type CompactionResult, type ShakeConfig } from "@oh-my-pi/pi-agent-core/compaction";
import type { AnthropicFallbackCreditHandle, AssistantMessage, Context, ImageContent, Judge, Message, Model, ProviderSessionState, ResetCreditAccountStatus, ResetCreditRedeemOutcome, ResetCreditTarget, ServiceTier, ServiceTierByFamily, ServiceTierFamily, SimpleStreamOptions, TextContent, UsageReport } from "@oh-my-pi/pi-ai";
import { type Effort } from "@oh-my-pi/pi-ai";
import { type EditStore, type PowerAssertionOptions } from "@oh-my-pi/pi-natives";
import type { AdvisorConfig } from "@oh-my-pi/pi-tui-zh/overlays/advisor-config";
import { AsyncJobManager } from "../async/index.js";
import type { EffectiveExtensionRoots } from "../capability/types.js";
import type { ModelRegistry } from "../config/model-registry.js";
import { type ResolvedModelRoleValue } from "../config/model-resolver.js";
import { type PromptTemplate } from "../config/prompt-templates.js";
import { type SettingsScope } from "../config/registry.js";
import type { Settings } from "../config/settings.js";
import { RawSseDebugBuffer } from "@oh-my-pi/pi-tui-zh/apps/debug/raw-sse-buffer";
import type { EvalPreludeDefinition } from "../eval/preludes.js";
import type { PythonResult } from "../eval/py/executor.js";
import { type BashPtyOptions, type BashResult } from "../exec/bash-executor.js";
import type { TtsrManager } from "../export/ttsr.js";
import type { LoadedCustomCommand } from "../extensibility/custom-commands/index.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
import type { ExtensionRunner, ExtensionUIContext, PreparedExtension, ToolInfo } from "../extensibility/extensions/index.js";
import type { CompactOptions, ContextUsage } from "../extensibility/extensions/types.js";
import type { Skill, SkillWarning } from "../extensibility/skills.js";
import { type FileSlashCommand } from "../extensibility/slash-commands.js";
import { GoalRuntime } from "../goals/runtime.js";
import type { GoalModeState } from "../goals/state.js";
import type { HindsightSessionState } from "../hindsight/state.js";
import type { IrcMessage } from "@oh-my-pi/pi-tui-zh/tools/irc";
import type { DaemonCompletionNotification } from "../launch/protocol.js";
import { type MnemopiSessionState } from "../mnemopi/state.js";
import { type PlanApprovalDetails } from "../plan-mode/approved-plan.js";
import type { PlanModeState } from "../plan-mode/state.js";
import type { SecretObfuscator } from "../secrets/obfuscator.js";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { ImageAttachmentEntry } from "../tools/index.js";
import { type AskToolDetails } from "@oh-my-pi/pi-tui-zh/tools/ask";
import { type AskToolInput } from "../tools/ask.js";
import type { CheckpointState, CompletedRewindState } from "../tools/checkpoint.js";
import { type PlanProposalHandler } from "../tools/resolve.js";
import type { TodoPhase } from "@oh-my-pi/pi-tui-zh/tools/todo";
import type { WorkPoolYieldItem } from "../task/workpool-yield.js";
import type { AgentDefinition } from "../task/types.js";
import type { ModelMention } from "@oh-my-pi/pi-tui-zh/prompt/model-mention-syntax";
import { TokenRateMeter } from "../utils/token-rate.js";
import type { VibeModeState } from "../vibe/state.js";
import type { AgentSessionEvent, AgentSessionEventListener } from "./agent-session-events.js";
import type { AgentSessionConfig, AgentSessionDisposeOptions, AsyncJobInspection, AsyncJobSnapshot, CommandMetadataChangedListener, ContextUsageBreakdown, DroppedPrompt, EphemeralTurnOptions, EphemeralTurnResult, FollowUpOptions, FreshSessionResult, HandoffResult, ModelCycleResult, Prewalk, PromptOptions, ResetSessionContextResult, ResolvedRoleModel, RestoredQueuedMessage, RoleModelCycle, RoleModelCycleResult, SendUserMessageOptions, SessionHandoffOptions, SessionOAuthAccountList, SessionStats, SteerOptions, UsageFallbackConfirmer } from "./agent-session-types.js";
import type { ClientBridge } from "./client-bridge.js";
import { type CustomMessage, type CustomMessagePayload } from "./messages.js";
import { type PrewalkRestartResult } from "./prewalk.js";
import type { ServingModel } from "./retry-fallback-chains.js";
import { type AdvisorCatchupOptions, type AdvisorStats, type AdvisorStatusOverviewEntry } from "./session-advisors.js";
import type { BuildSessionContextOptions, SessionContext } from "./session-context.js";
import type { CacheWarmingMode, CacheWarmingStatus } from "./cache-warmer.js";
import { type SessionDumpArchive } from "./session-dump-format.js";
import type { BranchSummaryEntry, NewSessionOptions } from "./session-entries.js";
import { type SessionManager } from "./session-manager.js";
import type { ShakeMode, ShakeResult } from "./shake-types.js";
import { ToolChoiceQueue } from "./tool-choice-queue.js";
import { YieldQueue } from "./yield-queue.js";
export * from "./agent-session-events.js";
export * from "./agent-session-types.js";
export type { AdvisorStats, AdvisorStatusOverviewEntry, PerAdvisorStat } from "./session-advisors.js";
import { type AnthropicSlowModeController } from "./anthropic-slow-mode.js";
import { type SkillsSettings } from "../extensibility/settings.js";
/**
 * Rejection from {@link AgentSession.prompt} with `throwOnDrop: true` when the
 * prompt was dropped before reaching the agent (an abort, session transition,
 * or usage preflight denial won the race with turn setup). The prompt was not
 * persisted, so resubmitting it is safe. Headless drivers use this to retry.
 */
export declare class PromptDroppedError extends Error {
    constructor();
}
/**
 * A transcript snapshot ({@link AgentSession.fork} at an entry, a /btw branch) was
 * refused because a turn, user command, or maintenance pass could still write into
 * the transcript. RPC maps it to the `session_busy` error code.
 */
export declare class SessionBusyError extends Error {
    constructor(action: string);
}
type SessionNameTrigger = "replan";
/**
 * Translate a `power.sleepPrevention` mode into `PowerAssertion.start` options,
 * or `undefined` when the mode asks for no assertion at all.
 */
export declare function powerAssertionOptions(mode: "off" | "idle" | "display" | "system"): PowerAssertionOptions | undefined;
export declare class AgentSession implements SettingsScope {
    #private;
    readonly agent: Agent;
    readonly sessionManager: SessionManager;
    readonly settings: Settings;
    /** Session-start policy, independent of the selected project memory backend. */
    readonly memoryEnabled: boolean;
    /** Entries of tools mounted under `xd://`; empty when virtual devices are unmounted. */
    getXdevToolEntries: () => Array<{
        name: string;
        summary: string;
    }>;
    readonly yieldQueue: YieldQueue;
    editStore?: EditStore;
    /**
     * Session-local extension roots for post-startup rediscovery. Subagents may
     * inherit the owning session's provider so recursive task discovery preserves
     * explicit roots, mode, configured roots, and provenance.
     */
    get effectiveExtensionRoots(): EffectiveExtensionRoots;
    /**
     * Session-independent imported extension factories safe to rebind in child
     * sessions. A `/tan` fork forwards these as `preloadedPreparedExtensions`
     * so the child re-registers the parent's runtime providers.
     */
    get preparedExtensions(): readonly PreparedExtension[] | undefined;
    /** Source paths of loaded extensions, forwarded to child sessions when prepared factories are unavailable. */
    get extensionPaths(): readonly string[] | undefined;
    readonly configWarnings: string[];
    readonly rawSseDebugBuffer: RawSseDebugBuffer;
    /**
     * Arm prewalk outside the normal startup path so an explicit slash command starts immediately.
     */
    armPrewalk(target: Model, thinkingLevel?: ConfiguredThinkingLevel): boolean;
    /** Restore a planning model and re-arm prewalk without partially applying a rejected restart. */
    restartPrewalk(source: Model, sourceThinkingLevel: ConfiguredThinkingLevel | undefined, target: Model, targetThinkingLevel: ConfiguredThinkingLevel | undefined): Promise<PrewalkRestartResult>;
    /** Validate the active plan artifact and shape an `xd://propose` result for review-mode hosts. */
    preparePlanForReview(title: string): Promise<AgentToolResult<PlanApprovalDetails>>;
    /** Live generation tok/s for the working row; fed by this session's own streamed deltas. */
    readonly tokenRate: TokenRateMeter;
    constructor(config: AgentSessionConfig);
    /** Registers teardown to run when this session is disposed (e.g. handle listeners bound to it). */
    addDisposer(dispose: () => void): void;
    /** Model registry for API key resolution and model discovery */
    get modelRegistry(): ModelRegistry;
    get asyncJobManager(): AsyncJobManager | undefined;
    getAgentId(): string | undefined;
    /**
     * The per-turn tool-choice directive for the agent loop's `getToolChoice`. Priority:
     *   1. a HARD forced choice from the queue (genuine forces: user-force, eager-todo, …) —
     *      consuming (advances the queue generator);
     *   2. else, when a non-forcing preview is pending, a {@link SoftToolRequirement} — a
     *      PEEK (advances/pops nothing), so the agent-loop injects the reminder once per head
     *      and escalates to a forced `write` only if the model declines to
     *      resolve via `xd://resolve` or `xd://reject`. A compliant turn
     *      pays ZERO tool_choice change (no prompt-cache messages-cache invalidation);
     *   3. else undefined.
     */
    nextToolChoiceDirective(): ToolChoiceDirective | undefined;
    /** Peek the head non-forcing pending preview invoker, for the preview-resolution dispatch. */
    peekPendingInvoker(): ((input: unknown) => Promise<unknown> | unknown) | undefined;
    /** Clear stale non-forcing pending preview invokers after a resolve dispatch proves none can run. */
    clearPendingInvokers(): void;
    /**
     * Force the next model call to target a specific active tool, then terminate
     * the agent loop. Pushes a two-step sequence [forced, "none"] so the model
     * calls exactly the forced tool once and then cannot call another.
     */
    setForcedToolChoice(toolName: string): void;
    /** The tool-choice queue: forces forthcoming tool invocations and carries handlers. */
    get toolChoiceQueue(): ToolChoiceQueue;
    /** Peek the in-flight directive's invocation handler for the preview-resolution dispatch. */
    peekQueueInvoker(): ((input: unknown) => Promise<unknown> | unknown) | undefined;
    peekPlanProposalHandler(): PlanProposalHandler | undefined;
    setPlanProposalHandler(handler: PlanProposalHandler | null): void;
    setSessionBeforeSwitchReconciler(reconciler: (() => Promise<void>) | null): void;
    setSessionSwitchReconciler(reconciler: (() => Promise<void>) | null): void;
    /** Provider-scoped mutable state store for transport/session caches. */
    get providerSessionState(): Map<string, ProviderSessionState>;
    /** Hint forwarded to provider calls that support websocket transport; read live from `providers.openaiWebsockets`. */
    get preferWebsockets(): boolean | undefined;
    getHindsightSessionState(): HindsightSessionState | undefined;
    setHindsightSessionState(state: HindsightSessionState | undefined): HindsightSessionState | undefined;
    getMnemopiSessionState(): MnemopiSessionState | undefined;
    /** TTSR manager for time-traveling stream rules */
    get ttsrManager(): TtsrManager | undefined;
    /** Secret obfuscator, when secrets are configured; /share redaction reuses it. */
    get obfuscator(): SecretObfuscator | undefined;
    /** Install the obfuscator built after a live `secrets.enabled` switch-on. */
    setObfuscator(obfuscator: SecretObfuscator | undefined): void;
    /** Whether a TTSR abort is pending (stream was aborted to inject rules) */
    get isTtsrAbortPending(): boolean;
    /** Whether an expected internal plan-mode abort is pending. Consumed by
     *  `#handleAgentEvent` to stamp `SILENT_ABORT_MARKER` on the next aborted
     *  assistant message_end; callers clear it in `finally`. */
    get isPlanInternalAbortPending(): boolean;
    /** Arm the silent-abort marker for the next aborted assistant message_end.
     *  Caller MUST clear via `clearPlanInternalAbortPending()` in a `finally`
     *  to guarantee no leak. */
    markPlanInternalAbortPending(): void;
    /** Unconditionally clear the silent-abort flag. Idempotent: safe when the
     *  flag was never set OR was already consumed by `#handleAgentEvent`. */
    clearPlanInternalAbortPending(): void;
    getAsyncJobSnapshot(options?: {
        recentLimit?: number;
    }): AsyncJobSnapshot | null;
    /**
     * Inspect one async job this session owns: its command, live pids, exit
     * status and output. Undefined when the job is unknown, owned by another
     * agent, or evicted.
     */
    inspectAsyncJob(id: string): AsyncJobInspection | undefined;
    /** Cancel a running async job this session owns; false when there is none by that id. */
    cancelAsyncJob(id: string): boolean;
    /**
     * Public view of the pending-async-wake state for run drivers: true while
     * owner-scoped async work can still re-wake this session's run (a running
     * background job with an unsuppressed delivery, or a queued / in-flight
     * delivery). The task executor's quiescence barrier polls this to
     * distinguish a scheduling pause from terminal completion.
     */
    hasPendingAsyncWork(): boolean;
    /** True while a submission has been admitted but has not yet started a turn, queued, or bailed. */
    get hasAdmittedSubmission(): boolean;
    /** Resolves once every currently admitted submission has dispatched, queued, or bailed. */
    waitForAdmittedSubmissions(): Promise<void>;
    /**
     * Settle one generation of owner-scoped async work: wait for running owner
     * jobs to finish, deliver their queued results (which enqueue async-result
     * follow-ups on this session's yield queue), and wait for the injected
     * follow-up turn(s) to go idle. Callers loop while
     * {@link hasPendingAsyncWork} still holds — a follow-up turn may start new
     * jobs.
     */
    settleAsyncWork(): Promise<void>;
    /**
     * Judge for TTSR `question` rules per `ttsr.judge`, used by live judging and
     * `/omfg` validation. `auto` requires the judge role to resolve to a native
     * System One model, since every completed output may cost a request. Rebuilt
     * per call so model, credential, and session switches apply.
     */
    ruleJudge(): Judge | undefined;
    /**
     * Emit a UI-only notice to the session. Surfaces in interactive mode as a
     * `showWarning` / `showError` / `showStatus` line; non-interactive modes
     * receive the event through the normal subscribe stream.
     *
     * Notices are NOT added to agent state and never reach the LLM — use this
     * for out-of-band conditions the user should see but the model shouldn't
     * react to (e.g. background queue flush failures).
     */
    emitNotice(level: "info" | "warning" | "error", message: string, source?: string): void;
    /**
     * Await only message persistence already in flight at call time.
     *
     * Focus attach uses this after subscribing to the target so a tool result
     * emitted during the focus blackout is present in the transcript rebuild.
     * This intentionally excludes agent_end maintenance, which may perform
     * provider-backed compaction and must not block switching sessions.
     */
    settleInFlightMessagePersistence(): Promise<void>;
    /**
     * Subscribe to agent events.
     * Session persistence is handled internally (saves messages on message_end).
     * Multiple listeners can be added. Returns unsubscribe function for this listener.
     */
    subscribe(listener: AgentSessionEventListener): () => void;
    /**
     * Snapshot the latest unpersisted display result for each active tool or
     * returned background call. Focus rebuilds replay these after reconstructing
     * persisted transcript state.
     */
    activeToolExecutionUpdates(): readonly Extract<AgentSessionEvent, {
        type: "tool_execution_update";
    }>[];
    /**
     * Observe authoritative run-state transitions before public `agent_end`
     * deferral, for lifecycle owners that must not remain stale while prompts unwind.
     */
    subscribeRunState(listener: (state: "running" | "idle") => void): () => void;
    /**
     * Epoch ms the current run started, stable across retries within the run and
     * across UI focus switches; undefined while idle.
     */
    get runStartedAt(): number | undefined;
    /**
     * Current prompt-cache warming state, for hosts that surface it. Undefined
     * when the session has no warmer (side-channels, subagents, older hosts).
     */
    get cacheWarmingStatus(): CacheWarmingStatus | undefined;
    /**
     * Arms the prompt-cache warmer for a main-loop request. Called from the
     * session streamFn with its raw request options; retention settings are
     * resolved here to match the settings-aware stream wrapper.
     * A no-op when the session has no warmer.
     */
    startCacheWarming(model: Model, context: Context, options: SimpleStreamOptions): void;
    /** Prompt size (input + cacheRead + cacheWrite) of the most recent real provider response. */
    lastPromptTokens(): number;
    /** True while a session identity or transcript transition is still applying or rolling back. */
    get isSessionTransitioning(): boolean;
    /** Wait until all active session/transcript transitions have settled, including rollback. */
    waitForSessionTransition(): Promise<void>;
    /** Register cleanup that runs when this AgentSession adopts a different session ID. */
    registerSessionChangeCallback(callback: () => void): () => void;
    subscribeCommandMetadataChanged(listener: CommandMetadataChangedListener): () => void;
    /** Run one abortable auto-learn capture outside the primary agent loop. */
    runAutolearnCapture(capture: (signal: AbortSignal) => Promise<void>): Promise<void>;
    /** True once dispose() has begun; deferred background work (e.g. the deferred
     *  MCP discovery task in sdk.ts) must not touch the session past this point. */
    get isDisposed(): boolean;
    markMovedFromEmptySessionFile(sessionFile: string): void;
    /**
     * Synchronously mark the session as disposing so new work is rejected
     * immediately: eval starts throw, queued asides are dropped, the aside
     * provider is detached, and settings listeners bound to the session stop
     * (a config reload mid-teardown must not reconnect or re-steer anything).
     * Idempotent; `dispose()` runs it first.
     *
     * Wrappers that await other teardown before delegating to `dispose()` MUST
     * call this before their first await — otherwise work started in that async
     * gap slips past the disposal guards.
     */
    beginDispose(): void;
    dispose(options?: AgentSessionDisposeOptions): Promise<void>;
    freshSession(): FreshSessionResult | undefined;
    /**
     * Reset the current conversation in place: drop every message, queued turn,
     * and pending tool call from the model's context while keeping the session
     * itself — its id, title, cwd, model, settings, and on-disk transcript all
     * survive. The next turn is sent with only the base system prompt plus the
     * project rules/AGENTS.md.
     *
     * This is the in-place sibling of {@link newSession}: it reuses the same
     * conversation-boundary teardown (drop the conversation, rotate provider-side
     * session state so providers that keep history server-side resume nothing,
     * re-prime the advisors, and undo any memory promotion) but skips minting a
     * new session id and opening a fresh transcript file. Unlike
     * {@link freshSession} (which only rotates provider stream state) it also
     * clears the conversation.
     *
     * Returns `undefined` without mutating anything while a response is
     * streaming or a foreground bash/python execution is in flight.
     */
    resetSessionContext(): Promise<ResetSessionContextResult | undefined>;
    /** Full agent state */
    get state(): AgentState;
    /** Current model (may be undefined if not yet selected) */
    get model(): Model | undefined;
    /**
     * Model this session's produced work is attributed to. Holds the last model
     * that actually served while a fallback is armed but unproven, so observers
     * never credit a run to a candidate that produced nothing.
     */
    get servingModel(): ServingModel | undefined;
    /** Install the interactive decision surface for reserve-triggered model changes. */
    setUsageFallbackConfirmer(confirmer: UsageFallbackConfirmer | undefined): void;
    /** Effective thinking level applied to the agent (the resolved level when `auto`). */
    get thinkingLevel(): ThinkingLevel | undefined;
    /** The selector the user configured: `auto` when auto mode is active, else the effective level. */
    configuredThinkingLevel(): ConfiguredThinkingLevel | undefined;
    /** True when `auto` thinking mode is active. */
    get isAutoThinking(): boolean;
    /** The level `auto` resolved to for the current turn (undefined until classified). */
    autoResolvedThinkingLevel(): Effort | undefined;
    /** Live per-family service tiers (OpenAI / Anthropic / Google). */
    get serviceTierByFamily(): ServiceTierByFamily;
    /** Whether agent is currently streaming a response */
    get isStreaming(): boolean;
    get isAborting(): boolean;
    /**
     * Wait until streaming, event persistence, and deferred recovery work are fully settled.
     * Call outside callbacks whose completion the session awaits to avoid waiting on yourself.
     */
    waitForIdle(): Promise<void>;
    /**
     * Prevent advisor notes from starting hidden primary turns while a headless
     * caller prints and drains the final primary response.
     */
    prepareForHeadlessAdvisorDrain(): void;
    /**
     * Wait for active advisor reviews and their emitted card events before a
     * headless caller disposes the session. Returns `false` and logs work disposal
     * will abandon when the shared deadline expires or an advisor fails;
     * `waitThroughRecovery` waits through a failing advisor's fallback recovery and
     * `strictWithoutDeadline` waits on `strict` advisors past the deadline.
     */
    waitForAdvisorCatchup(timeoutMs: number, options?: AdvisorCatchupOptions): Promise<boolean>;
    drainAsyncJobDeliveriesForAcp(options?: {
        timeoutMs?: number;
    }): Promise<boolean>;
    /**
     * Most recent settled assistant message. A classifier-refusal turn pruned
     * from active context at settle is still reported until the next run
     * starts, so terminal-outcome consumers (print mode, task executor) see
     * the refusal error rather than the previous turn — or nothing.
     */
    getLastAssistantMessage(): AssistantMessage | undefined;
    /** Current effective system prompt blocks (includes any per-turn extension modifications) */
    get systemPrompt(): string[];
    /** Marks streamed text as committed or buffered for turn-recovery replay decisions. */
    setTextOutputCommitted(committed: boolean): void;
    /** Current retry attempt (0 if not retrying) */
    get retryAttempt(): number;
    /** Names of tools currently exposed at the top level. */
    getActiveToolNames(): string[];
    /** Enabled top-level and discoverable tool names. */
    getEnabledToolNames(): string[];
    /** Names of dynamic tools mounted under `xd://`. */
    getMountedXdevToolNames(): string[];
    /** Whether the edit tool is registered in this session. */
    get hasEditTool(): boolean;
    /** Looks up a registered tool by name. */
    getToolByName(name: string): AgentTool | undefined;
    /** Looks up an enabled eval-bridge tool with the session's permission gate applied. */
    getToolForEvalBridge(name: string): AgentTool | undefined;
    /** Names currently authorized through the eval bridge. */
    getEvalBridgeToolNames(): string[];
    /** Tools left directly model-visible by Code Mode; undefined when inactive. */
    getCodeModeDirectToolNames(): readonly string[] | undefined;
    /** Whether a registry entry came from a built-in factory. */
    hasBuiltInTool(name: string): boolean;
    /**
     * Re-resolves settings-gated tools (built-in `*.enabled` toggles, eval backends,
     * image/speech generation, `tools.xdev`) against live settings and refreshes the
     * prompt once (`refreshPrompt: false` refreshes only if the tool set changed). The
     * SDK runs it whenever a gating setting changes; other runtime owners may call it
     * after changing an input the gate reads.
     */
    reconcileBuiltinTools(options?: {
        refreshPrompt?: boolean;
    }): Promise<void>;
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
    /** Updates extension MCP ownership after a lifecycle registration commit or rollback. */
    setExtensionMCPTool(name: string, tool: AgentTool | undefined): void;
    /** Runs a registry/presentation mutation in this session's shared queue. */
    runToolRegistryMutation<T>(mutation: () => Promise<T>, signal?: AbortSignal): Promise<T>;
    /** Names of every registered tool. */
    getAllToolNames(): string[];
    /** Full metadata for every registered tool, including source provenance (backs `getAllTools()`). */
    getAllToolInfos(): ToolInfo[];
    /** Installs and activates the ephemeral vibe tool set. */
    activateVibeTools(baseToolNames: string[]): Promise<void>;
    /** Uninstalls vibe tools and activates the replacement set. */
    deactivateVibeTools(nextToolNames: string[]): Promise<void>;
    /** Removes vibe tools without restoring a source-session snapshot. */
    removeVibeToolsPreservingActive(): Promise<void>;
    /** Enabled MCP tools in their current presentation partition. */
    getSelectedMCPToolNames(): string[];
    /** Rediscovers reloadable skills and refreshes prompt metadata. */
    refreshSkills(): Promise<void>;
    /**
     * Rediscovers skills and file-based slash commands for the current cwd, rebuilds the
     * system prompt, and notifies command-metadata listeners (TUI autocomplete, RPC/ACP
     * command lists). Serialized so overlapping reloads apply in call order.
     */
    refreshSkillsAndCommands(): Promise<void>;
    /**
     * Applies Code Mode at session startup: when the initial model activates
     * it (`codeMode` `on`, or `auto` matching a `code_mode_only` catalog flag),
     * the initial tool surface is routed through the Code Mode-aware path so
     * the restricted direct surface and namespaces snapshot exist before the
     * first provider turn instead of waiting for an unrelated reconciliation.
     *
     * Inactive sessions keep their initial surface untouched: re-applying an
     * unchanged set would seed the prompt-rebuild signature cache and suppress
     * the first late tool registration's rebuild (non-MCP `xd://` mounts are
     * deliberately not part of that signature).
     */
    initializeCodeMode(): Promise<void>;
    /** Current Code Mode `tool_namespaces_info` snapshot, or `undefined` when inactive. */
    get codeModeNamespacesInfo(): unknown;
    /** Selects enabled tools, ignoring names absent from the registry. */
    setActiveToolsByName(toolNames: string[]): Promise<void>;
    /** Restores an exact top-level versus `xd://` tool partition. */
    setActiveToolPresentation(toolNames: string[], mountedToolNames: string[], forcePromptRefresh?: boolean, signal?: AbortSignal): Promise<void>;
    /** Restores a non-MCP presentation snapshot while retaining the current MCP selection. */
    restoreNonMCPToolPresentation(nonMCPToolNames: string[], nonMCPMountedToolNames: string[]): Promise<void>;
    /** Current enabled eval prelude definitions. */
    getEvalPreludes(): readonly EvalPreludeDefinition[];
    /** Eval preludes frozen into the provider-visible prompt (see {@link SessionTools.advertisedEvalPreludes}). */
    getAdvertisedEvalPreludes(): readonly EvalPreludeDefinition[];
    /**
     * User-tagged model agents frozen into the task description (see
     * {@link SessionTools.advertisedSessionAgents}). Later tags ride a hidden
     * notice so the provider cache prefix stays intact.
     */
    getAdvertisedSessionAgents(): readonly AgentDefinition[];
    /** Cancels the local rollout-memory startup owned by this session. */
    cancelLocalMemoryStartup(): void;
    /** Starts a new local rollout-memory generation and cancels its predecessor. */
    beginLocalMemoryStartup(): AbortSignal;
    /** Releases the local startup slot if `signal` still owns it. */
    endLocalMemoryStartup(signal: AbortSignal): void;
    /** Apply the backend; cwd rebinding can skip Mnemopi auto-retention while still draining writes. */
    applyMemoryBackend(options?: {
        retainMnemopi?: boolean;
    }): Promise<void>;
    /** Resolves once every memory-setting edit so far, and the backend transitions it started, has settled. */
    settleMemoryBackend(): Promise<void>;
    /** Rebuilds the stable base prompt, optionally discarding a stale asynchronous rebuild. */
    refreshBaseSystemPrompt(commitIf?: () => boolean): Promise<void>;
    /** Replaces connected MCP tools and enables them immediately. */
    refreshMCPTools(mcpTools: CustomTool[]): Promise<void>;
    /** Replaces host-owned RPC tools before the next model call. */
    refreshRpcHostTools(rpcTools: AgentTool[]): Promise<void>;
    /** Whether compaction or manual handoff is active, for prompt admission and UI queuing. */
    get isCompacting(): boolean;
    /** Background speculative-compaction state, for UI indicators. */
    get compactionSpeculation(): "idle" | "running" | "armed";
    /** Strip image content from the current branch and persist the rewrite. */
    dropImages(): Promise<{
        removed: number;
    }>;
    /** Reduce stored context with the selected shake strategy. */
    shake(mode: ShakeMode, opts?: {
        config?: ShakeConfig;
        signal?: AbortSignal;
    }): Promise<ShakeResult>;
    /** Compact the active session history. */
    compact(customInstructions?: string, options?: CompactOptions): Promise<CompactionResult>;
    /** Cancel active manual, automatic, and handoff maintenance, preserving an optional source reason. */
    abortCompaction(reason?: unknown): void;
    /** Trigger idle compaction through the automatic maintenance flow. */
    runIdleCompaction(): Promise<void>;
    /** Override cache warming for this session only, never writing config.yml; returns the effective mode. */
    setCacheWarmingMode(mode: CacheWarmingMode): CacheWarmingMode;
    /** Toggle automatic compaction. `persist` saves it to global config; the default applies a session-scoped override. */
    setAutoCompactionEnabled(enabled: boolean, persist?: boolean): void;
    /** Whether automatic compaction is enabled. */
    get autoCompactionEnabled(): boolean;
    /**
     * Whether idle-flush tasks, auto-continuations, or other short-lived
     * post-prompt work are pending.  True in the brief window after
     * `session.prompt()` returns but before a scheduled background delivery
     * (e.g. an async-job result) has finished its own streaming turn.
     * Loop-mode and similar auto-submit paths should treat this as a block
     * to avoid racing against the delivery turn.
     */
    get hasPostPromptWork(): boolean;
    /** Register post-prompt work in tests without driving a full agent turn. */
    trackPostPromptTaskForTests(task: Promise<unknown>): void;
    /** All messages including custom types like BashExecutionMessage */
    get messages(): AgentMessage[];
    /** Latest image attachments addressable by tools as `Image #N` or `attachment://N`. */
    getImageAttachments(): ImageAttachmentEntry[];
    buildDisplaySessionContext(): SessionContext;
    /**
     * Transcript for TUI display. Full history is kept for export/resume-style
     * callers; live chat can collapse compacted history to keep the hot render
     * surface bounded. Display-only — NEVER feed the result to
     * `agent.replaceMessages` or a provider.
     */
    buildTranscriptSessionContext(options?: Pick<BuildSessionContextOptions, "collapseCompactedHistory" | "keepDanglingToolCalls">): SessionContext;
    /** Convert session messages using the same pre-LLM pipeline as the active session. */
    convertMessagesToLlm(messages: AgentMessage[], signal?: AbortSignal): Promise<Message[]>;
    /** Apply session-level stream hooks to a direct side request. */
    prepareSimpleStreamOptions(options: SimpleStreamOptions, provider?: string): SimpleStreamOptions;
    /** Current steering mode */
    get steeringMode(): "all" | "one-at-a-time";
    /** Current follow-up mode */
    get followUpMode(): "all" | "one-at-a-time";
    /** Current interrupt mode */
    get interruptMode(): "immediate" | "wait";
    /** Current session file path, or undefined if sessions are disabled */
    get sessionFile(): string | undefined;
    /** Current session ID */
    get sessionId(): string;
    getEvalSessionId(): string;
    getEvalKernelOwnerId(): string;
    /** Current session display name, if set */
    get sessionName(): string | undefined;
    /** Scoped models for cycling (from --models flag) */
    get scopedModels(): ReadonlyArray<{
        model: Model;
        thinkingLevel?: ThinkingLevel;
    }>;
    /** Replace the Ctrl+P/`/models` cycle scope (post-discovery rebuild; see {@link ModelControls.setScopedModels}). */
    setScopedModels(scopedModels: Array<{
        model: Model;
        thinkingLevel?: ThinkingLevel;
    }>): void;
    /** Prompt templates */
    getPlanModeState(): PlanModeState | undefined;
    /** Prewalk state, if armed and active */
    getPrewalkState(): Prewalk | undefined;
    setPlanModeState(state: PlanModeState | undefined): void;
    getGoalModeState(): GoalModeState | undefined;
    setGoalModeState(state: GoalModeState | undefined): void;
    getVibeModeState(): VibeModeState | undefined;
    setVibeModeState(state: VibeModeState | undefined): void;
    /**
     * True while a turn, user bash/eval, compaction, handoff, or retry could still write
     * into the transcript, so a snapshot of it would miss or split that work.
     */
    get isBusyForSnapshot(): boolean;
    get goalRuntime(): GoalRuntime;
    markPlanReferenceSent(): void;
    setPlanReferencePath(path: string): void;
    getPlanReferencePath(): string;
    get clientBridge(): ClientBridge | undefined;
    setClientBridge(bridge: ClientBridge | undefined): void;
    getCheckpointState(): CheckpointState | undefined;
    getLastCompletedRewind(): CompletedRewindState | undefined;
    setCheckpointState(state: CheckpointState | undefined): void;
    /**
     * Inject the plan mode context message into the conversation history.
     */
    sendPlanModeContext(options?: {
        deliverAs?: "steer" | "followUp" | "nextTurn" | "aside";
    }): Promise<void>;
    sendGoalModeContext(options?: {
        deliverAs?: "steer" | "followUp" | "nextTurn" | "aside";
    }): Promise<void>;
    sendVibeModeContext(options?: {
        deliverAs?: "steer" | "followUp" | "nextTurn" | "aside";
    }): Promise<void>;
    resolveRoleModel(role: string): Model | undefined;
    /**
     * Resolve a role to its model AND thinking level.
     * Unlike resolveRoleModel(), this preserves the thinking level suffix
     * from role configuration (e.g., "anthropic/claude-sonnet-4-5:xhigh").
     */
    resolveRoleModelWithThinking(role: string): ResolvedModelRoleValue;
    /**
     * Resolve the explicit thinking suffix that should apply when a temporary
     * picker selects a model already assigned to a configured role.
     */
    resolveTemporaryModelThinkingLevel(model: Model): ConfiguredThinkingLevel | undefined;
    get promptTemplates(): ReadonlyArray<PromptTemplate>;
    /** Replace file-based slash commands used for prompt expansion. */
    setSlashCommands(slashCommands: FileSlashCommand[]): void;
    /** File-based slash commands discovered at session construction (or last set). */
    get slashCommands(): ReadonlyArray<FileSlashCommand>;
    /** Custom commands (TypeScript slash commands and MCP prompts) */
    get customCommands(): ReadonlyArray<LoadedCustomCommand>;
    /** MCP prompt commands only, for command-list metadata. */
    get mcpPromptCommands(): ReadonlyArray<LoadedCustomCommand>;
    /** Update the MCP prompt commands list. Called when server prompts are (re)loaded. */
    setMCPPromptCommands(commands: LoadedCustomCommand[]): void;
    /**
     * Send a prompt to the agent.
     * - Handles extension commands (registered via pi.registerCommand) immediately, even during streaming
     * - Expands file-based prompt templates by default
     * - During streaming, queues via steer() or followUp() based on streamingBehavior option
     * - Validates model and API key before sending (when not streaming)
     * @throws Error if streaming and no streamingBehavior specified
     * @throws Error if no model selected or no API key available (when not streaming)
     *
     * Returns `false` when the command was fully handled locally (extension or
     * custom-TS command consumed without calling the LLM). Returns `true` when
     * the prompt was forwarded to the agent — either directly or queued as a
     * steer/follow-up. Callers that render a UI or manage turn lifecycle (e.g.
     * the ACP agent) use this to know whether to expect an `agent_end` event.
     *
     * A prompt dropped before dispatch also resolves `true` (RPC reports it as
     * aborted once no run started); pass `throwOnDrop: true` to reject with
     * {@link PromptDroppedError} instead.
     */
    prompt(text: string, options?: PromptOptions): Promise<boolean>;
    /**
     * @returns true when the message is (or will be) picked up by an agent turn
     * — queued into a running turn, or a new turn started synchronously. false
     * when dispatch bailed before invoking the agent (e.g. a concurrent abort
     * won the generation race), so hosts waiting on a terminal `agent_end` can
     * stop instead of hanging.
     */
    promptCustomMessage<T = unknown>(message: Pick<CustomMessage<T>, "customType" | "content" | "display" | "details" | "attribution">, options?: Pick<PromptOptions, "streamingBehavior" | "toolChoice" | "onPromptAdmitted"> & {
        queueChipText?: string;
        queueOnly?: boolean;
    }): Promise<boolean>;
    /**
     * Queue a steering message to interrupt the agent mid-run.
     */
    steer(text: string, images?: ImageContent[], options?: SteerOptions): Promise<void>;
    /**
     * Queue a follow-up message to process after the agent would otherwise stop.
     * Set `options.synthetic` to enqueue a hidden developer message (agent-attributed
     * by default) instead of a user-attributed follow-up; the plan-approval flow
     * uses this to land its execution directive behind a queued user turn without
     * flipping advisor auto-resume.
     */
    followUp(text: string, images?: ImageContent[], options?: FollowUpOptions): Promise<void>;
    /**
     * Run a mode-exit `teardown` (abort the active turn, swap the toolset, clear
     * mode state) with queued-message auto-resume suppressed, then re-arm the
     * drain so a queued user turn resumes cleanly once the previous toolset is
     * back.
     *
     * `abort()`'s stranded-queue drain runs from its own `finally`; without this
     * guard a queued steer/follow-up behind the aborted turn would start a fresh
     * `agent.continue()` during the teardown's `await`s — while the exiting mode's
     * tools/context are still live — and then have those tools removed underneath
     * it, reintroducing the mode's stale-tool failure on the restarted turn
     * (issue #8326). Suppressing the drain across teardown guarantees the queued
     * turn resumes only after teardown, so it runs as a clean non-mode turn.
     */
    runModeExitTeardown(teardown: () => Promise<void>): Promise<void>;
    queueDeferredMessage(message: CustomMessage): void;
    queueLaunchCompletion(notification: DaemonCompletionNotification): Promise<void>;
    /**
     * Send a custom message to the session. Creates a CustomMessageEntry.
     *
     * Handles three cases:
     * - Streaming: queue as steer/follow-up, aside (next step boundary), or store for next turn
     * - Not streaming + triggerTurn: appends to state/session, starts new turn unless the client cannot own it
     * - Not streaming + no trigger: appends to state/session, no turn; with the default delivery
     *   (no deliverAs) a display:true message also paints to the interactive transcript
     *   immediately (message_start/message_end, no turn)
     *
     * @returns true iff this call synchronously started a new turn (awaited
     * `agent.prompt`); false when the message was queued/appended without a turn
     * — including when `triggerTurn` is downgraded because the client defers
     * agent-initiated turns. Callers that must mirror the resulting `agent_end`
     * use this to avoid acting on a turn that never ran.
     */
    sendCustomMessage<T = unknown>(message: CustomMessagePayload<T>, options?: {
        triggerTurn?: boolean;
        deliverAs?: "steer" | "followUp" | "nextTurn" | "aside";
        queueChipText?: string;
        acceptTerminalEmptyStop?: boolean;
    }): Promise<boolean>;
    /**
     * Send a user message through the prompt flow.
     *
     * Omitted `deliverAs` starts a turn when idle and queues as a steer while streaming.
     * Explicit `deliverAs` queues without starting a turn in either state; `aside` at
     * an idle session instead starts a turn, since there is no live run to inject into.
     */
    sendUserMessage(content: string | (TextContent | ImageContent)[], options?: SendUserMessageOptions): Promise<void>;
    /** Clear queued messages and return the user-restorable ones (text plus any attached images).
     *  Only user-authored messages (plain user turns, `attribution:"user"` custom like `/skill`) are
     *  returned for editor restore. Other queued messages stay in the agent-core queues so a continuing
     *  stream still delivers them — EXCEPT on `forInterrupt` (Esc+abort), where only advisor cards are
     *  kept (abort()'s #extractQueuedAdvisorCards preserves them as visible advice) and every other
     *  non-user steer (hidden goal/plan/budget, IRC/extension asides) is dropped, so abort()'s
     *  #drainStrandedQueuedMessages can't auto-resume the run the user just interrupted (the drain only
     *  fires while agent.hasQueuedMessages()). `forInterrupt` also withdraws live-steered input the
     *  aborted response took but never recorded, returning it first (it was queued first).
     *  Plain Alt+Up dequeue preserves those non-user steers. */
    clearQueue(options?: {
        forInterrupt?: boolean;
    }): {
        steering: RestoredQueuedMessage[];
        followUp: RestoredQueuedMessage[];
    };
    /** Number of pending displayable messages (includes steering, follow-up, and next-turn messages).
     *  Reflects actual queued work (advisor cards included) — feeds hasPendingMessages()/RPC and the
     *  empty-submit abort gate. The user-restorable subset is surfaced by getQueuedMessages()/clearQueue(). */
    get queuedMessageCount(): number;
    /** Whether an empty submit should interrupt the streaming turn: displayable input is
     *  queued, or live steering sits in the in-flight response, which the abort requeues
     *  for the continuation turn. */
    get hasInterruptibleInput(): boolean;
    /** Chip texts for the queue display. Steering live steering took for the streaming response
     *  stays listed until the transcript records it, when the model actually switches to it. */
    getQueuedMessages(): {
        steering: readonly string[];
        followUp: readonly string[];
    };
    /**
     * Remove the first matching user message and its hidden companions from one queue.
     * Matches the raw text the caller originally submitted — recorded by
     * `#queueUserMessage` before any slash/custom-command rewrite, prompt-template
     * expansion, or `^model` mention substitution — first, then the queued chip
     * text itself (exact). Raw-text matching covers every transformation `prompt()`
     * can apply, including the slash/custom-command step no replay can safely
     * redo (custom commands can have side effects); the chip-text fallback keeps
     * exact matches working for callers that already hold the queued text (e.g. a
     * skill invocation's `__queueChipText`, or untransformed text). A missing or
     * already delivered target changes nothing; repeated calls may remove further
     * duplicates.
     */
    removeQueuedMessage(text: string, queue: "steering" | "followUp"): boolean;
    /**
     * Move the first matching user follow-up and its hidden companions to the end of the
     * steering queue without preprocessing them again. Matches exactly like
     * {@link removeQueuedMessage}; agent-attributed handoffs are never promoted. A missing
     * or already delivered target changes nothing; repeated calls may promote duplicates.
     */
    promoteQueuedMessage(text: string): boolean;
    /**
     * Pop the last queued message (steering first, then follow-up).
     * Used by dequeue keybinding to restore messages to editor one at a time.
     * Steps over agent-authored queued messages (advisor cards, hidden/internal steers).
     */
    popLastQueuedMessage(): RestoredQueuedMessage | undefined;
    get skillsSettings(): SkillsSettings | undefined;
    /** Skills loaded by SDK (empty if --no-skills or skills: [] was passed) */
    get skills(): readonly Skill[];
    /** Descriptions frozen when this session's system prompt was built. */
    get renderedSkills(): readonly Skill[];
    /** Frozen skill-URI hint visibility snapshot (see {@link SessionTools.skillHintVisible}). */
    getSkillHintVisible(): boolean;
    /** Skill loading warnings captured by SDK */
    get skillWarnings(): readonly SkillWarning[];
    /** Session-local general-purpose agents pinned to user-tagged models. */
    getSessionAgents(): AgentDefinition[];
    /** Registered model pseudonyms on the active branch. */
    get modelMentions(): readonly ModelMention[];
    /** Resolve a model selector within the session picker's scope. */
    findMentionableModel(selector: string): Model | undefined;
    getTodoPhases(): TodoPhase[];
    setTodoPhases(phases: TodoPhase[]): void;
    /** Active item labels accepted by this pooled turn's incremental yield tool. */
    getWorkPoolYieldItems(): readonly WorkPoolYieldItem[];
    /** Replace the pooled-turn yield contract and rebuild the provider prompt when it changes. */
    setWorkPoolYieldItems(items: readonly WorkPoolYieldItem[]): Promise<void>;
    /** Settles when any in-flight yield prompt rebuild completes. Wake-turn entry
     *  joins it so a turn never builds from stale provider bytes. */
    whenWorkPoolYieldSettled(): Promise<void>;
    /**
     * Start automatic title generation when the session and input are eligible.
     * Interactive and CLI-bootstrap submissions share this gate so every first
     * user message persists titles with the same environment, signal, and local
     * extension-command policy.
     */
    maybeStartTitleGeneration(firstMessage: string): void;
    /**
     * Generate an automatic session title tied to this session's lifecycle.
     * Input and replan callers share the signal so interruption and disposal cancel
     * provider and local-worker requests instead of leaving background inference alive.
     * Online calls use a stable side-request identity so they cannot advance the
     * foreground provider session while its request is waiting.
     * `customSystemPrompt` swaps the title prompt for special-purpose titling
     * (e.g. plan-save filename topics) without touching the session override.
     */
    generateTitle(firstMessage: string, customSystemPrompt?: string, signal?: AbortSignal): Promise<string | null>;
    /** Capture before generation to detect interruption or disposal of a title request. */
    get titleGenerationSignal(): AbortSignal;
    /** Currently-applied {@link TITLE_SYSTEM.md} override, or undefined when the
     *  bundled prompt is in effect. Consumed by {@link InteractiveMode} so the
     *  first-input title path and the replan refresh share one source. */
    get titleSystemPrompt(): string | undefined;
    /** Replace the title-generation system prompt override. Called by
     *  {@link InteractiveMode.refreshTitleSystemPrompt} after the session cwd
     *  changes (e.g. `/move` relocation) so the next replan refresh resolves
     *  against the destination project's override. */
    setTitleSystemPrompt(prompt: string | undefined): void;
    /** Install the host hook that receives a typed user prompt dropped before
     *  dispatch (an Esc abort or usage preflight denial raced turn setup). The
     *  prompt never reached the agent or the session file, so without this hook
     *  it would vanish; interactive mode restores it to the editor for editing. */
    setPromptDropped(handler: ((prompt: DroppedPrompt) => void) | undefined): void;
    /**
     * Abort current operation and wait for agent to become idle.
     *
     * `reason` (e.g. `USER_INTERRUPT_LABEL`) rides the agent's `AbortController`
     * and surfaces verbatim on the aborted assistant message's `errorMessage`, so
     * the transcript can distinguish a deliberate user interrupt from an opaque
     * abort. Omit it for internal/lifecycle aborts.
     */
    abort(options?: {
        goalReason?: "interrupted" | "internal";
        reason?: string;
        /** Internal `/compact` startup keeps the manual-compaction marker alive while aborting the active turn. */
        preserveCompaction?: boolean;
    }): Promise<void>;
    /**
     * Start a new session, optionally with initial messages and parent tracking.
     * Clears all messages and starts a new session.
     * Listeners are preserved and will continue receiving events.
     * @param options - Optional initial messages and parent session path
     * @returns true if completed, false if cancelled by hook
     */
    newSession(options?: NewSessionOptions): Promise<boolean>;
    /**
     * Set a display name for the current session.
     */
    setSessionName(name: string, source?: "auto" | "user", trigger?: SessionNameTrigger): Promise<boolean>;
    /**
     * Fork the current session, creating a new session file with the exact same state.
     * Copies all entries and artifacts to the new session.
     * Unlike newSession(), this preserves all messages in the agent state.
     *
     * With `entryId`, the new file instead holds only the root-to-entry path through that
     * transcript message, inclusive, plus the artifacts, and the transition runs like
     * {@link branch} (`session_before_branch`/`session_branch` hooks with reason `"fork"`,
     * agent messages rebuilt from the cut). A cut inside an assistant tool-call batch is
     * extended through the batch's recorded tool results (see {@link #resolveForkLeaf}), and
     * the hook's `entryId` is that last kept entry. An entry fork always requires an idle
     * session; `options.requireIdle` applies the same rule to the whole-session fork.
     * Either refusal throws {@link SessionBusyError} before any session state is discarded.
     * @returns true if completed, false if cancelled by hook or not persisting
     */
    fork(entryId?: string, options?: {
        requireIdle?: boolean;
    }): Promise<boolean>;
    /** Move the active session and artifacts after enforcing mode transition invariants. */
    moveSession(newCwd: string, targetSessionDir?: string): Promise<void>;
    /**
     * Set model directly.
     * Validates that a credential source is configured (synchronously, without
     * refreshing OAuth or running command-backed key programs). Active switches
     * always take effect; if the current transcript is too large for the target
     * model, the next prompt's compaction/error path owns that recovery instead
     * of leaving the session pinned to the old model.
     * @throws Error if no API key available for the model
     */
    setModel(model: Model, role?: string, options?: {
        selector?: string;
        thinkingLevel?: ThinkingLevel;
        persist?: boolean;
    }): Promise<{
        switched: boolean;
    }>;
    /** Selects a model for this session without updating persisted model settings. */
    setModelTemporary(model: Model, thinkingLevel?: ConfiguredThinkingLevel, options?: {
        ephemeral?: boolean;
    }): Promise<void>;
    /** Cycles the scoped model set, or all available models when no scope exists. */
    cycleModel(direction?: "forward" | "backward"): Promise<ModelCycleResult | undefined>;
    /** Resolves configured role models and the currently active role index. */
    getRoleModelCycle(roleOrder: readonly string[]): RoleModelCycle | undefined;
    /** Applies a resolved role model without changing global settings. */
    applyRoleModel(entry: ResolvedRoleModel): Promise<void>;
    /** Cycles the configured role models in the supplied order. */
    cycleRoleModels(roleOrder: readonly string[], direction?: "forward" | "backward"): Promise<RoleModelCycleResult | undefined>;
    /** Lists available models after applying the configured enabled-model filter. */
    getAvailableModels(): Model[];
    /** Selects the session thinking level and optionally persists it as the default. */
    setThinkingLevel(level: ConfiguredThinkingLevel | undefined, persist?: boolean): void;
    /** Advances through the thinking selectors supported by the active model. */
    cycleThinkingLevel(): ConfiguredThinkingLevel | undefined;
    /** Lists all selectable effort selectors for the active model. */
    getAvailableEffortSelectors(): ConfiguredThinkingLevel[];
    /** Reports whether `/fast` is enabled for the active model family. */
    isFastModeEnabled(): boolean;
    /** Reports whether priority service is realized by the active model. */
    isFastModeActive(): boolean;
    /** Record the Claude account lane that served this session's latest Anthropic request. */
    noteAnthropicSlowModeLane(lane: string): void;
    /**
     * Slow-mode lane of the Claude account this session last used, or
     * undefined before its first Anthropic subscription request.
     */
    getAnthropicSlowModeLane(): AnthropicSlowModeController | undefined;
    /**
     * Status-line label for the Claude account's usage-limit stage, e.g.
     * `limit reached · wrapping up · resets 14:30` or (with `/slow on`)
     * `low priority until 14:30 · 62% left`; undefined outside both stages or
     * off an Anthropic model.
     */
    getAnthropicSlowModeLabel(): string | undefined;
    /** Sets or clears one model family's live service tier. */
    setServiceTierFamily(family: ServiceTierFamily, tier: ServiceTier | undefined): void;
    /** Enables or disables priority service for the active model family. */
    setFastMode(enabled: boolean): boolean;
    /** Toggles priority service for the active model family. */
    toggleFastMode(): boolean;
    /** Reports whether `/fast ultra` (the OpenAI `ultrafast` tier) is selected for the active model. */
    isUltrafastModeEnabled(): boolean;
    /** Enables or disables the OpenAI `ultrafast` tier; `false` when the active model does not offer it. */
    setUltrafastMode(enabled: boolean): boolean;
    /** Reports whether `/slow` is on for the active model. */
    isSlowModeEnabled(): boolean;
    /**
     * `/slow on|off` for the active model. OpenAI/Google: sets or clears this
     * session's `flex` tier. Anthropic: sets `providers.anthropic.slowMode` to
     * `auto`/`off`; on also enters an already-offered (or user-stopped) slow
     * window right away, off stops the active one. Returns false when the model
     * has no slow mode.
     */
    setSlowMode(enabled: boolean): boolean;
    /** Flips the `skillful` setting for this session only. See {@link setSkillful}. */
    toggleSkillful(): Promise<boolean>;
    /**
     * Sets the `skillful` setting for this session only (never persisted).
     * Returns the new value.
     *
     * With an empty transcript the rebuilt system prompt simply carries or
     * drops the `<skills>` listing. Mid-session the provider-visible prompt
     * stays byte-stable: disabling is a no-op until the next session, and
     * enabling appends a single hidden notice carrying the listing so the
     * model learns the skills without a prompt-prefix rewrite.
     */
    setSkillful(enabled: boolean): Promise<boolean>;
    /** Lists thinking levels supported by the active model. */
    getAvailableThinkingLevels(): ReadonlyArray<Effort>;
    /**
     * Set steering mode. Persists to global config by default; pass
     * `persist: false` for a session-only change (RPC) that leaves Settings —
     * and therefore later sessions and subagents — untouched.
     */
    setSteeringMode(mode: "all" | "one-at-a-time", persist?: boolean): void;
    /**
     * Set follow-up mode. Persists to global config by default; pass
     * `persist: false` for a session-only change (RPC) that leaves Settings —
     * and therefore later sessions and subagents — untouched.
     */
    setFollowUpMode(mode: "all" | "one-at-a-time", persist?: boolean): void;
    /**
     * Set interrupt mode. Persists to global config by default; pass
     * `persist: false` for a session-only change (RPC) that leaves Settings —
     * and therefore later sessions and subagents — untouched.
     */
    setInterruptMode(mode: "immediate" | "wait", persist?: boolean): void;
    /**
     * Cancel in-progress branch summarization.
     */
    abortBranchSummary(): void;
    /**
     * Cancel in-progress handoff generation.
     */
    abortHandoff(): void;
    /**
     * Check if handoff generation is in progress.
     */
    get isGeneratingHandoff(): boolean;
    /**
     * Generate a handoff document with a oneshot LLM call and commit it as a
     * compaction entry on the current session (the document becomes the summary;
     * recent history is kept).
     *
     * @param customInstructions Optional focus for the handoff document
     * @param options Handoff execution options
     * @returns The handoff document text, or undefined if cancelled/failed
     */
    handoff(customInstructions?: string, options?: SessionHandoffOptions): Promise<HandoffResult | undefined>;
    /** Cancel an in-progress retry. */
    abortRetry(): void;
    /** Whether auto-retry is currently in progress. */
    get isRetrying(): boolean;
    /** Whether auto-retry is enabled. */
    get autoRetryEnabled(): boolean;
    /** Toggle the auto-retry setting. `persist` saves it to global config; the default applies a session-scoped override. */
    setAutoRetryEnabled(enabled: boolean, persist?: boolean): void;
    /** Whether the last turn ended aborted/failed on a tool call, so {@link retry} would re-attempt it. */
    get hasAbortedToolCallTail(): boolean;
    /** Retry the last failed assistant turn when the session is idle. */
    retry(): Promise<boolean>;
    /**
     * Execute a bash command and retain the session/branch that owned its start.
     * @param command The bash command to execute
     * @param onChunk Optional streaming callback for output
     * @param options.excludeFromContext If true, command output won't be sent to LLM (!! prefix)
     * @param options.useUserShell If true, allow caller to request configured user-shell routing
     */
    executeBash(command: string, onChunk?: (chunk: string) => void, options?: {
        excludeFromContext?: boolean;
        useUserShell?: boolean;
        pty?: BashPtyOptions;
    }): Promise<BashResult>;
    /** Record a bash result supplied outside executeBash in the current ownership scope. */
    recordBashResult(command: string, result: BashResult, options?: {
        excludeFromContext?: boolean;
    }): void;
    /** Cancel running bash commands. */
    abortBash(): void;
    /** Whether a bash command is currently running */
    get isBashRunning(): boolean;
    /** Whether there are pending bash messages waiting to be flushed */
    get hasPendingBashMessages(): boolean;
    /**
     * Execute Python code in the shared kernel.
     * Uses the same kernel session as eval's Python backend, allowing collaborative editing.
     * @param code The Python code to execute
     * @param onChunk Optional streaming callback for output
     * @param options.excludeFromContext If true, execution won't be sent to LLM ($$ prefix)
     */
    executePython(code: string, onChunk?: (chunk: string) => void, options?: {
        excludeFromContext?: boolean;
    }): Promise<PythonResult>;
    assertEvalExecutionAllowed(): void;
    /**
     * Track Python work started outside AgentSession.executePython so dispose can await and abort it too.
     */
    trackEvalExecution<T>(execution: Promise<T>, abortController: AbortController): Promise<T>;
    /**
     * Record a Python execution result in session history.
     */
    recordPythonResult(code: string, result: PythonResult, options?: {
        excludeFromContext?: boolean;
    }): void;
    /**
     * Cancel running Python execution.
     */
    abortEval(): void;
    /** Whether a Python execution is currently running */
    get isEvalRunning(): boolean;
    /** Whether there are pending Python messages waiting to be flushed */
    get hasPendingPythonMessages(): boolean;
    /**
     * Flush pending Python messages to agent state and session.
     */
    /** Surfaces and consumes pending IRC records before automatic injection. */
    drainPendingIrcInboxMessages(agentId: string, opts?: {
        from?: string;
        limit?: number;
    }): IrcMessage[];
    /** Delivers an IRC message into this recipient session. */
    deliverIrcMessage(msg: IrcMessage): Promise<"injected" | "woken">;
    /** Waits for any in-flight IRC wake-turn relays. */
    waitForIrcReplies(): Promise<void>;
    /** Registers an in-flight IRC wake-turn relay. */
    trackIrcReply(pending: Promise<void>): void;
    /** Installs task-executor monitoring around autonomous IRC wake turns. */
    setIrcWakeTurnObserver(observer: ((records: AgentMessage[]) => ((error?: unknown) => void | Promise<void>) | undefined) | undefined): void;
    /** Emits an IRC relay observation for UI rendering without persisting it. */
    emitIrcRelayObservation(record: CustomMessage): void;
    /**
     * Run a single ephemeral side-channel turn against this session's current
     * model + system prompt + history. The main turn's tool catalog is sent
     * to preserve the prompt cache unless `tools: false` is requested. The
     * model is reminded not to call tools and any tool calls are discarded. The side request
     * does not block on, or interfere with, any in-flight main turn. The
     * session's history and persisted state are NOT modified by this call.
     *
     * Used by `BtwController` (`/btw`) and `OmfgController` (`/omfg`) to share
     * the snapshot + stream pipeline. The snapshot includes any in-flight
     * streaming assistant text so the model sees the half-finished response
     * rather than missing context.
     */
    runEphemeralTurn(args: EphemeralTurnOptions): Promise<EphemeralTurnResult>;
    /**
     * Reload the current session from disk.
     *
     * Intended for extension commands and headless modes to re-read the current session
     * file and re-emit session_switch hooks.
     */
    reload(): Promise<void>;
    /**
     * Switch to a different session file.
     * Aborts current operation, loads messages, restores model/thinking.
     * Listeners are preserved and will continue receiving events.
     * @returns true if switch completed, false if cancelled by hook or cwd change
     */
    switchSession(sessionPath: string, options?: {
        onCwdChange?: (newCwd: string, previousCwd: string) => Promise<boolean>;
        /** Collab snapshot adoption keeps the guest's process cwd and marks the replica runtime-only. */
        preserveLocalCwd?: boolean;
    }): Promise<boolean>;
    /**
     * Create a branch from a specific entry.
     * Emits before_branch/branch session events to hooks.
     *
     * @param entryId ID of the entry to branch from
     * @returns Object with:
     *   - selectedText: The text of the selected user message (for editor pre-fill)
     *   - selectedImages: Image attachments of the selected user message (for editor draft restore)
     *   - cancelled: True if a hook cancelled the branch
     */
    branch(entryId: string): Promise<{
        selectedText: string;
        selectedImages: ImageContent[];
        cancelled: boolean;
    }>;
    /** Promotes a completed /btw answer from the explicitly authorized session and leaf. */
    branchFromBtw(question: string, assistantMessage: AssistantMessage, leafId: string, sessionId: string): Promise<{
        cancelled: boolean;
        sessionFile: string | undefined;
    }>;
    /**
     * Navigate to a different node in the session tree.
     * Unlike branch() which creates a new session file, this stays in the same file.
     *
     * @param targetId The entry ID to navigate to
     * @param options.summarize Whether user wants to summarize abandoned branch
     * @param options.customInstructions Custom instructions for summarizer
     * @returns Result with editorText/editorImages (if user message) and cancelled status
     */
    navigateTree(targetId: string, options?: {
        summarize?: boolean;
        customInstructions?: string;
        /**
         * Opts into the two-phase `ask` toolResult re-answer protocol
         * (issue #5642): set only by the interactive `/tree` selector, which
         * knows how to re-open the picker on `reopenAsk` and complete the
         * navigation with `reanswerAskResult`. Every other public caller
         * (extensions, hooks, ACP, session-extension actions) leaves this
         * unset and gets the pre-#5642 plain leaf move onto `ask`
         * toolResults instead — they have no picker to re-open and would
         * otherwise report a successful no-op navigation (roboomp review on
         * #5895).
         */
        allowAskReopen?: boolean;
        /**
         * Completes an in-progress `ask` re-answer (issue #5642): the caller
         * already received `reopenAsk` from a prior call on the same
         * `targetId`, re-opened the picker, and is handing back the fresh
         * answer. Branches a new toolResult sibling instead of landing on
         * the original one.
         */
        reanswerAskResult?: AgentToolResult<AskToolDetails>;
    }): Promise<{
        editorText?: string;
        /** Image attachments of the target user message, parallel to the positional `[Image #N]` markers in {@link editorText}. */
        editorImages?: ImageContent[];
        cancelled: boolean;
        aborted?: boolean;
        summaryEntry?: BranchSummaryEntry;
        /** Raw session context built during navigation — pass to renderInitialMessages to skip a second O(N) walk. */
        sessionContext?: SessionContext;
        /**
         * Set when `targetId` is an `ask` toolResult, `options.allowAskReopen`
         * was set, and `options.reanswerAskResult` was not supplied: nothing was
         * mutated. The caller must re-open the ask picker with these
         * `questions`, then call `navigateTree(targetId, { ...options,
         * reanswerAskResult })` with the produced result to actually branch
         * (issue #5642).
         */
        reopenAsk?: {
            toolCallId: string;
            questions: AskToolInput["questions"];
        };
        /**
         * `true` when this call committed a new sibling answer for an `ask`
         * re-answer (`reanswerAskResult` was applied). The interactive caller
         * resumes the agent via {@link resumeAfterAskReanswer} *after* rebuilding
         * its transcript, so the resumed turn never renders against the stale
         * pre-rebuild UI (issue #6483).
         */
        askReanswerCommitted?: boolean;
    }>;
    /**
     * Resume the agent after the interactive `/tree` caller has committed an
     * `ask` re-answer (`navigateTree` returned `askReanswerCommitted`) and
     * rebuilt its transcript. Mirrors how a live `ask` completion drives a
     * follow-up turn, but is deferred to the caller so the resumed turn renders
     * against the rebuilt UI rather than the stale pre-navigation transcript
     * (issue #6483). The scheduled continue honors the same disposed/compacting
     * guards as every other post-prompt continuation.
     */
    resumeAfterAskReanswer(): void;
    /**
     * Build a standalone `AgentToolContext` for running `AskTool.execute()`
     * outside a normal agent turn, for `/tree` `ask` re-answer (issue #5642).
     * `SelectorController` has no reachable `ToolContextStore` (that store is
     * built inside `sdk.ts` and never threaded through to mode controllers),
     * so this mirrors `refreshMCPTools()`'s `getCustomToolContext` factory
     * with real session state instead of a `{ ... } as unknown as
     * AgentToolContext` cast that could silently compile with an incomplete
     * context (roboomp review on #5895) — every `CustomToolContext` field is
     * backed by live session state, so a future required field fails to
     * compile here instead of surfacing as `undefined` at runtime.
     */
    buildAskReanswerContext(uiContext: ExtensionUIContext): AgentToolContext;
    /**
     * Get all user messages from session for branch selector.
     */
    getUserMessagesForBranching(): Array<{
        entryId: string;
        text: string;
    }>;
    /**
     * Get session statistics.
     */
    getSessionStats(): SessionStats;
    /**
     * Get current context usage statistics.
     * Uses the last assistant message's usage data when available,
     * otherwise estimates tokens for all messages.
     */
    getContextBreakdown(options?: {
        contextWindow?: number;
        pendingMessages?: AgentMessage[];
    }): ContextUsageBreakdown | undefined;
    getContextUsage(options?: {
        contextWindow?: number;
    }): ContextUsage | undefined;
    /**
     * Monotonic counter that changes whenever the in-flight pending context
     * snapshot is set or cleared. Status-line context memoization keys on this so
     * a value computed mid-turn cannot persist after the turn ends/aborts.
     */
    get contextUsageRevision(): number;
    fetchUsageReports(signal?: AbortSignal): Promise<UsageReport[] | null>;
    /** Models whose live `/usage` reports map to a quantitative provider scope. */
    getUsageReportingModelSelectors(reports: readonly UsageReport[]): string[];
    /** List stored OAuth accounts for the current model provider and mark this session's active account. */
    listCurrentProviderOAuthAccounts(): Promise<SessionOAuthAccountList | undefined>;
    /**
     * Pin a stored OAuth account to the current model provider for this session.
     * Returns false while streaming or when the credential is no longer available.
     */
    pinCurrentProviderOAuthAccount(credentialId: number): boolean;
    /**
     * Redeem one provider-selected saved rate-limit reset for an exact stored
     * credential. Never throws for business outcomes — inspect `code`.
     */
    redeemResetCredit(target: ResetCreditTarget, signal?: AbortSignal): Promise<ResetCreditRedeemOutcome>;
    /**
     * List live saved-reset eligibility. An explicit provider lists only that
     * provider; the public default aggregates Codex and Claude independently.
     */
    listResetCredits(signal?: AbortSignal, provider?: string): Promise<ResetCreditAccountStatus[]>;
    /**
     * Export session to HTML.
     * @param outputPath Optional output path
     * @param useUserThemes Bundle the dark and light TUI themes selected in settings
     */
    exportToHtml(outputPath?: string, useUserThemes?: boolean): Promise<string>;
    /**
     * Get text content of last assistant message.
     * Consumed by the `/copy` command and by the yield tool's empty-last-turn
     * guard (a data-less `useLastTurn` finalize is rejected when this is
     * undefined, so a thinking-only turn cannot become a null-data run failure).
     * @returns Trimmed text content, or undefined if no assistant message has text
     */
    getLastAssistantText(): string | undefined;
    hasCopyCandidateAssistantMessage(): boolean;
    /**
     * Get text content of the most recent visible handoff message.
     * Sessions created by older versions injected the handoff document as a
     * custom message at the top of a fresh session; callers that copy the
     * "last" message use this as a fallback while no assistant response exists.
     */
    getLastVisibleHandoffText(): string | undefined;
    /**
     * Format the entire session as plain text for clipboard export: system
     * prompt, model/thinking config, tool inventory, and the full transcript
     * rendered with markdown role headings (`## User`, `## Assistant`,
     * `### Tool Call`/`### Tool Result`).
     */
    formatSessionAsText(): string;
    /**
     * Write `/dump all` to an auto-named zip in `os.tmpdir()`: `session.md` (the
     * {@link formatSessionAsText} transcript), `llm-request.json` (the
     * {@link dumpLlmRequestToTmpDir} payload), and one `subagents/<path>.md` per
     * persisted subagent transcript stored next to the session file, nested
     * subagents included. Subagents with no messages are skipped. A subagent
     * discovery failure still writes the main dump and is reported in
     * `subagentError`.
     *
     * The archive persists on disk and may contain raw context/secrets.
     *
     * @returns the archive path and member names, or `undefined` when the main
     * session has no messages.
     */
    dumpSessionArchiveToTmpDir(): Promise<SessionDumpArchive | undefined>;
    /**
     * Dump the current session's LLM-facing request context as JSON to a
     * auto-named file in `os.tmpdir()`. This is the synchronous
     * `convertToLlm`-boundary snapshot — system prompt, tools (wire schemas),
     * thinking/service tier, and converted messages — with no network round-trip
     * and no arming flag, so advisor/side requests cannot intercept it.
     *
     * The file persists on disk and may contain the same raw context/secrets
     * as `/dump`; treat the path accordingly.
     *
     * @returns the written file path, or `undefined` when there are no messages.
     */
    dumpLlmRequestToTmpDir(): Promise<string | undefined>;
    /**
     * Enable or disable the advisor for this session. The setting is overridden for the session,
     * and the runtime is started or stopped to match.
     *
     * @returns true when the advisor is actively running after the call.
     */
    setAdvisorEnabled(enabled: boolean): boolean;
    /**
     * Run the retry.fallbackChains validation a `deferRetryFallbackValidation`
     * session skipped at construction. Validation composes the catalog slice of
     * every provider a chain names, so interactive startup runs it after the
     * first frame; the header picks the warnings up via `config_warnings_changed`.
     */
    validateRetryFallbackChains(): void;
    /**
     * Toggle the advisor setting and start/stop the runtime accordingly.
     *
     * @returns true when the advisor is actively running after the call.
     */
    toggleAdvisorEnabled(): boolean;
    /**
     * Replace the live advisor roster from an edited `WATCHDOG.yml` (the `/advisor
     * configure` save path). Swaps the configs + shared baseline, then rebuilds the
     * runtimes in place so the change applies without a restart. When the advisor is
     * disabled the new configs are simply stored for the next enable.
     *
     * @returns the number of advisors active after the rebuild.
     */
    applyAdvisorConfigs(advisors: AdvisorConfig[], sharedInstructions: string | undefined, sharedMaxNotesPerUpdate?: number): number;
    /**
     * Refresh the project context prompt advisor sessions run against after
     * context files change on `/reload-plugins`. Rebuilds live advisor runtimes so
     * they stop evaluating turns against stale `AGENTS.md` instructions.
     */
    setAdvisorContextPrompt(contextPrompt: string | undefined): void;
    /**
     * Refresh the memory backend instructions advisor sessions run against.
     * Store-only: live advisors pick the new value up at their next runtime
     * build (compaction, reset, toggle) — see `SessionAdvisors#setMemoryPrompt`.
     */
    setAdvisorMemoryPrompt(memoryPrompt: string | undefined): void;
    /**
     * Whether the advisor setting is enabled for this session.
     */
    isAdvisorEnabled(): boolean;
    /**
     * Whether a live advisor agent is attached to this session. True only when
     * `advisor.enabled` is set for this session (subagents opt in per agent via
     * frontmatter `advisor` / `task.agentAdvisor`) AND a model resolved for the
     * `advisor` role — i.e. the actual runtime exists, not merely the setting.
     * Drives the status-line badge and `/dump advisor`.
     */
    isAdvisorActive(): boolean;
    /**
     * The names of the tools available to advisors this session (the pool a
     * `/advisor configure` editor lists). The advisor is a full agent, so this is the
     * full built tool set; a tool whose optional factory returns null (e.g. lsp with
     * no servers) is absent.
     */
    getAdvisorAvailableToolNames(): string[];
    /**
     * The live advisor `Agent`, or `undefined` when no advisor runtime is
     * attached. Surfaced for diagnostics (`/dump advisor` already serializes
     * its transcript via {@link formatAdvisorHistoryAsText}) and so callers can
     * verify the advisor inherits the session's provider-shaping options
     * (`streamFn`, `promptCacheKey`, `providerSessionState`, ...).
     */
    getAdvisorAgent(): Agent | undefined;
    /** WATCHDOG.yml problems from startup discovery; shown by the UI once it is ready. */
    getAdvisorConfigWarnings(): readonly string[];
    /**
     * Lightweight advisor status for the status line: returns just the configured
     * flag and per-advisor name/status without computing token/cost breakdowns.
     * Avoids re-tokenizing the advisor transcript on every render frame.
     */
    getAdvisorStatusOverview(): {
        configured: boolean;
        advisors: AdvisorStatusOverviewEntry[];
    };
    /** Return cumulative cost recorded for the current session's advisor activity. */
    getAdvisorCost(): number;
    /**
     * Begin backfilling advisor spend recorded before this resume, off the
     * critical path. A large transcript would otherwise block startup while
     * the file is streamed; the status-line total hydrates once the scan
     * settles.
     */
    beginInitialAdvisorCostRestore(): void;
    /** Resolves once {@link beginInitialAdvisorCostRestore}'s scan has settled. */
    get advisorCostRestore(): Promise<void>;
    /**
     * Restore persisted advisor spend plus the process-local delta billed after
     * `costsAtSnapshot`. The recorder barrier fixes every transcript's byte length
     * after capturing that baseline, so a turn completed while the scan runs is added
     * exactly once.
     */
    restoreInitialAdvisorCosts(costs: ReadonlyMap<string, number>, costsAtSnapshot?: ReadonlyMap<string, number>, providersBySlug?: ReadonlyMap<string, ReadonlySet<string>>): void;
    /** Return whether any active or configured advisor is running on an OAuth/subscription model. */
    isAdvisorUsingSubscription(): boolean;
    /**
     * Return structured advisor stats for the status command and TUI panel.
     */
    getAdvisorStats(): AdvisorStats;
    /**
     * Format a concise advisor status line for ACP/text output.
     */
    formatAdvisorStatus(): string;
    /**
     * Format the advisor agent's own transcript (its system prompt, config,
     * tools, and the markdown deltas it received plus its thinking/advise/read
     * calls) as plain text — the advisor-side equivalent of
     * {@link formatSessionAsText}. Returns null when no advisor is active.
     */
    formatAdvisorHistoryAsText(options?: {
        compact?: boolean;
    }): string | null;
    /**
     * Check if extensions have handlers for a specific event type.
     */
    hasExtensionHandlers(eventType: string): boolean;
    /**
     * Get the extension runner (for setting UI context and error handlers).
     */
    get extensionRunner(): ExtensionRunner | undefined;
    /**
     * Consume any pending Anthropic fallback credit handle for the next retry turn.
     */
    consumeActiveFallbackCreditRedemption(targetModel?: Model): AnthropicFallbackCreditHandle | undefined;
}
