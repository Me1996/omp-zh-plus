/**
 * Diff pane of the git TUI, with four view modes:
 *
 * - `split` (default): old file left, new file right, aligned line-by-line
 *   with word-level intraline emphasis and faint fillers for one-sided rows.
 * - `inline`: the full file with deletions/additions stacked in place.
 * - `hunk`: only the changed regions (3 context lines), one block per hunk
 *   with `@@` headers and per-hunk stage/unstage/discard buttons.
 * - `file`: the current (new) side only, plain syntax-highlighted view.
 *
 * The right edge carries a minimap-style scrollbar encoding change density
 * (deletions > additions > changes > context, hunk headers in accent) with
 * the visible viewport brightened; clicking it seeks. Long lines either pan
 * horizontally (`←`/`→`) or soft-wrap when word wrap is enabled.
 */
import type { DiffStreamResult } from "@oh-my-pi/pi-natives";
import { type ImageBudget } from "../../components/image.js";
import { type FileAssetSide, type FileStreamUpdate } from "./state.js";
/** Column ranges (inclusive start, exclusive end) carrying intraline emphasis. */
type MarkRanges = readonly (readonly [number, number])[];
type RowKind = "context" | "change" | "add" | "del";
interface DiffRow {
    readonly kind: RowKind;
    readonly oldNum?: number;
    readonly newNum?: number;
    /** Tab-expanded line for each side ("" when absent). */
    readonly oldText: string;
    readonly newText: string;
    readonly oldWidth: number;
    readonly newWidth: number;
    readonly oldMarks?: MarkRanges;
    readonly newMarks?: MarkRanges;
    /** Raw (untab-expanded) source lines, for patch construction. */
    readonly oldRaw?: string;
    readonly newRaw?: string;
}
/** One changed region with its applyable patch for hunk-level staging. */
export interface HunkBlock {
    /** `@@ -a,b +c,d @@` header shown above the block. */
    readonly header: string;
    /** Standalone patch text for this hunk, or "" when not applyable. */
    readonly patch: string;
    readonly rows: readonly DiffRow[];
}
/** Aligned diff document produced by {@link buildDiffDocument}. */
export interface DiffDocument {
    readonly filePath: string;
    readonly rows: readonly DiffRow[];
    readonly hunks: readonly HunkBlock[];
    /** Tab-expanded new-side lines for the `file` view. */
    readonly fileLines: readonly {
        text: string;
        width: number;
    }[];
    /** Tab-expanded source lines, retained for progressive syntax highlighting. */
    readonly oldDisplayLines: readonly string[];
    /** Tab-expanded source lines, retained for progressive syntax highlighting. */
    readonly newDisplayLines: readonly string[];
    readonly additions: number;
    readonly deletions: number;
    readonly gutterWidth: number;
    readonly maxLineWidth: number;
    /** False when built with whitespace-ignore: hunk patches would not apply. */
    readonly canPatch: boolean;
    /** Raw input texts and newline state, for line-selection patches. */
    readonly rawOld: string;
    readonly rawNew: string;
    readonly oldEndsNewline: boolean;
    readonly newEndsNewline: boolean;
    /** Index into {@link rows} for each 1-based new-file line number. */
    readonly rowIndexByNewLine: readonly number[];
}
/** How the pane presents the document. */
export type ViewMode = "split" | "inline" | "hunk" | "file";
/** Hunk-button actions raised to the root component. */
export type HunkAction = "stage" | "unstage" | "discard";
/**
 * Whitespace handling for {@link buildDiffDocument}:
 *
 * - `off`: exact, byte-level alignment.
 * - `whitespace`: align ignoring leading/trailing whitespace (disables hunk
 *   patches — the alignment no longer matches git's view of the file).
 * - `formatting`: exact alignment, but changed blocks that only move
 *   whitespace around (indentation, line splits/joins, blank lines) or only
 *   touch import statements (ts/js, rust, go) are demoted to context.
 */
export type WhitespaceMode = "off" | "whitespace" | "formatting";
/** Options for {@link buildDiffDocument}. */
export interface DiffBuildOptions {
    /** Whitespace handling; defaults to `off`. */
    whitespace?: WhitespaceMode;
    /** Exact runs/hunks already computed by the native streaming differ. */
    streamResult?: DiffStreamResult;
}
/** Build the aligned document for one file from its raw old/new texts. */
export declare function buildDiffDocument(oldRaw: string, newRaw: string, filePath: string, options?: DiffBuildOptions): DiffDocument;
/**
 * Build a patch covering only the changed rows inside `[from, to]` (indices
 * into `doc.rows`).
 *
 * - `apply`: base is the old side; the target adopts only the selected
 *   changes. Staging selected lines = apply this to the index.
 * - `revert`: base is the new side; the target undoes only the selected
 *   changes. Unstaging selected lines = apply `--cached`; discarding
 *   selected lines = apply to the worktree.
 *
 * Returns `null` when the selection touches no changes or the document
 * cannot produce patches (whitespace-ignore alignment).
 */
export declare function buildLineSelectionPatch(doc: DiffDocument, from: number, to: number, intent: "apply" | "revert"): string | null;
/** Placeholder states shown instead of a document. */
export type DiffPaneState = "empty" | "loading" | "streaming" | "asset" | "ready";
/** Result of a left click inside the pane. */
export type PaneClick = {
    type: "hunk-action";
    hunk: HunkBlock;
    action: HunkAction;
} | {
    type: "handled";
} | null;
/**
 * Scrollable diff viewport. The root component feeds it key/mouse input and
 * composes its rendered lines into the frame.
 */
export declare class DiffPane {
    #private;
    state: DiffPaneState;
    /** Message shown in the empty state. */
    emptyMessage: string;
    mode: ViewMode;
    wrap: boolean;
    /** Which hunk buttons apply: staging (unstaged), unstaging (staged), or none. */
    patchTarget: "stage" | "unstage" | null;
    selectedHunk: number;
    scrollTop: number;
    scrollLeft: number;
    /** Pane holds keyboard focus: the cursor band renders at full strength (dimmed otherwise). */
    focused: boolean;
    /** Cursor as a visual-row index; navigation keys move it. */
    cursor: number;
    /** Shift-selection anchor (visual-row index), or null when no selection. */
    anchor: number | null;
    constructor(imageBudget?: ImageBudget);
    get doc(): DiffDocument | null;
    setDocument(doc: DiffDocument | null, state: DiffPaneState): void;
    /** Show media previews and safe placeholders for non-text Git objects. */
    setAsset(filePath: string, old: FileAssetSide, next: FileAssetSide): void;
    /** Start a provisional file view while the native stream ingests both sides. */
    startStream(filePath: string): void;
    /** Merge newly completed native-stream lines into the provisional viewport. */
    updateStream(update: FileStreamUpdate): void;
    /** Incrementally syntax-highlight the active document without blocking input. */
    highlightAsync(signal: AbortSignal, requestRender: () => void): Promise<void>;
    setMode(mode: ViewMode): void;
    cycleMode(): void;
    toggleWrap(): void;
    scrollBy(delta: number): void;
    pageBy(direction: 1 | -1): void;
    scrollLeftBy(delta: number): void;
    /** Move the read-only cursor; `extend` grows the shift selection. */
    moveCursor(delta: number, extend: boolean): void;
    /** Drop the shift selection. True when there was one. */
    clearSelection(): boolean;
    /**
     * Selected span as indices into `doc.rows` (shift selection, or the cursor
     * row alone). Null when the cursor sits on rows that cannot map back to the
     * document (hunk-view rows, headers).
     */
    get selection(): {
        from: number;
        to: number;
        explicit: boolean;
    } | null;
    /** Center the viewport on a visual row (minimap seek, hunk jump). */
    seekTo(row: number): void;
    /** Jump to the next/previous hunk. False when already at the boundary. */
    jumpHunk(direction: 1 | -1): boolean;
    /** Snap to the first/last hunk — the landing spot when hunk nav crosses files. */
    seekHunk(edge: "first" | "last"): void;
    /** Move the cursor to the first/last visual row (home/end, `g`/`G`). */
    cursorToEdge(edge: "start" | "end"): void;
    /** Currently selected hunk (hunk view), if any. */
    get currentHunk(): HunkBlock | null;
    /** Handle a left click at pane-local coordinates. */
    clickAt(col: number, row: number, shift?: boolean): PaneClick;
    render(width: number, height: number): string[];
}
export {};
