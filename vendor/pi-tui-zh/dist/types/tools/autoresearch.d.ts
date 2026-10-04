import { Text } from "../components/text.js";
import type { Theme } from "../theme/theme.js";
import type { NativeToolView, ToolRenderResult } from "./renderer.js";
import type { TruncationResult } from "./streaming-output.js";
/** Whether a lower or higher metric is better. */
export type MetricDirection = "lower" | "higher";
/** Disposition of a completed experiment. */
export type ExperimentStatus = "keep" | "discard" | "crash" | "checks_failed";
/** JSON-compatible additional structured experiment information. */
export type ASIValue = string | number | boolean | null | ASIValue[] | {
    [key: string]: ASIValue;
};
/** Named structured experiment observations. */
export interface ASIData {
    [key: string]: ASIValue;
}
/** Numeric metrics indexed by name. */
export interface NumericMetricMap {
    [key: string]: number;
}
/** Name and unit of an experiment metric. */
export interface MetricDef {
    name: string;
    unit: string;
}
/** Recorded metric and disposition of an experiment run. */
export interface ExperimentResult {
    runNumber: number | null;
    commit: string;
    metric: number;
    metrics: NumericMetricMap;
    status: ExperimentStatus;
    description: string;
    timestamp: number;
    segment: number;
    confidence: number | null;
    asi?: ASIData;
    modifiedPaths: string[];
    scopeDeviations: string[];
    justification: string | null;
    flagged: boolean;
    flaggedReason: string | null;
}
/** Current experiment baseline, history, and scope. */
export interface ExperimentState {
    results: ExperimentResult[];
    bestMetric: number | null;
    bestDirection: MetricDirection;
    metricName: string;
    metricUnit: string;
    secondaryMetrics: MetricDef[];
    name: string | null;
    goal: string | null;
    currentSegment: number;
    maxExperiments: number | null;
    confidence: number | null;
    scopePaths: string[];
    offLimits: string[];
    constraints: string[];
    notes: string;
    branch: string | null;
    baselineCommit: string | null;
    sessionId: number | null;
}
/** Live elapsed time and output metadata of a benchmark. */
export interface RunExperimentProgressDetails {
    phase: "running";
    elapsed: string;
    truncation?: TruncationResult;
    fullOutputPath?: string;
    runDirectory?: string;
}
/** Completed benchmark measurements, status, and output. */
export interface RunDetails {
    runNumber: number;
    runDirectory: string;
    benchmarkLogPath: string;
    command: string;
    exitCode: number | null;
    durationSeconds: number;
    passed: boolean;
    crashed: boolean;
    timedOut: boolean;
    tailOutput: string;
    parsedMetrics: NumericMetricMap | null;
    parsedPrimary: number | null;
    parsedAsi: ASIData | null;
    metricName: string;
    metricUnit: string;
    preRunDirtyPaths: string[];
    abandonedPriorRun: number | null;
    truncation?: TruncationResult;
    fullOutputPath?: string;
}
/** Logged experiment result and updated baseline state. */
export interface LogDetails {
    experiment: ExperimentResult;
    state: ExperimentState;
    wallClockSeconds: number | null;
    scopeDeviations: string[];
    justification: string | null;
    flaggedRuns: Array<{
        runId: number;
        reason: string;
    }>;
}
/** Format an integer with comma-separated digit groups. */
export declare function commas(value: number): string;
/** Format a number with grouped digits and optional decimals. */
export declare function fmtNum(value: number, decimals?: number): string;
/** Format an optional metric value with its unit. */
export declare function formatNum(value: number | null, unit: string): string;
/** Filename of the benchmark harness. */
export declare const HARNESS_FILENAME = "autoresearch.sh";
/** Default command that executes the benchmark harness. */
export declare const DEFAULT_HARNESS_COMMAND = "bash autoresearch.sh";
/** Initialization outcome and experiment state. */
export interface InitExperimentDetails {
    state: ExperimentState;
    createdSession: boolean;
    bumpedSegment: boolean;
    abandonedRuns: number;
    harnessCommitted: boolean;
    baselineCommit: string | null;
}
/** Render init-experiment tool calls and results. */
export declare const initExperimentToolRenderer: {
    renderCall(args: {
        name: string;
    }, _options: import("./renderer.js").RenderResultOptions, theme: Theme): Text;
    renderResult(result: ToolRenderResult<InitExperimentDetails>): Text;
    describeCall(args: {
        name: string;
    }): NativeToolView;
    describeResult(result: ToolRenderResult<InitExperimentDetails>): NativeToolView | undefined;
};
/** Render log-experiment tool calls and results. */
export declare const logExperimentToolRenderer: {
    renderCall(args: {
        status: ExperimentStatus;
        description: string;
    }, _options: import("./renderer.js").RenderResultOptions, theme: Theme): Text;
    renderResult(result: ToolRenderResult<LogDetails>, _options: import("./renderer.js").RenderResultContextOptions, theme: Theme): Text;
    describeCall(args: {
        status: ExperimentStatus;
        description: string;
    }): NativeToolView;
    describeResult(result: ToolRenderResult<LogDetails>): NativeToolView | undefined;
};
/** Render run-experiment tool calls and results. */
export declare const runExperimentToolRenderer: {
    renderCall(_args: unknown, _options: import("./renderer.js").RenderResultOptions, theme: Theme): Text;
    renderResult(result: ToolRenderResult<RunDetails | RunExperimentProgressDetails>, options: import("./renderer.js").RenderResultContextOptions, theme: Theme): Text;
    describeCall(): NativeToolView;
    describeResult(result: ToolRenderResult<RunDetails | RunExperimentProgressDetails>): NativeToolView | undefined;
};
/** Persisted experiment notes after an update. */
export interface UpdateNotesDetails {
    notes: string;
}
/** Render update-notes tool calls and results. */
export declare const updateNotesToolRenderer: {
    renderCall(args: {
        body: string;
        append_idea?: string;
    }, _options: import("./renderer.js").RenderResultOptions, theme: Theme): Text;
    renderResult(result: ToolRenderResult<UpdateNotesDetails>, _options: import("./renderer.js").RenderResultContextOptions, theme: Theme): Text;
    describeCall(args: {
        body: string;
        append_idea?: string;
    }): NativeToolView;
    describeResult(result: ToolRenderResult<UpdateNotesDetails>): NativeToolView | undefined;
};
