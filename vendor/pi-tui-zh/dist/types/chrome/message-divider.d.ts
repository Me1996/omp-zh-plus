import type { Component } from "../tui.js";
import { type ThemeColor } from "../theme/index.js";
import type { NativeNode } from "../native/node.js";
/** Presentation policy for a compact message divider. */
export interface MessageDividerOptions {
    /** Theme-aware label, recomputed after invalidation. */
    readonly label: () => string;
    readonly labelColor: ThemeColor;
    readonly ruleColor?: ThemeColor;
    readonly ruleWidth?: number;
    /** Preserve an intentionally untruncated legacy label at very narrow widths. */
    readonly truncateWhenNarrow?: boolean;
    /** Semantic role of the native node. */
    readonly role?: string;
    /**
     * Draw as an inline notice (this named icon and a one-line label without
     * the leading glyph) instead of a labelled rule.
     */
    readonly native?: {
        readonly icon: string;
        readonly label: () => string;
    };
}
/**
 * A short left-aligned rule and label surrounded by blank transcript rows.
 * Rendered rows are cached by width and stay reference-stable until invalidated.
 */
export declare class MessageDividerComponent implements Component {
    #private;
    constructor(options: MessageDividerOptions);
    invalidate(): void;
    /** An inline notice, else a labelled `rule`; the label is theme-aware, so it rebuilds on theme changes. */
    describe(): NativeNode;
    render(width: number): readonly string[];
}
