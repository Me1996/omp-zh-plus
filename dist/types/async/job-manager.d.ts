import type { ImageContent } from "@oh-my-pi/pi-ai";
import type { StructuredSubagentOutput } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { OutputMeta } from "@oh-my-pi/pi-tui-zh/tools/output-meta";
/** Abort reason used only when the owning session shuts down the entire manager. */
export declare const ASYNC_JOB_MANAGER_SHUTDOWN_REASON: unique symbol;
/** Kind of work a managed job runs; drives job-row badges and delivery labels. */
export type AsyncJobType = "bash" | "task" | "eval";
/** Settled job-body payload: delivery text plus its parsed structured output. */
export interface AsyncJobRunResult {
    text: string;
    structured?: StructuredSubagentOutput;
}
/**
 * Job-body failure that still carries the run's structured output, so a
 * strict-mode schema violation fails the job without dropping the parsed
 * (invalid) payload.
 */
export declare class AsyncJobError extends Error {
    readonly structured?: StructuredSubagentOutput | undefined;
    constructor(message: string, structured?: StructuredSubagentOutput | undefined);
}
/** Progress metadata retained for renderers and multimodal completion delivery. */
export interface AsyncJobDetails extends Record<string, unknown> {
    /** Images recovered from command output, independent of text truncation. */
    images?: ImageContent[];
    /** Tool output metadata needed when a completion is delivered or recovered later. */
    meta?: OutputMeta;
}
export interface AsyncJob {
    id: string;
    type: AsyncJobType;
    status: "running" | "completed" | "failed" | "cancelled";
    startTime: number;
    /** When the job's run settled; `endTime - startTime` is its frozen run duration. */
    endTime?: number;
    label: string;
    abortController: AbortController;
    promise: Promise<void>;
    resultText?: string;
    errorText?: string;
    /**
     * Parsed structured completion for a job whose work selected an output
     * schema. Set from the body's {@link AsyncJobRunResult} or from an
     * {@link AsyncJobError}. The job row is the carrier — every delivery
     * attempt, redelivery, and `proc://` snapshot reads it from here.
     */
    structured?: StructuredSubagentOutput;
    /** Latest progress text the running job reported (a bash job's output tail). */
    progressText?: string;
    /** Latest tool-render details reported by the running job. */
    latestDetails?: AsyncJobDetails;
    /**
     * Registry id of the agent that registered the job (e.g. "Main",
     * "AuthLoader"). Used by scoped cancel/list APIs so a subagent's teardown
     * does not cancel its parent's jobs. Undefined for callers that don't
     * supply an id (e.g. legacy tests, SDK consumers without an agent context).
     */
    ownerId?: string;
    /**
     * Registry id of the subagent this job runs (task/tan/vibe jobs). Lets
     * job-view code link a job row to its AgentRegistry ref even when the job
     * id differs from the agent id (vibe turn jobs, tan clones).
     */
    agentId?: string;
    /** The process the job runs, when it spawns one. */
    process?: AsyncJobProcess;
    /**
     * Job is registered but parked behind a caller-managed gate (e.g. a task
     * batch semaphore). Queued jobs do not count toward the running-job limit
     * until the caller invokes `markRunning()` from the run context.
     */
    queued?: boolean;
    /**
     * Job backs a foreground tool call that may still auto-background. It is
     * hidden from job listings and its delivery is suppressed until
     * {@link AsyncJobManager.backgroundJob} promotes it; a call that finishes in
     * the foreground hands it to {@link AsyncJobManager.releaseForegroundJob}.
     */
    foreground?: boolean;
    /**
     * Disposal closure for a detached spawn's temporary artifacts directory
     * that `runStructuredSubagent()` retained past completion (so a
     * delayed `agent://<id>` handle in an `async-result` delivery still
     * resolves). The manager invokes and clears this exactly once — on
     * eviction or manager disposal — so the retained directory does not
     * outlive the job row it was kept alive for.
     */
    retainedArtifactsCleanup?: () => Promise<void>;
}
/**
 * The process a job runs, for job inspectors (the jobs sheet): set by bodies
 * that spawn one (bash), absent for in-process work (eval, task).
 */
export interface AsyncJobProcess {
    /** Full command line; the job label is cut to 120 characters. */
    readonly command: string;
    /** Directory the command started in. */
    readonly cwd: string;
    /** Live pids the command spawned, in spawn order; empty before it starts and after it ends. */
    pids(): readonly number[];
}
/** Delivery callback for a settled job's result text. */
export type AsyncJobDeliverySink = (jobId: string, text: string, job?: AsyncJob) => void | Promise<void>;
export interface AsyncJobManagerOptions {
    /**
     * Delivery sink for UNOWNED completions (jobs registered without an
     * `ownerId`). Owned deliveries route exclusively through
     * {@link AsyncJobManager.registerDeliverySink}; when the owner has no live
     * sink they are dead-lettered (dropped with a warning; the job row keeps
     * the result text until retention eviction) — never routed here, which
     * would leak one agent's result into another session.
     */
    onJobComplete?: AsyncJobDeliverySink;
    /** Running-job cap; a function is re-read on every capacity check so a live setting resizes the cap. */
    maxRunningJobs?: number | (() => number);
    retentionMs?: number;
    /**
     * Delay after a job's `async-result` delivery settles before its retained
     * artifacts are removed (see {@link RETAINED_ARTIFACTS_CLEANUP_GRACE_MS}).
     * Defaults to that constant; tests override to `0` to assert cleanup
     * without a real-time wait.
     */
    retainedArtifactsCleanupGraceMs?: number;
    /**
     * Upper bound on how long retained-artifacts cleanup waits for a job's
     * delivery to settle before giving up and running cleanup anyway (see
     * {@link RETAINED_ARTIFACTS_CLEANUP_MAX_WAIT_MS}). Defaults to that
     * constant; tests override to a small value to assert the bound without
     * a real-time wait.
     */
    retainedArtifactsCleanupMaxWaitMs?: number;
    /**
     * Delay before a settled job row is evicted once its result has been
     * consumed (delivered to a sink or recovered by a foreground snapshot).
     * Defaults to {@link CONSUMED_RESULT_EVICTION_MS}; tests override to a
     * small value to assert eviction without real-time waits.
     */
    consumedResultEvictionMs?: number;
}
export interface AsyncJobDeliveryState {
    queued: number;
    delivering: boolean;
    nextRetryAt?: number;
    pendingJobIds: string[];
}
export interface AsyncJobReapResult {
    settled: boolean;
    pendingJobIds: string[];
    completion: Promise<void>;
}
export interface AsyncJobRegisterOptions {
    id?: string;
    /** Registry id of the agent that owns this job; used to scope cancelAll. */
    ownerId?: string;
    /** Registry id of the subagent this job runs; see {@link AsyncJob.agentId}. */
    agentId?: string;
    onProgress?: (text: string, details?: AsyncJobDetails) => void | Promise<void>;
    /** Register the job in queued state; see {@link AsyncJob.queued}. */
    queued?: boolean;
    /** Register the job as backing a foreground call; see {@link AsyncJob.foreground}. */
    foreground?: boolean;
    /** The process the job runs; see {@link AsyncJob.process}. */
    process?: AsyncJobProcess;
}
/**
 * Filter applied to job query/cancel/delivery APIs. Matches jobs registered by
 * exactly `ownerId` (registry id from `AgentRegistry`, e.g. "Main",
 * "AuthLoader"); `ownerId: undefined` matches only unowned jobs. Omit the
 * filter entirely for a manager-wide view.
 */
export interface AsyncJobFilter {
    ownerId: string | undefined;
}
export declare class AsyncJobManager {
    #private;
    /** Process-global instance shared by internal URL protocol handlers and tools. */
    static instance(): AsyncJobManager | undefined;
    /** Install or clear the process-global instance. */
    static setInstance(value: AsyncJobManager | undefined): void;
    /** Reset the process-global instance. Test-only. */
    static resetForTests(): void;
    constructor(options: AsyncJobManagerOptions);
    /** True when the running-job count has reached the configured cap. */
    get atCapacity(): boolean;
    register(type: AsyncJobType, label: string, run: (ctx: {
        jobId: string;
        signal: AbortSignal;
        reportProgress: (text: string, details?: AsyncJobDetails) => Promise<void>;
        /** Clear the queued flag once the job actually starts executing. */
        markRunning: () => void;
    }) => Promise<string | AsyncJobRunResult>, options?: AsyncJobRegisterOptions): string;
    /**
     * Cancel a single job by id. When a filter is given and its owner does not
     * match the job's owner, the call is treated as not-found (returns false)
     * so cross-agent cancellation is rejected at the manager level.
     */
    cancel(id: string, filter?: AsyncJobFilter): boolean;
    getJob(id: string): AsyncJob | undefined;
    /** Running background jobs; foreground-backed jobs stay hidden until promoted. */
    getRunningJobs(filter?: AsyncJobFilter): AsyncJob[];
    /** Settled background jobs, newest first; foreground-backed jobs stay hidden. */
    getRecentJobs(limit?: number, filter?: AsyncJobFilter): AsyncJob[];
    /** Every background job row; foreground-backed jobs stay hidden until promoted. */
    getAllJobs(filter?: AsyncJobFilter): AsyncJob[];
    /**
     * Promote a foreground-backed job to a real background job: it becomes
     * visible to listings and its completion is delivered (re-enqueued when it
     * already settled during the foreground wait). Returns false for unknown ids.
     */
    backgroundJob(jobId: string): boolean;
    /**
     * Drop a foreground-backed job whose result the foreground call already
     * returned (or whose call aborted). The row is discarded as soon as its run
     * settles and never surfaces as a background job.
     */
    releaseForegroundJob(jobId: string): void;
    getDeliveryState(filter?: AsyncJobFilter): AsyncJobDeliveryState;
    hasPendingDeliveries(filter?: AsyncJobFilter): boolean;
    watchJobs(jobIds: string[]): number;
    /**
     * Stop watching jobs. Settled jobs whose delivery was skipped while watched
     * and not consumed are re-enqueued.
     */
    unwatchJobs(jobIds: string[]): number;
    acknowledgeDeliveries(jobIds: string[]): number;
    /**
     * Mark settled job results as recovered by a foreground snapshot.
     *
     * Suppresses queued delivery and marks retained bodies as consumed so later
     * snapshots report execution state without replaying the same result.
     */
    consumeJobResults(jobIds: string[]): number;
    /** True once a result was auto-delivered or recovered by a foreground snapshot. */
    isJobResultConsumed(jobId: string): boolean;
    /**
     * Cancel running jobs. With a filter, cancels only jobs the matching owner
     * registered; with no filter, cancels every running job
     * (used by `dispose()` to nuke the manager's state).
     *
     * `reason` is forwarded to each job's `AbortController.abort`, so a session
     * teardown can tag its owned jobs with {@link ASYNC_JOB_MANAGER_SHUTDOWN_REASON}
     * before `dispose()` runs — the task executor reads it to park (not
     * tombstone) a subagent interrupted purely by process shutdown.
     */
    cancelAll(filter?: AsyncJobFilter, reason?: unknown): void;
    /**
     * Immediately evict completed and failed jobs matching the filter instead of
     * waiting for retention expiry, dropping every queued delivery so a prior
     * session's result can never be injected into a later transcript. Returns the
     * number of jobs evicted.
     *
     * A delivery whose sink call is already in flight (or drained onto a caller's
     * yield queue) is guarded by the owner's delivery generation, not the per-id
     * suppression marker — that marker is cleared when the id is reused.
     */
    evictCompletedJobs(filter?: AsyncJobFilter): number;
    waitForAll(): Promise<void>;
    /**
     * Route completions for jobs owned by `ownerId` to `sink`. Sessions register
     * their own sink at construction and unregister on dispose. Owned deliveries
     * with no live sink are dead-lettered — `onJobComplete` serves only unowned
     * deliveries.
     *
     * Last registration wins for an owner id; the returned unregister clears the
     * mapping only while it still points at `sink`, so a revived session's fresh
     * registration survives its parked predecessor's late cleanup.
     */
    registerDeliverySink(ownerId: string, sink: AsyncJobDeliverySink): () => void;
    /**
     * Wait until every job owned by `ownerId` has settled — its run promise
     * resolved, which for cancelled jobs means the underlying process actually
     * exited. Jobs registered while waiting (e.g. by a follow-up turn) are
     * awaited too. Returns false when `timeoutMs` elapses first.
     *
     * `excludeSuppressed` skips jobs whose delivery is suppressed (acknowledged
     * or `wait`-watched): those can never re-wake a run, so quiescence barriers
     * pass it to share one contract with the pending-async-wake predicate.
     * Teardown reaps omit it — worktree safety concerns every owner process.
     */
    waitForOwnerJobs(ownerId: string, options?: {
        timeoutMs?: number;
        excludeSuppressed?: boolean;
    }): Promise<boolean>;
    /**
     * Cancel every job owned by `ownerId`, then wait only until `deadlineAt`.
     * The returned completion keeps waiting for actual process settlement when
     * the deadline expires, so callers can move that cleanup out of the
     * user-visible Task wait without losing ownership of the live work.
     */
    cancelAndReapOwnerJobs(ownerId: string, deadlineAt: number): Promise<AsyncJobReapResult>;
    drainDeliveries(options?: {
        timeoutMs?: number;
        filter?: AsyncJobFilter;
    }): Promise<boolean>;
    dispose(options?: {
        timeoutMs?: number;
    }): Promise<boolean>;
    isDeliverySuppressed(jobId: string): boolean;
}
