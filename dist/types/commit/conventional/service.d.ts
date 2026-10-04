import type { ConventionalCommit } from "../types.js";
import { type CommitProgress } from "./inference.js";
/** Options for generating a conventional message from the staged tree. */
export interface GenerateGitCommitOptions {
    cwd: string;
    modelOverride?: string;
    stageIfEmpty?: boolean;
    onProgress?: CommitProgress;
    signal?: AbortSignal;
}
/** Conventional commit form values plus staging and validation metadata. */
export interface GeneratedGitCommit {
    commit: ConventionalCommit;
    validationError: string | null;
    stagedAll: boolean;
}
/** Generate a commit message from the staged tree, staging all only when the index is empty. */
export declare function generateGitCommit(options: GenerateGitCommitOptions): Promise<GeneratedGitCommit>;
