import type { Component } from "../tui.js";
import { type ScrollRangeAnchor } from "../components/scroll-view.js";
import { type ComposedColumn, type OutlineStyle, type OutlineTarget } from "./transcript-outline.js";
/** Logical body rows and optional selection supplied by a transcript browser controller. */
export interface TranscriptBrowserBody {
    lines: readonly string[];
    anchor?: ScrollRangeAnchor;
}
/** One complete browser frame. Header and footer rows are inset by one column. */
export interface TranscriptBrowserFrame {
    header: readonly string[];
    body: TranscriptBrowserBody;
    footer: readonly string[];
}
/** Widths available while composing a transcript browser frame. */
export interface TranscriptBrowserRenderContext {
    /** Width passed to {@link TranscriptBrowser.render}. */
    frameWidth: number;
    /** Stable transcript width, reserving the final column for an automatic scrollbar. */
    contentWidth: number;
    /** Width for inset header/footer children such as an editor. */
    chromeWidth: number;
}
/** Construction options for the shared transcript browser viewport and frame. */
export interface TranscriptBrowserOptions {
    /** Explicit height budget supplied by the fullscreen host. */
    getHeight: () => number;
    /** Domain controller which supplies header, body, footer, and optional selection. */
    frame: (context: TranscriptBrowserRenderContext) => TranscriptBrowserFrame;
    /** Preserve the historical three-row minimum used by transcript overlays. */
    minimumBodyRows?: number;
    /** Start in append-follow mode; manual scrolling updates the mode automatically. */
    followBottom?: boolean;
}
/** Prepared transcript rows, visibility, and nearest valid selection. */
export interface PreparedTranscriptOutline {
    childRows: Array<readonly string[]>;
    visible: boolean[];
    selected: number;
}
/** Options for composing the standard single-column dotted transcript outline. */
export interface TranscriptOutlineComposition {
    children: readonly Component[];
    targets: readonly OutlineTarget[];
    selected: number;
    columnWidth: number;
    /** Reuse rows already prepared for custom branch/block composition in the same frame. */
    prepared?: PreparedTranscriptOutline;
    from?: number;
    to?: number;
    header?: string[];
    style?: OutlineStyle;
}
/** Nearest visible target, preferring the preceding item just like the legacy selectors. */
export declare function nearestVisibleOutlineTarget(visible: readonly boolean[], selected: number): number;
/**
 * Shared framed viewport for transcript browsers.
 *
 * Domain controllers retain loading, actions, and branch/block presentation;
 * this component owns outline row caching, frame sizing, scroll state,
 * selection anchoring, append-follow behavior, and frame-to-body coordinates.
 */
export declare class TranscriptBrowser implements Component {
    #private;
    readonly debugChildren: readonly Component[];
    constructor(options: TranscriptBrowserOptions);
    invalidate(): void;
    /** Prompt-zone-safe rendered rows for outline composition at `columnWidth`. */
    renderOutlineRows(children: readonly Component[], columnWidth: number): Array<readonly string[]>;
    /** Compute target visibility and snap a collapsed selection to the nearest rendered item. */
    prepareOutline(children: readonly Component[], targets: readonly OutlineTarget[], selected: number, columnWidth: number): PreparedTranscriptOutline;
    /** Compose the standard single-column outline using the browser-owned row cache. */
    composeOutline(options: TranscriptOutlineComposition): PreparedTranscriptOutline & {
        column: ComposedColumn;
    };
    /** Scroll logical body rows. Returns whether the offset changed. */
    scroll(delta: number): boolean;
    /** Apply the ScrollView navigation key set. */
    handleScrollKey(data: string): boolean;
    scrollToTop(): void;
    scrollToBottom(): void;
    /** Whether an anchor identity has successfully been applied to the viewport. */
    hasAnchored(id: string): boolean;
    /**
     * Translate a 0-based frame mouse point into the logical, scrolled body.
     * Returns undefined for borders, header/footer rows, and unpainted body rows.
     */
    toContentPoint(frameRow: number, frameCol: number): {
        row: number;
        col: number;
    } | undefined;
    render(width: number): readonly string[];
}
