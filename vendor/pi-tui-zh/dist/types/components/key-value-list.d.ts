import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** One label/value entry in a {@link KeyValueList}. */
export interface KeyValueRow {
    readonly label: string;
    readonly value: string;
    readonly labelStyle?: (text: string) => string;
    readonly valueStyle?: (text: string) => string;
}
/** Explicit sizing and wrapping policy for a key/value list. */
export interface KeyValueListOptions {
    readonly indent?: string;
    readonly labelWidth: number;
    readonly gap?: string;
    readonly minValueWidth?: number;
    readonly labelOverflow?: "allow" | "truncate";
}
/** A bounded ANSI-aware label/value list with replaceable rows and aligned wrapped continuations. */
export declare class KeyValueList implements Component {
    #private;
    constructor(rows: readonly KeyValueRow[], options: KeyValueListOptions);
    setRows(rows: readonly KeyValueRow[]): boolean;
    invalidate(): void;
    /** An aligned `kv` grid; label width and value wrapping are the terminal's. */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
