/** Session event channel for editor-anchored judgment progress. */
export declare const JUDGMENT_BATCH_PROGRESS_EVENT_CHANNEL = "eval:judgment-batch-progress";
/** Live progress snapshot for one host-owned judgment batch. */
export interface JudgmentBatchProgress {
    /** Stable batch/job identifier. */
    id: string;
    /** Caller-provided description of the judgment work. */
    intent: string;
    /** Settled item count, including failures. */
    done: number;
    /** Total item count. */
    total: number;
    /** Settled items that failed. */
    failed: number;
    /** Accumulated USD cost of every judgment attempt so far, including retries and failures. */
    cost: number;
    /** Whether the host is still processing the batch. */
    running: boolean;
    /** Whole-batch terminal error, when present. */
    error?: string;
}
/** Validate an untyped event-bus payload before rendering it. */
export declare function isJudgmentBatchProgress(value: unknown): value is JudgmentBatchProgress;
