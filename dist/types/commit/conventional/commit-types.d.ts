import type { CommitType, ConventionalAnalysis, ConventionalCommit } from "../types.js";
/** Conventional commit types in llm-git's canonical classification order. */
export declare const COMMIT_TYPE_ORDER: readonly CommitType[];
/** Return whether a string is an accepted conventional commit type. */
export declare function isCommitType(value: string): value is CommitType;
/** Resolve a canonical commit type or configured alias. */
export declare function canonicalCommitType(raw: string): CommitType | undefined;
/** Resolve a model-emitted type, falling back to `chore` when unknown. */
export declare function coerceCommitType(raw: string): CommitType;
/** Resolve a model-emitted scope using llm-git's lossy two-segment normalization. */
export declare function coerceOptionalScope(raw: unknown): string | null;
/** Render the configured commit-type vocabulary injected into analysis prompts. */
export declare function formatTypesDescription(): string;
/** Normalize raw model analysis into the conventional commit domain. */
export declare function conventionalAnalysis(input: {
    type: string;
    scope?: unknown;
    summary?: unknown;
    details?: unknown;
    issueRefs?: unknown;
}): ConventionalAnalysis;
/** Build a normalized conventional commit value. */
export declare function conventionalCommit(input: {
    type: string;
    scope?: unknown;
    summary: string;
    body?: readonly string[];
    footers?: readonly string[];
}): ConventionalCommit;
