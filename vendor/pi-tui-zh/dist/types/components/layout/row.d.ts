import type { MouseRoutable, SgrMouseEvent } from "../../mouse.js";
import type { DescribeContext, NativeNode } from "../../native/node.js";
import type { Component } from "../../tui.js";
import { type LayoutAlignment, type LayoutContent, type LayoutDecoration, type LayoutInsets, type LayoutRect } from "./geometry.js";
/** One child and its horizontal sizing and alignment constraints. */
export interface RowChild {
    content: LayoutContent;
    width?: number;
    grow?: number;
    minWidth?: number;
    maxWidth?: number;
    padding?: LayoutInsets;
    align?: LayoutAlignment;
}
/** Construction options for {@link Row}. */
export interface RowOptions {
    children: readonly RowChild[];
    height?: number;
    gap?: LayoutDecoration;
    prefix?: LayoutDecoration;
    suffix?: LayoutDecoration;
    align?: LayoutAlignment;
}
/** A child hit translated into that child's local coordinates. */
export interface RowHit {
    index: number;
    content: LayoutContent;
    line: number;
    col: number;
    rect: LayoutRect;
}
/**
 * Horizontal component layout with fixed/proportional slots, exact row budgets,
 * ANSI-aware clipping, alignment, and local mouse-coordinate translation.
 */
export declare class Row implements Component, MouseRoutable {
    #private;
    constructor(options: RowOptions);
    /** Concrete component children exposed to the debug tree. */
    get debugChildren(): readonly Component[];
    /** Last-rendered content rectangle for `index`, excluding its padding. */
    childRect(index: number): LayoutRect | undefined;
    /** Replace the row's children without recreating the layout component. */
    setChildren(children: readonly RowChild[]): void;
    /** Set the exact rendered row count, or clear it to use natural height. */
    setHeight(height: number | undefined): void;
    /** Update outer and inter-child decorations. */
    setDecorations(prefix: LayoutDecoration | undefined, gap: LayoutDecoration | undefined, suffix: LayoutDecoration | undefined): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
    /**
     * A flex `row`: each child sits in a slot carrying its width bounds
     * (fixed → min = max `ch`, else grow/min/max). Decorations become gap
     * spacing; clipping and the exact row budget are the terminal's.
     */
    describe(_cx: DescribeContext): NativeNode;
    /** Translate a row-local point into a child's local coordinates. */
    locate(line: number, col: number): RowHit | undefined;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    render(width: number): readonly string[];
}
