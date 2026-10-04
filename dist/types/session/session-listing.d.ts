import { type SessionStorage } from "./session-storage.js";
/**
 * Coarse lifecycle status of a session, derived from its last persisted message.
 *
 * - `complete` — the last assistant turn ended with no unanswered tool calls, i.e.
 *   the agent yielded control back to the user.
 * - `interrupted` — work was cut off mid-flight: a trailing assistant turn with
 *   pending tool calls, a trailing tool result the agent never continued from, or
 *   a length-truncated turn.
 * - `aborted` — the last assistant turn was cancelled by the user.
 * - `error` — the last assistant turn ended in an error.
 * - `pending` — a trailing user message with no assistant reply persisted after it.
 * - `unknown` — status could not be determined (empty/header-only session, or the
 *   final message was larger than the tail window that was read).
 */
export type SessionStatus = "complete" | "interrupted" | "aborted" | "error" | "pending" | "unknown";
export interface SessionInfo {
    path: string;
    id: string;
    /** Working directory where the session was started. Empty string for old sessions. */
    cwd: string;
    title?: string;
    /** Path to the parent session (if this session was forked). */
    parentSessionPath?: string;
    created: Date;
    modified: Date;
    messageCount: number;
    /** Persisted assistant turns; zero means the agent never replied (0-turn session). */
    assistantTurns?: number;
    /** File size in bytes on disk; used for compact list rendering. */
    size: number;
    firstMessage: string;
    allMessagesText: string;
    /**
     * Coarse lifecycle status from the session's last persisted message. Optional:
     * synthesized {@link SessionInfo}s (cross-project stubs, tests) leave it unset.
     */
    status?: SessionStatus;
}
export interface ResolvedSessionMatch {
    session: SessionInfo;
    scope: "local" | "global";
}
/** Lightweight metadata for a recent session, used in welcome/picker UI. */
export interface RecentSessionInfo {
    path: string;
    name: string;
    timeAgo: string;
}
/**
 * Friendly display name for a session: explicit title, then first user prompt,
 * then a timestamp-based label. The raw UUID `id` is intentionally never used —
 * it is unfriendly and indistinguishable from neighboring sessions in the UI.
 */
export declare function sessionDisplayName(info: SessionInfo): string;
/**
 * Promote orphaned `<basename>.jsonl.<snowflake>.bak` backups created by the
 * EPERM-rewrite path back to their primary path when the primary is missing.
 * This runs once per session-dir scan, before the main `*.jsonl` glob, so a
 * crash between the two renames in the EPERM-rewrite path does not leave the
 * user's last good state stranded outside the loader's view.
 *
 * Exported for testing.
 */
export declare function recoverOrphanedBackups(sessionDir: string, storage: SessionStorage): Promise<void>;
/**
 * List sessions in a resolved session directory (newest first), reading each
 * file's lifecycle {@link SessionStatus}.
 */
export declare function listSessions(sessionDir: string, storage: SessionStorage): Promise<SessionInfo[]>;
/**
 * List sessions without repairing orphaned backups or mutating the directory.
 */
export declare function listSessionsReadOnly(sessionDir: string, storage: SessionStorage): Promise<SessionInfo[]>;
/** List all sessions across all project directories (newest first). */
export declare function listAllSessions(storage?: SessionStorage, sessionsRoot?: string): Promise<SessionInfo[]>;
/**
 * True when a scanned session is a 0-turn stub with no display name: the tail
 * lifecycle shows no assistant activity (pending user-only or unscannable)
 * and neither a title nor a first prompt worth showing. Covers header-only
 * records (`newSession()` boundaries, `ensureOnDisk()` stubs, drafts) and
 * user-only sessions whose prompt text never made the prefix scan. A title or
 * first prompt is user intent worth resuming, so named 0-turn sessions stay
 * discoverable. The tail — not the 4 KB prefix — decides answered-ness, so a
 * transcript whose first assistant record starts past the prefix is never
 * elided. The picker and `--continue` skip these; every other consumer (GC,
 * ACP, `resolveResumableSession`) keeps the unfiltered scan.
 */
export declare function isEmptySession(session: SessionInfo): boolean;
/** Picker-facing view of a session list: empties dropped, pinned sessions kept. */
export declare function filterSessionsForPicker(sessions: SessionInfo[], pinnedIds: ReadonlySet<string>): SessionInfo[];
/** Most recent session with resumable content, skipping 0-turn empties. Exported for testing. */
export declare function findMostRecentNonEmptySession(sessionDir: string, storage?: SessionStorage): Promise<string | null>;
/** Exported for testing */
export declare function findMostRecentSession(sessionDir: string, storage?: SessionStorage): Promise<string | null>;
/** Header-level {@link SessionInfo} with status for one session file; undefined when unreadable or not a session. */
export declare function readSessionInfo(file: string): Promise<SessionInfo | undefined>;
/** Selects which session files {@link listRecentSessions} considers. */
export interface RecentSessionsQuery {
    /** Maximum sessions returned. */
    limit: number;
    /** One project's session directory; omitted spans every project under `sessionsRoot`. */
    sessionDir?: string;
    /** Root holding one directory per project. Default: {@link getSessionsDir}. */
    sessionsRoot?: string;
}
/**
 * Newest non-empty sessions by mtime, with lifecycle status. Stats every
 * candidate file but content-scans only until `limit` sessions are found, so
 * it stays fast across tens of thousands of sessions where
 * {@link listAllSessions} scans everything.
 */
export declare function listRecentSessions(query: RecentSessionsQuery): Promise<SessionInfo[]>;
/** One project directory summarized from its session files. */
export interface ProjectSummary {
    /** Working directory recorded by the project's newest non-empty session. */
    cwd: string;
    /** Session files in the project's directory, 0-turn empties included. */
    sessionCount: number;
    /** Newest non-empty session; its `modified` is the project's last activity. */
    latest: SessionInfo;
}
/**
 * Projects by last activity, newest first. Stats every session file under
 * `sessionsRoot` but content-scans only the files needed to find each listed
 * project's newest non-empty session. Directories holding only empty sessions
 * are skipped; directories resolving to an already-listed cwd are not repeated.
 */
export declare function listRecentProjects(limit: number, sessionsRoot?: string): Promise<ProjectSummary[]>;
/**
 * Session files under every project directory whose session id starts with
 * `idPrefix`, located by filename without reading content. Prefixes outside
 * `[A-Za-z0-9_-]` match nothing, so the prefix is never interpreted as a glob.
 */
export declare function findSessionFiles(idPrefix: string, sessionsRoot?: string): Promise<string[]>;
/**
 * Get recent sessions for display in the welcome screen.
 *
 * Deliberately avoids {@link scanSessionDir}'s full-directory content scan
 * (multi-hundred-ms with thousands of sessions): lists files, sorts by mtime,
 * and resolves names for the newest `limit` files from the history.db title
 * index. Files without an indexed title (legacy sessions, branch/fork copies)
 * fall back to a per-file header scan whose title — when present — is
 * backfilled into the index so the next launch skips the read.
 */
export declare function getRecentSessions(sessionDir: string, limit?: number, storage?: SessionStorage): Promise<RecentSessionInfo[]>;
/** Controls cross-directory fallback for resumable session lookup. */
export interface ResolveResumableSessionOptions {
    /** Search default global session buckets after the active/custom session directory misses. */
    allowGlobalFallback?: boolean;
}
export declare function resolveResumableSession(sessionArg: string, cwd: string, sessionDir?: string, storageOrOptions?: SessionStorage | ResolveResumableSessionOptions, options?: ResolveResumableSessionOptions): Promise<ResolvedSessionMatch | undefined>;
