import type { CommitSettings } from "../settings.js";
/** Runtime thresholds copied from llm-git's standard commit workflow. */
export interface ConventionalGenerationConfig {
    readonly summaryGuideline: number;
    readonly summarySoftLimit: number;
    readonly summaryHardLimit: number;
    readonly maxRetries: number;
    readonly initialBackoffMs: number;
    readonly autoFastThresholdLines: number;
    readonly maxDiffLength: number;
    readonly maxDiffTokens: number;
    readonly wideChangeThreshold: number;
    readonly excludedFiles: readonly string[];
    readonly lowPriorityExtensions: readonly string[];
    readonly maxDetailTokens: number;
    readonly wideChangeAbstract: boolean;
    readonly mapReduceEnabled: boolean;
    readonly mapReduceThreshold: number;
    readonly mapBatchTokenBudget: number;
    readonly cacheEnabled: boolean;
    readonly cacheTtlDays: number;
}
/** Default llm-git thresholds before omp's explicit commit settings are applied. */
export declare const DEFAULT_CONVENTIONAL_GENERATION_CONFIG: ConventionalGenerationConfig;
/** Build generation configuration from exact defaults plus omp settings. */
export declare function conventionalGenerationConfig(settings: CommitSettings): ConventionalGenerationConfig;
