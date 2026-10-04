import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
/** Display metadata returned by ast-edit. */
export interface AstEditToolDetails {
    totalReplacements: number;
    filesTouched: number;
    filesSearched: number;
    applied: boolean;
    limitReached: boolean;
    parseErrors?: string[];
    /** Total parse error count before {@link PARSE_ERRORS_LIMIT} capping. Omitted when no errors. */
    parseErrorsTotal?: number;
    scopePath?: string;
    files?: string[];
    fileReplacements?: Array<{
        path: string;
        count: number;
    }>;
    meta?: OutputMeta;
    /** Pre-formatted text for the user-visible TUI render. Mirrors `result.text` lines but uses
     * a `│` gutter (no model-only hashline anchors). The TUI uses this directly so it never parses model-facing text. */
    displayContent?: string;
    /** Absolute base directory used during the edit. Used by the renderer to resolve
     * display-relative paths to absolute paths for OSC 8 hyperlinks. */
    searchPath?: string;
    /** Session cwd at edit time. Display header paths are cwd-relative, so the
     * renderer resolves them against this; `searchPath` is the scope target. */
    cwd?: string;
}
interface AstEditRenderArgs {
    ops?: Array<{
        pat?: string;
        out?: string;
    }>;
    paths?: string[];
}
/** Render AST edit calls and results. */
export declare const astEditToolRenderer: {
    inline: true;
    renderCall(args: AstEditRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: AstEditToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: AstEditRenderArgs): Component;
    describeCall(args: AstEditRenderArgs): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: AstEditToolDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: AstEditRenderArgs): NativeToolView;
    mergeCallAndResult: true;
};
export {};
