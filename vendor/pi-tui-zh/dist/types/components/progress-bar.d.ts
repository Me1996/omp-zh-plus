import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** Explicit glyph and styling policy for a progress bar. */
export interface ProgressBarStyle {
    readonly filled: string;
    readonly empty: string;
    readonly indeterminate?: string;
    readonly styleFilled?: (text: string) => string;
    readonly styleEmpty?: (text: string) => string;
    readonly styleIndeterminate?: (text: string) => string;
    readonly styleBar?: (text: string) => string;
}
/** Layout and labeling policy for a progress bar. */
export interface ProgressBarOptions {
    readonly min?: number;
    readonly max?: number;
    readonly minWidth?: number;
    readonly maxWidth?: number;
    readonly prefix?: string;
    readonly suffix?: string;
    readonly showPercentage?: boolean;
    readonly percentageSeparator?: string;
    readonly formatPercentage?: (fraction: number) => string;
    readonly style: ProgressBarStyle;
}
/** Normalize a progress value to a clamped fraction, preserving undefined as indeterminate. */
export declare function progressFraction(value: number | undefined, min?: number, max?: number): number | undefined;
/** Render a single progress bar line; `width` is the inner bar width before frame and percentage chrome. */
export declare function renderProgressBar(value: number | undefined, width: number, options: ProgressBarOptions): string;
/** Mutable progress component whose `render(width)` bounds the complete framed and labeled line to `width`. */
export declare class ProgressBar implements Component {
    #private;
    constructor(value: number | undefined, options: ProgressBarOptions);
    setValue(value: number | undefined): boolean;
    invalidate(): void;
    /** A native `progress` bar (indeterminate when the value is unknown); prefix, suffix and percentage label it. */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
