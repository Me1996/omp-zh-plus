/**
 * Inclusive line range describing one selector segment (e.g. `50-100`,
 * `301-`, or `50+10`). `endLine` is `undefined` for open-ended ranges.
 */
export interface LineRange {
    startLine: number;
    endLine: number | undefined;
}
/** Shared line-range grammar for selector recognition and parsing. */
export declare const LINE_RANGE_CHUNK_SOURCE: string;
/** Parse a single `N`, `N-M`, `N-`, `N+K`, or `..`-aliased (`N..M`, `N..`) chunk. Throws via {@link ToolError} on invalid bounds. */
export declare function parseLineRangeChunk(sel: string): LineRange | null;
/**
 * Parse a comma-separated list of line ranges (e.g. `5-16,960-973` or `19,59`). Returns
 * the ranges in ascending order with overlapping/adjacent ranges merged so
 * downstream consumers can stream the file in a single forward pass per range.
 */
export declare function parseLineRanges(sel: string): [LineRange, ...LineRange[]] | null;
/**
 * Extract the line-range component from a read-tool selector that may also
 * carry a verbatim/index display mode (`raw`, `conflicts`) — alone or compounded
 * with a range (`raw:50-100`, `50-100:raw`). Returns the parsed ranges when the
 * selector names any, otherwise `undefined` (pure `raw`/`conflicts`/none).
 *
 * Used by content search, which honors line ranges as a match filter but has no
 * use for verbatim/conflict display modes — so those selectors are accepted and
 * treated as an unfiltered, whole-resource search rather than rejected.
 */
export declare function selectorLineRanges(sel: string | undefined): [LineRange, ...LineRange[]] | undefined;
