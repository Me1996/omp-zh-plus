import type { CommitType, ConventionalAnalysis, ConventionalCommit } from "../types.js";
/** Remove a conventional type/scope prefix from model summary text. */
export declare function stripTypePrefix(text: string, commitType?: string, scope?: string | null): string;
/** Generate llm-git's deterministic type-aware fallback summary. */
export declare function fallbackSummary(stat?: string, details?: Iterable<string>, diff?: string, options?: {
    limit?: number;
    commitType?: string;
}): string;
/** Parse summary output from markdown, XML-ish tags, JSON, or plain text. */
export declare function parseSummaryMarkdown(text: string): string;
/** Parse a conventional analysis from llm-git's lenient markdown contract. */
export declare function parseConventionalAnalysisMarkdown(text: string, defaultType?: CommitType): ConventionalAnalysis;
/** Parse a complete conventional commit from markdown or JSON text. */
export declare function parseFastCommitMarkdown(text: string, defaultType?: CommitType): ConventionalCommit;
/** Coerce a JSON-like payload into conventional analysis. */
export declare function analysisFromMapping(payload: Record<string, unknown>, defaultType?: CommitType): ConventionalAnalysis;
/** Parse map-phase file observations from JSON or lenient markdown. */
export declare function parseFileObservationsMarkdown(text: string): Array<{
    path: string;
    observations: string[];
}>;
