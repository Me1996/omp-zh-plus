/**
 * Host-side handler for the eval `judge_batch()` helper.
 *
 * Bulk classification does not fit one cell: cells time out, and a thousand
 * `judge()` calls means a thousand bridge round-trips and a thousand opaque
 * handles. `judge_batch(states, questions)` instead hands the whole batch to the
 * host in one call. The host owns the run — one resolved judge chain, fan-out
 * bounded by the shared eval request semaphore, one retry per item — and the
 * cell pulls settled items through a cursor (`drain`) in bounded slices across
 * as many cells as it needs. Item failures are recorded per key, never raised;
 * only a run that dies wholesale (no judge available, `min_ok` unmet) surfaces
 * as an error from `drain()`.
 *
 * Each batch registers as an async job under its id so completion auto-delivers
 * a summary to the agent and `hub wait ids:[id]` / `hub cancel` address it. The
 * batch survives kernel resets (`attach(id)`) until `close()` or its owner
 * session releases it.
 */
import type { JudgmentState, Question } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "../tools/index.js";
import type { JsStatusEvent } from "./js/shared/types.js";
import { type CellAnswer } from "./judgment-bridge.js";
/** Synthetic bridge name reserved for the `judge_batch()` helper across both runtimes. */
export declare const EVAL_JUDGMENT_BATCH_BRIDGE_NAME = "__judge_batch__";
/** Caller-supplied item key; list inputs use their index. */
export type BatchKey = string | number;
/** One settled item as the cell receives it from `drain()`. */
export interface JudgmentBatchItem {
    key: BatchKey;
    answers?: Record<string, CellAnswer>;
    error?: string;
    /** Backend that answered; absent on failure. */
    model?: string;
}
/** Snapshot returned by `status()` and carried on `create`/`attach`. */
export interface JudgmentBatchStatus {
    id: string;
    /** Caller-provided progress/job label. */
    intent: string;
    total: number;
    done: number;
    failed: number;
    /** Accumulated USD cost of every judgment attempt, including retries and failures. */
    cost: number;
    running: boolean;
    /** Backend that answered the most recent item. */
    model?: string;
    elapsedS: number;
    /** Set when the run died wholesale; `drain()` raises it once the cursor is exhausted. */
    error?: string;
}
export interface EvalJudgmentBatchBridgeOptions {
    session: ToolSession;
    signal?: AbortSignal;
    emitStatus?: (event: JsStatusEvent) => void;
}
export type EvalJudgmentBatchResult = JudgmentBatchStatus | {
    items: JudgmentBatchItem[];
} | {
    results: Record<string, Record<string, CellAnswer>>;
} | {
    failed: Record<string, string>;
} | {
    cancelled: boolean;
} | {
    closed: boolean;
};
interface BatchInput {
    key: BatchKey;
    state: JudgmentState;
}
interface BatchOptions {
    concurrency: number;
    retries: number;
    minOk: number;
}
/** A host-owned bulk judgment run with a single pull cursor. */
export declare class JudgmentBatch {
    #private;
    readonly id: string;
    readonly ownerId: string;
    readonly intent: string;
    readonly total: number;
    constructor(session: ToolSession, inputs: BatchInput[], questions: Record<string, Question>, options: BatchOptions, intent: string);
    /**
     * Kick off the fan-out and register the async job; returns once registered,
     * not once done. Without a job manager (or at the running-job limit) the run
     * still proceeds — only auto-delivery and `hub` addressing are lost.
     */
    start(): void;
    status(): JudgmentBatchStatus;
    /**
     * Items settled since the previous drain. Waits up to `timeoutMs` for at
     * least one new item, then up to {@link DRAIN_COALESCE_MS} more (never past
     * `timeoutMs`) so near-simultaneous settles return together; returns `[]` on
     * timeout. Once the cursor is exhausted on a run that died wholesale, throws
     * that error.
     */
    drain(timeoutMs: number | undefined, signal: AbortSignal | undefined): Promise<JudgmentBatchItem[]>;
    results(): Record<string, Record<string, CellAnswer>>;
    failed(): Record<string, string>;
    /** Abort in-flight items, settle everything unstarted as cancelled, and cancel the async job. */
    cancel(): boolean;
}
/** Resolve a batch owned by the calling session. */
export declare function getJudgmentBatch(id: string, session: ToolSession): JudgmentBatch | undefined;
/** Cancel and forget every batch owned by an agent session. */
export declare function releaseJudgmentBatches(ownerId: string): void;
/** Create or operate a host-owned bulk judgment run. */
export declare function runEvalJudgmentBatch(args: unknown, options: EvalJudgmentBatchBridgeOptions): Promise<EvalJudgmentBatchResult>;
export {};
