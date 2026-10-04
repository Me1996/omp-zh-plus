import type { SessionEntry } from "../session/session-entries.js";
import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeSpec, UrlCompletion } from "./types.js";
/**
 * Render every persisted entry on the caller's live branch without the
 * compaction filters that shape model context. Each block begins with the
 * durable session-entry id, making references unambiguous across compactions
 * and branch rewinds.
 */
export declare function formatCurrentBranchFullHistory(entries: readonly SessionEntry[]): string;
/**
 * Handler for history:// URLs.
 *
 * Resolves agent ids against the global AgentRegistry, then falls back to
 * on-disk `.jsonl` transcripts, serving read-only history for live, parked,
 * and unregistered agents alike.
 */
export declare class HistoryProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "history";
    readonly spec: SchemeSpec;
    promptDoc(): string;
    /**
     * The JSONL session file the transcript is rendered from. The index and
     * `history://current/full` render from memory, so they locate to null, as
     * do live agents without a session file and unknown ids.
     */
    locate(url: InternalUrl, context?: ResolveContext): Promise<string | null>;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    complete(): Promise<UrlCompletion[]>;
}
