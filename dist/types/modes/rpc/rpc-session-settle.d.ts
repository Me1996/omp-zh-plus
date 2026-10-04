import type { AgentSession, AgentSessionEvent } from "../../session/agent-session.js";
import type { RpcSessionSettledFrame } from "./rpc-types.js";
/** Session surface the settle predicate reads. */
export type RpcSettleSession = Pick<AgentSession, "isStreaming" | "hasAdmittedSubmission" | "queuedMessageCount" | "hasPendingAsyncWork">;
/**
 * Reports a turn the host side has decided to start but not yet admitted (for
 * example a scheduled goal continuation). Such a session is not settled.
 */
export type RpcScheduledTurnProbe = () => boolean;
/**
 * A scheduled-turn probe whose every "not settled" answer marks `watcher` active,
 * so a stretch reported busy only because of a pending host-scheduled turn still
 * ends with `session_settled` even if that turn is later abandoned.
 */
export declare function watchedScheduledTurnProbe(pending: () => boolean, watcher: () => Pick<RpcSessionSettleWatcher, "markActive"> | undefined): RpcScheduledTurnProbe;
/**
 * True when no run is live, admitted or scheduled, no steer/follow-up is queued,
 * and no background job or delivery can re-wake the session. Backs
 * `session_settled`, `prompt_result.sessionSettled`, and `get_state.isSettled`.
 */
export declare function isRpcSessionSettled(session: RpcSettleSession, scheduledTurn?: RpcScheduledTurnProbe): boolean;
/**
 * Emits `session_settled` once per stretch of agent activity, after the final
 * run yields and background work that could wake the session has drained.
 * Re-checks on every terminal `agent_end` and after session transitions.
 */
export declare class RpcSessionSettleWatcher {
    #private;
    constructor(session: RpcSettleSession & Pick<AgentSession, "settleAsyncWork">, output: (frame: RpcSessionSettledFrame) => void, scheduledTurn?: RpcScheduledTurnProbe);
    observe(event: AgentSessionEvent): void;
    /**
     * Record activity that no `agent_start` announces (for example a reported pending
     * goal turn), so the stretch it opens still ends with `session_settled`.
     */
    markActive(): void;
    /**
     * Settle the current stretch of activity if the session is quiet, waiting out
     * background work that will wake it. A live run is left alone: its own
     * terminal `agent_end` triggers the next check.
     */
    check(): Promise<void>;
}
