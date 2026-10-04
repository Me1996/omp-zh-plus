import type { MouseRoutable, SgrMouseEvent } from "../../mouse.js";
import type { DescribeContext, NativeNode } from "../../native/node.js";
import type { Component } from "../../tui.js";
import { type LayoutAlignment, type LayoutContent, type LayoutDecoration, type LayoutRect } from "./geometry.js";
/** Pane selected when a split collapses below its width constraints. */
export type PaneSide = "left" | "right";
/** Fixed or proportional sizing constraints for the left pane. */
export interface SplitPaneSize {
    fixed?: number;
    ratio?: number;
    min?: number;
    max?: number;
}
/** Construction options for {@link SplitPane}. */
export interface SplitPaneOptions {
    left: LayoutContent;
    right: LayoutContent;
    leftSize?: SplitPaneSize;
    rightMinWidth?: number;
    splitAt?: number;
    narrowPane?: PaneSide;
    height?: number;
    prefix?: LayoutDecoration;
    divider?: LayoutDecoration;
    suffix?: LayoutDecoration;
    align?: LayoutAlignment;
}
/** Resolved pane mode and local rectangles for a width. */
export interface SplitPaneGeometry {
    mode: "split" | "narrow";
    left?: LayoutRect;
    right?: LayoutRect;
    dividerCol?: number;
}
/** A pane hit translated into the pane child's local coordinates. */
export interface SplitPaneHit {
    pane: PaneSide;
    content: LayoutContent;
    line: number;
    col: number;
    rect: LayoutRect;
}
/**
 * Adaptive two-pane layout over {@link Row}. It owns width bounds, an optional
 * narrow fallback, exact height budgets, and pane-local mouse translation.
 */
export declare class SplitPane implements Component, MouseRoutable {
    #private;
    constructor(options: SplitPaneOptions);
    /** Concrete pane children exposed to the debug tree. */
    get debugChildren(): readonly Component[];
    /** Mode used by the last render. */
    get mode(): "split" | "narrow";
    /** Left-pane content width from the last render. */
    get leftWidth(): number;
    /** Right-pane content width from the last render. */
    get rightWidth(): number;
    /** Column where the divider begins in the last split render. */
    get dividerCol(): number | undefined;
    /** Set the exact pane row budget, or clear it to use natural height. */
    setHeight(height: number | undefined): void;
    /** Change which pane is shown in narrow mode; `undefined` disables collapse. */
    setNarrowPane(pane: PaneSide | undefined): void;
    /** Update fixed/proportional left-pane constraints. */
    setLeftSize(size: SplitPaneSize): void;
    /** Update the minimum width at which both panes may be shown. */
    setSplitAt(width: number): void;
    /** Update the minimum content width reserved for the right pane. */
    setRightMinWidth(width: number): void;
    /** Update outer and divider decorations. */
    setDecorations(prefix: LayoutDecoration | undefined, divider: LayoutDecoration | undefined, suffix: LayoutDecoration | undefined): void;
    /** Resolve split/narrow geometry without rendering either pane. */
    measure(width: number): SplitPaneGeometry;
    /**
     * Two flex slots in a `row`: the left pane fixed (`ch`) or a fraction of
     * the width within its bounds, the right pane growing from its minimum.
     * With a narrow pane configured the row may wrap, stacking the panes on
     * narrow terminals instead of hiding one.
     */
    describe(_cx: DescribeContext): NativeNode;
    /** Translate a split-local point into pane-local coordinates. */
    locate(line: number, col: number): SplitPaneHit | undefined;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
    render(width: number): readonly string[];
}
