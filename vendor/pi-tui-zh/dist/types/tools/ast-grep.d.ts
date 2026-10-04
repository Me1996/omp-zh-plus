import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
/** Display metadata returned by ast-grep. */
export interface AstGrepToolDetails {
    matchCount: number;
    fileCount: number;
    filesSearched: number;
    limitReached: boolean;
    parseErrors?: string[];
    /** Total parse error count before {@link PARSE_ERRORS_LIMIT} capping. Omitted when no errors. */
    parseErrorsTotal?: number;
    scopePath?: string;
    files?: string[];
    fileMatches?: Array<{
        path: string;
        count: number;
    }>;
    meta?: OutputMeta;
    /** Pre-formatted text for the user-visible TUI render. Mirrors `result.text` lines but uses
     * a `│` gutter and `*` to mark match lines. The TUI uses this directly so it never parses model-facing text. */
    displayContent?: string;
    /** Absolute base directory used during search. Used by the renderer to resolve
     * display-relative paths to absolute paths for OSC 8 hyperlinks. */
    searchPath?: string;
    /** Session cwd at search time. Display header/match paths are cwd-relative, so
     * the renderer resolves them against this; `searchPath` is the scope target. */
    cwd?: string;
}
interface AstGrepRenderArgs {
    pat?: string;
    path?: string | string[];
    /** Legacy pre-`path` argument name; kept so historical transcripts still render a scope. */
    paths?: string[];
    skip?: number;
}
/** Render AST grep calls and results. */
export declare const astGrepToolRenderer: {
    inline: true;
    renderCall(args: AstGrepRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: AstGrepToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: AstGrepRenderArgs): Component;
    describeCall(args: AstGrepRenderArgs): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: AstGrepToolDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: AstGrepRenderArgs): NativeToolView;
    mergeCallAndResult: true;
};
export {};
