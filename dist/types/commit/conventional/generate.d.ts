import type { ConventionalAnalysis, ConventionalCommit } from "../types.js";
import type { ConventionalGenerationConfig } from "./config.js";
import type { CommitInference } from "./inference.js";
/** Repository context supplied to analysis and final project-scope validation. */
export interface ConventionalGenerationContext {
    userContext?: string;
    recentCommits?: string;
    commonScopes?: string;
    projectContext?: string;
    projectNames?: readonly string[];
}
/** Inputs captured from one immutable staged-tree view. */
export interface ConventionalGenerationInput {
    diff: string;
    stat: string;
    numstat: string;
    config: ConventionalGenerationConfig;
    inference: CommitInference;
    context?: ConventionalGenerationContext;
}
/** Generated commit plus any final validation failure left for manual correction. */
export interface ConventionalGenerationResult {
    commit: ConventionalCommit;
    validationError: string | null;
}
/** Run llm-git's exact standard-mode generation algorithm over captured Git inputs. */
export declare function generateConventionalCommit(input: ConventionalGenerationInput): Promise<ConventionalGenerationResult>;
/** Generate and salvage a compliant summary from one holistic analysis. */
export declare function generateSummaryFromAnalysis(config: ConventionalGenerationConfig, analysis: ConventionalAnalysis, stat: string, userContext: string | undefined, inference: CommitInference): Promise<string>;
