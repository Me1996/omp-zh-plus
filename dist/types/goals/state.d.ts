import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import { type Goal } from "@oh-my-pi/pi-tui-zh/tools/goal";
import type { UsageStatistics } from "../session/session-entries.js";
export interface GoalModeState {
    enabled: boolean;
    mode: "active" | "exiting";
    reason?: "completed";
    goal: Goal;
}
export type GoalRuntimeEvent = {
    type: "goal_updated";
    goal: Goal | null;
    state?: GoalModeState;
} | {
    type: "goal_continuation_requested";
    prompt: string;
};
export type GoalTokenUsage = Pick<UsageStatistics, "input" | "output" | "cacheRead" | "cacheWrite">;
export type GoalBudgetSteering = "allowed" | "suppressed";
export type GoalTerminalMetricEmission = "emit" | "suppress";
/** Rebuild a persisted goal from `mode_change` data; undefined when the record is malformed. */
export declare function goalFromModeData(modeData: Record<string, unknown> | undefined): Goal | undefined;
/**
 * Digest of a turn's tool calls and results. Two continuation turns with the same
 * (or empty) activity made no progress, so automatic continuation stops.
 */
export declare function goalContinuationActivity(messages: readonly AgentMessage[]): string;
