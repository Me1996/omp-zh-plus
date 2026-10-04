import type { Component } from "../tui.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
import type { TruncationResult } from "./streaming-output.js";
/** Display metadata for grep tool results. */
export interface GrepToolDetails {
    truncation?: TruncationResult;
    fileLimitReached?: number;
    perFileLimitReached?: number;
    linesTruncated?: boolean;
    meta?: OutputMeta;
    scopePath?: string;
    matchCount?: number;
    fileCount?: number;
    files?: string[];
    fileMatches?: Array<{
        path: string;
        count: number;
    }>;
    truncated?: boolean;
    error?: string;
    /** Pre-formatted text for the user-visible TUI render. Mirrors the model-facing
     * `result.text` lines but uses a `│` gutter and `*` to mark match lines (vs space for
     * context). The TUI uses this directly so it never parses model-facing hashline anchors. */
    displayContent?: string;
    /** Filesystem hyperlink targets resolved for internal URL headers at execution time. */
    displayTargets?: Record<string, string>;
    /** Absolute base directory used during search. Used by the renderer to resolve
     * display-relative paths to absolute paths for OSC 8 hyperlinks. */
    searchPath?: string;
    /** Session cwd at search time. The renderer resolves the display-relative
     * (cwd-relative) header/match paths against this for OSC 8 hyperlinks;
     * `searchPath` is the scope label target, not the display-path base. */
    cwd?: string;
    /** User-supplied paths whose base directory was missing on disk. The tool
     * skipped these and continued with the surviving entries; surfaced as a
     * non-fatal warning in the renderer and in the model-facing text. */
    missingPaths?: string[];
}
interface GrepRenderArgs {
    pattern: string;
    path?: string | string[];
    /** Legacy pre-`path` argument name; kept so historical transcripts still render a scope. */
    paths?: string | string[];
    case?: boolean;
    gitignore?: boolean;
    skip?: number;
}
/** Render grep calls and results in the transcript. */
export declare const grepToolRenderer: {
    inline: true;
    renderCall(args: GrepRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: GrepToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: GrepRenderArgs): Component;
    describeCall(args: GrepRenderArgs): NativeToolView;
    /**
     * Inline (§7.3 grep): `Grep “pattern”  5 matches · 2 files  in src`, then
     * the matches grouped by file; collapsed shows the first two files.
     */
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: GrepToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, args?: GrepRenderArgs): NativeToolView;
    mergeCallAndResult: true;
};
export {};
