/**
 * Fuzzy matching utilities.
 *
 * Matching is deliberately word-local for normal words. This keeps a query like
 * "image provider" from matching a long setting description only because the
 * letters i-m-a-g-e appear somewhere in order across unrelated words.
 *
 * Lower score = better match.
 */
export interface FuzzyMatch {
    matches: boolean;
    score: number;
}
export interface FuzzyFilterResult<T> {
    item: T;
    score: number;
}
export declare function fuzzyMatch(query: string, text: string): FuzzyMatch;
/**
 * A text prepared once for repeated fuzzy matching.
 *
 * `fuzzyMatch` builds a search index per call; the module cache only admits
 * texts up to {@link MAX_CACHED_TEXT_LEN}, so long corpora (session or
 * transcript search) rebuild the index on every keystroke — the dominant cost
 * when a selector re-filters a stable candidate list as the user types. Build
 * one `FuzzyText` per candidate and call {@link match} per query instead; the
 * index lives exactly as long as the caller's reference.
 */
export declare class FuzzyText {
    #private;
    constructor(text: string);
    /** Match `query` (space-separated tokens; all must match) against the prepared text. */
    match(query: string): FuzzyMatch;
}
/**
 * Filter and sort items by fuzzy match quality (best matches first).
 * Supports space-separated tokens: all tokens must match.
 */
export declare function fuzzyRank<T>(items: readonly T[], query: string, getText: (item: T) => string): FuzzyFilterResult<T>[];
export declare function fuzzyFilter<T>(items: T[], query: string, getText: (item: T) => string): T[];
/**
 * Clear the fuzzy search-index cache. Intended for tests/benchmarks so a fresh
 * cold-start typing session can be measured on demand; not part of the supported
 * TUI API.
 *
 * @internal
 */
export declare function resetFuzzyIndexCache(): void;
