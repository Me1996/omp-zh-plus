import type { ConventionalCommit } from "../types.js";
import type { ConventionalGenerationConfig } from "./config.js";
/**
 * Normalize Unicode punctuation, symbols, fractions, arrows, and spaces.
 *
 * NFKD is the vehicle for the compatibility folding (fractions, super/subscripts,
 * ligatures, fullwidth forms); it also splits every precomposed letter into a base
 * plus combining marks, which is not part of that intent. Recomposing with NFC
 * afterwards keeps each folding — compatibility mappings never recompose — while
 * restoring the author's letters, so a summary is measured and stored at the length
 * it was written. Without it the byte guard below counts the decomposition instead:
 * Vietnamese inflates ~1.23x and Hangul ~2.4x, so a summary well inside the limit is
 * rejected for exceeding it.
 */
export declare function normalizeCommitUnicode(text: string): string;
/** Estimate tokens with llm-git's four-UTF-8-bytes rule. */
export declare function estimateCommitTokens(text: string): number;
/** Keep the highest-priority details inside the configured token budget. */
export declare function capCommitDetails(details: string[], maxTokens: number): void;
/** Convert a known leading present-tense summary verb to past tense. */
export declare function normalizeSummaryVerb(summary: string, commitType: string): string;
/** Normalize summary, body, and footers before final validation. */
export declare function postProcessCommitMessage(message: ConventionalCommit, config: ConventionalGenerationConfig): ConventionalCommit;
/** Format a normalized conventional commit as Git commit-message text. */
export declare function formatConventionalCommit(message: ConventionalCommit): string;
