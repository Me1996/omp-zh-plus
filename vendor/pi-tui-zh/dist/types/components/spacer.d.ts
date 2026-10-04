import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** Terminal spacing step for a count of blank rows. */
export declare function spaceForRows(rows: number): "none" | "sm" | "md" | "lg";
/**
 * Spacer component that renders empty lines
 */
export declare class Spacer implements Component {
    #private;
    constructor(lines?: number);
    /** Return the spacer height for debug inspection. */
    debugState(): Record<string, unknown>;
    setLines(lines: number): void;
    invalidate(): void;
    describe(_cx: DescribeContext): NativeNode;
    render(_width: number): readonly string[];
}
