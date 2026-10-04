import type { SessionInfo } from "./session-listing.js";
/**
 * Read the global set of pinned session ids (`~/.omp/session-pins.json`). Pins
 * are keyed by session id, not file path, so they survive `/move` renames.
 * A missing file yields an empty set; a corrupt one degrades to empty with a
 * warning rather than breaking the resume picker.
 */
export declare function loadPinnedSessionIds(agentDir?: string): Promise<Set<string>>;
/**
 * Toggle one session's pin and persist the set; returns the new pinned state.
 *
 * The read-modify-write runs under the shared cross-process file lock and
 * commits via write-temp-then-atomic-replace, mirroring the MCP config
 * writer: two omp instances toggling pins concurrently can no longer lose
 * each other's update (load-load-write-write), and a crash mid-write leaves
 * the previous pins file intact instead of a truncated one that degrades to
 * an empty set. The replace preserves the destination across Windows
 * EPERM/EEXIST rename failures (`replaceFileAtomically`).
 */
export declare function toggleSessionPin(sessionId: string, agentDir?: string): Promise<boolean>;
/**
 * Stable partition putting pinned sessions on top: within each group the
 * caller's order (recency) is preserved. Unknown ids are a no-op so stale
 * pins for deleted sessions never disturb the listing.
 */
export declare function sortPinnedFirst(sessions: SessionInfo[], pinnedIds: ReadonlySet<string>): SessionInfo[];
