import type { Component } from "../../tui.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../../native/node.js";
/** Host capabilities for copying and fetching earlier log entries. */
export interface LogViewerDeps {
    copyToClipboard(text: string): void;
    hasOlderLogs?(): boolean;
    loadOlderLogs?(limitDays?: number): Promise<string>;
}
/** Separator marking logs captured before the current process started. */
export declare const SESSION_BOUNDARY_WARNING = "### WARNING - Logs above are older than current session!";
/** Action row for loading earlier log entries. */
export declare const LOAD_OLDER_LABEL = "### MOVE UP TO LOAD MORE...";
type DebugLogViewerModelOptions = {
    processStartMs?: number;
    processPid?: number;
    hasOlderLogs?: () => boolean;
    loadOlderLogs?: (limitDays?: number) => Promise<string>;
};
type ViewerRow = {
    kind: "warning";
} | {
    kind: "load-older";
} | {
    kind: "log";
    logIndex: number;
};
/** Split raw log text into nonempty entries. */
export declare function splitLogText(logText: string): string[];
/** Build sanitized clipboard text from selected log entries. */
export declare function buildLogCopyPayload(lines: string[]): string;
/** Filter, paginate, expand, and select captured log entries. */
export declare class DebugLogViewerModel {
    #private;
    constructor(logText: string, options?: DebugLogViewerModelOptions);
    get logCount(): number;
    get visibleLogCount(): number;
    get rows(): readonly ViewerRow[];
    get cursorRowIndex(): number | undefined;
    get cursorLogIndex(): number | undefined;
    get filterQuery(): string;
    get cursorRowKind(): ViewerRow["kind"] | undefined;
    get expandedCount(): number;
    isProcessFilterEnabled(): boolean;
    isCursorAtFirstSelectableRow(): boolean;
    getRawLine(logIndex: number): string;
    setFilterQuery(query: string): void;
    toggleProcessFilter(): void;
    moveCursor(delta: number, extendSelection: boolean): void;
    moveCursorToRow(rowIndex: number, extendSelection: boolean): boolean;
    getSelectedLogIndices(): number[];
    getSelectedCount(): number;
    isSelected(logIndex: number): boolean;
    isExpanded(logIndex: number): boolean;
    expandSelected(): void;
    collapseSelected(): void;
    getSelectedRawLines(): string[];
    selectAllVisible(): void;
    canLoadOlder(): boolean;
    loadOlder(additionalCount?: number): Promise<boolean>;
    prependLogs(logText: string): number;
}
interface DebugLogViewerComponentOptions {
    logs: string;
    terminalRows: number;
    onExit: () => void;
    onStatus?: (message: string) => void;
    onError?: (message: string) => void;
    processStartMs?: number;
    processPid?: number;
    deps: LogViewerDeps;
    onUpdate?: () => void;
}
/** Interactive log viewer with host-provided storage and clipboard capabilities. */
export declare class DebugLogViewerComponent implements Component {
    #private;
    constructor(options: DebugLogViewerComponentOptions);
    handleInput(keyData: string): void;
    invalidate(): void;
    dispose(): void;
    /** A `picker` sheet floats over the transcript instead of taking the screen. */
    nativeSheet(cx: DescribeContext): boolean;
    /**
     * The logs as a picker sheet: the filter as its query, one row per entry
     * (message, fields, time, pid, level dot) with the session boundary as a
     * group head, the range selection checked, the entry under the cursor
     * pretty-printed below, and the keys' actions in the bar. Without the
     * `picker` kind it falls back to rows.
     */
    describe(cx: DescribeContext): NativeNode | null;
    /**
     * Pointer actions run the keys' code: a row click moves the cursor there,
     * a second click copies it (or loads older entries from that row), and the
     * bar's buttons mirror their keys.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
export {};
