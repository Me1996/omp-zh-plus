import type { ConventionalGenerationConfig } from "./config.js";
/** Per-file cap applied after long prompt lines are collapsed. */
export declare const MAX_PROMPT_FILE_BYTES = 100000;
/** Long-line threshold above which machine payloads are collapsed. */
export declare const BLOB_LINE_THRESHOLD = 512;
/** One file section parsed from a unified diff for prompt preparation. */
export declare class ConventionalFileDiff {
    filename: string;
    header: string;
    content: string;
    additions: number;
    deletions: number;
    isBinary: boolean;
    status: "added" | "deleted" | "renamed" | "modified";
    constructor(filename: string, header: string, content?: string, additions?: number, deletions?: number, isBinary?: boolean, status?: ConventionalFileDiff["status"]);
    /** UTF-8 byte size used by prompt budgets. */
    get size(): number;
    /** Deterministic four-character token estimate. */
    tokenEstimate(): number;
    /** Context-retention priority; higher values survive truncation first. */
    priority(config?: ConventionalGenerationConfig): number;
    /** Truncate content in place while preserving metadata and useful edges. */
    truncate(maxSize: number): void;
}
/** Collapse blob-like diff lines while preserving recognizable head and tail text. */
export declare function collapseBlobLines(diff: string, threshold?: number): string;
/** Keep the largest stat rows plus the totals line. */
export declare function condenseStat(stat: string, maxFiles?: number): string;
/** Parse a unified git diff into file-level prompt sections. */
export declare function parsePromptDiff(diff: string): ConventionalFileDiff[];
/** Reconstruct prompt text from parsed file sections. */
export declare function reconstructPromptDiff(files: readonly ConventionalFileDiff[]): string;
/** Collapse long payloads and cap any remaining oversized file section. */
export declare function scrubDiffForPrompt(diff: string, maxFileBytes?: number): string;
/** Truncate a diff by file priority while retaining whole-file scope. */
export declare function smartTruncateDiff(diff: string, maxLength: number, config: ConventionalGenerationConfig): string;
/** Truncate to a line budget distributed by file priority. */
export declare function truncateDiffByLines(diff: string, maxLines: number, config: ConventionalGenerationConfig): string;
/** Classify file sections as whitespace-only or substantive. */
export declare function classifyDiffWhitespace(diff: string): {
    whitespaceOnlyFiles: string[];
    hasSubstantive: boolean;
    allWhitespace: boolean;
};
/** Remove whitespace-only file sections, returning `null` when nothing changes. */
export declare function stripWhitespaceOnlyFiles(diff: string): string | null;
