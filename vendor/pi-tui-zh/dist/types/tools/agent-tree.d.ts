import { type ConfiguredThinkingLevel } from "../render/render-utils.js";
import type { Theme } from "../theme/theme.js";
/** Counters displayed alongside an agent name. */
export interface AgentStats {
    toolCount?: number;
    requests?: number;
    contextTokens?: number;
    contextWindow?: number;
    cost?: number;
}
/** Format the shared tool-count, request, context, and cost stat run. */
export declare function formatAgentStatRun(stats: AgentStats, theme: Theme): string;
/** Tool-specific presentation layered onto a bounded agent progress row. */
export interface AgentTreeRowOptions {
    status: "pending" | "running" | "completed" | "failed" | "aborted";
    presentation: "task" | "eval";
    prefix: string;
    id: string;
    width: number;
    model?: string;
    thinkingLevel?: ConfiguredThinkingLevel;
    advisor?: boolean;
    spinnerFrame?: number;
    frozen?: boolean;
    roleBadge?: string;
    statusBadge?: string;
    description?: string;
    preview?: string;
    stats?: AgentStats;
    /** The agent's own completion estimate (0–100); shown only while live. */
    completionPercent?: number;
    durationMs?: number;
}
/** Render an agent row while reserving its identifier and required status badges. */
export declare function renderAgentTreeRow(options: AgentTreeRowOptions, theme: Theme): {
    line: string;
    descriptionShown: boolean;
};
