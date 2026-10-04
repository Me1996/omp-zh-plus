import type { MouseRoutable, SgrMouseEvent } from "../../mouse.js";
import type { DescribeContext, NativeNode } from "../../native/node.js";
import type { Component } from "../../tui.js";
import { type LayoutAlignment, type LayoutContent, type LayoutInsets, type LayoutRect } from "./geometry.js";
/** One child and its vertical row-budget constraints. */
export interface StackChild {
    content: LayoutContent;
    height?: number;
    grow?: number;
    minHeight?: number;
    maxHeight?: number;
    padding?: LayoutInsets;
    align?: LayoutAlignment;
}
/** Construction options for {@link Stack}. */
export interface StackOptions {
    children: readonly StackChild[];
    height?: number;
    align?: LayoutAlignment;
}
/** A stack hit translated into the child's local coordinates. */
export interface StackHit {
    index: number;
    content: LayoutContent;
    line: number;
    col: number;
    rect: LayoutRect;
}
/**
 * Vertical component layout with fixed and growing regions, exact height
 * budgets, ANSI-aware clipping, padding, and local mouse translation.
 */
export declare class Stack implements Component, MouseRoutable {
    #private;
    constructor(options: StackOptions);
    /** Concrete component children exposed to the debug tree. */
    get debugChildren(): readonly Component[];
    /** Last-rendered content rectangle for `index`, excluding its padding. */
    childRect(index: number): LayoutRect | undefined;
    /** Replace the stack's children without recreating the layout component. */
    setChildren(children: readonly StackChild[]): void;
    /** Set the exact total row budget, or clear it to use natural height. */
    setHeight(height: number | undefined): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
    /**
     * A `col` of slots carrying each child's height bounds (fixed → min = max
     * `lines`, else grow/min/max); an exact stack height bounds the column.
     */
    describe(_cx: DescribeContext): NativeNode;
    /** Translate a stack-local point into a child's local coordinates. */
    locate(line: number, col: number): StackHit | undefined;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    render(width: number): readonly string[];
}
