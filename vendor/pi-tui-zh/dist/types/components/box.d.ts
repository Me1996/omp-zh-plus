import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** Box-drawing glyphs plus an optional colorizer for an outline drawn around a {@link Box}. */
export interface BoxBorder {
    chars: {
        topLeft: string;
        topRight: string;
        bottomLeft: string;
        bottomRight: string;
        horizontal: string;
        vertical: string;
    };
    color?: (text: string) => string;
}
/**
 * Box component - a container that applies padding and background to all children
 */
export declare class Box implements Component {
    #private;
    children: Component[];
    setIgnoreTight(ignore: boolean): this;
    constructor(paddingX?: number, paddingY?: number, bgFn?: (text: string) => string, border?: BoxBorder);
    /** Return container layout and child-count state for debug inspection. */
    debugState(): Record<string, unknown>;
    addChild(component: Component): void;
    removeChild(component: Component): void;
    clear(): void;
    setPaddingX(paddingX: number): void;
    setPaddingY(paddingY: number): void;
    setBgFn(bgFn?: (text: string) => string): void;
    setBorder(border?: BoxBorder): void;
    invalidate(): void;
    /**
     * A `card` when the box has a border or background: the background token
     * picks tone/role (user message, tool state, selection), a border colour
     * picks the ring tone. A plain `col` otherwise. Padding is the terminal's.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
