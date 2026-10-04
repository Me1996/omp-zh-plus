import type { SessionEntry } from "./session-entries.js";
export declare const CONTEXT_NOTES_ENTRY_TYPE = "experimental_context_notes";
export declare const MAX_CONTEXT_NOTES_BYTES = 16384;
export interface ContextNotesEntry {
    version: 1;
    text: string;
}
export interface ContextNotesRevision {
    text: string;
    entryId: string;
}
/**
 * Returns the latest valid notebook revision visible after the active context-reset boundary.
 * Invalid historical custom entries are ignored so a malformed journal record cannot mask an
 * earlier valid notebook revision.
 */
export declare function getContextNotes(entries: readonly SessionEntry[]): ContextNotesRevision | undefined;
/**
 * Renders the context injection for the latest visible non-empty notebook revision.
 * An absent or explicitly cleared notebook returns an empty string so callers add no context.
 */
export declare function renderContextNotes(entries: readonly SessionEntry[]): string;
