import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Theme } from "../theme/theme.js";
import type { Component } from "../tui.js";
/** Which side of an output stream remains visible when the pane is capped. */
export type OutputPaneEdge = "head" | "tail";
/** Inputs for the shared output capping and styling algorithm. */
export interface OutputPaneFormatOptions {
    lines: readonly string[];
    expanded: boolean;
    collapsedMaxLines: number;
    expandedMaxLines?: number;
    edge?: OutputPaneEdge;
    /** Apply the cap after terminal-width wrapping instead of to logical rows. */
    visual?: boolean;
    /** Content width used by visual capping. Required when `visual` is true. */
    width?: number;
    styleLine?: (line: string, index: number) => string;
    /** Keep sixel payload rows byte-for-byte and show the complete payload. */
    uncapSixel?: boolean;
    showHiddenMarker?: boolean;
    showExpandHint?: boolean;
    showExpandHintWhenUncapped?: boolean;
    formatHidden?: (hidden: number, shown: number, total: number, edge: OutputPaneEdge) => string;
}
/** Result of formatting one bounded output pane. */
export interface OutputPaneFormatResult {
    lines: readonly string[];
    hiddenCount: number;
    hasSixel: boolean;
}
/**
 * Split terminal text without allowing carriage-return progress updates to
 * corrupt following TUI rows. The final segment after a bare CR wins, matching
 * a terminal cursor-return overwrite.
 */
export declare function splitTerminalOutputLines(text: string): string[];
/**
 * Style and cap output rows for code cells, tool cards, and live execution
 * panes. Sixel rows are never styled or split; with `uncapSixel`, the complete
 * payload is retained so terminal image protocols remain valid.
 */
export declare function formatOutputPaneLines(options: OutputPaneFormatOptions, theme: Theme): OutputPaneFormatResult;
/** Display policy for {@link describeOutputLines}. */
export interface NativeOutputOptions {
    expanded: boolean;
    collapsedMaxLines: number;
    expandedMaxLines?: number;
    edge?: OutputPaneEdge;
    key?: string;
}
/**
 * Raw output rows as a native `ansi` mini-terminal: the terminal wraps and
 * styles them. The row cap becomes a `preview` clamp (with its own "N more"
 * affordance); a tail edge follows the stream.
 */
export declare function describeOutputLines(lines: readonly string[], options: NativeOutputOptions): NativeNode;
/** Mutable options for a live {@link OutputPane}. */
export interface OutputPaneOptions extends Omit<OutputPaneFormatOptions, "lines"> {
    paddingX?: number;
    leadingBlank?: boolean;
    maxStoredLines?: number;
    /** Normalize each logical row before it enters the retained stream. */
    normalizeLine?: (line: string) => string;
}
/**
 * Stateful, cached output viewport. Streaming callers append chunks while
 * settled callers may replace all rows. Unchanged renders preserve array
 * identity through the inner Text cache.
 */
export declare class OutputPane implements Component {
    #private;
    constructor(theme: Theme, options: OutputPaneOptions, text?: string);
    /** Replace the complete output snapshot. */
    setText(text: string): void;
    /** Replace the complete output snapshot with caller-owned immutable rows. */
    setLines(lines: readonly string[]): void;
    /**
     * Append a streaming chunk. Bare CR overwrites the current logical row;
     * a CRLF split across chunks remains a newline, so chunked and whole-text
     * ingestion produce the same settled rows.
     */
    append(chunk: string): void;
    /** Settle a trailing bare carriage return once no later LF can pair with it. */
    finish(): void;
    /** Update presentation without replacing streamed content. */
    configure(options: Partial<OutputPaneOptions>): void;
    setExpanded(expanded: boolean): void;
    get lineCount(): number;
    get hasSixel(): boolean;
    getText(): string;
    /** The retained rows as an `ansi` node; streamed appends grow its text, so the reconciler sends `text append`. */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
    invalidate(): void;
}
/** Default styling for plain tool output while preserving existing ANSI. */
export declare function styleToolOutputLine(line: string, theme: Theme): string;
