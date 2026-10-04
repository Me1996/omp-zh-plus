import type { SessionEntry } from "../../session/session-entries.js";
/**
 * Slice canonical append-history for the Pi-compatible `get_entries` command.
 *
 * Delegates to the canonical `SessionManager` entry list (append order) and
 * applies only the `since` cursor — never a second history/indexing layer.
 *
 * - no `since` → all entries in append order;
 * - `since` → entries strictly after the matching durable entry;
 * - unknown `since` → throws; the caller maps it to an explicit RPC failure;
 * - always passes through the current `leafId` unchanged.
 */
export declare function selectRpcEntries(entries: readonly SessionEntry[], leafId: string | null, since?: string): {
    entries: SessionEntry[];
    leafId: string | null;
};
