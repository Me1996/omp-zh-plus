/**
 * Sharpshooter delta queue.
 *
 * Producers (per-prompt extraction) write one JSON file per delta under
 * `queue/<sessionId>/`; the consolidator lists, applies, and unlinks exactly the
 * files it read. File-per-delta makes producers lock-free: there is no shared
 * append fd to race against a consuming rename, and a crash between apply and
 * unlink only re-delivers deltas (consolidation is idempotent by construction —
 * newest-wins over full-file rewrites).
 */
import type { SharpshooterDelta } from "./types.js";
/** One queued delta plus the file backing it (consume token). */
export interface QueuedSharpshooterDelta {
    delta: SharpshooterDelta;
    file: string;
}
/** All queued deltas of one session, ordered oldest-first. */
export interface SharpshooterSessionDeltas {
    sessionId: string;
    deltas: QueuedSharpshooterDelta[];
}
/** Persist one delta into the session's queue directory. */
export declare function appendSharpshooterDelta(agentDir: string, cwd: string, delta: SharpshooterDelta): Promise<void>;
/**
 * Session ids become directory names; strip anything path-hostile. Ids are
 * UUID-shaped in practice, so this is defense, not normalization.
 */
export declare function sanitizeSessionId(sessionId: string): string;
/**
 * List every queued delta grouped per session, sessions ordered by their oldest
 * queued delta and deltas ordered oldest-first within each session. Unreadable
 * or corrupt entries are skipped (never consumed), so a torn write cannot wedge
 * the queue.
 */
export declare function listSharpshooterDeltas(agentDir: string, cwd: string): Promise<SharpshooterSessionDeltas[]>;
/**
 * Remove consumed delta files and prune emptied session directories. Missing
 * files are ignored — a concurrent consumer or manual cleanup already won.
 */
export declare function consumeSharpshooterDeltas(files: readonly string[]): Promise<void>;
/** Total queued delta count across sessions (for status displays). */
export declare function sharpshooterQueueDepth(agentDir: string, cwd: string): Promise<number>;
