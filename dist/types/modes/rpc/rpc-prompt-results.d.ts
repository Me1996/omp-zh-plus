import type { AgentSessionEvent } from "../../session/agent-session.js";
import { type RpcScheduledTurnProbe, type RpcSettleSession } from "./rpc-session-settle.js";
import type { RpcPromptResultFrame } from "./rpc-types.js";
/** A prompt accepted by RPC mode whose `prompt_result` is still owed; see {@link RpcPromptResults.begin}. */
export interface RpcPromptTicket {
    readonly id: string | undefined;
}
/**
 * Correlates accepted prompts with the run that carries their work and emits
 * their `prompt_result`. Fed every session event through {@link observe}.
 *
 * A prompt reports when the agent **yields** its work (`agent_end` with
 * `yielded`), not when the session is done: background jobs may still wake the
 * session later (see {@link RpcSessionSettleWatcher}), which `sessionSettled`
 * on the frame reports.
 *
 * A prompt dispatched as a fresh turn owns the first run that starts after it
 * was accepted, so a late `agent_end` from an earlier run never settles it. A
 * prompt queued into a live run (steer/follow-up) resolves while that run
 * streams and reports at the first yield after its message left the queue.
 */
export declare class RpcPromptResults {
    #private;
    /**
     * @param session read for queue state and, at report time, the `sessionSettled` predicate.
     * @param scheduledTurn reports a host-scheduled turn not yet admitted (not settled).
     */
    constructor(session: RpcSettleSession, output: (frame: RpcPromptResultFrame) => void, scheduledTurn?: RpcScheduledTurnProbe);
    /** Open a ticket before the prompt starts any work. Close it with exactly one report or {@link discard}. */
    begin(id: string | undefined): RpcPromptTicket;
    /** Drop a ticket whose command was rejected before it was accepted (no `prompt_result` is owed). */
    discard(ticket: RpcPromptTicket): void;
    /**
     * The prompt's work reached the agent (dispatched or queued). Reports now if
     * its own run already settled, otherwise at the next terminal `agent_end`.
     */
    settle(ticket: RpcPromptTicket): void;
    /** The prompt was handled locally without an agent turn. */
    completeLocal(ticket: RpcPromptTicket): void;
    /** The prompt failed before reaching the agent. */
    fail(ticket: RpcPromptTicket, message: string): void;
    /**
     * Mark every open prompt aborted after a session transition (host command or
     * extension). Transitions detach the agent before aborting it, so the
     * interrupted run never publishes a terminal `agent_end` for them.
     */
    abortOpen(): void;
    /** Track run boundaries; call after the event has been written so `prompt_result` follows its `agent_end`. */
    observe(event: AgentSessionEvent): void;
}
/**
 * Tracks extension-originated messages while an RPC prompt is executing.
 * A slash command can resolve the outer prompt as local-only while also
 * scheduling agent work through pi.sendUserMessage() or pi.sendMessage()
 * with triggerTurn; that prompt's result must wait for the agent work.
 */
export declare class RpcExtensionUserMessageTracker {
    #private;
    markAgentMessageTask(): void;
    trackAgentMessageTask(task: Promise<unknown>): void;
    watchPrompt<T>(startPrompt: () => Promise<T>): {
        prompt: Promise<T>;
        hasAgentMessageTask: () => boolean;
        waitForAgentMessageTasks: () => Promise<void>;
    };
}
/**
 * Route a started prompt's resolution into its `prompt_result`: `false` without
 * extension-scheduled agent work completes locally, agent work settles through
 * the run, and a rejection is reported via `onError` and as a failed result.
 */
export declare function reportPromptResult(input: {
    ticket: RpcPromptTicket;
    prompt: Promise<boolean>;
    results: RpcPromptResults;
    onError: (error: Error) => void;
    hasExtensionAgentMessageTask?: () => boolean;
    waitForExtensionAgentMessageTasks?: () => Promise<void>;
}): void;
/**
 * Start a prompt under extension-message tracking and report its `prompt_result`.
 *
 * `startPrompt` receives an admission callback to forward as
 * `PromptOptions.onPromptAdmitted`. The returned promise resolves once the
 * prompt is admitted, or once it settles without ever being admitted; it never
 * rejects, since a failure is already routed to `onError` and the failed
 * `prompt_result`. Await it to acknowledge the command only after admission.
 */
export declare function watchAndReportPromptResult(input: {
    ticket: RpcPromptTicket;
    startPrompt: (onPromptAdmitted: () => void) => Promise<boolean>;
    results: RpcPromptResults;
    onError: (error: Error) => void;
    extensionUserMessageTracker: RpcExtensionUserMessageTracker;
}): Promise<void>;
