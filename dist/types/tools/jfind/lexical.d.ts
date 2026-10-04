/**
 * Lexical prior: per-file keyword occurrence counts from one native grep pass,
 * turned into IDF weights and a file score that ranks candidates before any
 * judgment is spent.
 */
import * as natives from "@oh-my-pi/pi-natives";
export interface GrepIndex {
    /** Lowercased, non-empty keywords; `perFileKw` vectors align with this. */
    keywords: string[];
    /** rel file path → per-keyword occurrence counts over matching lines. */
    perFileKw: Map<string, number[]>;
    /** Files the walk offered for scanning, including oversized ones. */
    filesScanned: number;
}
export interface GrepIndexOptions {
    includeHidden: boolean;
    /** Filesystem URL roots and their entries resolve through. */
    filesystem: natives.ShellFilesystem;
    signal?: AbortSignal;
    timeoutMs?: number;
}
/**
 * Count keyword occurrences (case-insensitive, any keyword) in every file under
 * `root`, keyed like `FileEntry.rel`: root-relative, or a file root's own
 * path. Only lines containing a keyword are inspected, so counts are per
 * matching line rather than per file byte. Matching lines stream from the
 * native scan and are folded into counts as they arrive, so memory stays
 * bounded by the batches in flight however many lines match.
 */
export declare function grepIndex(root: string, rawKeywords: readonly string[], options: GrepIndexOptions): Promise<GrepIndex>;
/**
 * Inverse document frequency per keyword, clamped to `[0.5, 6]`: rarity is
 * capped so a word occurring once in a test fixture cannot beat an
 * implementation that contains several query concepts repeatedly.
 */
export declare function idf(index: GrepIndex): number[];
/**
 * Lexical rank of a file: rare query terms count more, log-scaled frequency
 * keeps common words in a giant file from overwhelming a compact
 * implementation with several terms, and a keyword in the path is worth two
 * extra log-units.
 */
export declare function fileScore(counts: readonly number[], weights: readonly number[], rel: string, keywords: readonly string[]): number;
