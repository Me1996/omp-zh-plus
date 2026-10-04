import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import type { NativeToolView, RenderResultOptions, ToolRenderResult } from "./renderer.js";
/** Display fields captured from a debugger session. */
export interface DebugSessionSnapshot {
    id: string;
    adapter: string;
    status: string;
    cwd: string;
    program?: string;
    stopReason?: string;
    frameName?: string;
    instructionPointerReference?: string;
    source?: {
        path?: string;
    };
    line?: number;
    column?: number;
    needsConfigurationDone: boolean;
    exitCode?: number;
}
/** Debug execution metadata consumed by the transcript. */
export interface DebugToolDetails {
    action: string;
    success: boolean;
    snapshot?: DebugSessionSnapshot;
}
/** Debug arguments used to describe a pending request. */
export interface DebugRenderArgs {
    action?: string;
    program?: string;
    file?: string;
    line?: number;
    function?: string;
    expression?: string;
    command?: string;
    memory_reference?: string;
    instruction_reference?: string;
    data_id?: string;
    name?: string;
}
/** Formats a debugger stop location as a source path and coordinates. */
export declare function formatLocation(snapshot: DebugSessionSnapshot | undefined): string | null;
/** Formats the debugger session snapshot for model and terminal output. */
export declare function formatSessionSnapshot(snapshot: DebugSessionSnapshot): string[];
/** Renders debugger calls and captured execution snapshots. */
export declare const debugToolRenderer: {
    animatedPartialResult: true;
    renderCall(args: DebugRenderArgs, _options: RenderResultOptions, theme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: DebugToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, theme: Theme, args?: DebugRenderArgs): Component;
    describeCall(args: DebugRenderArgs): NativeToolView;
    describeResult(result: ToolRenderResult<DebugToolDetails>, _options: RenderResultOptions, args?: DebugRenderArgs): NativeToolView | undefined;
    mergeCallAndResult: true;
    inline: true;
};
