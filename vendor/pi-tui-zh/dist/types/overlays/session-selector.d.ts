import { type Component, Input } from "../index.js";
import type { TspPickerGroup, TspPickerItem } from "@oh-my-pi/pi-wire";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/** Session lifecycle status presented by the picker. */
export type SessionSelectorStatus = "complete" | "interrupted" | "aborted" | "error" | "pending" | "unknown";
/** Session listing fields consumed by the picker. */
export interface SessionSelectorEntry {
    path: string;
    id: string;
    cwd: string;
    title?: string;
    modified: Date;
    created?: Date;
    size: number;
    firstMessage: string;
    allMessagesText: string;
    status?: SessionSelectorStatus;
    /** Path to the parent session when this one was forked. */
    parentSessionPath?: string;
}
import { OverlayPanel } from "../chrome/overlay-box.js";
/** The session list's part of the picker props, plus the memo keys it was built from. */
interface SessionPickerView {
    items: readonly TspPickerItem[];
    itemsAdd?: readonly TspPickerItem[];
    version: number;
    query: string;
    /** Search caret (UTF-16 offset into `query`). */
    cursor: number;
    order: readonly (string | TspPickerGroup)[];
    hits?: Readonly<Record<string, readonly (readonly [number, number])[]>>;
    selected: string | null;
    current: readonly string[];
    total: number;
}
/** Returns the IDs of sessions whose recorded prompts match a query, best first. */
export type SessionHistoryMatcher = (query: string) => string[];
/**
 * Filter and rank session picker search results.
 *
 * Exact and partial title matches lead. Other literal matches rank by recency
 * rather than a slightly better fuzzy position match. Pure fuzzy/acronym
 * matches still sort by fuzzy score after literal matches, but weak pure
 * fuzzy tokens are dropped as noise.
 *
 * This is the synchronous reference implementation; {@link SessionList} runs
 * the same primitives incrementally so huge listings never block a keystroke.
 */
export declare function rankSessionSearchMatches<T extends SessionSelectorEntry>(allSessions: T[], query: string): T[];
/**
 * Combine metadata matches with prompt-history matches for ranking, using both
 * signals rather than replacing one with the other.
 *
 * - `fuzzy` is the ordered metadata/session-text result.
 * - `historyIds` are session IDs whose recorded prompts matched the query,
 *   ordered by prompt-history rank (typically newest matching prompt first); duplicates are tolerated.
 *
 * Ranking: prompt-history matches lead in history order, then remaining
 * metadata matches keep their existing order. A metadata match is never dropped,
 * and history matches not present in `allSessions` (e.g. deleted or out-of-scope
 * sessions) are ignored since they cannot be resumed from here.
 */
export declare function mergeSessionRanking<T extends SessionSelectorEntry>(allSessions: T[], fuzzy: T[], historyIds: string[]): T[];
/**
 * Custom session list component with multi-line items and search
 */
declare class SessionList<T extends SessionSelectorEntry> implements Component {
    #private;
    onSelect?: (session: T) => void;
    onCancel?: () => void;
    onExit: () => void;
    onToggleScope?: () => void;
    onDeleteRequest?: (session: T) => void;
    /** Re-render hook for async list updates (fuzzy scan chunks, history merge). */
    onRequestRender?: () => void;
    constructor(sessions: T[], showCwd?: boolean, historyMatcher?: SessionHistoryMatcher, getTerminalRows?: () => number, pinnedIds?: ReadonlySet<string>, currentSessionPath?: string | (() => string | undefined));
    /** Replace the visible dataset, e.g. when toggling folder/all-projects scope. */
    setSessions(sessions: T[], showCwd: boolean, pinnedIds?: ReadonlySet<string>): void;
    /** Cancel pending async search work; idempotent, called on every picker exit path. */
    dispose(): void;
    removeSession(sessionPath: string): void;
    /** Resolve a list-local rendered-line index to a filtered-session index. */
    hitTestSession(line: number): number | undefined;
    /** Wheel notch: move the selection one step (clamped, no wrap). */
    handleWheel(delta: -1 | 1): void;
    /** Mouse click: select the session under the pointer and resume it. */
    selectAndConfirm(index: number): void;
    /** Native click on a session item: the same outcome as a mouse click (select + resume). */
    confirmSession(path: string): void;
    /** Native row click: move the selection there, as the arrow keys would. */
    selectSession(path: string): void;
    /** Enter: resume the selected session. */
    resumeSelected(): void;
    /** Delete / Backspace on an empty query: ask the parent to confirm deleting the selected session. */
    requestDelete(): void;
    /** Empty the search query (the empty state's "Clear search"). */
    clearSearch(): void;
    get selectedSession(): T | undefined;
    /** Label of the session at `sessionPath` in this listing, else its file name. */
    parentLabel(sessionPath: string): string;
    /**
     * The session list's picker data. `items` is the whole scope and keeps its
     * identity while typing (rebuilt when the set, pins, the live session or
     * the minute change); a query changes only `order`, `hits` and
     * `selected`, plus `itemsAdd` upserts for prompt-history badges. Without
     * a query `order` groups pinned sessions, then by day (Today, Yesterday,
     * This week, Earlier); with one it is the flat ranking.
     */
    pickerView(): SessionPickerView;
    get searchInput(): Input;
    /**
     * The session list as a native `list` keyed `"list"`, items keyed by
     * session path. The terminal owns scrolling and virtualization; item nodes
     * are cached per session and the list node while nothing visible changed.
     */
    describeList(): NativeNode;
    invalidate(): void;
    render(width: number): readonly string[];
    handleInput(keyData: string): void;
}
export interface SessionSelectorOptions<T extends SessionSelectorEntry = SessionSelectorEntry> {
    onDelete?: (session: T) => Promise<boolean>;
    historyMatcher?: SessionHistoryMatcher;
    /** Loads sessions across all projects for the all-projects scope toggle (Tab). */
    loadAllSessions?: () => Promise<T[]>;
    /** Preloaded all-projects list; cached so the first Tab toggle is instant. */
    allSessions?: T[];
    /** Picker heading; defaults to "Resume Session". */
    title?: string;
    /** Fixed scope label, or false to omit the scope suffix. */
    scopeLabel?: string | false;
    /** Show each session's working directory in the list. */
    showCwd?: boolean;
    /**
     * Reads the live terminal height so the visible window fits the viewport.
     * Omitted only in tests; defaults to a conservative 24 rows.
     */
    getTerminalRows?: () => number;
    /**
     * Fill the whole viewport and pin the footer (hint + bottom border) to the
     * last rows, so the footer stops drifting as the list window changes height.
     * Set by the standalone `--resume` picker (fullscreen alternate screen); the
     * in-editor selector leaves it off and renders compactly.
     */
    fillHeight?: boolean;
    /** Set of pinned session ids to display with a pin indicator. */
    pinnedIds?: ReadonlySet<string>;
    /** Path of the live session, or a getter so detach/newSession stays accurate. */
    currentSessionPath?: string | (() => string | undefined);
    /**
     * The picker is the whole program (`omp --resume`): the native picker
     * fills the screen surface (`size:"screen"`) instead of floating as a
     * sheet over the transcript.
     */
    standalone?: boolean;
}
/**
 * Component that renders a session selector with optional confirmation dialog
 */
export declare class SessionSelectorComponent<T extends SessionSelectorEntry = SessionSelectorEntry> extends OverlayPanel {
    #private;
    constructor(sessions: T[], onSelect: (session: T) => void, onCancel: () => void, onExit: () => void, options?: SessionSelectorOptions<T>);
    setOnRequestRender(callback: () => void): void;
    /** Ignore input after selection while the host resumes the session. */
    lockInput(): void;
    /** Re-enable input after a failed resume so the user can pick again. */
    unlockInput(): void;
    /**
     * Dispose the session list explicitly: while the delete-confirmation dialog
     * is mounted the list is detached from the child tree, so Container's
     * child-walking dispose would miss its pending history-merge timer.
     */
    dispose(): void;
    /**
     * Render the panel directly so fill-height mode can keep its footer pinned
     * while sharing OverlayPanel's exact rounded-box chrome. Children receive
     * the panel's inner width before their rows are wrapped.
     */
    render(width: number): readonly string[];
    /** Over the transcript the picker is its own sheet (`layer`); the standalone app fills the screen surface. */
    nativeSheet(cx: DescribeContext): boolean;
    /**
     * With the `picker` kind: the data-first session picker (§4.7). Otherwise
     * scope `tabs`, loading/error message, then the search `input` and session
     * `list` — or the delete-confirmation dialog in their place, as on the ANSI
     * path — and the key-hint footer.
     */
    describe(cx: DescribeContext): NativeNode;
    /** Picker events (root keypath); fallback: scope tab → toggle scope, click on a session → resume it, exactly like a mouse click. */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(keyData: string): void;
    getSessionList(): SessionList<T>;
}
export {};
