import type { SessionPersistenceNotice } from "../session/session-manager.js";
/**
 * First-failure notice. The store keeps the unlanded entries in memory and
 * retries the whole transcript on the next write, so this reports a retryable
 * condition and claims nothing about durability — the write may still land.
 * `sanitizeText` leaves tabs and newlines intact, so both are normalized here
 * to keep the result on one line.
 */
export declare function formatPersistenceFailure(message: string): string;
/**
 * Teardown-time durability claim, emitted only while the store failure is
 * still latched at dispose: the retry never landed, so the transcript is not
 * durable and the in-memory entries are gone with the process.
 */
export declare function formatPersistenceDurabilityFailure(message: string): string;
/**
 * A {@link SessionPersistenceNotice}: saving continues, so this claims no
 * failure. Not truncated, because the notice names the session files the user
 * may need to find.
 */
export declare function formatPersistenceNotice(notice: SessionPersistenceNotice): string;
