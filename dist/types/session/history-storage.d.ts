/** A unique prompt with provenance from its most recent submission. */
export interface HistoryEntry {
    /** Stable row identifier used by the full-text index. */
    id: number;
    /** Trimmed prompt text, unique across the history database. */
    prompt: string;
    /** Unix timestamp of the most recent submission. */
    created_at: number;
    /** Project working directory of the most recent submission. */
    cwd?: string;
    /** Session ID of the most recent submission, if known. */
    sessionId?: string;
    /** Number of times this prompt has been submitted, including the first. */
    useCount: number;
}
/** Narrows history reads; omitted fields match every prompt. */
export interface HistoryFilter {
    /** Exact project working directory of the prompt's latest submission. */
    cwd?: string;
    /** Exact session id of the prompt's latest submission. */
    sessionId?: string;
}
/** Stores searchable prompts with only their latest project and session metadata. */
export declare class HistoryStorage {
    #private;
    private constructor();
    /** Opens the process-wide prompt history database, quarantining a corrupt store once. */
    static open(dbPath?: string): HistoryStorage;
    /** Checkpoints and closes the process-wide database, and permits reopening it. */
    static close(): void;
    /**
     * Register a resolver that supplies the current session ID for prompts added
     * without an explicit `sessionId`. Evaluated synchronously at `add()` time so
     * each write captures the session active when the prompt was submitted.
     */
    setSessionResolver(resolver: () => string | undefined): void;
    /** Register a callback run after each successful {@link add}, once the row is durable. */
    setAddListener(listener: () => void): void;
    /** Register a callback for the first failed write in each outage, reset by a successful write. */
    setErrorListener(listener: (error: unknown) => void): void;
    /**
     * Stores a prompt, replaces its provenance with the latest submission, and
     * bumps its use count on resubmission.
     * The write is synchronous: prompt submission is human-paced, not a hot
     * path. On success the row is durable the moment `add()` returns and cannot
     * be lost to an exit racing a deferred flush. Failures are logged, not thrown;
     * the error listener is notified once per outage until a write succeeds.
     */
    add(prompt: string, cwd?: string, sessionId?: string): Promise<void>;
    /** Returns unique prompts ordered by their most recent submission. */
    getRecent(limit: number, filter?: HistoryFilter): HistoryEntry[];
    /** Finds unique prompts matching every query token, newest first. */
    search(query: string, limit: number, filter?: HistoryFilter): HistoryEntry[];
    /**
     * IDs of the sessions whose stored prompts match `query`, ordered by prompt
     * recency and de-duplicated. Used to augment session ranking in the resume
     * picker with prompts that the 4KB session-list prefix never sees.
     */
    matchingSessionIds(query: string, limit?: number): string[];
}
