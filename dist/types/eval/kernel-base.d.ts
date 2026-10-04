import { Snowflake } from "@oh-my-pi/pi-utils";
import type { Subprocess } from "bun";
import { type KernelDisplayOutput } from "./py/display.js";
import type { ShadowBarrier, ShadowControlNode, ShadowOperation } from "./speculation/types.js";
export type KernelRuntimeEnv = Record<string, string | null>;
export interface KernelExecuteOptions {
    id?: string;
    /** Source filename for file-backed execution and tracebacks. */
    filename?: string;
    /** Runtime working directory applied immediately before this request executes. */
    cwd?: string;
    /** Managed runtime environment variables applied immediately before this request executes. */
    env?: Record<string, string | undefined> | Record<string, string | null>;
    signal?: AbortSignal;
    onChunk?: (text: string) => Promise<void> | void;
    onDisplay?: (output: KernelDisplayOutput) => Promise<void> | void;
    timeoutMs?: number;
    silent?: boolean;
    storeHistory?: boolean;
    allowStdin?: boolean;
}
export interface KernelExecuteResult {
    status: "ok" | "error";
    executionCount?: number;
    error?: {
        name: string;
        value: string;
        traceback: string[];
    };
    cancelled: boolean;
    timedOut: boolean;
    stdinRequested: boolean;
    /** True when an atomic retained-runtime admission check rejected this execution before user code ran. */
    admissionRejected?: boolean;
    /**
     * True when the kernel subprocess was killed as part of settling this
     * execution (e.g. SIGINT was ignored and we escalated to shutdown, or the
     * kernel died unexpectedly). When false, the kernel remains reusable.
     */
    kernelKilled?: boolean;
}
export interface KernelShutdownResult {
    confirmed: boolean;
}
export interface KernelShutdownOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
}
/** Per-language lifecycle configuration consumed by each kernel's `start()`. */
export interface KernelStartOptions {
    cwd: string;
    env?: Record<string, string | undefined>;
    /** Explicit interpreter path; skips discovery when set. */
    interpreter?: string;
    signal?: AbortSignal;
    deadlineMs?: number;
}
/** Per-language configuration handed to {@link BaseKernel} by each subclass. */
export interface BaseKernelOptions<TExecuteOptions extends KernelExecuteOptions = KernelExecuteOptions> {
    /** Human-readable language label used in log messages and errors. */
    languageName: string;
    /** When true, every IPC frame is logged at debug level. */
    traceIpc: boolean;
    /** Wire payload asking the runner to exit cleanly. */
    exitPayload: string;
    /** How long to wait after SIGINT before escalating to subprocess termination. */
    interruptEscalationMs: number;
    /** Default grace period applied by {@link BaseKernel.shutdown}. */
    shutdownGraceMs: number;
    /** Serializes an execution request into the runner's wire protocol. */
    buildPayload: (code: string, msgId: string, options?: TExecuteOptions) => string;
}
export type FrameType = "started" | "stdout" | "stderr" | "display" | "result" | "error" | "done" | "shadow_snapshot" | "shadow_plan";
export interface Frame {
    type: FrameType;
    id?: string;
    data?: string;
    bundle?: Record<string, unknown>;
    ename?: string;
    evalue?: string;
    traceback?: string[];
    status?: "ok" | "error";
    operations?: ShadowOperation[];
    controls?: ShadowControlNode[];
    barrier?: ShadowBarrier | null;
    executionCount?: number;
    cancelled?: boolean;
    eligible?: boolean;
    reason?: string;
    revision?: number;
    digest?: string;
    admissionRejected?: boolean;
    values?: Record<string, unknown>;
}
export declare function getRemainingTimeMs(deadlineMs?: number): number | undefined;
/**
 * True when `pid` is safe to use as a process-group target for `kill(2)`.
 *
 * `process.kill(-pid, …)` is a group signal, and the degenerate targets are
 * catastrophic rather than merely useless: `-0` signals *our own* process group
 * (omp would kill itself along with the whole terminal job) and `-1` signals
 * every process the user is permitted to signal. Both must be rejected before
 * the negation is applied.
 */
export declare function isSignalableProcessGroup(pid: number | undefined): pid is number;
/**
 * Signal the whole process group led by `pid`, returning true when a signal was
 * actually delivered.
 *
 * Kernels are spawned with `detached: true` on POSIX (see `shouldDetachKernel`),
 * so each runner calls `setsid()` and becomes the leader of its own session and
 * process group. Signalling only the direct PID therefore leaves anything the
 * runner itself spawned behind, and those orphans keep the kernel's pipes open
 * for the remainder of the omp process lifetime (#7714).
 *
 * Windows has no process groups, so this is a no-op there and callers keep
 * relying on the direct-PID kill.
 */
export declare function killProcessGroup(pid: number | undefined, signal: NodeJS.Signals): boolean;
export declare function createAbortError(name: "AbortError" | "TimeoutError", message: string): Error;
export declare function throwIfAborted(signal: AbortSignal | undefined, fallbackReason: string): void;
export declare function isTimeoutReason(reason: unknown): boolean;
/**
 * Shared subprocess-backed kernel machinery for the language runners. Each
 * language subclasses this, supplying its binary/runner via a static `start()`
 * and its wire protocol via {@link BaseKernelOptions.buildPayload}. The IPC loop
 * speaks NDJSON: the runner emits one JSON {@link Frame} per line; outbound
 * requests are serialized by `buildPayload` (which may itself be NDJSON or any
 * other line-delimited encoding).
 *
 * `TExecuteOptions` is the language's own execute-options type so each runner's
 * `buildPayload` sees its precise option shape (e.g. environment-map variants).
 */
export declare abstract class BaseKernel<TExecuteOptions extends KernelExecuteOptions = KernelExecuteOptions> {
    #private;
    readonly id: string;
    constructor(id: string, options: BaseKernelOptions<TExecuteOptions>);
    setProcess(proc: Subprocess<"pipe", "pipe", "pipe">): void;
    isAlive(): boolean;
    execute(code: string, options?: TExecuteOptions): Promise<KernelExecuteResult>;
    /** Submit a raw runner request without sending SIGINT when its caller cancels. */
    submitRequest(msgId: string, payload: string, options?: TExecuteOptions): Promise<KernelExecuteResult>;
    requestControl(payload: string, id?: Snowflake, timeoutMs?: number): Promise<Frame>;
    interrupt(): Promise<void>;
    /**
     * Concurrent calls (e.g. several in-flight requests hitting the same broken pipe) share one
     * shutdown sequence. An unconfirmed shutdown clears the slot so a later call can retry.
     */
    shutdown(options?: KernelShutdownOptions): Promise<KernelShutdownResult>;
    executeWithBudget(code: string, signal: AbortSignal | undefined, timeoutMs: number, label: string): Promise<void>;
}
