import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
import { Ellipsis } from "../utils.js";
import { type ViewportAlignment } from "./scroll-viewport.js";
type ScrollbarMode = "auto" | "always" | "never";
export type ScrollAnchor = "start" | "end";
export interface ScrollViewTheme {
    track?: (text: string) => string;
    thumb?: (text: string) => string;
}
export interface ScrollViewOptions {
    height: number;
    /** Defaults to "auto". "auto" reserves a scrollbar column only when content overflows. */
    scrollbar?: ScrollbarMode | boolean;
    /** Logical row count for pre-windowed line slices. Defaults to the rendered content row count. */
    totalRows?: number;
    theme?: ScrollViewTheme;
    trackChar?: string;
    thumbChar?: string;
    /**
     * Indicator appended when a row overflows `contentWidth`. Defaults to
     * {@link Ellipsis.Unicode}. Pass {@link Ellipsis.Omit} when callers wrap
     * lines to width themselves and only trailing padding can overflow.
     */
    ellipsis?: Ellipsis;
    /** Rows moved by Shift+Arrow in {@link ScrollView.handleScrollKey}. Defaults to 5. */
    fastScrollLines?: number;
    /** Follow newly appended rows while the viewport was already at its tail. */
    followTail?: boolean;
    /** Preserve either the leading row or the distance from the tail across content/height changes. */
    anchor?: ScrollAnchor;
}
/** A selected logical range revealed once or whenever its geometry changes. */
export interface ScrollRangeAnchor {
    id: string;
    start: number;
    end: number;
    margin?: number;
    alignment?: ViewportAlignment;
    mode?: "selection" | "once";
    /** Prefer the leading edge when the selected range fills more than the viewport. */
    oversized?: "nearest" | "start";
}
/**
 * Fixed-height viewport over supplied rows or a lazily rendered child.
 *
 * Without `totalRows`, content is a complete row buffer and ScrollView slices
 * it at its own offset. With `totalRows`, content is an already-windowed slice:
 * the offset remains logical (for thumb and hit mapping), while local row zero
 * is rendered from content row zero.
 */
export declare class ScrollView implements Component {
    #private;
    constructor(content: readonly string[] | Component, options: ScrollViewOptions);
    /** Child exposed for debug-tree traversal when the viewport wraps a component. */
    get debugChildren(): readonly Component[];
    /** Return viewport, content, and scroll position state for debug inspection. */
    debugState(): Record<string, unknown>;
    setLines(lines: readonly string[]): void;
    /** Replace the supplied rows with a lazily rendered child component. */
    setChild(child: Component): void;
    setTotalRows(totalRows: number | undefined): void;
    setHeight(height: number): void;
    setScrollbar(scrollbar: ScrollViewOptions["scrollbar"]): void;
    setFollowTail(followTail: boolean): void;
    setAnchor(anchor: ScrollAnchor): void;
    getScrollOffset(): number;
    getMaxScrollOffset(): number;
    /** Current half-open logical row range. */
    getVisibleRange(): {
        start: number;
        end: number;
    };
    /** Map a local viewport row to its logical content row. */
    logicalRowAt(localRow: number): number | undefined;
    /** Map a visible logical content row to its local viewport row. */
    localRowFor(logicalRow: number): number | undefined;
    setScrollOffset(offset: number): void;
    /** Keep a logical row visible now and through subsequent resize/content changes. */
    setActiveRow(row: number | undefined, alignment?: ViewportAlignment): void;
    /** Whether a keyed range has already been revealed successfully. */
    hasRevealedRange(id: string): boolean;
    /**
     * Reveal a changed selection without snapping manual scrolling back on
     * unchanged renders. Passing undefined forgets the previous range.
     */
    revealRange(anchor: ScrollRangeAnchor | undefined, width: number): boolean;
    scroll(delta: number): void;
    page(delta: number): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    /** Apply Arrow, Shift+Arrow, Page, Home, and End navigation keys. */
    handleScrollKey(data: string): boolean;
    invalidate(): void;
    /** Permanently release a wrapped child's timers, subscriptions, and other resources. */
    dispose(): void;
    /**
     * The whole content in a `col` capped at the viewport height: the
     * terminal scrolls it natively and draws its own scrollbar.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
export {};
