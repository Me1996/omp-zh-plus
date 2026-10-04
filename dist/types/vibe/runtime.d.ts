import { type VibeSessionState, type VibeScreenSnapshot, type VibeSpawnOutcome, type VibeSendOutcome, type VibeKillOutcome, type VibeWaitOutcome } from "@oh-my-pi/pi-tui-zh/tools/vibe";
import type { AsyncJobManager } from "../async/job-manager.js";
import { SessionManager } from "../session/session-manager.js";
import type { ToolSession } from "../tools/index.js";
import { type VibeCli } from "@oh-my-pi/pi-tui-zh/tools/vibe";
/**
 * CLI flavor → bundled agent type. This IS the model-tier mapping: `sonic`
 * carries `model: "@smol"` (the configured fast/low-latency role) and `task`
 * carries `model: "@task"` (inherits the session's strong model).
 * Resolution goes through {@link resolveAgentModelSelection} exactly like a
 * `task` spawn, so `task.agentModelOverrides` and model-role settings apply.
 */
export declare const VIBE_CLI_AGENT: Record<VibeCli, string>;
export interface VibeOwnerScope {
    ownerId: string;
    parentSessionId: string;
    parentSessionFile: string | null;
}
export interface VibeParentSession {
    getAgentId?: () => string | null;
    getSessionId?: () => string | null;
    getSessionFile: () => string | null;
    sessionManager?: ToolSession["sessionManager"] & Partial<Pick<SessionManager, "appendModeChange" | "appendEntriesAtomically" | "recoverPersistenceFromCurrentState">>;
    asyncJobManager?: AsyncJobManager;
    settings: ToolSession["settings"];
    getActiveModelString?: () => string | undefined;
    getModelString?: () => string | undefined;
}
/** Thrown from a turn job body so the job manager marks the job failed while carrying the formatted result. */
export declare class VibeTurnError extends Error {
}
/**
 * Process-global registry of vibe worker sessions, scoped by both owner agent
 * id and stable parent session id. Persisted lifecycle events rebuild idle
 * records after a process restart; live turn jobs remain process-local.
 */
export declare class VibeSessionRegistry {
    #private;
    static global(): VibeSessionRegistry;
    /** Reset the global registry. Test-only. */
    static resetGlobalForTests(): void;
    /**
     * Insert a bare worker record without the spawn machinery. Test-only —
     * lets focused runtime tests attach an optional synthetic in-flight job.
     * Keyed like a real spawn in the `test-parent-session` scope (null file), so
     * id lookups (`vibe_wait` with named sessions, `vibe_kill`) resolve.
     */
    registerRecordForTests(record: {
        id: string;
        cli?: VibeCli;
        ownerId: string;
        state?: VibeSessionState;
        killed?: boolean;
        jobId?: string;
    }): void;
    /** Override the teardown grace period for deterministic lifecycle tests. */
    setTeardownGraceForTesting(timeoutMs: number): void;
    ownerScope(session: VibeParentSession): VibeOwnerScope;
    /** Re-open spawn admission after an explicit Vibe-mode entry. */
    activateScope(scope: VibeOwnerScope): void;
    listIds(session: ToolSession): string[];
    /** Ids of every live worker owned by `ownerId`, across all parent scopes (status-line tok/s aggregation). */
    listIdsByOwner(ownerId: string): string[];
    /**
     * Live screen snapshots for rich rendering (the "TV wall"): one entry per
     * session in creation order, carrying the in-flight turn's trace, current
     * tool, and streamed text tail. All strings are one-line sanitized here so
     * renderers can print them verbatim.
     */
    screens(session: ToolSession, ids?: string[]): VibeScreenSnapshot[];
    /** Reconcile resumable and terminal workers from the persisted parent journal. */
    rehydrate(session: VibeParentSession): Promise<number>;
    /** Spawn a persistent worker session and start its first turn in the background. */
    spawn(session: ToolSession, args: {
        cli: VibeCli;
        name?: string;
        prompt: string;
    }): Promise<VibeSpawnOutcome>;
    /**
     * Send a message to a worker. Mid-turn and streaming → steering; mid-turn
     * otherwise → queued for the next turn; idle/parked → starts a new
     * background turn immediately.
     */
    send(session: ToolSession, args: {
        session: string;
        message: string;
    }): Promise<VibeSendOutcome>;
    /**
     * Block until one watched session's in-flight turn settles, the timeout
     * elapses, or `signal` aborts — `hub` wait semantics. Settled turns are
     * acknowledged against the job manager so their results are not delivered
     * a second time as async follow-ups.
     */
    wait(session: ToolSession, args: {
        sessions?: string[];
        timeoutMs?: number;
        signal?: AbortSignal;
    }): Promise<VibeWaitOutcome>;
    /** Detach one parent's process-local workers without tombstoning their persisted conversations. */
    suspendScope(scope: VibeOwnerScope, manager?: AsyncJobManager): Promise<number>;
    /** Terminate one worker; a tombstone failure still tears it down before reconciliation and error delivery. */
    kill(session: ToolSession, id: string): Promise<VibeKillOutcome>;
    /** Kill every live session in one parent scope after durably recording the complete mode-exit intent. */
    killAll(session: VibeParentSession, ownerScope?: VibeOwnerScope): Promise<number>;
}
/**
 * Aggregate tok/s across every live vibe worker session owned by `ownerId`.
 * Returns null when no workers are streaming (so callers can fall back to
 * their own rate unchanged). The director is often idle while workers stream,
 * so without this aggregation the status-line tok/s badge would show a stale
 * value while parallel work is actively generating tokens.
 *
 * Reads each worker's last assistant message via {@link calculateTokensPerSecond}
 * — the same leaf calculator the main status line uses — so worker rates are
 * computed identically to the main session's rate.
 */
export declare function aggregateVibeWorkerTokensPerSecond(ownerId: string): number | null;
