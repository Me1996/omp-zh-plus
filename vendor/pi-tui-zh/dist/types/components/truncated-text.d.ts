import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/**
 * Text component that truncates to fit viewport width
 */
export declare class TruncatedText implements Component {
    #private;
    constructor(text: string, paddingX?: number, paddingY?: number);
    /** Return bounded source text and the last-known truncation state. */
    debugState(): Record<string, unknown>;
    invalidate(): void;
    /** First line only, clamped to one visual line with an end ellipsis. */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
