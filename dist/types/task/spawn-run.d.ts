/**
 * A subagent run that holds one spawn-semaphore permit until it settles.
 *
 * The task tool starts every spawn through a `SpawnRun`: during dispatch, or
 * speculatively while the call's `tasks[]` still streams (see
 * `./speculative-launch`). The run executes detached from any owner; the
 * owner that adopts it binds its abort signal and progress/artifact sinks via
 * {@link SpawnRun.attach}, and the latest progress update replays on attach so
 * a run that advanced before adoption is not rendered as pending.
 */
import type { AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { TaskToolDetails } from "@oh-my-pi/pi-tui-zh/tools/task";
/** Wall-clock stamps a spawn reports to the executor: call time and permit time. */
export interface SpawnLaunchTiming {
    invokedAt: number;
    acquiredAt: number;
}
/** Permit source bounding concurrent subagents; the task tool's session semaphore. */
export interface SpawnPermit {
    acquire(signal: AbortSignal): Promise<void>;
    release(): void;
}
/** Everything the run body needs from its `SpawnRun`. */
export interface SpawnRunBody {
    signal: AbortSignal;
    timing: SpawnLaunchTiming;
    onUpdate: AgentToolUpdateCallback<TaskToolDetails>;
    onArtifactsRetained: (cleanup: () => Promise<void>) => void;
}
/** Launch-time identity an adopter checks: the pre-claimed agent id and whether the run is job-detached. */
export interface SpawnIdentity {
    agentId?: string;
    detached: boolean;
}
/** Owner bindings applied when a run is adopted. */
export interface SpawnRunOwner {
    signal?: AbortSignal;
    onUpdate?: AgentToolUpdateCallback<TaskToolDetails>;
    onArtifactsRetained?: (cleanup: () => Promise<void>) => void;
}
export declare class SpawnRun {
    #private;
    readonly identity: SpawnIdentity;
    /** Resolves once the permit is held; rejects with the acquire error when aborted first. */
    readonly started: Promise<SpawnLaunchTiming>;
    /** The run's payload; rejects only when `started` does. */
    readonly result: Promise<AgentToolResult<TaskToolDetails>>;
    /** Acquire a permit, then run `body` and release the permit when it settles. */
    constructor(permit: SpawnPermit, body: (run: SpawnRunBody) => Promise<AgentToolResult<TaskToolDetails>>, identity: SpawnIdentity);
    /** Bind the adopting owner: its abort cancels the run, and buffered progress/artifacts flush to it. */
    attach(owner: SpawnRunOwner): void;
    /** Abort an unadopted run and drop anything it retained; nothing ever consumes its result. */
    discard(reason: string): void;
}
