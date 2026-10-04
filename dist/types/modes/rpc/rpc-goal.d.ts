/**
 * Goal mode for RPC hosts (`--mode rpc` and `--mode rpc-ui`).
 *
 * The durable lifecycle (create/resume/pause/drop, accounting, persistence) is
 * `GoalRuntime`, shared with the TUI and the `goal` tool. This controller adds
 * what `InteractiveMode` otherwise owns: the goal tool's place in the active
 * tool set, completion/drop exit, reattach after a session change, and an
 * opt-in continuation driver keyed to agent lifecycle events instead of an
 * editor idle window.
 */
import type { Goal } from "@oh-my-pi/pi-tui-zh/tools/goal";
import { type GoalModeState } from "../../goals/state.js";
import type { AgentSession, AgentSessionEvent } from "../../session/agent-session.js";
/** `goal.continuationModes` value that enables automatic continuation for RPC hosts. */
export declare const RPC_GOAL_CONTINUATION_MODE = "rpc";
export type RpcGoalOp = "get" | "create" | "resume" | "pause" | "drop";
export interface RpcGoalCommand {
    op: RpcGoalOp;
    objective?: string;
    token_budget?: number;
}
export interface RpcGoalResult {
    goal: Goal | null;
    state: GoalModeState | null;
}
export type RpcGoalSession = Pick<AgentSession, "settings" | "sessionManager" | "goalRuntime" | "getGoalModeState" | "setGoalModeState" | "getPlanModeState" | "getEnabledToolNames" | "setActiveToolsByName" | "sendGoalModeContext" | "getTodoPhases" | "promptCustomMessage" | "waitForIdle" | "isStreaming" | "isDisposed" | "isSessionTransitioning" | "hasAdmittedSubmission" | "queuedMessageCount">;
export declare class RpcGoalController {
    #private;
    /**
     * @param onContinuationDropped called when a pending continuation is abandoned
     *   (a gate closed while it waited), so settle reporting can re-check.
     */
    constructor(session: RpcGoalSession, onContinuationDropped?: () => void);
    /**
     * True while a goal continuation has been decided but not yet admitted. Hosts and
     * quiescence checks must treat the session as busy during this window.
     */
    get continuationPending(): boolean;
    /**
     * The host interrupted the session (`abort`). Stop automatic continuation until
     * the host acts again. Called before the abort starts, so the aborted run's own
     * `agent_end` cannot schedule another goal turn. The runtime separately pauses the
     * interrupted goal, so in practice only `goal resume`/`create` restarts it.
     */
    stopForHostAbort(): void;
    /**
     * Resolves once queued goal exits and reconciles (including ones queued while
     * waiting) have run. Host commands and reads wait for it so they never act on
     * the previous transcript's goal. Not for use inside extension notifications.
     */
    settled(): Promise<void>;
    /**
     * Call before any session change or tree navigation (RPC command or extension
     * action). Waits for a pending goal exit so it cannot land in the next session,
     * voids a waiting continuation, and holds new goal turns until
     * {@link endSessionChange}.
     */
    beginSessionChange(): Promise<void>;
    /**
     * Call after the change resolves, is cancelled, or throws. Only a change that
     * actually switched the transcript adopts the target session's goal; an active
     * goal stays active across it, as in the TUI. A cancelled or no-op change (same
     * session, for example tree navigation or reopening the open session) leaves the
     * running goal untouched and resumes continuation.
     *
     * `detachedRun`: the change stopped the running agent (new, switch, reload). A
     * detached continuation turn never reaches its terminal `agent_end`, so it no
     * longer counts as pending. Never throws; settlement is re-checked afterwards.
     */
    endSessionChange(options?: {
        detachedRun?: boolean;
    }): Promise<void>;
    handle(command: RpcGoalCommand): Promise<RpcGoalResult>;
    /**
     * Leave the previous session's goal behind and restore a goal journaled in the
     * current session (startup, new/switch/branch/open), mirroring the TUI's reattach.
     * `preserveActiveGoal` keeps an active goal active (in-process session changes);
     * without it an active goal is paused (startup, a resumed process).
     * Queued behind any reconcile already running; resolves when this one has run.
     * Never awaited from {@link beginSessionChange}: `onThreadResumed` notifies
     * extensions, which may start another change.
     */
    reconcile(options?: {
        preserveActiveGoal?: boolean;
    }): Promise<void>;
    /**
     * Feed session events. Must run before the RPC settle watcher observes the same
     * event so a continuation is admitted before settlement is evaluated.
     */
    observe(event: AgentSessionEvent): void;
}
