/**
 * AgentRegistry - Process-global registry of agents (the main session plus
 * every subagent), keyed by stable id.
 *
 * Tracks each agent's status and (when live) its AgentSession so peers can be
 * addressed by id (`agent://`, `task resume`, `history://`). Sessions are
 * registered explicitly at creation; finished agents stay registered as
 * `idle` (live) or `parked` (session disposed, ref + sessionFile retained for
 * revival) and are only removed on explicit release/teardown.
 */
import type { AgentSession } from "../session/agent-session.js";
import { MAIN_AGENT_ID, type AgentStatus, type AgentMetricsSummary } from "@oh-my-pi/pi-tui-zh/overlays/agent-hub-types";
export { MAIN_AGENT_ID };
export type { AgentStatus, AgentMetricsSummary };
/**
 * - `main`/`sub`: the user-facing agent tree (driving agent + task subagents).
 * - `advisor`: a passive review transcript persisted like a subagent for usage
 *   attribution and Agent Hub observability, but never a peer — hidden from
 *   agent-facing rosters (`proc://`, `history://`) and not messageable/revivable.
 */
export type AgentKind = "main" | "sub" | "advisor";
/**
 * Run lifecycle milestones, stamped as they happen and scoped to the CURRENT
 * run: they are cleared when the ref re-enters `running` for a follow-up or
 * wake turn. Launch is the ref's `createdAt`; these are the post-launch
 * boundaries the parent needs to tell a genuinely working agent from one whose
 * accepted result never terminalized.
 */
export interface AgentRunLifecycle {
    /** When the run produced its final response (an accepted terminal `yield`). */
    responseAt?: number;
    /** When the run's final result was accepted by its driver. */
    acceptedAt?: number;
    /** When the ref last left `running` for a terminal status. */
    terminalAt?: number;
}
/** Historical identity and telemetry that remain available after the live session is disposed. */
export interface AgentHistorySummary {
    agent?: string;
    modelRole?: string;
    resolvedModel?: string;
    /** Whether the last resolved model was selected by retry fallback routing. */
    resolvedModelIsFallback?: boolean;
    metrics?: AgentMetricsSummary;
    readOnly?: boolean;
    /** Durable task output artifact, when the executor wrote one. */
    outputPath?: string;
    /** Captured isolated-worktree patch, when patch capture succeeded. */
    patchPath?: string;
    /** Isolated branch identity, when branch-mode capture succeeded. */
    branchName?: string;
    /** Captured nested-repo patches (`<id>.nested-<n>-<path>.patch`), one per nested repository the agent changed. */
    nestedPatchPaths?: string[];
}
export interface AgentRef {
    id: string;
    displayName: string;
    kind: AgentKind;
    parentId?: string;
    status: AgentStatus;
    /** Null exactly when parked/aborted. */
    session: AgentSession | null;
    sessionFile: string | null;
    createdAt: number;
    lastActivity: number;
    /** Short gist of what the agent is currently doing (latest intent or tool), for the work-aware roster. Display-only. */
    activity?: string;
    /** Persisted identity and telemetry restored after the live observer is gone. */
    history?: AgentHistorySummary;
    /** Run lifecycle milestones (launch is {@link createdAt}). */
    lifecycle?: AgentRunLifecycle;
}
export type AgentRefExpectation = AgentRef | AgentSession;
export type RegistryEvent = {
    type: "registered";
    ref: AgentRef;
} | {
    type: "status_changed";
    ref: AgentRef;
} | {
    type: "metadata_changed";
    ref: AgentRef;
} | {
    type: "removed";
    ref: AgentRef;
};
type RegistryListener = (event: RegistryEvent) => void;
export interface RegisterInput {
    id: string;
    displayName: string;
    kind: AgentKind;
    parentId?: string;
    session: AgentSession | null;
    sessionFile?: string | null;
    status?: AgentStatus;
    /** Last persisted task summary, when restoring a historical agent. */
    activity?: string;
    /** Original registration timestamp, when known from persisted history. */
    createdAt?: number;
    /** Last transcript activity timestamp, when known from persisted history. */
    lastActivity?: number;
    /** Persisted identity and telemetry restored after the live observer is gone. */
    history?: AgentHistorySummary;
    /** Run lifecycle milestones restored from persisted history, when known. */
    lifecycle?: AgentRunLifecycle;
}
export declare class AgentRegistry {
    #private;
    static global(): AgentRegistry;
    /** Reset the global registry. Test-only. */
    static resetGlobalForTests(): void;
    register(input: RegisterInput): AgentRef;
    /**
     * Register a new id only when it is absent, or reuse the exact detached
     * `parked` ref a revival was authorized to revive. A missing, replaced, or
     * terminal expected ref is a failed CAS: delayed revivers must never claim an
     * id after its prior generation disappeared or was hard-killed.
     */
    registerIfAvailable(input: RegisterInput, expected: AgentRef | null): AgentRef | undefined;
    /** Attach transcript-derived identity and telemetry without changing lifecycle state. */
    setHistory(id: string, history: AgentHistorySummary, expectedSessionFile?: string): boolean;
    setStatus(id: string, status: AgentStatus, expected?: AgentRefExpectation): boolean;
    /**
     * Record that this agent's run produced and handed over its final result,
     * and terminalize the ref when no turn is in flight. Acceptance is the
     * executor's run boundary: the result is settled, so a ref still `running`
     * with nothing streaming is a missed terminal transition the parent's
     * `wait` would otherwise keep blocking on. A ref with a genuinely
     * streaming session (a wake turn started at the boundary) stays `running`
     * and is surfaced by {@link staleAcceptedRuns} instead.
     *
     * Milestones are run-scoped: `responseAt` is the CURRENT call's response
     * time (never a previous run's, which {@link setStatus} cleared when the
     * ref re-entered `running`).
     *
     * Returns false when the id is gone, aborted, or no longer owned by
     * `expected`; those cases must not stamp a newer generation.
     */
    markResultAccepted(id: string, expected?: AgentRefExpectation, responseAt?: number): boolean;
    /**
     * Accepted-but-running refs: the run's final result was handed over but the
     * ref never left `running`, and no turn is in flight. This is the lifecycle
     * leak the `proc://` running-agents roster reports so the parent can cancel it
     * instead of waiting on a run that already finished.
     */
    staleAcceptedRuns(): AgentRef[];
    /**
     * Record a short activity gist for the work-aware roster. Display-only and
     * read on demand (`irc list`, peer roster), so it emits no event — keeping
     * the per-tool-call update rate off the registry listener path (same as
     * `attachSession`, which also bumps `lastActivity` without emitting). Only a
     * `running` agent has current work: a heartbeat for any other status is
     * dropped, so a late progress flush can't resurrect activity on a ref that
     * `setStatus` just cleared. Every running heartbeat refreshes `lastActivity`
     * — even when the gist text is unchanged — so the roster's "active … ago" and
     * recency sort track real work, not just the last status change.
     * The gist is normalized to one bounded line (`oneLineLabel`) so model-derived
     * intent text can neither break the roster nor smuggle terminal escapes —
     * every caller is safe without sanitizing at its own call site.
     */
    setActivity(id: string, activity: string): void;
    attachSession(id: string, session: AgentSession, sessionFile?: string | null, expected?: AgentRefExpectation): boolean;
    detachSession(id: string, expected?: AgentRefExpectation): boolean;
    unregister(id: string, expected?: AgentRefExpectation): boolean;
    get(id: string): AgentRef | undefined;
    list(): AgentRef[];
    /**
     * Returns every alive agent (running | idle) except the caller. Advisor refs
     * are observability-only transcripts, never peers, so they are excluded.
     * Flat namespace: every other agent is visible.
     */
    listVisibleTo(id: string): AgentRef[];
    /** Whether a ref's claimed running state is corroborated by its attached live session. */
    isRunning(ref: AgentRef): boolean;
    /** Mirror a session's authoritative run-state notifications into its owned registry ref. */
    syncSessionStatus(id: string, session: AgentSession): () => void;
    onChange(listener: RegistryListener): () => void;
}
