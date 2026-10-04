/**
 * Lifecycle control for async background jobs (bash scripts,
 * subagents) owned by the calling agent: wait/cancel/snapshot plus the
 * running-agents roster for activity with no job entry.
 */
import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { AsyncJob, AsyncJobDetails, AsyncJobManager, AsyncJobType } from "./job-manager.js";
import type { StructuredSubagentOutput } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { ToolSession } from "../tools/index.js";
import type { AgentActivitySnapshot, CancelOutcome, CoordinationDetails, JobSnapshot } from "@oh-my-pi/pi-tui-zh/tools/wait";
/**
 * Resolve a list of job ids to job records visible to the calling agent.
 * Drops missing ids and ids owned by other agents, preventing cross-agent inspection.
 * An unowned caller (`ownerId` undefined) sees only unowned jobs.
 */
export declare function visibleJobs(manager: AsyncJobManager, ids: string[], ownerId: string | undefined): AsyncJob[];
/**
 * Settled jobs owned by `ownerId` whose completion was accepted but has not
 * reached the owner yet: delivery queued or awaiting yield-queue injection,
 * dead-lettered, or skipped while a `wait` watched it. Consumed, acknowledged,
 * and currently watched results are excluded.
 */
export declare function undeliveredJobs(manager: AsyncJobManager, ownerId: string | undefined): AsyncJob[];
/**
 * Running subagents from the registry that are not covered by one of the
 * caller's running jobs. Agents woken via peer messaging (idle wake / park
 * revival) and spawns owned by another agent run with no AsyncJobManager
 * entry, yet the UI's agent badge counts them — a snapshot must account for
 * that activity instead of implying the system is quiet. Existence is
 * already public via the peer roster, so listing ids here leaks nothing new;
 * job *control* stays owner-scoped.
 *
 * Reporting deliberately uses the claimed `status`, not the session-corroborated
 * `registry.isRunning` used by the wait-sustaining gates: a ref that claims
 * `running` with no live turn is exactly the stale entry an operator must see
 * here to cancel it (#8634). Hiding it would match the badge count to nothing
 * and remove the only discovery path for the id.
 */
export declare function runningAgentsOutsideJobs(session: ToolSession): AgentActivitySnapshot[];
/**
 * Suffix flagging a claimed-running agent with no turn in flight; empty for a
 * live one. Shared by `jobs`, empty-wait results, and the `proc://` roster so
 * every surface tells a finished-but-unterminalized run (#11079) from real work.
 */
export declare function agentStaleNote(agent: AgentActivitySnapshot): string;
interface TrackedJobLike {
    id: string;
    type: AsyncJobType;
    status: string;
    label: string;
    startTime: number;
    endTime?: number;
    latestDetails?: AsyncJobDetails;
    resultText?: string;
    errorText?: string;
    structured?: StructuredSubagentOutput;
}
export declare function snapshotJobs(session: ToolSession, jobs: TrackedJobLike[], options?: {
    includeResults?: boolean;
}): JobSnapshot[];
export declare function buildJobResult(session: ToolSession, manager: AsyncJobManager, op: "wait" | "cancel" | "jobs", jobs: TrackedJobLike[], cancelOutcomes: CancelOutcome[], agents?: AgentActivitySnapshot[]): AgentToolResult<CoordinationDetails>;
/** `cancel`: kill the named jobs; returns immediately with outcomes + snapshots. */
export declare function executeCancel(session: ToolSession, manager: AsyncJobManager, ownerId: string | undefined, ids: string[]): Promise<AgentToolResult<CoordinationDetails>>;
/**
 * Kill a non-job-backed agent registration named by `id`: abort any in-flight
 * turn, then release it from the lifecycle (dispose session + unregister). This
 * is the only kill path for a keep-alive subagent that was budget-aborted, went
 * `idle`/`parked`, and outlived its job row — otherwise it is unstoppable short
 * of a broker restart (issue #6315). Scoped to the caller's own descendants so
 * cross-agent kills stay impossible; an unowned caller (no owner id) reaches
 * only parentless subs. Never touches Main, the caller, or advisor transcripts.
 */
export declare function cancelAgentRegistration(session: ToolSession, ownerId: string | undefined, id: string): Promise<CancelOutcome>;
export {};
