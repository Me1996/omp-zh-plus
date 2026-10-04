/**
 * Host-side handler for the eval `completion()` helper.
 *
 * Both eval runtimes (JS worker + Python kernel) route helper→host calls
 * through {@link callSessionTool}. Reserving the synthetic tool name
 * {@link EVAL_COMPLETION_BRIDGE_NAME} lets a single host handler serve both
 * transports without registering an agent-visible tool: cell code calls
 * `completion(prompt, opts)`, the prelude forwards `{ prompt, model, system?, schema? }`
 * through the bridge, and this module performs one stateless completion.
 *
 * The call is oneshot and toolless from the model's perspective — pure text
 * in, text (or, with `schema`, a structured object) out.
 */
import { Semaphore } from "../task/parallel.js";
import type { ToolSession } from "../tools/index.js";
import type { JsStatusEvent } from "./js/shared/types.js";
/** Synthetic bridge name reserved for the `completion()` helper across both runtimes. */
export declare const EVAL_COMPLETION_BRIDGE_NAME = "__completion__";
type CompletionTier = "smol" | "default" | "slow";
export interface EvalCompletionBridgeOptions {
    session: ToolSession;
    signal?: AbortSignal;
    emitStatus?: (event: JsStatusEvent) => void;
}
/** Terminal payload of a retained handle. */
export interface EvalCompletionResult {
    text: string;
    /** Structured payload; when present the cell receives it in place of `text`. */
    data?: unknown;
    details: {
        model: string;
        tier?: CompletionTier;
        structured: boolean;
    };
}
/** Handle returned immediately after an eval completion starts. */
export interface EvalCompletionHandleResult {
    id: string;
}
/** Process-local state retained for one eval completion handle. */
export interface CompletionHandleEntry {
    ownerId: string;
    controller: AbortController;
    promise: Promise<void>;
    settled: boolean;
    result?: EvalCompletionResult;
    error?: string;
    evictionTimer?: NodeJS.Timeout;
}
/**
 * Process-wide ceiling on eval model requests executing at once, shared by
 * `completion()` handles, `judge()`, and `judge_batch()` items. A cell that
 * fans out hundreds of calls otherwise opens every request simultaneously and,
 * once the primary candidate rejects, floods each fallback in the role chain
 * (including self-hosted models that serve requests serially). Queued handles
 * report `running` until admitted.
 */
export declare const EVAL_HANDLE_CONCURRENCY = 32;
export declare const evalRequestSlots: Semaphore;
/** Resolve a retained completion handle by id. */
export declare function getCompletionHandle(id: string): CompletionHandleEntry | undefined;
/** Cancel and remove every completion handle owned by an agent session. */
export declare function releaseCompletionHandles(ownerId: string): void;
/** Start a stateless completion and return its process-local handle immediately. */
export declare function runEvalCompletion(args: unknown, options: EvalCompletionBridgeOptions): Promise<EvalCompletionHandleResult>;
/**
 * Run `execute` in the background under a session-owned, cancellable handle
 * and return its id immediately; `wait()`/`status()`/`cancel()` resolve it
 * through {@link getCompletionHandle}. Settled entries are evicted after
 * {@link COMPLETION_HANDLE_RETENTION_MS}.
 */
export declare function retainCompletionHandle(prefix: string, options: EvalCompletionBridgeOptions, execute: (signal: AbortSignal) => Promise<EvalCompletionResult>): EvalCompletionHandleResult;
export {};
