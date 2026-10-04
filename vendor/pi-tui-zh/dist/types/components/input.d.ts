import { type DescribeContext, type NativeNode, type NativeTextEdit, type NativeUiEvent } from "../native/node.js";
import { SpaceHoldGesture } from "../space-hold.js";
import { type Component, type Focusable } from "../tui.js";
/**
 * Input component - single-line text input with horizontal scrolling
 */
export declare class Input implements Component, Focusable {
    #private;
    /** Rendered before the editable area; set to "" for chrome-less embedding. */
    prompt: string;
    /** Render the editable value as bullets while retaining the real value internally. */
    mask: boolean;
    /** Dim hint a native terminal shows while the value is empty. */
    placeholder: string | undefined;
    onSubmit?: (value: string) => void;
    onEscape?: () => void;
    /** Space-bar push-to-talk; set its `handler` to enable it. */
    readonly spaceHold: SpaceHoldGesture;
    /** When set, replaces the cursor glyph at end-of-text with this ANSI-styled string. */
    cursorOverride: string | undefined;
    /** Focusable interface - set by TUI when focus changes */
    focused: boolean;
    getValue(): string;
    /** The caret as a UTF-16 offset into {@link getValue}. */
    getCursor(): number;
    /** Return bounded input content and cursor state for debug inspection. */
    debugState(): Record<string, unknown>;
    setValue(value: string): void;
    setUseTerminalCursor(useTerminalCursor: boolean): void;
    getUseTerminalCursor(): boolean;
    /**
     * Apply one key: the editor's text bindings (motion, deletion, kill ring,
     * undo), pastes and printable text. Returns whether the key was the
     * field's: false for keys it has no binding for, and for cancel/submit
     * without an `onEscape`/`onSubmit`, so a host (a list's search field) can
     * route everything else on.
     */
    handleInput(data: string): boolean;
    /** Apply terminal paste semantics to text from non-bracketed paste transports
     *  (e.g. kitty's OSC 5522 enhanced clipboard read). Mirrors `Editor.pasteText`. */
    pasteText(text: string): void;
    /** Terminal-side selection edits and undo on the `input` node (see {@link applyHostEdit}). */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * Apply an edit the terminal made over its own selection (TSP `edit`):
     * replace `[from, to)` with `text` (newlines stripped, as a paste) and put
     * the caret at `cursor`, as one undo unit. Offsets are in the described
     * text, so a masked field's count bullets, one per grapheme. Stale edits
     * (`len` no longer the described length) are dropped.
     */
    applyHostEdit(edit: NativeTextEdit): void;
    /** Programmatically trigger submission (e.g. for voice submit). */
    submit(): void;
    /** Delete up to `count` characters immediately before the cursor. */
    deleteBeforeCursor(count: number): void;
    /** Show or replace a volatile speech-to-text preview at the cursor, outside undo history.
     *  Finalize it with {@link commitVolatileText} or drop it with {@link clearVolatileText}. */
    setVolatileText(text: string): void;
    /** Remove the current volatile preview without committing it. */
    clearVolatileText(): void;
    /** Drop any volatile preview, then insert `text` as a single undoable edit. */
    commitVolatileText(text: string): void;
    invalidate(): void;
    /**
     * An `input` with the value, the caret as a UTF-16 offset and the prompt;
     * the terminal draws the caret, scrolls horizontally and places the IME.
     * A masked input sends one bullet per grapheme, with the caret mapped onto
     * them, so the secret never leaves the process.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
