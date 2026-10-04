import type { Component } from "../tui.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
import type { TruncationResult } from "./streaming-output.js";
/** Display metadata for glob tool results. */
export interface GlobToolDetails {
    truncation?: TruncationResult;
    resultLimitReached?: number;
    meta?: OutputMeta;
    scopePath?: string;
    fileCount?: number;
    files?: string[];
    truncated?: boolean;
    error?: string;
    /** Working directory at search time. Used by the renderer to resolve relative
     * file paths to absolute paths for OSC 8 hyperlinks. */
    cwd?: string;
    /** User-supplied paths whose base directory was missing on disk. The tool
     * skipped these and continued with the surviving entries; surfaced as a
     * non-fatal warning in the renderer and in the model-facing text. */
    missingPaths?: string[];
}
interface GlobRenderArgs {
    path?: string | string[];
    /** Legacy pre-`path` argument name; kept so historical transcripts still render a scope. */
    paths?: string | string[];
    limit?: number;
}
/** Render glob calls and results in the transcript. */
export declare const globToolRenderer: {
    inline: true;
    renderCall(args: GlobRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: GlobToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: GlobRenderArgs): Component;
    describeCall(args: GlobRenderArgs): NativeToolView;
    /**
     * Inline (§7.3 glob): `Glob “pattern”  5 files`, then the files as rows
     * (≤ 6) or a wrap of chips; one quiet footnote for limits and skipped paths.
     */
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: GlobToolDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: GlobRenderArgs): NativeToolView;
    mergeCallAndResult: true;
};
export {};
