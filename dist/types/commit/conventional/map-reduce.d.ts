import type { ConventionalAnalysis } from "../types.js";
import type { ConventionalGenerationConfig } from "./config.js";
import { ConventionalFileDiff } from "./diff.js";
import type { CommitInference } from "./inference.js";
/** Factual observations extracted for one changed file. */
export interface ConventionalFileObservation {
    file: string;
    observations: string[];
    additions: number;
    deletions: number;
    status: ConventionalFileDiff["status"];
}
/** Return whether a diff crosses llm-git's exact map-reduce threshold. */
export declare function shouldUseMapReduce(diff: string, config: ConventionalGenerationConfig): boolean;
/** Group all file indices into greedy token- and byte-budgeted batches. */
export declare function buildFileBatches(files: readonly ConventionalFileDiff[], budget: number): number[][];
/** Group non-binary file indices into greedy LLM batches. */
export declare function buildLlmFileBatches(files: readonly ConventionalFileDiff[], budget: number): number[][];
/** Run exact per-file observation mapping followed by one reduce synthesis call. */
export declare function runMapReduce(input: {
    inference: CommitInference;
    config: ConventionalGenerationConfig;
    stat: string;
    diff: string;
    scopeCandidates: string;
}): Promise<ConventionalAnalysis>;
/** Render status and change-count annotations into reduce-phase markdown. */
export declare function renderObservationsMarkdown(observations: readonly ConventionalFileObservation[]): string;
