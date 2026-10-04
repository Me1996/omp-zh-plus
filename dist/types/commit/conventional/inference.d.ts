import type { AuthStorage } from "@oh-my-pi/pi-ai";
import type { ResolvedCommitModel } from "../model-selection.js";
import { type CommitInferenceCache } from "./cache.js";
import type { ConventionalGenerationConfig } from "./config.js";
import type { ConventionalPromptFamily } from "./prompts.js";
/** Model roles preserved from llm-git's analysis/summary/map/fast pipeline. */
export type CommitInferenceRole = "analysis" | "summary" | "map" | "fast";
/** One fully rendered inference operation. */
export interface CommitInferenceRequest {
    operation: string;
    role: CommitInferenceRole;
    promptFamily: ConventionalPromptFamily;
    systemPrompt: string;
    userPrompt: string;
    toolName: string;
    progressLabel: string;
    cacheable?: boolean;
}
/** Raw text and stop metadata passed to operation-specific parsers. */
export interface CommitInferenceResponse {
    text: string;
    stopReason: string;
}
/** Parser-aware inference boundary so malformed responses share the normal retry budget. */
export interface CommitInference {
    complete<T>(request: CommitInferenceRequest, parse: (response: CommitInferenceResponse) => T): Promise<T>;
}
/** User-visible phase updates emitted during generation. */
export type CommitProgress = (message: string) => void;
/** Omp's model/provider adapter for llm-git's parser-aware one-shot algorithm. */
export declare class OmpCommitInference implements CommitInference {
    #private;
    constructor(options: {
        primary: ResolvedCommitModel;
        smol: ResolvedCommitModel;
        forcePrimaryForEveryRole?: boolean;
        config: ConventionalGenerationConfig;
        cache: CommitInferenceCache | null;
        /** Closed on dispose; broker-backed storage runs a background sync loop that pins the event loop. */
        authStorage?: AuthStorage;
        onProgress?: CommitProgress;
        signal?: AbortSignal;
    });
    /** Run one request with cache lookup, parse validation, and exponential retries. */
    complete<T>(request: CommitInferenceRequest, parse: (response: CommitInferenceResponse) => T): Promise<T>;
    /** Release the cache and auth-storage handles after generation completes. */
    dispose(): void;
}
