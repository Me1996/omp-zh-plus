/** Context maintenance for an active coding-agent session. */
import { type Agent, type AgentMessage, type AgentTurnEndContext, type StreamFn, type ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import { type CompactionPreparation, type CompactionResult, type ShakeConfig } from "@oh-my-pi/pi-agent-core/compaction";
import type { AssistantMessage, CodexCompactionContext, Message, Model, ProviderSessionState } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import type { ExtensionRunner } from "../extensibility/extensions/index.js";
import type { CompactOptions, ContextUsage } from "../extensibility/extensions/types.js";
import type { GoalModeState } from "../goals/state.js";
import type { MemoryBackendOperationContext } from "../memory-backend/types.js";
import { type NonMessageTokenSource } from "@oh-my-pi/pi-tui-zh/status-line/context-usage";
import type { ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { AgentSessionEvent } from "./agent-session-events.js";
import type { ContextUsageBreakdown, HandoffResult, SessionHandoffOptions } from "./agent-session-types.js";
import type { SessionContext } from "./session-context.js";
import type { SessionManager } from "./session-manager.js";
import type { ShakeMode, ShakeResult } from "./shake-types.js";
export type CompactionCheckResult = Readonly<{
    continuationScheduled: boolean;
    automaticContinuationBlocked?: boolean;
    historyRewritten?: boolean;
}>;
/** Shared no-op result for dispatcher paths that perform no maintenance. */
export declare const COMPACTION_CHECK_NONE: CompactionCheckResult;
/**
 * Consecutive `response.incomplete` (length-stop) recoveries that deliver no
 * text or tool call before recovery gives up. A model that keeps returning an
 * empty or reasoning-only `length` turn (seen with `zai/glm-4.5-flash`, #10594)
 * would otherwise retry forever, persisting a dead assistant turn on every
 * attempt. Mirrors the empty-stop / unexpected-stop retry caps in
 * {@link TurnRecovery}; any delivered turn ({@link assistantTurnDelivered})
 * resets the counter, so legitimate multi-step recoveries are never cut short.
 */
export declare const INCOMPLETE_RECOVERY_MAX_RETRIES = 3;
/** Creates one provider-scoped compaction lifecycle descriptor. */
export declare function createCodexCompactionContext(options: {
    trigger: CodexCompactionContext["trigger"];
    reason: CodexCompactionContext["reason"];
    phase: CodexCompactionContext["phase"];
}): CodexCompactionContext;
/** Capabilities borrowed from the owning AgentSession. */
export interface SessionMaintenanceHost {
    agent: Agent;
    sessionManager: SessionManager;
    settings: Settings;
    modelRegistry: ModelRegistry;
    extensionRunner: ExtensionRunner | undefined;
    sideStreamFn: StreamFn;
    providerSessionState: Map<string, ProviderSessionState>;
    /** Live `providers.openaiWebsockets` hint for provider calls. */
    preferWebsockets(): boolean | undefined;
    model(): Model | undefined;
    thinkingLevel(): ThinkingLevel | undefined;
    isDisposed(): boolean;
    isStreaming(): boolean;
    isGeneratingHandoff(): boolean;
    promptGeneration(): number;
    sessionId(): string;
    messages(): AgentMessage[];
    baseSystemPrompt(): string[];
    goalModeState(): GoalModeState | undefined;
    planReferencePath(): string;
    nonMessageTokenSource(): NonMessageTokenSource;
    hasExperimentalContextRolloverTools(): boolean;
    takeExperimentalContextRolloverRequest(context: AgentTurnEndContext | undefined): boolean;
    queueExperimentalContextNotesReminder(prompt: string): void;
    memoryBackendSession(): MemoryBackendOperationContext["session"];
    emitSessionEvent(event: AgentSessionEvent, options?: {
        detachExtensions?: boolean;
    }): Promise<void>;
    emitNotice(level: "info" | "warning" | "error", message: string, source?: string): void;
    scheduleAgentContinue(options: {
        source: string;
        delayMs?: number;
        generation?: number;
        shouldContinue?: () => boolean;
        onSkip?: (reason: "aborted" | "stale-generation" | "session-unavailable" | "should-continue-false" | "post-restore-unavailable") => void;
        onError?: () => void;
    }): void;
    scheduleCompactionContinuation(options: {
        generation: number;
        autoContinue: boolean;
        terminalTextAnswer: boolean;
        suppressContinuation: boolean;
    }): boolean;
    persistTurnMessagesForMidRunCompaction(context: AgentTurnEndContext | undefined): Promise<boolean>;
    findLastAssistantMessage(): AssistantMessage | undefined;
    disconnectFromAgent(): void;
    reconnectToAgent(): void;
    drainStrandedQueuedMessages(): void;
    buildDisplaySessionContext(): SessionContext;
    convertToLlmForSideRequest(messages: AgentMessage[]): Message[];
    obfuscateTextForProvider(text: string | undefined): string | undefined;
    obfuscatePreparationForProvider(preparation: CompactionPreparation): CompactionPreparation;
    closeCodexProviderSessionsForHistoryRewrite(): void;
    resetCodexProviderAfterCompaction(compaction: CodexCompactionContext): void;
    resetPlanReference(): void;
    syncTodoPhasesFromBranch(): void;
    resetAdvisorRuntimes(reason?: string): void;
    /** Re-aligns advisors after an in-place prune their own contexts already cover (no re-prime). */
    rebaseAdvisorPrefix(reason: string): void;
    rebaseAfterCompaction(): void;
    recordAnchoredHistoryRewrite(tokensRemoved: number): void;
    getContextBreakdown(options?: {
        contextWindow?: number;
        pendingMessages?: AgentMessage[];
    }): ContextUsageBreakdown | undefined;
    getContextUsage(options?: {
        contextWindow?: number;
    }): ContextUsage | undefined;
    shake(mode: ShakeMode, options?: {
        config?: ShakeConfig;
        signal?: AbortSignal;
    }): Promise<ShakeResult>;
    dropImages(): Promise<{
        removed: number;
    }>;
    generateHandoffDocument(customInstructions?: string, options?: SessionHandoffOptions): Promise<HandoffResult | undefined>;
    removeAssistantMessageFromActiveContext(message: AssistantMessage): void;
    dropPersistedAssistantTurn(message: AssistantMessage): Promise<string | undefined>;
    /**
     * Keep a terminal failure whose turn was dropped from history visible to
     * post-settle readers (`AgentSession.getLastAssistantMessage`) until the next run.
     */
    retainTerminalFailure(message: AssistantMessage): void;
    runRecoveryCompactionWithRollback(reason: "overflow" | "incomplete", message: AssistantMessage, options: {
        autoContinue: boolean;
        triggerContextTokens?: number;
        excludeMediaMethods?: boolean;
    }): Promise<CompactionCheckResult>;
    parseRetryAfterMsFromError(errorMessage: string): number | undefined;
    setModelTemporary(model: Model, thinkingLevel?: ConfiguredThinkingLevel, options?: {
        ephemeral?: boolean;
    }): Promise<void>;
    abort(options?: {
        goalReason?: "interrupted" | "internal";
        reason?: string;
        preserveCompaction?: boolean;
    }): Promise<void>;
    abortHandoff(): void;
}
/** Owns compaction, pruning, shake, promotion, and automatic context maintenance. */
export declare class SessionMaintenance {
    #private;
    constructor(host: SessionMaintenanceHost);
    /** Clears per-prompt recovery counters when a new user prompt starts. */
    resetForNewPrompt(): void;
    /** Whether compaction or a manual handoff is active. */
    get isCompacting(): boolean;
    /** Background speculative-compaction state, for UI indicators. */
    get speculationState(): "idle" | "running" | "armed";
    /** Completion of the current speculative pass, used to resume maintenance skipped during its handoff. */
    get speculationCompletion(): Promise<void> | undefined;
    /** Abort and discard any in-flight or armed speculative compaction. */
    cancelSpeculation(): void;
    /** Assistant timestamp whose post-turn maintenance must be skipped once. */
    get skipPostTurnMaintenanceAssistantTimestamp(): number | undefined;
    set skipPostTurnMaintenanceAssistantTimestamp(timestamp: number | undefined);
    /**
     * Strip image content blocks from every message on the current branch and
     * persist the rewrite. Walks `SessionManager.getBranch()` in place — both
     * `SessionMessageEntry.message` and `CustomMessageEntry.content` arrays
     * are mutated, then `rewriteEntries` durably commits the new shape. The
     * agent's runtime view is rebuilt from the freshly-mutated entries so any
     * provider sessions caching message identity (Codex Responses) are torn
     * down to force a clean replay on the next turn.
     *
     * No-op when the branch carries no images; returns `{ removed: 0 }` and
     * skips the disk rewrite.
     */
    dropImages(): Promise<{
        removed: number;
    }>;
    /**
     * Surgically reduce context by dropping heavy content ("shake").
     *
     * - `images` delegates to {@link dropImages}.
     * - `thinking` removes assistant reasoning blocks without replacement text.
     * - `elide` replaces whole tool-call results and large fenced/XML blocks
     *   with short placeholders that embed an `artifact://` recovery link.
     *
     * Mutates the branch in place, persists via `rewriteEntries`, replays the
     * rebuilt context through the agent, and tears down provider sessions that
     * cache message identity — same rewrite contract as {@link dropImages}.
     *
     * No-op (zero counts) when nothing is eligible.
     */
    shake(mode: ShakeMode, opts?: {
        config?: ShakeConfig;
        signal?: AbortSignal;
        requireArtifact?: boolean;
        isCurrent?: () => boolean;
        toolResultsOnly?: boolean;
    }): Promise<ShakeResult>;
    /** One-shot, artifact-backed mechanical reduction for a pre-output Responses body-read timeout. */
    shakeForRequestBodyReadTimeout(generation: number): Promise<boolean>;
    /**
     * Manually compact the session context.
     * Aborts current agent operation first.
     * @param customInstructions Optional instructions for the compaction summary
     * @param options Optional callbacks for completion/error handling
     * @param onCommitted Internal: nested fallback frames report their commit to
     * the owning frame the moment the entry lands, so a late rejection (a
     * `session_compact` hook or `onComplete` throwing after the append) still
     * resumes the interrupted turn exactly as the direct path does.
     */
    compact(customInstructions?: string, options?: CompactOptions, methodOffset?: number, retryController?: AbortController, onCommitted?: () => void): Promise<CompactionResult>;
    /**
     * Cancel in-progress context maintenance and return the active manual pass's
     * cleanup barrier. The barrier resolves only after its agent subscription reconnects.
     */
    abortCompaction(reason?: unknown): Promise<void> | undefined;
    /**
     * Park a prompt until manual compaction reconnects the agent or manual handoff
     * finishes committing its history. A parked prompt supersedes the interrupted
     * turn's synthetic resume after compaction; local commands and failed dispatches
     * release that claim so the interrupted turn is not stranded.
     *
     * Returns `undefined` when neither maintenance pass nor a resume decision is
     * open. Otherwise the caller MUST invoke the returned `release` after dispatch.
     */
    waitForManualMaintenanceCleanup(): Promise<((startedTurn: boolean) => void) | undefined>;
    /**
     * Register a dispatch that may start a turn while an interrupted-turn resume
     * decision is open (a prompt parked by {@link waitForManualMaintenanceCleanup}
     * has not released yet). `undefined` when no decision is open.
     *
     * The caller MUST invoke the returned `release` once the dispatch settles.
     * `startedTurn: true` (dispatched or queued) drops the deferred resume for
     * good; `false` (an extension/custom command handled locally, a pre-dispatch
     * throw) hands it back so the interrupted work is not stranded, once no other
     * participant can still claim the session.
     */
    claimPendingResume(): ((startedTurn: boolean) => void) | undefined;
    /**
     * A turn started, by whatever path (a released prompt, an extension's
     * `sendMessage({ triggerTurn })`, the queued-message drain). It owns the
     * session now, so a resume still withheld for a parked prompt is moot.
     */
    noteTurnStarted(): void;
    /** Cancel only automatic maintenance while preserving a manual compaction. */
    abortAutomaticCompaction(): void;
    /** Trigger idle compaction through the auto-compaction flow (with UI events). */
    runIdleCompaction(): Promise<void>;
    /**
     * Manual handoff: generate a handoff document and commit it as a compaction
     * entry on the current session — the document becomes the summary and recent
     * history is kept per `compaction.keepRecentTokens`. Unlike `/compact`, the
     * live agent is not aborted; generation reads a snapshot of the live
     * messages through the cache-friendly side-request pipeline. Prompts wait
     * until the commit or failure completes.
     */
    handoff(customInstructions?: string, options?: SessionHandoffOptions): Promise<HandoffResult | undefined>;
    /**
     * Start a background speculative compaction when context has entered the
     * pre-threshold band `[threshold − lead, threshold)`. The produced summary
     * is held (armed) and committed instantly by the next real maintenance
     * pass, hiding summarization latency. Only LLM-backed methods
     * (remote/handoff/soft) are speculated — shake and snapcompact are local
     * and effectively instant. Never rewrites history itself; stale results are
     * discarded by apply-time branch validation in {@link #claimArmedSpeculation}.
     * A turn that jumps past the threshold before a run armed is handled by
     * {@link deferThresholdCompactionToSpeculation}'s grace band instead.
     */
    maybeStartSpeculativeCompaction(contextTokens: number, contextWindow: number): void;
    /**
     * Grace band above the compaction threshold: when a single turn jumps past
     * the threshold before the background speculation armed (or even started),
     * the threshold pass keeps serving the user instead of blocking on a
     * synchronous summarization — the speculation finishes in the background
     * and the next maintenance boundary splices it in for free. Returns true
     * while deferral is in effect (a run was live, or one was started here);
     * the caller MUST skip its blocking compaction then.
     *
     * Deferral ends — and the blocking pass resumes — once context grows past
     * `threshold + lead`, clamped to keep {@link SPECULATION_LEAD_MIN_TOKENS}
     * of headroom below the window. A provider overflow inside the band is
     * recovered by the existing overflow path (compact + retry). Never defers
     * for local-first method orders (shake/snapcompact are instant), when
     * async compaction is disabled, or when a `session_before_compact`
     * extension must keep exact blocking semantics.
     */
    deferThresholdCompactionToSpeculation(contextTokens: number, contextWindow: number): boolean;
    runPrePromptCompactionIfNeeded(messages: AgentMessage[]): Promise<void>;
    /**
     * Compact continuing tool-loop runs before the next provider request.
     *
     * `onTurnEnd` is the safe boundary: tool results for the just-finished turn
     * are already paired in `activeMessages`, the live array the agent loop reads
     * before its next model call. Before compacting, the just-finished turn is
     * synchronously persisted if async message hooks have not reached the normal
     * append path yet.
     */
    maintainContextMidRun(activeMessages: AgentMessage[], signal: AbortSignal | undefined, context: AgentTurnEndContext | undefined): Promise<void>;
    /**
     * Check if context maintenance or promotion is needed and run it.
     * Called after agent_end and before prompt submission.
     *
     * Four cases (in order):
     * 1. Input overflow + promotion: promote to larger model, retry without maintenance.
     * 2. Input overflow + no promotion target: run context maintenance, auto-retry on same model.
     * 3. Output incomplete (stopReason === "length", e.g. `response.incomplete`): the
     *    model exhausted its output budget. Try promotion; otherwise compact and
     *    retry when the context is over threshold (the window, not the output cap,
     *    ran out), retry as-is when the turn produced nothing actionable, and
     *    keep a truncated deliverable with a warning otherwise.
     * 4. Threshold: context over threshold, run context maintenance (no auto-retry).
     *
     * @param assistantMessage The assistant message to check
     * @param skipAbortedCheck If false, include aborted messages (for pre-prompt check). Default: true
     * @param autoContinue Whether maintenance may schedule the agent-authored continuation prompt.
     * @returns whether compaction/recovery scheduled a retry, auto-continue, or
     *   queued-message drain that already owns the next turn. Callers MUST skip
     *   `session_stop` and other agent continuations when `continuationScheduled`
     *   is true.
     */
    checkCompaction(assistantMessage: AssistantMessage, skipAbortedCheck?: boolean, autoContinue?: boolean): Promise<CompactionCheckResult>;
    resolveContextPromotionTarget(currentModel: Model, contextWindow: number, signal?: AbortSignal): Promise<Model | undefined>;
    resolveCompactionModelCandidates(preferredModel: Model | null | undefined, availableModels: Model[], filter?: (model: Model) => boolean): Model[];
    /**
     * Whether the current stored context fits `model`'s usable window
     * (`contextWindow - reserve`), using the same reserve resolution as
     * compaction. This is deliberately independent of `compaction.enabled`: an
     * oversized request overflows the provider whether or not compaction would
     * have run, so a fit check must judge the raw budget.
     *
     * The default absolute reserve can exceed bundled small-context windows, or
     * nearly consume a 16k-class window; those known-impossible defaults fall
     * back to the proportional 15% reserve. Explicit valid reserves still define
     * the usable prompt budget so callers do not enter headroom the user
     * intentionally reserved.
     *
     * Used by the retry-fallback selector to skip a candidate whose window cannot
     * hold the retry context before switching onto it, and (via
     * {@link #compactionCreatedRetryFit}) to decide whether an overflow recovery
     * produced a retryable prompt. `excludedMessage` identifies a failed assistant
     * turn that will be removed before retrying; subtracting it makes the selector
     * judge the request that will actually be sent. When the window is unknown we
     * cannot evaluate the budget, so we optimistically report a fit (preserving
     * prior behavior).
     */
    contextFitsModel(model: Model, excludedMessage?: AssistantMessage): boolean;
    /**
     * Internal: Run auto-compaction with events.
     *
     * Every method, handoff included, runs to completion before this resolves,
     * so the result reports the continuation that was actually scheduled — the
     * `agent_end` settle derives `willContinue` from it.
     *
     * @returns whether auto-compaction scheduled a follow-up turn.
     */
    runAutoCompaction(reason: "overflow" | "threshold" | "idle" | "incomplete", willRetry: boolean, options?: {
        autoContinue?: boolean;
        triggerContextTokens?: number;
        /** Tokens from pending messages included in triggerContextTokens but absent from the prepared history. */
        pendingContextTokens?: number;
        /** Stored context before pending messages, measured before preparation rewrites its representation. */
        preparedContextTokens?: number;
        suppressContinuation?: boolean;
        phase?: CodexCompactionContext["phase"];
        terminalTextAnswer?: boolean;
        /** Mid-turn: splice history then return; do not await UI/extension fan-out. */
        detachPostCommit?: boolean;
        /** Index to resume from after an earlier preferred method failed. */
        methodIndex?: number;
        /** A preceding shake already rewrote history before this fallback attempt. */
        fallbackFromShake?: boolean;
        /**
         * This call services an explicit model-requested rollover
         * (`new_context`): it bypasses the Auto-Compact toggle, and never
         * falls through to ordinary summary compaction when the experimental
         * capability is no longer present at dispatch time.
         */
        explicitNewContextRequest?: boolean;
        /**
         * Skip `snapcompact` regardless of model image support — a byte/payload-
         * limit 413 recovery must not retry with an even larger, media-heavy
         * request (#11482).
         */
        excludeMediaMethods?: boolean;
    }): Promise<CompactionCheckResult>;
    /**
     * Toggle auto-compaction. When `persist` is false (the default) the change is
     * applied as a session-scoped runtime override — like `setThinkingLevel` — so
     * transient callers (e.g. the `set_auto_compaction` RPC command) configure
     * only their own session instead of mutating the machine-global `config.yml`.
     * The settings panel passes `persist: true` to save the preference durably.
     */
    setAutoCompactionEnabled(enabled: boolean, persist?: boolean): void;
    /** Whether automatic maintenance has an enabled method to run. */
    get autoCompactionEnabled(): boolean;
}
