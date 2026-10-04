/**
 * Byte-budgeted text primitives shared by the lexical windows, sketches, and
 * file reads. Budgets are UTF-8 bytes (what the judge is billed on), so
 * clipping is always done at a code-point boundary.
 */
import type { InternalUrlFilesystem } from "../../internal-urls/url-filesystem.js";
/** Split like Rust `str::lines`: `\n`-separated, trailing `\r` stripped, no phantom last line after a final newline. */
export declare function lines(text: string): string[];
/** Longest prefix of `text` that fits in `bytes` UTF-8 bytes without splitting a code point. */
export declare function clipBytes(text: string, bytes: number): string;
/** First `count` code points of `text`. */
export declare function takeChars(text: string, count: number): string;
/** Non-overlapping occurrences of `needle` in `haystack`; 0 for an empty needle. */
export declare function countOccurrences(haystack: string, needle: string): number;
export interface ReadText {
    text: string;
    /** Bytes actually used (after trimming to a line boundary). */
    bytes: number;
    truncated: boolean;
}
/** Why a file was not read: not text, nothing in it, or the filesystem said no. */
export type ReadTextFailure = "binary" | "empty" | "io";
export declare class ReadTextError extends Error {
    readonly kind: ReadTextFailure;
    constructor(kind: ReadTextFailure, message: string);
}
/**
 * Read up to `maxBytes` of a text file (host path or internal URL) through
 * `filesystem`. Rejects binaries (NUL in the first 8 KB) and blank files;
 * trims a truncated read back to the last full line.
 * @throws {ReadTextError} `binary`, `empty`, or `io`.
 */
export declare function readText(filesystem: InternalUrlFilesystem, path: string, maxBytes: number): Promise<ReadText>;
