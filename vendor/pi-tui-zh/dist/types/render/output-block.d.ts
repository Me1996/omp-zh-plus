/**
 * Bordered output container with optional header and sections.
 */
import type { TspCardStatus, TspPreview, TspText, TspTone } from "@oh-my-pi/pi-wire";
import type { NativeChild, NativeNode } from "../native/node.js";
import type { Theme, ThemeColor } from "../theme/theme.js";
import type { Component } from "../tui.js";
import type { State } from "./types.js";
/** Sections and presentation options for a bordered output block. */
export interface OutputBlockOptions {
    header?: string;
    headerMeta?: string;
    state?: State;
    sections?: Array<{
        label?: string;
        lines: readonly string[];
        separator?: boolean;
    }>;
    width: number;
    applyBg?: boolean;
    contentPaddingLeft?: number;
    contentPaddingRight?: number;
    /** Override the state-derived border color. Used for muted "legacy" tool
     * frames that should not visually compete with framed-output tools. */
    borderColor?: ThemeColor;
}
declare const FRAMED_BLOCK_COMPONENT: unique symbol;
/** A component marked as rendering its own output frame. */
export type FramedBlockComponent = Component & {
    [FRAMED_BLOCK_COMPONENT]?: true;
};
/** Mark a component as owning its output frame. */
export declare function markFramedBlockComponent<T extends Component>(component: T): T & FramedBlockComponent;
/** Return whether a component owns its output frame. */
export declare function isFramedBlockComponent(component: Component): boolean;
/**
 * Inner content width that {@link renderOutputBlock} wraps its body to, for a
 * given outer `width`: both vertical borders plus symmetric content padding.
 * An explicit left padding of zero keeps legacy flush blocks flush on both
 * sides unless a right padding is provided separately.
 */
export declare function outputBlockContentWidth(width: number, contentPaddingLeft?: number, contentPaddingRight?: number): number;
/** Render a bordered output block with optional header and sections. */
export declare function renderOutputBlock(options: OutputBlockOptions, theme: Theme): string[];
/** Card tone for an output state. */
export declare function outputStateTone(state: State | undefined): TspTone;
/** Card status chip for an output state. */
export declare function outputStateStatus(state: State | undefined): TspCardStatus | undefined;
/** One body section of a native output block. */
export interface NativeOutputBlockSection {
    /** Titled sub-section (the ANSI path's labelled separator bar). */
    label?: TspText;
    body: readonly NativeChild[];
    /** Divide from the previous section with a rule. */
    separator?: boolean;
    /** Stable identity when sections come and go. */
    key?: string;
}
/** Semantic inputs for {@link describeOutputBlock}. */
export interface NativeOutputBlockOptions {
    head?: TspText;
    meta?: TspText;
    state?: State;
    /** Card role (`omp.tool.bash`, `omp.eval.cell`, …). Defaults to `omp.output`. */
    role?: string;
    /** Override the state-derived tone (the ANSI path's `borderColor`). */
    tone?: TspTone;
    sections?: readonly NativeOutputBlockSection[];
    collapsible?: boolean;
    collapsed?: boolean;
    preview?: TspPreview;
    /** Flat card without a ring (inline/plain variants). */
    inset?: boolean;
    key?: string;
}
/**
 * The native form of {@link renderOutputBlock}: a `card` whose tone and
 * status chip come from the state, head from the header plus meta, and body
 * from the sections (labelled ones as `section`s, separators as `rule`s).
 * Borders, background fills and wrapping are the terminal's.
 */
export declare function describeOutputBlock(options: NativeOutputBlockOptions): NativeNode;
/**
 * Cached wrapper around `renderOutputBlock`.
 *
 * Since output blocks are re-rendered on every frame (via `render(width)` closures),
 * but their content rarely changes, this cache avoids redundant `visibleWidth()` and
 * `padding()` computations on ~99% of render calls.
 */
export declare class CachedOutputBlock {
    #private;
    /** Render with caching. Returns the cached (shared, caller-immutable) lines if options haven't changed. */
    render(options: OutputBlockOptions, theme: Theme): readonly string[];
    /** Invalidate the cache, forcing a rebuild on next render. */
    invalidate(): void;
}
export {};
