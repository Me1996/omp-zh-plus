import type { Component } from "../index.js";
import type { NativeToolView, RenderResultContextOptions, RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
import type { ImageContent } from "@oh-my-pi/pi-ai";
import type { OutputMeta } from "./output-meta.js";
import { type ConfiguredThinkingLevel } from "../render/render-utils.js";
/** Runtime backend that an eval cell dispatches to. */
export type EvalLanguage = "python" | "js";
/** Status event emitted by eval prelude helpers for TUI rendering. */
export interface EvalStatusEvent {
    op: string;
    /** Validated thinking level supplied by the execution layer. */
    resolvedThinkingLevel?: ConfiguredThinkingLevel;
    [key: string]: unknown;
}
/** Per-cell execution result for transcript rendering. */
export interface EvalCellResult {
    index: number;
    title?: string;
    code: string;
    language?: EvalLanguage;
    output: string;
    status: "pending" | "running" | "complete" | "error";
    durationMs?: number;
    exitCode?: number;
    statusEvents?: EvalStatusEvent[];
    hasMarkdown?: boolean;
}
/** Tool result detail object surfaced to the UI/transcript. */
export interface EvalToolDetails {
    cells?: EvalCellResult[];
    jsonOutputs?: unknown[];
    images?: ImageContent[];
    statusEvents?: EvalStatusEvent[];
    isError?: boolean;
    meta?: OutputMeta;
    /** First backend that produced cells. Kept for transcript compatibility. */
    language?: EvalLanguage;
    /** Backends that produced cells in this call, in first-use order. */
    languages?: EvalLanguage[];
    /** Optional human-readable notice (e.g. fallback explanation). */
    notice?: string;
    /** Present when the cell was auto-backgrounded as an async job. */
    async?: {
        state: "running" | "completed" | "failed";
        jobId: string;
        type: "eval";
    };
}
/** Default collapsed eval output preview height; kept as a named alias (consumed by chat/tool-execution). */
export declare const EVAL_DEFAULT_PREVIEW_LINES: number;
interface EvalRenderCellArg {
    language?: string;
    code?: string;
    title?: string;
}
interface EvalRenderArgs extends EvalRenderCellArg {
    cells?: EvalRenderCellArg[];
    __partialJson?: string;
}
interface EvalRenderContext {
    output?: string;
    expanded?: boolean;
    previewLines?: number;
    timeout?: number;
}
/**
 * Coalescing key of a progress-snapshot event: `agent` and `judge_batch`
 * events keyed by `id`, where only the newest snapshot matters. Discrete
 * actions (everything else) have no key. Shared by {@link upsertStatusEvent}
 * and the executors' display collectors so both coalesce identically.
 */
export declare function statusEventKey(event: {
    op: string;
    [key: string]: unknown;
}): string | undefined;
/**
 * Append or replace a status event. Progress snapshots (see
 * {@link statusEventKey}) coalesce in place, preserving first-seen order; every
 * other op is a discrete action and simply appends. Keeps the persisted event
 * list bounded even when a subagent or batch emits hundreds of progress ticks.
 */
export declare function upsertStatusEvent(events: EvalStatusEvent[], event: EvalStatusEvent): void;
/** Render eval code cells, structured display output, and progress events. */
export declare const evalToolRenderer: {
    animatedPendingPreview: true;
    animatedPartialResult: true;
    renderCall(args: EvalRenderArgs, options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: EvalToolDetails;
    }, options: RenderResultOptions & {
        renderContext?: EvalRenderContext;
    }, uiTheme: Theme, _args?: EvalRenderArgs): Component;
    describeCall(args: EvalRenderArgs, _options: RenderResultOptions): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: EvalToolDetails;
        isError?: boolean;
    }, options: RenderResultContextOptions & {
        renderContext?: EvalRenderContext;
    }, args?: EvalRenderArgs): NativeToolView;
    mergeCallAndResult: true;
    inline: true;
};
export {};
