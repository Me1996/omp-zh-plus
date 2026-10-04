/**
 * Modal editing state machine for {@link Editor}.
 *
 * Deliberately a *pure* state machine: it reads a snapshot of the buffer and returns the edits it
 * wants applied, so motions can be unit-tested without a terminal and the editor keeps sole
 * ownership of undo, atomic placeholder tokens, the kill ring, and `onChange`.
 *
 * This is a usable subset of Vim, not a reimplementation of it (see issue #3299): Normal and Visual
 * modes, the common motions, and operators built from those motions.
 */
export type VimMode = "insert" | "normal" | "visual" | "visual-line";
export type VimOperator = "d" | "y" | "c";
export interface VimPosition {
    line: number;
    col: number;
}
/** Read-only view of the editor buffer that motions resolve against. */
export interface VimBuffer {
    readonly lines: readonly string[];
    readonly cursorLine: number;
    readonly cursorCol: number;
}
/**
 * An edit the editor should apply. `to` is always an *exclusive* end offset, so ranges compose the
 * same way regardless of whether the originating motion was inclusive (`e`) or exclusive (`w`).
 */
export type VimCommand = {
    kind: "move";
    to: VimPosition;
} | {
    kind: "mode";
    mode: VimMode;
} | {
    kind: "yank";
    from: VimPosition;
    to: VimPosition;
    linewise: boolean;
} | {
    kind: "delete";
    from: VimPosition;
    to: VimPosition;
    linewise: boolean;
    insert: boolean;
} | {
    kind: "openLine";
    below: boolean;
} | {
    kind: "paste";
    after: boolean;
    count: number;
} | {
    kind: "undo";
};
/** Start offset of the grapheme after `col`, clamped to `text.length`. */
export declare function nextGraphemeStart(text: string, col: number): number;
/** Start offset of the grapheme before `col`, clamped to 0. */
export declare function prevGraphemeStart(text: string, col: number): number;
/** Offset of the final grapheme — where a Normal-mode cursor rests on a non-empty line. */
export declare function lastGraphemeStart(text: string): number;
export declare class VimState {
    #private;
    mode: VimMode;
    /** Fixed end of a Visual selection; the cursor is the moving end. */
    anchor: VimPosition | null;
    /** True while a count, operator, `g`, or text-object prefix is half-typed — Escape cancels it. */
    get pending(): boolean;
    /**
     * The half-typed command as Vim would echo it (`"2"`, `"d"`, `"2d"`, `"di"`) — empty when
     * nothing is pending. Hosts render this next to the mode so a partially entered operator is
     * visible instead of silently swallowing the next keystroke.
     */
    get pendingText(): string;
    get visual(): boolean;
    reset(): void;
    /**
     * Handle one key. `key` is either the literal `"escape"` or a single grapheme; the editor
     * normalizes arrow/Home/End keys onto their Vim equivalents before calling.
     *
     * Returns the commands to apply, or `null` when the key is not ours — the editor then falls
     * through to its regular handling (and, for Escape in Normal mode, to the app's interrupt).
     */
    handleKey(key: string, buf: VimBuffer): VimCommand[] | null;
}
/**
 * Normalized, end-exclusive span covered by a Visual selection.
 *
 * Charwise selections include the grapheme under the cursor (Vim semantics); linewise selections
 * span whole lines, with `to.col` at the end of the last line so the caller can decide whether the
 * trailing newline goes too.
 */
export declare function visualRange(buf: VimBuffer, anchor: VimPosition, linewise: boolean): {
    from: VimPosition;
    to: VimPosition;
};
