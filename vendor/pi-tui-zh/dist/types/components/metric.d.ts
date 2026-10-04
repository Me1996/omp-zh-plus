import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** One preformatted metric. Domain-specific number, cost, and quota policy stays with the caller. */
export interface MetricSpec {
    /** Undefined omits the metric; an empty string and zero-like strings remain observable values. */
    readonly value: string | undefined;
    /** Optional icon or label placed before the value. */
    readonly leading?: string;
    /** Separator between `leading` and `value`. */
    readonly separator?: string;
    /** Higher-priority metrics survive first when a row uses `drop` overflow. */
    readonly priority?: number;
    /** Render-time styling for the complete metric. */
    readonly style?: (text: string) => string;
}
/** Width behavior for an inline metric row. */
export type MetricOverflow = "allow" | "drop" | "truncate" | "wrap";
/** Presentation options shared by {@link formatMetricRow} and {@link MetricRow}. */
export interface MetricRowOptions {
    readonly separator?: string;
    readonly overflow?: MetricOverflow;
    readonly maxWidth?: number;
    readonly paddingX?: number;
    readonly paddingY?: number;
    readonly style?: (text: string) => string;
}
/** Format one metric without imposing domain-specific value policy. */
export declare function formatMetric(metric: MetricSpec): string | undefined;
/**
 * Join metrics in declaration order. `drop` removes the lowest-priority metric
 * first (rightmost on ties); `truncate` clips the complete row. `wrap` is
 * applied by {@link MetricRow}, where the component owns the available width.
 */
export declare function formatMetricRow(metrics: readonly MetricSpec[], options?: MetricRowOptions): string;
/**
 * Component form of an inline metric row. It delegates ANSI-aware wrapping,
 * padding, theme invalidation, and stable unchanged-render arrays to {@link Text}.
 */
export declare class MetricRow implements Component {
    #private;
    constructor(metrics: readonly MetricSpec[], options?: MetricRowOptions);
    setMetrics(metrics: readonly MetricSpec[]): boolean;
    invalidate(): void;
    /**
     * `drop` overflow becomes a transparent `status` strip whose segments keep
     * the metric priorities (the terminal drops the lowest first); the other
     * modes are one text run that wraps or truncates.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
