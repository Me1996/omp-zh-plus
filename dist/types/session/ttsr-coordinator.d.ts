import { type AfterToolCallContext, type AfterToolCallResult, type Agent, type AgentEvent, type AgentTool, type AgentToolContext, type AgentToolResult, type BeforeToolCallContext, type BeforeToolCallResult } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage, Judge } from "@oh-my-pi/pi-ai";
import type { Settings } from "../config/settings.js";
import { type TtsrManager } from "../export/ttsr.js";
import type { AgentSessionEvent } from "./agent-session-events.js";
import type { SessionManager } from "./session-manager.js";
type TtsrContinueSkipReason = "aborted" | "stale-generation" | "session-unavailable" | "should-continue-false" | "post-restore-unavailable";
interface TtsrContinueOptions {
    source: string;
    delayMs?: number;
    generation?: number;
    shouldContinue?: () => boolean;
    onSkip?: (reason: TtsrContinueSkipReason) => void;
    onError?: () => void;
}
/** Capabilities the TTSR coordinator borrows from its owning session. */
export interface TtsrCoordinatorHost {
    agent: Agent;
    sessionManager: SessionManager;
    settings: Settings;
    emitSessionEvent(event: AgentSessionEvent): Promise<void>;
    schedulePostPromptTask(task: (signal: AbortSignal) => Promise<void>, options?: {
        delayMs?: number;
    }): void;
    scheduleAgentContinue(options: TtsrContinueOptions): void;
    promptGeneration(): number;
    /** Judge for `question` rules, or `undefined` while judged rules are off (`ttsr.judge`). */
    ruleJudge(): Judge | undefined;
    /** Delivers a judged-rule warning without interrupting the run. */
    deliverRuleWarning(content: string, ruleNames: string[]): Promise<void>;
    /** Changes when the session is replaced; verdicts from an older generation are dropped. */
    sessionGeneration(): number;
}
/** Coordinates TTSR stream matching, interruption, injection, and resume gates. */
export declare class TtsrCoordinator {
    #private;
    constructor(host: TtsrCoordinatorHost, manager: TtsrManager | undefined);
    /** Configured TTSR manager, when stream rules are enabled. */
    get manager(): TtsrManager | undefined;
    /** Whether a TTSR-triggered stream abort is awaiting its continuation. */
    get abortPending(): boolean;
    /** Current resume gate awaited by post-prompt recovery. */
    get resumeGate(): Promise<void> | undefined;
    /** Resets stream buffers at turn start. */
    onTurnStart(): void;
    /**
     * Resets stream buffers when an assistant message begins. The agent loop
     * turns the first provider `start` of every response into `message_start`,
     * so this is the boundary between two responses inside one turn (an aborted
     * response and its retry, or a continuation after an interruption); without
     * it, text from the earlier response would combine with the later one.
     */
    onAssistantMessageStart(): void;
    /** Advances repeat-after-gap tracking at turn end. */
    onTurnEnd(): void;
    /** Checks one streamed message update and reports whether TTSR consumed it by aborting. */
    checkMessageUpdate(event: AgentEvent): Promise<boolean>;
    /** AST parsing runs once on finalized arguments, before execution, not in
     * fire-and-forget stream listeners or on partial deltas. */
    beforeToolCall(ctx: BeforeToolCallContext): Promise<BeforeToolCallResult | undefined>;
    /** Checks finalized arguments for a tool call issued through eval or another non-loop bridge. */
    beforeBridgedToolCall(toolCallId: string, tool: AgentTool, args: unknown): Promise<{
        block?: boolean;
        reason?: string;
    } | undefined>;
    /** Settles the previous resume gate, queues any deferred injection, and starts judged-rule checks. */
    onAssistantMessageEnd(message: AssistantMessage): void;
    /**
     * Waits (bounded) for in-flight judged-rule checks. The session runs this
     * before the agent yields, so warnings about the final output join the run
     * as asides instead of reopening an idle session.
     */
    settleJudgments(): Promise<void>;
    /** Marks names persisted with a delivered TTSR injection as injected. */
    markInjectedFromDetails(details: unknown): void;
    /** Releases a queued delivery that was discarded before persistence. */
    releaseDeferredReservationFromDetails(details: unknown): void;
    /** Delivers per-tool reminders through the trusted passive-context channel. */
    afterToolCall(ctx: AfterToolCallContext): AfterToolCallResult | undefined;
    /**
     * Bridged calls (Cursor exec handlers, eval) bypass the agent loop's `afterToolCall`. When the caller
     * installed a passive-context sink the reminder goes there and the result stays untouched; without one
     * (eval-bridged calls) it is folded into the result as a leading block, the only channel left.
     */
    afterBridgedToolCall(toolCallId: string, result: AgentToolResult, context?: AgentToolContext): AgentToolResult | undefined;
    cancelBridgedToolCall(toolCallId: string): void;
    /** Resolves and clears the current resume gate. */
    resolveResume(): void;
}
export {};
