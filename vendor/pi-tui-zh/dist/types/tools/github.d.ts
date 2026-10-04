import type { NativeToolView, ToolRenderResult } from "./renderer.js";
import { type Component } from "../index.js";
import type { RenderResultOptions } from "./renderer.js";
import type { Theme } from "../theme/theme.js";
type GithubToolRenderArgs = {
    op?: string;
    run?: string;
    branch?: string;
    repo?: string;
    pr?: string | string[];
    query?: string;
};
/** Render GitHub operations and live workflow status. */
export declare const githubToolRenderer: {
    renderCall(args: GithubToolRenderArgs, options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: GhToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: GithubToolRenderArgs): Component;
    describeCall(args: GithubToolRenderArgs): NativeToolView;
    describeResult(result: ToolRenderResult<GhToolDetails>, options: RenderResultOptions, args?: GithubToolRenderArgs): NativeToolView | undefined;
    mergeCallAndResult: true;
};
import type { OutputMeta } from "./output-meta.js";
import type { IsoBackendKind } from "@oh-my-pi/pi-natives";
/** Display metadata for GitHub operations. */
export interface GhToolDetails {
    meta?: OutputMeta;
    artifactId?: string;
    repo?: string;
    branch?: string;
    worktreePath?: string;
    remote?: string;
    remoteBranch?: string;
    headSha?: string;
    runId?: number;
    runIds?: number[];
    status?: string;
    conclusion?: string;
    failedJobs?: string[];
    watch?: GhRunWatchViewDetails;
    checkouts?: GhPrCheckoutSummary[];
}
/** Checkout location and branch metadata for a pull request. */
export interface GhPrCheckoutSummary {
    prNumber?: number;
    url?: string;
    branch: string;
    worktreePath: string;
    remote: string;
    remoteBranch: string;
    reused: boolean;
    clonedWith?: IsoBackendKind;
}
/** Display state of a watched workflow job. */
export interface GhRunWatchJobDetails {
    id: number;
    name: string;
    status?: string;
    conclusion?: string;
    durationSeconds?: number;
    url?: string;
}
/** Display state of a watched workflow run. */
export interface GhRunWatchRunDetails {
    id: number;
    workflowName?: string;
    displayTitle?: string;
    status?: string;
    conclusion?: string;
    branch?: string;
    headSha?: string;
    url?: string;
    jobs: GhRunWatchJobDetails[];
}
/** Captured log preview for a failed job. */
export interface GhRunWatchFailedLogDetails {
    runId: number;
    workflowName?: string;
    jobName: string;
    conclusion?: string;
    tail?: string;
    available: boolean;
}
/** Live workflow watcher display snapshot. */
export interface GhRunWatchViewDetails {
    mode: "run" | "commit";
    state: "watching" | "completed";
    repo: string;
    branch?: string;
    headSha?: string;
    pollCount?: number;
    note?: string;
    run?: GhRunWatchRunDetails;
    runs?: GhRunWatchRunDetails[];
    failedLogs?: GhRunWatchFailedLogDetails[];
}
/** Normalized status and timestamps of a workflow job. */
export interface GhRunJobSnapshot {
    id: number;
    name: string;
    status?: string;
    conclusion?: string;
    startedAt?: string;
    completedAt?: string;
    url?: string;
}
/** Normalized workflow run and job snapshot. */
export interface GhRunSnapshot {
    id: number;
    workflowName?: string;
    displayTitle?: string;
    status?: string;
    conclusion?: string;
    branch?: string;
    headSha?: string;
    createdAt?: string;
    updatedAt?: string;
    url?: string;
    jobs: GhRunJobSnapshot[];
}
/** Captured failure logs associated with a run and job. */
export interface GhFailedJobLog {
    run: GhRunSnapshot;
    job: GhRunJobSnapshot;
    full?: string;
    tail?: string;
    available: boolean;
}
/** Choose the terminal conclusion or current job state. */
export declare function formatJobState(job: GhRunJobSnapshot): string;
/** Format workflow jobs as a Markdown section. */
export declare function renderJobsSection(jobs: GhRunJobSnapshot[]): string[];
/** Format failed workflow logs as Markdown sections. */
export declare function renderFailedJobLogs(failedJobLogs: GhFailedJobLog[], options: {
    mode: "tail";
    tail: number;
} | {
    mode: "full";
}): string[];
/** Format a workflow run and its jobs as Markdown. */
export declare function renderRunSection(run: GhRunSnapshot): string[];
export {};
