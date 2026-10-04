import type { Agent, AgentMessage } from "@oh-my-pi/pi-agent-core";
import { type IrcMessage } from "@oh-my-pi/pi-tui-zh/tools/irc";
import type { AgentSessionEvent } from "./agent-session-events.js";
import type { CustomMessage } from "./messages.js";
import type { SessionManager } from "./session-manager.js";
/** Capabilities the IRC bridge borrows from its owning session. */
export interface IrcBridgeHost {
    agent: Agent;
    sessionManager: SessionManager;
    isDisposed(): boolean;
    isStreaming(): boolean;
    planModeEnabled(): boolean;
    emitSessionEvent(event: AgentSessionEvent): Promise<void>;
    wakeForIrc(records: AgentMessage[]): void;
}
/** Owns incoming IRC queues and the session's non-interrupting aside queue. */
export declare class IrcBridge {
    #private;
    constructor(host: IrcBridgeHost);
    /** Whether an incoming peer message can interrupt a wait. */
    hasInterrupts(): boolean;
    /** Whether any undelivered IRC record remains queued. */
    hasPending(): boolean;
    /** Waits until every in-flight wake-turn relay has settled. */
    waitForReplies(): Promise<void>;
    /** Registers a reply obligation that {@link waitForReplies} must outlast. */
    trackReply(pending: Promise<void>): void;
    /** Takes every queued IRC record in interrupt-before-aside order. */
    drainPending(): AgentMessage[];
    /** Snapshots and discards every queued IRC record — used when a session-boundary transition
     *  (new/switch) begins, since an aborted turn skips its final aside poll and would otherwise
     *  leak the outgoing transcript's extension/peer content into the next session via the first
     *  ordinary prompt's `flushPending()`. Deferred wakes ride along: without them a later
     *  contract clear could wake the new transcript with a peer message belonging to the
     *  previous session. Pass the snapshot to `restorePending` to undo the clear
     *  if the transition is rolled back. */
    clearPending(): {
        interrupts: AgentMessage[];
        asides: AgentMessage[];
        deferredWakes: AgentMessage[];
    };
    /** Restores a snapshot taken by `clearPending`, for a rolled-back session transition. Merges
     *  ahead of whatever queued in the meantime (e.g. an in-flight IRC auto-reply appending while
     *  the rolled-back switch's async load/hooks were still running) instead of overwriting it, so
     *  those newly arrived records aren't silently discarded — snapshot records precede them since
     *  they arrived first. */
    restorePending(snapshot: {
        interrupts: AgentMessage[];
        asides: AgentMessage[];
        deferredWakes: AgentMessage[];
    }): void;
    /** Queues records for the next step-boundary aside injection: IRC wakes deferred by a
     *  session transition, and extension `deliverAs: "aside"` sends. */
    queueAside(records: AgentMessage[]): void;
    /** Parks wake-intended records while a pooled contract owns the worker. Unlike
     *  asides, these are invisible to turn injection (`flushPending`, the loop
     *  aside poll) and resume into a monitored wake once the contract clears. */
    queueDeferredWake(records: AgentMessage[]): void;
    /** Takes parked wake records for a post-clear monitored wake, oldest first. */
    drainDeferredWakes(): AgentMessage[];
    /** Surfaces and consumes queued incoming records before automatic injection. */
    drainInboxMessages(agentId: string, opts?: {
        from?: string;
        limit?: number;
    }): IrcMessage[];
    /** Delivers an IRC message into the recipient session without awaiting any wake turn. */
    deliver(msg: IrcMessage): Promise<"injected" | "woken">;
    /** Emits an IRC relay observation for rendering without persisting it. */
    emitRelayObservation(record: CustomMessage): void;
    /** Persists queued IRC records that missed their step-boundary injection. */
    flushPending(): void;
}
