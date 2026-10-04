import type { LineRange } from "@oh-my-pi/pi-tui-zh/tools/line-ranges";
/** Parsed representation of a path-embedded selector. */
export type ParsedSelector = {
    kind: "none";
} | {
    kind: "raw";
} | {
    kind: "conflicts";
} | {
    kind: "image";
} | {
    kind: "lines";
    ranges: [LineRange, ...LineRange[]];
    raw?: boolean;
}
/** `:-N` — the last N lines. Needs the source's line count before it can be sliced. */
 | {
    kind: "tail";
    count: number;
    raw?: boolean;
};
/**
 * A selector whose bounds are absolute — every kind except `tail`. Slicing
 * helpers take this type so a tail selector cannot silently read from the head;
 * callers convert with {@link resolveTailSelector} once the line count is known.
 */
export type ResolvedSelector = Exclude<ParsedSelector, {
    kind: "tail";
}>;
/** Returns true when the selector requested verbatim/raw output (alone or combined with a range). */
export declare function isRawSelector(parsed: ParsedSelector): boolean;
/** Returns true when the selector requested multiple line ranges. */
export declare function isMultiRange(parsed: ParsedSelector): boolean;
/**
 * Pin a `:-N` tail selector to absolute lines against a source of `totalLines`
 * lines; every other selector passes through unchanged. The last N lines become
 * one inclusive range clamped to the source (`totalLines - N + 1` .. `totalLines`),
 * so downstream slicing, context expansion, and out-of-bounds reporting behave
 * exactly as for an explicit `:N-M`.
 */
export declare function resolveTailSelector(parsed: ParsedSelector, totalLines: number): ResolvedSelector;
export declare function parseSel(sel: string | undefined): ParsedSelector;
/**
 * Convert a single-range selector to the offset/limit pair used by internal pagination.
 * Returns the FIRST range only — multi-range callers MUST branch on `isMultiRange` before
 * calling this helper.
 */
export declare function selToOffsetLimit(parsed: ResolvedSelector): {
    offset?: number;
    limit?: number;
};
