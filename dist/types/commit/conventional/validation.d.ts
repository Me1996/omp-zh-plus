import type { ConventionalCommit } from "../types.js";
import type { ConventionalGenerationConfig } from "./config.js";
/** Severity attached to a conventional commit validation issue. */
export type ValidationSeverity = "error" | "warning";
/** One structured conventional commit validation diagnostic. */
export interface ValidationIssue {
    severity: ValidationSeverity;
    field: string;
    code: string;
    message: string;
    value?: string;
}
/** Blocking errors and advisory warnings from conventional validation. */
export interface ValidationReport {
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    ok: boolean;
}
/** Return the configured past-tense form for a present-tense verb. */
export declare function presentToPast(present: string): string | undefined;
/** Rewrite a leading present-tense verb, or return `null` when no repair applies. */
export declare function repairSummaryTense(summary: string): string | null;
/** Split the leading ASCII verb segment from punctuation or suffix text. */
export declare function splitVerbToken(token: string): [string, string] | null;
/** Return a lowercase leading verb stem, excluding acronyms and numbers. */
export declare function verbStem(token: string): string | null;
/** Return whether a bare word looks like a past-tense verb. */
export declare function isPastTenseVerb(word: string): boolean;
/** Return whether a raw first summary token is acceptable past tense. */
export declare function isPastTenseFirstWord(token: string): boolean;
/** Validate summary semantics before a conventional commit is built. */
export declare function validateSummaryQuality(summary: string, commitType: string, stat?: string): ValidationReport;
/** Validate a normalized conventional commit against llm-git's exact rules. */
export declare function validateCommitMessage(message: ConventionalCommit, config: ConventionalGenerationConfig, options?: {
    stat?: string;
    projectNames?: readonly string[];
}): ValidationReport;
/** Return advisory type/file-stat consistency diagnostics. */
export declare function checkTypeScopeConsistency(message: ConventionalCommit, stat: string): ValidationReport;
