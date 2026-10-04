import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** One table cell. Styling is applied after alignment so padding shares the cell style. */
export interface TableCell {
    readonly text: string;
    readonly style?: (text: string) => string;
}
/** Explicit sizing and overflow policy for a table column. */
export interface TableColumn {
    readonly width: number;
    readonly minWidth?: number;
    readonly align: "left" | "right";
    readonly overflow: "allow" | "truncate";
    /** Lower-priority columns shrink before higher-priority columns. */
    readonly priority?: number;
    readonly style?: (text: string) => string;
}
/** Row-layout options shared by table functions and the component. */
export interface TableOptions {
    readonly gap?: string;
    readonly indent?: string;
    readonly fit?: boolean;
}
/** Render one ANSI-aware fixed-column row. */
export declare function renderTableRow(cells: readonly TableCell[], columns: readonly TableColumn[], maxWidth?: number, options?: TableOptions): string;
/** Bounded table component for structured rows with replaceable data and stable unchanged-render arrays. */
export declare class Table implements Component {
    #private;
    constructor(rows: readonly (readonly TableCell[])[], columns: readonly TableColumn[], options?: TableOptions);
    setRows(rows: readonly (readonly TableCell[])[]): boolean;
    invalidate(): void;
    /**
     * A native `table`. Column priorities carry over unchanged (lower gives
     * way first); truncating columns truncate at the end, the rest keep
     * their content. Widths are the terminal's.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
