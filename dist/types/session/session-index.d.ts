/**
 * Record (or replace) the indexed title for a session id. Best-effort: index
 * failures must never break a rename, so errors are logged and swallowed.
 */
export declare function recordSessionTitle(sessionId: string, title: string): void;
/** Indexed title for a session id, or undefined when unindexed/unavailable. */
export declare function lookupSessionTitle(sessionId: string): string | undefined;
/**
 * Append an idle recap to the session's recap journal. Best-effort: a journal
 * failure must never disturb the recap display, so errors are logged and swallowed.
 */
export declare function recordSessionRecap(sessionId: string, cwd: string, recap: string): void;
/** One journaled idle recap. */
export interface SessionRecap {
    sessionId: string;
    /** Working directory of the session that produced the recap. */
    cwd: string;
    recap: string;
    /** Unix seconds. */
    createdAt: number;
}
/** Narrows {@link listSessionRecaps}; omitted fields match everything. */
export interface SessionRecapQuery {
    /** Recaps of these sessions only; empty matches nothing. */
    sessionIds?: readonly string[];
    /** Recaps produced in this exact working directory. */
    cwd?: string;
    /** Maximum rows returned. */
    limit?: number;
}
/**
 * Journaled recaps matching `query`, newest first. Best-effort like the
 * writers: an unavailable index or failed read yields an empty list.
 */
export declare function listSessionRecaps(query?: SessionRecapQuery): SessionRecap[];
/** @internal Close the cached connection so the next call re-resolves the db path — test-only. */
export declare function resetSessionIndexForTests(): void;
