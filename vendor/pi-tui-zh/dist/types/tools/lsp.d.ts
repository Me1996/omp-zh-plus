import type { NativeToolView, RenderResultOptions, ToolRenderResult } from "./renderer.js";
import type { Component } from "../tui.js";
import { Text } from "../components/text.js";
import { type Theme } from "../theme/theme.js";
/** Display arguments for an LSP tool request. */
export interface LspParams {
    action: "diagnostics" | "definition" | "references" | "hover" | "symbols" | "rename" | "rename_file" | "code_actions" | "type_definition" | "implementation" | "status" | "reload" | "capabilities" | "request";
    file?: string;
    line?: number;
    symbol?: string;
    query?: string;
    new_name?: string;
    apply?: boolean;
    timeout?: number;
    payload?: string;
}
/** Details accompanying an LSP tool response. */
export interface LspToolDetails {
    serverName?: string;
    action: string;
    success: boolean;
    request?: LspParams;
}
/** Diagnostics and formatting status for one file. */
export interface FileDiagnosticsResult {
    /** Name of the LSP server used (if available) */
    server?: string;
    /** Formatted diagnostic messages */
    messages: string[];
    /** Summary string (e.g., "2 error(s), 1 warning(s)") */
    summary: string;
    /** Whether there are any errors (severity 1) */
    errored: boolean;
    /** Whether the file was formatted */
    formatter?: FileFormatResult;
}
/** Outcome of automatic file formatting. */
export declare enum FileFormatResult {
    UNCHANGED = "unchanged",
    FORMATTED = "formatted",
    FAILED = "failed",
    UNSUPPORTED = "unsupported"
}
export declare function renderCall(args: LspParams, _options: RenderResultOptions, theme: Theme): Text;
/**
 * Render LSP tool result with intelligent formatting based on result type.
 * Detects hover, diagnostics, references, symbols, etc. and formats accordingly.
 */
export declare function renderResult(result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: LspToolDetails;
    isError?: boolean;
}, options: RenderResultOptions, theme: Theme, args?: LspParams): Component;
/** Render LSP requests and responses in the transcript. */
export declare const lspToolRenderer: {
    renderCall: typeof renderCall;
    renderResult: typeof renderResult;
    describeCall(args: LspParams): NativeToolView;
    describeResult(result: ToolRenderResult<LspToolDetails>, _options: RenderResultOptions, args?: LspParams): NativeToolView | undefined;
    mergeCallAndResult: true;
    inline: true;
};
