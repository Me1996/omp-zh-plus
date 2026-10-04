import type { Component } from "../tui.js";
import { type Theme } from "../theme/theme.js";
import { type OutputMeta } from "./output-meta.js";
import type { NativeToolView, RenderResultContextOptions, RenderResultOptions } from "./renderer.js";
/** Default collapsed shell output preview height. */
export declare const BASH_DEFAULT_PREVIEW_LINES = 10;
/**
 * LLM-facing footer appended when a tool call becomes a background job. It states the job's kill
 * deadline (`timeoutSec`, `undefined` when disabled) so the model knows the job will die at it before
 * it waits on the result. The deadline counts the job's whole run time, not time left from now: an
 * auto-backgrounded call has already spent its foreground wait.
 */
export declare function formatBackgroundNotice(jobId: string, timeoutSec: number | undefined): string;
/** Shell execution metadata used by transcript rendering. */
export interface BashToolDetails {
    meta?: OutputMeta;
    timeoutSeconds?: number;
    requestedTimeoutSeconds?: number;
    timeoutDisabled?: boolean;
    wallTimeMs?: number;
    /** Exit code of a command that ran to completion but failed (non-zero). */
    exitCode?: number;
    /** True when the command was killed by its timeout deadline (not a failure). */
    timedOut?: boolean;
    /** Live ACP update only; completed results refer to released terminals. */
    terminalId?: string;
    service?: {
        name: string;
        state: string;
        ready: boolean;
        timedOut: boolean;
        pid?: number;
    };
    async?: {
        state: "running" | "completed" | "failed";
        jobId: string;
        type: "bash";
    };
}
/** Formats the model-facing command duration notice. */
export declare function formatWallTimeNotice(wallTimeMs: number): string;
/** Formats the model-facing command exit status notice. */
export declare function formatExitCodeNotice(exitCode: number): string;
/** Shell arguments used to build a command preview. */
export interface BashRenderArgs {
    command?: string;
    env?: Record<string, unknown>;
    timeout?: number;
    cwd?: string;
    __partialJson?: string;
    [key: string]: unknown;
}
/** Mutable transcript viewport state for shell output. */
export interface BashRenderContext {
    /** Raw output text */
    output?: string;
    /** Whether output came from artifact storage */
    isFullOutput?: boolean;
    /** Whether output is expanded */
    expanded?: boolean;
    /** Number of preview lines when collapsed */
    previewLines?: number;
    /** Timeout in seconds */
    timeout?: number;
}
/** Caller-supplied shell labels and argument projections. */
export interface ShellRendererConfig<TArgs> {
    resolveTitle: (args: TArgs | undefined, options: RenderResultOptions) => string;
    resolveCommand?: (args: TArgs | undefined) => string | undefined;
    resolveCwd?: (args: TArgs | undefined) => string | undefined;
    resolveEnv?: (args: TArgs | undefined) => Record<string, unknown> | undefined;
    showHeader?: boolean;
}
/** Combines parsed and partially streamed environment assignments. */
export declare function getBashEnvForDisplay(args: BashRenderArgs): Record<string, unknown> | undefined;
/**
 * Returns the bash command formatted for the result body: the dim `$ cd … &&`
 * prefix joined with syntax-highlighted command lines. The prefix is applied
 * only to the first line so multi-line commands display cleanly — terminals
 * reset SGR state at line boundaries, which made the previous single-string
 * `theme.fg("dim", ...)` form render only the first line as dim.
 */
export declare function formatBashCommandLines(args: BashRenderArgs, uiTheme: Theme): string[];
/**
 * Plain (unstyled) command line for native views: `cd <dir> && NAME="…" <command>`,
 * built from the same decoded display args (incl. streamed `__partialJson` env) as the ANSI path.
 */
export declare function formatBashCommandText(args: BashRenderArgs): string;
/** Builds a shell transcript renderer with caller-supplied command labels. */
export declare function createShellRenderer<TArgs>(config: ShellRendererConfig<TArgs>): {
    renderCall(args: TArgs, options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: BashToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions & {
        renderContext?: BashRenderContext;
    }, uiTheme: Theme, args?: TArgs): Component;
    describeCall(args: TArgs, options: RenderResultOptions): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: BashToolDetails;
        isError?: boolean;
    }, options: RenderResultContextOptions & {
        renderContext?: BashRenderContext;
    }, args?: TArgs): NativeToolView;
    mergeCallAndResult: true;
    inline: true;
};
/** Renders bash command previews and output. */
export declare const bashToolRenderer: {
    renderCall(args: BashRenderArgs, options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: {
            type: string;
            text?: string;
        }[];
        details?: BashToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions & {
        renderContext?: BashRenderContext;
    }, uiTheme: Theme, args?: BashRenderArgs | undefined): Component;
    describeCall(args: BashRenderArgs, options: RenderResultOptions): NativeToolView;
    describeResult(result: {
        content: {
            type: string;
            text?: string;
        }[];
        details?: BashToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions & {
        renderContext?: Record<string, unknown>;
    } & {
        renderContext?: BashRenderContext;
    }, args?: BashRenderArgs | undefined): NativeToolView;
    mergeCallAndResult: true;
    inline: true;
};
