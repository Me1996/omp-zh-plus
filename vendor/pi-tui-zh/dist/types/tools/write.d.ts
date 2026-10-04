import type { HighlightStream } from "@oh-my-pi/pi-natives";
import type { Component } from "../tui.js";
import { type Theme } from "../theme/theme.js";
import type { CoordinationDetails } from "./wait.js";
import { type ProcWriteDetails } from "./proc-render.js";
import { type CfgWriteDetails } from "./cfg-render.js";
import type { FileDiagnosticsResult } from "./lsp.js";
import type { OutputMeta } from "./output-meta.js";
import type { NativeToolView, RenderResultOptions, ToolActivityContext, ToolActivitySummary } from "./renderer.js";
import { type XdevRenderDispatch, type XdevMountedRenderer } from "./xdev.js";
/** Details returned by the write tool for transcript rendering. */
export interface WriteToolDetails {
    diagnostics?: FileDiagnosticsResult;
    meta?: OutputMeta;
    /** Set when the file was auto-chmod'd because content begins with a `#!` shebang. */
    madeExecutable?: boolean;
    /** Absolute filesystem path the write resolved to. Used by the renderer to wrap
     * the (possibly cwd-relative) header path in an OSC 8 `file://` hyperlink. */
    resolvedPath?: string;
    /** Set when the write dispatched an `xd://` tool device; drives renderer delegation. */
    xdev?: XdevRenderDispatch;
    message?: CoordinationDetails;
    proc?: ProcWriteDetails;
    cfg?: CfgWriteDetails;
}
interface WriteRenderArgs {
    path?: unknown;
    file_path?: unknown;
    content?: unknown;
}
/** A write tool result as the renderer receives it. */
interface WriteResult {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: WriteToolDetails;
    isError?: boolean;
}
declare const writeStreamingPreviewStateKey: unique symbol;
/**
 * Per-component state for incrementally rendering a streamed write.
 * The ToolExecutionComponent's persistent render options carry the state, so
 * it lives exactly as long as the component and cannot leak across tool calls.
 */
interface WriteStreamingPreviewState {
    /** Prior full content; append-only growth is validated with an exact prefix check. */
    previous: string;
    /** `1 + count("\n")` over the scanned content. */
    lineCount: number;
    /** Raw offset immediately after the last newline consumed by `highlighter`. */
    completeLength: number;
    /** Highlighted, complete logical lines; the unfinished trailing line is rendered plain. */
    highlightedLines: string[];
    /** Stateful parser carrying syntax scopes across appended complete lines. */
    highlighter: HighlightStream | null;
    language: string | undefined;
    uiTheme: Theme;
    /** Content length for which the trailing line was flushed as final (`argsComplete`); -1 when none. */
    finalFlushedLength: number;
    /** Highlighted trailing line from the final flush; rendered in place of the plain tail. */
    finalTrailing: string;
}
interface WriteStreamingPreviewStateCarrier {
    [writeStreamingPreviewStateKey]?: WriteStreamingPreviewState;
}
/** Render context for the write tool: resolves an `xd://`-mounted tool so its live renderer drives device dispatch previews. */
export interface WriteRenderContext {
    resolveXdevMounted?: (name: string) => XdevMountedRenderer | undefined;
}
/** Render file writes and delegated tool-device calls. */
export declare const writeToolRenderer: {
    /** Compact one-line activity: device writes read as the mounted tool (`LSP · references foo`), file writes as `Write · <path>`. */
    activitySummary(args: unknown, context: ToolActivityContext): ToolActivitySummary;
    renderCall(args: WriteRenderArgs, options: RenderResultOptions & WriteStreamingPreviewStateCarrier & {
        renderContext?: WriteRenderContext;
    }, uiTheme: Theme): Component | undefined;
    renderResult(result: WriteResult, options: RenderResultOptions & {
        renderContext?: WriteRenderContext;
    }, uiTheme: Theme, args?: WriteRenderArgs): Component;
    describeCall(args: WriteRenderArgs, options: RenderResultOptions & {
        renderContext?: WriteRenderContext;
    }): NativeToolView | undefined;
    describeResult(result: WriteResult, options: RenderResultOptions & {
        renderContext?: WriteRenderContext;
    }, args?: WriteRenderArgs): NativeToolView | undefined;
    mergeCallAndResult: true;
    forceFirstResultViewportRepaint: (args: unknown, options: RenderResultOptions) => boolean;
};
export {};
