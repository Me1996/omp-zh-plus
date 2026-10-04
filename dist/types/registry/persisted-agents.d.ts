import { type AgentRegistry } from "./agent-registry.js";
/** Whether `sessionFile` is the root transcript or lives in its artifacts tree. */
export declare function sessionFileBelongsToRoot(sessionFile: string, rootSessionFile: string): boolean;
/** Keep old parked trees out of a new/current session's model-facing roster. */
export declare function isCurrentSessionRosterRef(ref: {
    status: string;
    sessionFile: string | null;
}, rootSessionFile: string | undefined): boolean;
/**
 * Restore parked sibling transcripts once per current root session. Scans are
 * latched per root: concurrent calls for the same root share one in-flight
 * scan, while distinct roots stay latched independently but serialize their
 * scan bodies behind a failure-tolerant tail (a child basename shared across
 * roots must be observed as already-registered, never raced unseen). A settled
 * latch is reusable only while every parked ref its scan restored still matches
 * registry identity/session: a shared id another root's scan replaced (or a
 * released ref) invalidates the latch, so returning to this root re-scans
 * through the tail and restores its own transcripts instead of leaving the
 * other root's refs in this roster. The latch
 * cache is bounded by forgetting settled roots oldest-first, so a switch back
 * to an old root re-scans only once its latch was pruned. IO failure degrades
 * roster counts, never task startup, and remains retryable.
 */
export declare function ensurePersistedRoster(registry: AgentRegistry, sessionFileHint?: string | null): Promise<string | undefined>;
/** Register persisted subagent and advisor transcripts as parked registry refs. */
export declare function registerPersistedSubagents(registry: AgentRegistry, sessionFile: string | null | undefined, options?: {
    shouldContinue?: () => boolean;
    hydrateHistory?: boolean;
    /**
     * When supplied, every (id → sessionFile) pair this scan restores or
     * confirms as this root's parked ref is recorded here: the narrowest
     * root-ownership token `ensurePersistedRoster` validates settled latches
     * against, bounded by this root's own transcript tree.
     */
    owned?: Map<string, string>;
}): Promise<void>;
