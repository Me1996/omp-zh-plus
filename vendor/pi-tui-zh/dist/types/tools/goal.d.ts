import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import type { NativeToolView, RenderResultOptions, ToolRenderResult } from "./renderer.js";
/** Lifecycle state of a tracked goal. */
export type GoalStatus = "active" | "paused" | "budget-limited" | "complete" | "dropped";
/** Serializable goal progress and resource budget. */
export interface Goal {
    id: string;
    objective: string;
    status: GoalStatus;
    tokenBudget?: number;
    tokensUsed: number;
    timeUsedSeconds: number;
    createdAt: number;
    updatedAt: number;
}
/** Goal operation outcome displayed in the transcript. */
export interface GoalToolDetails {
    op: "create" | "get" | "complete" | "resume" | "drop";
    goal?: Goal | null;
    remainingTokens?: number | null;
    completionBudgetReport?: string | null;
}
interface GoalRenderArgs {
    op?: GoalToolDetails["op"];
    objective?: string;
    token_budget?: number;
}
/** Renders goal creation, status, and lifecycle results. */
export declare const goalToolRenderer: {
    renderCall(args: GoalRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: GoalToolDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, uiTheme: Theme, args?: GoalRenderArgs): Component;
    describeCall(args: GoalRenderArgs): NativeToolView;
    describeResult(result: ToolRenderResult<GoalToolDetails>, _options: RenderResultOptions, args?: GoalRenderArgs): NativeToolView | undefined;
    mergeCallAndResult: true;
};
export {};
