export type ViewportAlignment = "nearest" | "start" | "center" | "end";
export interface ViewportRange {
    /** First visible logical row. */
    start: number;
    /** Exclusive end of the visible logical rows. */
    end: number;
}
export interface ScrollbarThumbRange {
    /** First local viewport row occupied by the thumb. */
    start: number;
    /** Exclusive end of the thumb. */
    end: number;
}
export interface CursorColumnWindow {
    /** Visible source slice. */
    text: string;
    /** First visible terminal column in the source. */
    startColumn: number;
    /** UTF-16 index of the cursor within {@link text}. */
    cursorIndex: number;
}
/** Maximum legal row offset for a bounded viewport. */
export declare function maxScrollOffset(totalRows: number, viewportRows: number): number;
/** Clamp a row offset to the bounds of a viewport. */
export declare function clampScrollOffset(offset: number, totalRows: number, viewportRows: number): number;
/** Logical half-open row range visible at an offset. */
export declare function viewportRange(totalRows: number, viewportRows: number, offset: number): ViewportRange;
/** Whether the logical row set is taller than its viewport. */
export declare function viewportOverflows(totalRows: number, viewportRows: number): boolean;
/**
 * Offset that keeps `row` visible, optionally aligning it to a viewport edge
 * or center. `nearest` preserves the current offset while the row is visible.
 */
export declare function scrollOffsetForRow(currentOffset: number, row: number, totalRows: number, viewportRows: number, alignment?: ViewportAlignment): number;
/** Selection-centered logical row window. */
export declare function centeredViewportRange(selectedRow: number, totalRows: number, viewportRows: number): ViewportRange;
/**
 * Scrollbar thumb geometry shared by standalone viewports and embedded border
 * renderers. The returned rows are local to the viewport.
 */
export declare function scrollbarThumbRange(viewportRows: number, totalRows: number, scrollOffset: number): ScrollbarThumbRange;
/**
 * Horizontally window a single rendered line around its cursor. Grapheme width
 * is respected, including a wide cursor cell at the right edge.
 */
export declare function cursorColumnWindow(text: string, cursorIndex: number, width: number): CursorColumnWindow;
