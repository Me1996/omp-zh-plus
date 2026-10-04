import type { SessionEntry, SessionHeader } from "./session-entries.js";
/** Persisted subagent session transcript, keyed by slash-joined agent path. */
export interface SubSession {
    /** Bare agent id (session file stem), e.g. "ToolAsk". */
    agentId: string;
    /** Key of the parent sub-session, or null when spawned by the main session. */
    parent: string | null;
    header: SessionHeader | null;
    entries: SessionEntry[];
    leafId: string | null;
    /** The subagent was explicitly killed (a tombstone sidecar sits next to its transcript). */
    aborted: boolean;
}
/**
 * Collect subagent session transcripts stored next to a session file.
 *
 * Keys in the returned record are slash-joined ids relative to the main session
 * ("ToolAsk", "ToolAsk/Helper"). Corrupt or empty files are skipped silently.
 */
export declare function collectSubSessions(sessionFile: string): Promise<Record<string, SubSession>>;
