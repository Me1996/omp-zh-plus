/**
 * Edit tool renderer.
 */
import type { Component } from "../tui.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import type { FileDiagnosticsResult } from "./lsp.js";
import type { Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
import type { ToolActivityContext, ToolActivitySummary } from "./renderer.js";
/** Edit payload syntax selected by the caller. */
export type EditMode = "replace" | "patch" | "hashline" | "apply_patch" | "sloppy";
/** Filesystem operation represented by an edit. */
export type Operation = "create" | "delete" | "update";
/** Computed streaming diff or preview error for one file. */
export interface PerFileDiffPreview {
    path: string;
    diff?: string;
    firstChangedLine?: number;
    error?: string;
}
type EditDiffPreview = {
    diff: string;
    firstChangedLine?: number;
} | {
    error: string;
    diff?: undefined;
    firstChangedLine?: undefined;
};
/** Result metadata for one edited file. */
export interface EditToolPerFileResult {
    path: string;
    diff: string;
    firstChangedLine?: number;
    diagnostics?: FileDiagnosticsResult;
    op?: Operation;
    move?: string;
    isError?: boolean;
    errorText?: string;
    /** TUI-friendly error text. When present, rendered to the user instead of `errorText`.
     * Set when the underlying error carries a `displayMessage` (e.g. {@link HashlineMismatchError}). */
    displayErrorText?: string;
    meta?: OutputMeta;
    /** Source-of-truth content before the edit; `undefined` for create operations. */
    oldText?: string;
    /** Source-of-truth content after the edit; `undefined` for delete operations. */
    newText?: string;
    /** True when {@link pruneOversizedEditSnapshots} dropped `oldText`/`newText` from this entry. Aggregators check this to suppress misleading combined snapshots when at least one entry of a multi-entry single-path edit was pruned. */
    snapshotsPruned?: boolean;
    /** Pre-move source path; set only when the edit moved/renamed the file. The header renders `sourcePath → path`. */
    sourcePath?: string;
}
/** Diff, diagnostics, and snapshots returned by an edit. */
export interface EditToolDetails {
    /** Unified diff of the changes made */
    diff: string;
    /** Line number of the first change in the new file (for editor navigation) */
    firstChangedLine?: number;
    /** Diagnostic result (if available) */
    diagnostics?: FileDiagnosticsResult;
    /** Operation type (patch mode only) */
    op?: Operation;
    /** New path after move/rename (patch mode only) */
    move?: string;
    /** Structured output metadata */
    meta?: OutputMeta;
    /** Per-file results (multi-file edits) */
    perFileResults?: EditToolPerFileResult[];
    /** Absolute file path for single-file edit results. Required by ACP diff metadata consumers. */
    path?: string;
    /** Source-of-truth content before the edit; `undefined` for create operations. */
    oldText?: string;
    /** Source-of-truth content after the edit; `undefined` for delete operations. */
    newText?: string;
    /** True when {@link pruneOversizedEditSnapshots} dropped `oldText`/`newText` from this entry. Aggregators check this to suppress misleading combined snapshots when at least one entry of a multi-entry single-path edit was pruned. */
    snapshotsPruned?: boolean;
    /** Pre-move source path; set only when the edit moved/renamed the file. The header renders `sourcePath → path`. */
    sourcePath?: string;
}
/** Memoized native inspection of the streamed payload, tagged onto the args it came from. */
declare const kInspectedInput: unique symbol;
type InspectedInput = {
    mode: EditMode;
    input: string;
} & ({
    entries: InspectedInputEntry[];
    error?: undefined;
} | {
    entries?: undefined;
    error: unknown;
});
interface EditRenderArgs {
    path?: unknown;
    file_path?: unknown;
    oldText?: string;
    newText?: string;
    patch?: string;
    input?: string;
    _input?: string;
    replace_all?: boolean;
    op?: Operation;
    rename?: unknown;
    diff?: string;
    /**
     * Computed preview diff (used when tool args don't include a diff, e.g. hashline mode).
     */
    previewDiff?: string;
    __partialJson?: string;
    edits?: EditRenderEntry[];
    [kInspectedInput]?: InspectedInput;
}
type EditRenderEntry = {
    path?: unknown;
    rename?: unknown;
    move?: unknown;
    op?: Operation;
};
interface InspectedInputEntry {
    path: string;
    op?: Operation;
    rename?: string;
}
/** Extended context for edit tool rendering */
export interface EditRenderContext {
    /** Edit mode resolved by the caller; lets the renderer dispatch without shape-sniffing */
    editMode?: EditMode;
    /** Pre-computed diff preview (computed before tool executes) */
    editDiffPreview?: EditDiffPreview;
    /** Multi-file streaming diff preview (edits spanning several files) */
    perFileDiffPreview?: PerFileDiffPreview[];
    /** Raw in-flight edit text shown while a computed diff preview is unavailable */
    editStreamingFallback?: string;
    /** Function to render diff text with syntax highlighting */
    renderDiff?: (diffText: string, options?: {
        filePath?: string;
    }) => string;
}
/** Render replacement text until a computed diff preview is available. */
export declare function renderStreamingFallback(editMode: EditMode, args: unknown, theme: Theme): string;
/** Extract display targets using the existing parsers for supported freeform edit modes. */
export declare function getEditInputPaths(input: string, resolvedMode?: EditMode): readonly string[];
/** Render edit previews and completed file diffs. */
export declare const editToolRenderer: {
    mergeCallAndResult: true;
    /** Compact one-line activity: operation + target path instead of the payload's first line. */
    activitySummary(args: unknown, context: ToolActivityContext): ToolActivitySummary;
    renderCall(args: EditRenderArgs, options: RenderResultOptions & {
        renderContext?: EditRenderContext;
    }, uiTheme: Theme): Component;
    describeCall(args: EditRenderArgs, options: RenderResultOptions & {
        renderContext?: EditRenderContext;
    }): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: EditToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions & {
        renderContext?: EditRenderContext;
    }, args?: EditRenderArgs): NativeToolView;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: EditToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions & {
        renderContext?: EditRenderContext;
    }, uiTheme: Theme, args?: EditRenderArgs): Component;
};
export {};
