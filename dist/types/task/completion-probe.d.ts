import type { Settings } from "../config/settings.js";
import type { AgentSession } from "../session/agent-session.js";
/**
 * Whether a subagent spawned by a session at `parentDepth` gets completion probes.
 * Only the interactive TUI shows the estimate, so print/RPC/ACP/SDK hosts never pay
 * for it, and only the main agent's direct subagents (`parentDepth` 0) are probed.
 * Callers: the task executor and eval workpool, when building a run monitor.
 */
export declare function isCompletionProbeEnabled(settings: Settings, parentDepth: number): boolean;
/** Inputs for {@link startCompletionProbe}. */
export interface CompletionProbeOptions {
    /** The run's current session; probing skips ticks while it is absent or idle. */
    session: () => AgentSession | null;
    /** Stops the timer and cancels an in-flight probe. */
    signal: AbortSignal;
    /** Receives each parsed estimate with the side request's cost in USD. */
    onEstimate: (percent: number, cost: number) => void;
}
/**
 * Extract a 0–100 percentage from a probe reply (`"40%"`, `"~65 %"`, `"Roughly 70%."`).
 * Returns `undefined` when the reply carries no percentage.
 */
export declare function parseCompletionPercent(reply: string): number | undefined;
/**
 * Probe the run's session on the {@link PROBE_DELAYS_MS} schedule until `signal`
 * aborts. Each delay counts from the end of the previous probe, so probes never
 * overlap. A tick that finds the session idle is skipped; failures are logged.
 * Both still advance the schedule.
 */
export declare function startCompletionProbe(options: CompletionProbeOptions): void;
