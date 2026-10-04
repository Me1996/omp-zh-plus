import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/**
 * Text component - displays multi-line text with word wrapping.
 *
 * Foreground colors may be supplied lazily via {@link setStyleFn} instead of
 * baked into `text`: the styler runs at render time, so a caller that
 * invalidates the component on a theme change (see the coding-agent's
 * `onThemeChange` handler) re-resolves the color against the now-active theme
 * rather than replaying the palette active when the component was constructed.
 */
export declare class Text implements Component {
    #private;
    setIgnoreTight(ignore: boolean): this;
    constructor(text?: string, paddingX?: number, paddingY?: number, customBgFn?: (text: string) => string);
    /** Return bounded text and layout state for debug inspection. */
    debugState(): Record<string, unknown>;
    getText(): string;
    setText(text: string): boolean;
    setCustomBgFn(customBgFn?: (text: string) => string): void;
    /**
     * Supply a foreground styler applied to the text at render time (e.g. a
     * theme color resolver). Unlike baking the color into `text`, the styler
     * re-runs on every render, so invalidating the component after a theme
     * change re-resolves the color against the active theme.
     */
    setStyleFn(styleFn?: (text: string) => string): this;
    invalidate(): void;
    /**
     * Wrapped text; styling re-derived from the styled source so a theme swap
     * re-resolves tokens. A background fill becomes the node's tone.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
