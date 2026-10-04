import { type SessionSelectorEntry, type SessionHistoryMatcher } from "../overlays/session-selector.js";
/** Persistence and history capabilities supplied by the session-owning host. */
export interface SessionPickerHost<T extends SessionSelectorEntry = SessionSelectorEntry> {
    loadPinnedIds?(): Promise<ReadonlySet<string>>;
    loadHistoryMatcher?(): SessionHistoryMatcher;
    deleteSession?(session: T): Promise<boolean>;
    loadAllSessions?(): Promise<T[]>;
}
/** Presentation and capability controls for the standalone session picker. */
export interface SessionPickerOptions<T extends SessionSelectorEntry = SessionSelectorEntry> {
    allSessions?: T[];
    title?: string;
    scopeLabel?: string | false;
    showCwd?: boolean;
    allowDelete?: boolean;
    allowGlobalScope?: boolean;
    historySearch?: boolean;
    pinnedIds?: ReadonlySet<string>;
}
/**
 * Show the TUI session selector and return the selected session, or null if
 * cancelled. The default OMP picker supports deletion, transcript-history
 * search, and an all-projects scope; foreign import pickers disable those
 * source-owned capabilities.
 */
export declare function selectSession<T extends SessionSelectorEntry>(sessions: T[], options?: SessionPickerOptions<T>, host?: SessionPickerHost<T>): Promise<T | null>;
