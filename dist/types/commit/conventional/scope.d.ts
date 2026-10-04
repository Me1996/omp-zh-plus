import type { NumstatEntry } from "../types.js";
import type { ConventionalGenerationConfig } from "./config.js";
/** Weighted path candidate considered for a conventional commit scope. */
export interface ScopeCandidate {
    path: string;
    percentage: number;
    confidence: number;
}
/** Result rendered into analysis prompts plus its wide-change classification. */
export interface ScopeCandidatesResult {
    scopeCandidates: string;
    isWide: boolean;
}
/** Accumulates changed-line totals per meaningful path component. */
export declare class ScopeAnalyzer {
    readonly componentLines: Map<string, number>;
    totalLines: number;
    /** Build an analyzer from raw `git diff --numstat` output. */
    static fromNumstat(numstat: string, config: ConventionalGenerationConfig): ScopeAnalyzer;
    /** Count changed non-binary, non-excluded lines. */
    static countChangedLines(numstat: string, config: ConventionalGenerationConfig): number;
    /** Detect an abstract category for cross-cutting changes. */
    static analyzeWideChange(numstat: string): string | null;
    /** Process one added/deleted/path numstat row. */
    processNumstatLine(line: string, config: ConventionalGenerationConfig): void;
    /** Return candidates sorted by confidence descending. */
    buildScopeCandidates(): ScopeCandidate[];
}
/** Extract the exact scope hint string consumed by llm-git's prompts. */
export declare function extractScopeCandidates(source: string | readonly NumstatEntry[], config: ConventionalGenerationConfig): ScopeCandidatesResult;
/** Extract a rename destination from git's brace or arrow numstat syntax. */
export declare function extractPathFromRename(pathPart: string): string;
/** Extract single- and two-segment meaningful components from a path. */
export declare function extractComponentsFromPath(file: string): string[];
