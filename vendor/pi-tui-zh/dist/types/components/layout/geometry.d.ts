import type { TspProps, TspSpace } from "@oh-my-pi/pi-wire";
import type { MouseRoutable } from "../../mouse.js";
import type { Component } from "../../tui.js";
/** Alignment within space allocated by a layout component. */
export type LayoutAlignment = "start" | "center" | "end";
/** Insets reserved inside a layout child's allocated rectangle. */
export interface LayoutInsets {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}
/** Insets normalized to finite, non-negative terminal-cell counts. */
export interface NormalizedLayoutInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
/** Rectangle in coordinates local to a layout component. */
export interface LayoutRect {
    row: number;
    col: number;
    width: number;
    height: number;
}
/** Lazy layout child, evaluated only when the child is visible. */
export type LayoutRenderer = (width: number, height: number | undefined) => readonly string[];
/** A concrete component or a lazy renderer used as a layout child. */
export type LayoutContent = Component | LayoutRenderer;
/** Static text or a late-bound layout decoration, useful for theme-colored rules. */
export type LayoutDecoration = string | (() => string);
/** A component whose parent may assign a local row budget before rendering. */
export interface HeightConstrainedComponent extends Component {
    setHeight(height: number | undefined): void;
}
/** One fixed or growing constraint consumed by {@link allocateLayoutSpace}. */
export interface LayoutAllocation {
    fixed?: number;
    grow?: number;
    min?: number;
    max?: number;
}
/**
 * Describe child for layout content: components describe themselves; a lazy
 * row renderer becomes a stable adapter component the native engine renders
 * as a `rows` fallback (it can only produce width-bound rows).
 */
export declare function nativeLayoutChild(content: LayoutContent): Component;
/** Spacing step standing in for a textual gap decoration (the terminal draws no divider glyphs). */
export declare function nativeLayoutGap(decoration: LayoutDecoration | undefined): TspSpace | undefined;
/** Flex props for one layout slot along `axis` (`w` for rows, `h` for stacks). */
export declare function nativeSlotProps(axis: "w" | "h", slot: {
    fixed?: number;
    grow?: number;
    min?: number;
    max?: number;
}): TspProps<"col">;
/** Clamp an external size to a finite, non-negative integer cell count. */
export declare function layoutSize(value: number | undefined, fallback?: number): number;
/** Normalize an optional external size while preserving `undefined`. */
export declare function optionalLayoutSize(value: number | undefined): number | undefined;
/** Clamp a proportional layout input to a finite, non-negative number. */
export declare function layoutRatio(value: number | undefined, fallback: number): number;
/** Resolve static or late-bound layout decoration text. */
export declare function layoutDecorationText(decoration: LayoutDecoration | undefined): string;
/**
 * Allocate bounded integer cells across fixed and growing children. When the
 * minimums cannot fit, later children collapse first so output stays bounded.
 */
export declare function allocateLayoutSpace(items: readonly LayoutAllocation[], available: number): number[];
/** Normalize every inset to a finite, non-negative integer cell count. */
export declare function layoutInsets(insets: LayoutInsets | undefined): NormalizedLayoutInsets;
/** Compare optional inset objects by their normalized terminal geometry. */
export declare function equalLayoutInsets(left: LayoutInsets | undefined, right: LayoutInsets | undefined): boolean;
/** Offset content within spare cells according to an alignment. */
export declare function layoutAlignmentOffset(space: number, alignment: LayoutAlignment): number;
/** Narrow a concrete-or-lazy child to a concrete component. */
export declare function isLayoutComponent(content: LayoutContent): content is Component;
/** Narrow a layout child to a component accepting a row budget. */
export declare function isHeightConstrainedComponent(content: LayoutContent): content is HeightConstrainedComponent;
/** Narrow a layout child to a mouse-routable component. */
export declare function isLayoutMouseRoutable(content: LayoutContent): content is Component & MouseRoutable;
/** Return concrete children once each, preserving their first layout order. */
export declare function uniqueLayoutComponents(contents: readonly LayoutContent[]): readonly Component[];
/** Fit one ANSI-styled row to an exact terminal-cell width. */
export declare function fitLayoutLine(line: string, width: number): string;
/** Render a concrete or lazy child with an optional local height budget. */
export declare function renderLayoutContent(content: LayoutContent, width: number, height: number | undefined): readonly string[];
