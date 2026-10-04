import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage } from "@oh-my-pi/pi-ai";
import type { SecretObfuscator } from "../secrets/obfuscator.js";
/**
 * Minimal slice of `Agent` the runtime drives — satisfied by pi-agent-core
 * `Agent`. `state.error` mirrors `Agent.state.error`: provider/stream failures
 * the loop catches internally never reject `prompt()`, so the runtime reads
 * this field after every prompt to detect a failed turn.
 */
export interface AdvisorAgent {
    prompt(input: string | AgentMessage[]): Promise<void>;
    abort(reason?: unknown): void;
    reset(): void;
    /**
     * Drop messages appended past `count`. Called after a failed `prompt()` so a
     * retry doesn't replay the failed user batch + synthetic assistant-error
     * turn `Agent.#runLoop` records on its internal state.
     */
    rollbackTo?(count: number): void;
    readonly state: {
        messages: AgentMessage[];
        error?: string;
    };
}
export interface AdvisorRuntimeHost {
    /** Live primary transcript (use `agent.state.messages`). */
    snapshotMessages(): AgentMessage[];
    /** Redact primary transcript bytes before they reach the advisor model. */
    obfuscator?: SecretObfuscator;
    /**
     * Pre-prompt context maintenance for the advisor's own append-only context.
     * Promotes the advisor model to a larger sibling when its context nears the
     * window (mirroring the primary's promote-first policy) and resolves `true`
     * when the advisor must clear its own context before sending the current
     * incremental update. The cursor stays at the current primary position: this
     * recovery path must never replay the full primary transcript.
     *
     * Takes the pending update as a message rather than a token count: sizing it
     * needs the advisor model's tokenizer, which the host owns.
     * Optional: hosts that omit it get no proactive maintenance.
     */
    maintainContext?(incoming: AgentMessage, signal: AbortSignal): Promise<boolean>;
    /**
     * Called immediately before each `agent.prompt(batch)` cycle. Lets the host
     * clear per-update advisor state and apply the in-progress delivery policy.
     * The host owns these gates because it routes `advise()` results back to the
     * primary.
     */
    beginAdvisorUpdate?(inProgress: boolean): void;
    /**
     * Called with the error of every failed advisor turn, before the retry sleep
     * or the dropped-after-3 path. Lets the host apply credential-level remedies
     * and configured model fallback that the advisor loop cannot perform itself.
     * Return `true` after switching models so the same clean batch is retried
     * immediately with a fresh failure budget. `failedMessages` contains the
     * failed prompt's appended turns before rollback. Errors thrown here are
     * logged and swallowed.
     */
    onTurnError?(error: unknown, failedMessages: readonly AgentMessage[], signal: AbortSignal): Promise<boolean | undefined> | boolean | undefined;
    /** Called after a successful advisor turn so the host can finish fallback lifecycle reporting. */
    onTurnSuccess?(): Promise<void> | void;
    /** Called when a failed batch is permanently dropped so replay-only state can be discarded. */
    onTurnAbandoned?(): void;
    /** Surface a non-recovering advisor failure to the host UI without adding model-visible context. */
    notifyFailure?(error: unknown): void;
    /** Signal that the advisor paused on a quota/rate-limit after host-level
     *  recovery (credential switch, fallback chain) declined. Cleared only by
     *  an explicit reset (`/new`, config rebuild, session restart). */
    notifyQuotaExhausted?(): void;
    /** Stable identity for the live advisor model. Used to restore full transcript rendering after a model switch. */
    getModelIdentity?(): string;
    /** Called once the runtime finishes draining its review backlog (or
     *  hard-stops), so the host can repaint UI that reflects whether the
     *  advisor is still going to comment on the current yield. */
    notifyIdle?(): void;
}
/** Signals that an advisor response was discarded before it could become model-visible context. */
export declare class AdvisorOutputQuarantinedError extends Error {
    constructor(message: string);
}
/**
 * Replaces an advisor assistant turn that generated output-only destructive
 * directives with a sanitized error before dispatch.
 *
 * The agent loop records assistant turns before dispatching tools. Without this
 * pre-dispatch rewrite, a hazardous advisor turn would stay in the advisor
 * transcript as model-visible context. Calls to tools the advisor was not
 * granted are not a quarantine matter: the loop answers them with a
 * self-correcting `Tool <name> not found` result.
 */
export declare function quarantineAdvisorUnsafeOutput(message: AssistantMessage, sourceText?: string): string | undefined;
/**
 * Builds the provenance text used to decide whether hazardous advisor output was
 * generated by the advisor or came from model-visible primary/tool context.
 */
export declare function buildAdvisorQuarantineSourceText(currentInput: string, messages: readonly AgentMessage[]): string;
interface PendingDelta {
    text: string;
    rawMessages: AgentMessage[];
    renderRevision: number;
    turns: number;
    /** Whether the primary was mid-turn (willContinue:true) when this delta was rendered. */
    wip: boolean;
    overflowRecovery?: boolean;
}
/** Updates a review cadence captured but has not sent, and the primary cursor they end at. */
export interface AdvisorHeldUpdates {
    readonly cursor: number;
    readonly deltas: readonly PendingDelta[];
}
export declare class AdvisorRuntime {
    #private;
    private readonly agent;
    private readonly host;
    private readonly retryDelayMs;
    disposed: boolean;
    constructor(agent: AdvisorAgent, host: AdvisorRuntimeHost, retryDelayMs?: number);
    get backlog(): number;
    get quotaExhausted(): boolean;
    get failureNotified(): boolean;
    /** True after the runtime hard-stopped on repeated or permanent failures. */
    get halted(): boolean;
    /**
     * True once the runtime has completed at least one review and has no queued
     * or in-flight review work left, or has hard-stopped (halted/quota-paused/
     * disposed): the advisor is not going to add any more comments until a new
     * primary turn (or an explicit reset). A fresh runtime that has never
     * reviewed anything is NOT yielded — the eye stays open until the first
     * review completes. Drives the status-line closed-eye state.
     */
    get yielded(): boolean;
    /**
     * Called after each primary turn ends. Renders the incremental delta and
     * queues it for the advisor model.
     *
     * @param messages - Live primary transcript snapshot (defaults to `snapshotMessages()`).
     * @param opts.willContinue - When `true` the primary is mid-turn (more tool-call
     *   steps will follow). The rendered heading is tagged `[in progress]` so the
     *   advisor knows to withhold critique on partial work. The flag is carried on
     *   the delta and forwarded to the reprime path so it is never silently dropped.
     * @param opts.dispatch - `false` when review cadence skips this boundary: the
     *   delta is still captured now, as the primary saw it, and held until the
     *   next dispatching boundary sends every held delta as one review.
     */
    onTurnEnd(messages?: AgentMessage[], opts?: {
        willContinue?: boolean;
        dispatch?: boolean;
    }): void;
    /**
     * Send every held delta as one review without capturing a new boundary.
     * Headless callers flush before draining, so a final yield the review
     * cadence skipped is still reviewed before disposal.
     */
    flushHeld(): void;
    /**
     * Detach captured-but-unsent updates so a replacement runtime reviews them
     * ({@link adoptHeld}); `undefined` when the cadence holds nothing.
     */
    releaseHeld(): AdvisorHeldUpdates | undefined;
    /**
     * Resume at a replaced runtime's cursor with its held updates queued ahead
     * of this runtime's next dispatch, instead of seeding past them.
     */
    adoptHeld(held: AdvisorHeldUpdates): void;
    /**
     * Wait until the advisor backlog falls below `threshold`.
     *
     * Returns `false` when the deadline, abort signal, or a runtime failure releases
     * the waiter before the requested backlog was drained. An omitted `maxMs` waits
     * without a wall-clock deadline; abort, failure, and disposal still release it.
     *
     * By default a failing advisor turn releases the waiter at once, so the primary
     * agent never parks on a broken advisor. `waitThroughRecovery` is for callers
     * that must observe the outcome of that failure — a headless shutdown drain
     * about to dispose the session: the waiter stays parked while the runtime
     * retries or the host switches to a fallback model, and is released only by
     * catch-up, the deadline, the signal, or a terminal stop (halt, quota pause,
     * reset, session transition, dispose).
     */
    waitForCatchup(maxMs: number | undefined, threshold: number, signal?: AbortSignal, options?: {
        waitThroughRecovery?: boolean;
    }): Promise<boolean>;
    dispose(): void;
    /** Stop new advisor work and wait only for the active prompt's recorder-visible events. */
    pauseForSessionTransition(): Promise<void>;
    /** Continue queued work after a session transition rolls back or preserves the conversation. */
    resumeAfterSessionTransition(): void;
    /**
     * Re-prime the advisor after a history rewrite (compaction, session
     * switch/resume, branch). Clears the advisor's own (non-persisted) context
     * and rewinds the cursor to 0 so the NEXT turn replays the full current —
     * post-compaction — transcript, giving the advisor fresh context instead of
     * leaving it blind to everything before the rewrite.
     */
    reset(reason?: string): void;
    /**
     * Seed the cursor to the current transcript length when the advisor is enabled
     * mid-session. Prevents the next turn from replaying the entire history to the
     * advisor (which would be expensive and likely stale).
     */
    seedTo(count: number): void;
    /**
     * Re-align the delivered prefix with the primary transcript after an
     * in-place rewrite the advisor's own context already covers (the primary's
     * per-turn prune). Unlike {@link reset} nothing is cleared or replayed: the
     * stored identities are refreshed, so the next delta's prefix check compares
     * against the rewritten messages instead of stale pre-rewrite fingerprints.
     *
     * Positional: delivered slot i is re-pointed at current message i when the
     * two render the same, or when current i is the same tool result elided in
     * place (`prunedAt`). Delivered `eval-state-context` messages are skipped:
     * every display-context rebuild re-appends a fresh one at the tail, so the
     * old slot moving is not a rewrite (the fresh copy is delivered as new).
     * All or nothing: if any slot fails to align, or the current transcript is
     * shorter than the delivered prefix, nothing changes and the next delta's
     * prefix check resets the advisor exactly as it would have without a rebase.
     */
    rebaseDeliveredPrefix(reason: string): void;
}
export {};
