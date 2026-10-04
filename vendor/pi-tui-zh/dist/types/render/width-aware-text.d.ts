import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/**
 * Text whose content is (re)formatted against the actual render width.
 *
 * A plain `Text` receives an already-formatted string and only wraps it at
 * render time, so width-dependent layout (per-line truncation, inline previews)
 * has to be decided before the width is known. Renderers used to cope by
 * hard-capping output lines at a fixed column count (e.g. 80), which truncated
 * to roughly a third of a wide terminal. This defers formatting to
 * `render(width)`: it computes the same content width the inner `Text` uses
 * (mirroring its tight-layout flag so the budget can't desync), hands that to
 * the formatter, and delegates margins/background/vertical padding to the inner
 * `Text`. Lines the formatter caps at `contentWidth` fit exactly and so never
 * wrap.
 */
export declare class WidthAwareText implements Component {
    #private;
    constructor(format: (contentWidth: number) => string, paddingX?: number, paddingY?: number);
    setCustomBgFn(customBgFn?: (text: string) => string): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    /**
     * Re-run the formatter on the next render because its inputs changed.
     * Unlike {@link invalidate}, the inner `Text` keeps its wrap cache, so a
     * reformat that yields the same string skips re-wrapping and re-tinting.
     */
    reformat(): void;
    /**
     * The inner `Text` as the only child, fed the formatter's output. The
     * formatter is width-bound by contract, so it runs once per surface width
     * (the only width a describer knows) and again on `reformat()`.
     */
    describe(cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
