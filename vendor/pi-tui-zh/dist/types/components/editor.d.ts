import { type AutocompleteProvider } from "../autocomplete.js";
import type { TspEditorDecoration, TspTone } from "@oh-my-pi/pi-wire";
import { type DescribeContext, type NativeChild, type NativeNode, type NativeTextEdit, type NativeUiEvent } from "../native/node.js";
import type { SymbolTheme } from "../symbols.js";
import { type Component, type Focusable } from "../tui.js";
import { type VimMode } from "../vim.js";
import { type EditorBorderStyle, type EditorTopBorder } from "./composer/index.js";
export type { EditorBorderStyle, EditorTopBorder };
import { type SelectListTheme } from "./select-list.js";
/** The TSP root an {@link Editor.describeLayout} hook builds around the `editor` node. */
export interface NativeEditorLayout {
    readonly role: string;
    /** Tone of the root (`pending` while a turn runs). */
    readonly tone?: TspTone;
    readonly children: readonly NativeChild[];
    /** Keypath of the `editor` node inside the root (the autocomplete's caret anchor). */
    readonly caret: string;
}
export interface EditorTheme {
    borderColor: (str: string) => string;
    /** Stable accent for composer chrome that should not follow the mutable border state. */
    accentColor?: (str: string) => string;
    /** Background fill used by filled composer styles. */
    surfaceColor?: (str: string) => string;
    /** Foreground used when the composer shape leaves its text surface transparent. */
    textColor?: (str: string) => string;
    selectList: SelectListTheme;
    symbols: SymbolTheme;
    editorPaddingX?: number;
    /** Style function for inline hint/ghost text (dim text after cursor) */
    hintStyle?: (text: string) => string;
}
interface HistoryEntry {
    prompt: string;
}
interface HistoryStorage {
    add(prompt: string, cwd?: string): Promise<void>;
    getRecent(limit: number): HistoryEntry[];
}
/** A synchronous replacement immediately before the editor cursor. */
export interface EditorInlineReplacement {
    /** UTF-16 code units to remove immediately before the cursor. */
    replaceLen: number;
    /** Literal text inserted where the removed suffix started. */
    insert: string;
}
/** Replacement candidates and the current-line span they replace. */
export interface EditorWordReplacements {
    line: number;
    startCol: number;
    endCol: number;
    items: readonly string[];
}
/** Source location for one visual text segment passed to `decorateText`. */
export interface EditorTextDecorationContext {
    line: number;
    startCol: number;
    endCol: number;
}
/**
 * Optional prose assistance kept separate from command/file autocomplete.
 * Hosts independently decide whether word completion and autocorrection are enabled.
 */
export interface EditorTextAssistProvider {
    /** Return ghost-text suffix for the partial word at the cursor, or `null`. */
    getWordCompletion?(lines: string[], cursorLine: number, cursorCol: number): string | null;
    /**
     * Report the fate of the ghost-text `suggestion` shown at the cursor:
     * `accepted` (Tab/→) or typed past (a typed character diverged from it).
     * Called with the editor state the suggestion was shown for.
     */
    wordCompletionFeedback?(lines: string[], cursorLine: number, cursorCol: number, suggestion: string, accepted: boolean): void;
    /** Return a correction after one single-character insertion, or `null`. */
    tryAutocorrect?(lines: string[], cursorLine: number, cursorCol: number): EditorInlineReplacement | null | Promise<EditorInlineReplacement | null>;
    /** Return replacement candidates for the misspelled word at the cursor. */
    getWordReplacements?(lines: string[], cursorLine: number, cursorCol: number): EditorWordReplacements | null | Promise<EditorWordReplacements | null>;
}
/** What the paste transport knew about the input burst before the editor inserts the payload. */
export interface PasteOptions {
    /** A submit keypress arrived in the same input burst and will be dispatched right after the paste. */
    submitAfterPaste?: boolean;
}
export declare class Editor implements Component, Focusable {
    #private;
    /** Focusable interface - set by TUI when focus changes */
    focused: boolean;
    /** When set, replaces the normal cursor glyph at end-of-text with this ANSI-styled string. */
    cursorOverride: string | undefined;
    /** Optional hook that decorates displayed user text after source-text layout.
     *  Width-changing output is allowed on lines without the cursor; it is truncated
     *  to the content width rather than reflowed. Cursor glyphs and inline hints are excluded. */
    decorateText: ((text: string, context: EditorTextDecorationContext) => string) | undefined;
    /**
     * TSP counterpart of {@link decorateText}: styled ranges over the buffer
     * (UTF-16 offsets into the lines joined by `\n`). Called only when the text
     * changed or the editor was invalidated since the last description.
     */
    describeDecorations: ((lines: readonly string[]) => readonly TspEditorDecoration[]) | undefined;
    /** TSP code language of the buffer (`python`, `bash`): the terminal highlights it in the mono face. */
    describeLanguage: (() => string | undefined) | undefined;
    /**
     * TSP chrome around the `editor` node (the prompt composer's chips, mode
     * chip, send/stop): the root role, the children with `input` placed where
     * the layout wants it, and the input's keypath for the caret-anchored
     * autocomplete. Unset: a plain `omp.field` column over the input (a
     * dialog's text field; only the prompt composer claims `omp.editor`).
     */
    describeLayout: ((input: NativeNode, cx: DescribeContext) => NativeEditorLayout) | undefined;
    /** TSP placeholder for the empty buffer; natively it replaces the rotating ANSI {@link placeholder} hints. */
    describePlaceholder: (() => string) | undefined;
    /** Called with the selected text when Visual mode yanks, so hosts can reach the system
     *  clipboard — `packages/tui` deliberately has no clipboard dependency of its own. */
    onYank?: (text: string) => void;
    /** Fired when the modal state changes, so hosts can restyle their chrome (border, status). */
    onVimModeChange?: (mode: VimMode) => void;
    borderColor: (str: string) => string;
    onAutocompleteUpdate?: () => void;
    /** Called after an async text-assist result mutates the document outside an input event, so hosts can schedule a repaint. */
    onTextAssistApplied?: () => void;
    /** Terminal height source for clamping the autocomplete dropdown. Hosts wire this to their Terminal's rows. */
    viewportRowsProvider?: () => number;
    /** Optional pattern matching atomic placeholder tokens (e.g. `[Image #1, 800x600]` or
     *  `[Paste #2, +30 lines]`) that the editor treats as indivisible: a backspace or forward-delete
     *  landing on any character of a token removes the whole token instead of corrupting it into
     *  stray text. MUST be a global regex; the editor recompiles a private copy so its `lastIndex`
     *  is never shared with the caller. */
    atomicTokenPattern: RegExp | undefined;
    onSubmit?: (text: string) => void | Promise<void>;
    onAltEnter?: (text: string) => void;
    onChange?: (text: string) => void;
    /** Called for a "marker-sized" paste — the point where the editor would otherwise collapse it
     *  into a `[Paste #N]` token (> 10 lines or > 1000 characters). Return `true` to intercept:
     *  the editor inserts nothing and records no undo state, leaving insertion to the host (e.g. a
     *  "wrap in a code block / XML / attach as file" menu for very large pastes), which re-inserts
     *  via {@link insertPaste} or {@link insertText}. Return `false` (or leave unset) for the
     *  default collapse-to-marker behavior. `lineCount` is the sanitized paste's line count;
     *  `options` carries what the paste transport knew about the burst. */
    onLargePaste?: (text: string, lineCount: number, options: PasteOptions) => boolean;
    onAutocompleteCancel?: () => void;
    disableSubmit: boolean;
    /** Base editors accept native edits, not atomic sends. Implementations that
     *  handle `send` override this readiness check for their submission path. */
    protected get nativeSendable(): boolean;
    /** Placeholder painted right-aligned on the cursor row while the editor is empty and no
     *  autocomplete is open; hidden when it can't keep {@link PLACEHOLDER_MIN_GAP} cells from the
     *  cursor. The host styles it (ANSI allowed). Re-evaluated on every render, so hosts can derive
     *  it from live state. */
    placeholder?: () => string | undefined;
    constructor(theme: EditorTheme);
    /** Return bounded editor content, cursor, and transient child state for debug inspection. */
    debugState(): Record<string, unknown>;
    /** Expose the active autocomplete list to the debug tree walker. */
    get debugChildren(): readonly Component[];
    setTheme(theme: EditorTheme): void;
    setAutocompleteProvider(provider: AutocompleteProvider): void;
    /** Install prose assistance without changing command/file autocomplete. */
    setTextAssistProvider(provider: EditorTextAssistProvider | undefined): void;
    /**
     * Set custom content for the top border (e.g., status line).
     * Pass undefined to use the default plain border.
     *
     * Eager: the passed value is cached and reused every frame. Callers that
     * mutate status upstream must recompute and call this again. Prefer
     * {@link setTopBorderProvider} for high-frequency updates — it collapses
     * per-event rebuilds to one per painted frame.
     */
    setTopBorder(content: EditorTopBorder | undefined): void;
    /**
     * Install a lazy provider invoked once per editor render with the current
     * `availableWidth`. Overrides any eager content set via {@link setTopBorder}
     * — pass `undefined` to detach and fall back to the eager slot.
     *
     * Use this when the top border derives from state that mutates far faster
     * than the render cadence (session events, streaming, subagent updates).
     * The TUI already throttles renders, so a provider is invoked exactly once
     * per frame and does no work between paints. 	 */
    setTopBorderProvider(provider: ((availableWidth: number) => EditorTopBorder | undefined) | undefined): void;
    /**
     * Show or hide the editor border chrome.
     */
    setBorderVisible(borderVisible: boolean): void;
    setPromptGutter(promptGutter: string | undefined): void;
    getBorderStyle(): EditorBorderStyle;
    setBorderStyle(style: EditorBorderStyle): void;
    /** True while the autocomplete/slash-command menu is open below the editor. */
    isAutocompleteActive(): boolean;
    /**
     * Get the available width for top border content given a total terminal width.
     * Accounts for the border characters and horizontal padding when visible.
     */
    getTopBorderAvailableWidth(terminalWidth: number): number;
    /**
     * Use the real terminal cursor instead of rendering a cursor glyph.
     */
    setUseTerminalCursor(useTerminalCursor: boolean): void;
    /** Render a dedicated bottom border so terminal-local IME preedit cannot shift editor chrome. */
    setImeSafeCursorLayout(enabled: boolean): void;
    /** Enable Vim-style modal editing. Toggling always drops back to Insert mode so the editor is
     *  never left in a state where ordinary typing does nothing. */
    setVimMode(enabled: boolean): void;
    /** Current modal state; always `"insert"` when Vim mode is off. */
    get vimMode(): VimMode;
    /** True when modal editing is active, regardless of which mode is current. */
    get vimEnabled(): boolean;
    /** Half-typed Vim command (`"2d"`, `"g"`), or `""` when nothing is pending. */
    get vimPending(): string;
    /** Lines spanned by the active Visual selection; 0 outside Visual modes. */
    get vimSelectedLines(): number;
    /**
     * Whether Escape belongs to the editor right now rather than to the app.
     *
     * Hosts bind Escape to interrupt/clear; in Vim mode it first has to mean "leave Insert mode" and
     * "cancel a half-typed operator". Only a quiet Normal mode gives Escape back to the app.
     */
    vimConsumesEscape(): boolean;
    getUseTerminalCursor(): boolean;
    setMaxHeight(maxHeight: number | undefined): void;
    /** Enable/disable the right-border scrollbar. Only shown when content overflows. */
    setScrollbarVisible(visible: boolean): void;
    setPaddingX(paddingX: number): void;
    getAutocompleteMaxVisible(): number;
    setAutocompleteMaxVisible(maxVisible: number): void;
    /** Loads persistent prompts for navigation and enables future persistence. */
    setHistoryStorage(storage: HistoryStorage): void;
    /**
     * Add a prompt to history for up/down arrow navigation.
     * Called after successful submission.
     */
    addToHistory(text: string): void;
    /** Retain the current draft for local recall only, never persistent history. */
    rememberDraft(restore?: () => void): void;
    /** Release the current draft's expansion payloads without touching history. */
    clearPasteState(): void;
    /** Restore host-owned draft state before history text triggers onChange. */
    restoreHistoryState(restore?: () => void): void;
    invalidate(): void;
    render(width: number): readonly string[];
    /**
     * An `editor` node (key `input`) carrying the buffer, caret, Vim selection
     * anchor and mode, decorations, ghost completion, placeholder, prompt and
     * height cap; the frame, wrapping, scrolling and caret are the terminal's,
     * so composer shapes play no part. An open autocomplete popup follows as an
     * `overlay` anchored to the caret around the completion list. Typing and
     * caret moves change only `text` and `cursor` on the same node.
     */
    describe(cx: DescribeContext): NativeNode;
    handleInput(data: string): void;
    getText(): string;
    /** Host-registered atomic chip labels mapped to their submit-time expansions. */
    get atoms(): ReadonlyMap<string, string>;
    /** Monotonic buffer-content revision for render caches. Cursor-only movement does not advance it. */
    get textRevision(): number;
    /** Whether the buffer text equals `value`, without `getText()`'s full join —
     *  O(1) for the hot per-keystroke probes against short single-line values. */
    textEquals(value: string): boolean;
    /** Register `label` as a collapsed atom expanding to `expansion` on submit, without inserting
     *  it — for hosts that re-collapse restored draft text via {@link setText}. */
    registerAtom(label: string, expansion: string): void;
    /** Insert `label` (plus a trailing space) at the cursor and register it as an atom expanding
     *  to `expansion` on submit. Pair with {@link atomicTokenPattern} so the label deletes as a
     *  unit. */
    insertAtom(label: string, expansion: string): void;
    /** Collapse the typed span `[start, end)` on `line` into the atom `label` (expanding back
     *  to `expansion` on submit). A cursor at or past the span keeps its position relative to
     *  the span end; a cursor inside it lands after the label. */
    collapseToAtom(line: number, start: number, end: number, label: string, expansion: string): void;
    /** Drop every registered atom expansion (draft cleared or replaced by the host). */
    clearAtoms(): void;
    /**
     * Get text with paste markers expanded to their actual content.
     * Use this when you need the full content (e.g., for external editor).
     */
    getExpandedText(): string;
    getLines(): string[];
    getCursor(): {
        line: number;
        col: number;
    };
    moveToLineStart(): void;
    moveToLineEnd(): void;
    moveToMessageStart(): void;
    moveToMessageEnd(): void;
    /** The `tui.editor.deleteCharForward` operation, callable by hosts that resolve the chord
     *  themselves rather than redispatching the raw key (see CustomEditor's exit-chord overlap).
     *  Mirrors the transient state the key dispatch tears down before this action so the two
     *  cannot diverge: a pending character jump is cancelled by any other key, and an open
     *  spelling-assist popup is dismissed by anything that is not one of its accept keys (its
     *  debounced refresh skips assist mode, so a surviving list would hang around forever).
     *  While Vim owns the buffer (Normal or Visual) the operation is Vim's `x` — deleting the
     *  selection and returning to Normal in Visual mode, the grapheme under the cursor
     *  otherwise. Only Insert mode and Vim-off editors delete straight through. */
    deleteCharForward(): void;
    /**
     * Undo the last meaningful edit while ignoring transient text that is still present at the cursor.
     * Used for command-like autocomplete actions whose typed trigger should not count as the edit being undone.
     */
    undoPastTransientText(transientText: string): void;
    setText(text: string): void;
    submit(): void;
    /** Insert text at the current cursor position */
    insertText(text: string): void;
    /** Terminal-side selection edits and undo on the `editor` node (see {@link applyHostEdit}). */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * Apply an edit the terminal made over its own selection (TSP `edit`):
     * replace `[from, to)` of the described text with `text` and put the caret
     * at `cursor`, as one undo unit that leaves history browsing and updates
     * autocomplete like typing. A range cutting through an atomic placeholder
     * token takes the whole token. Stale edits (`len` no longer the text's
     * length) are dropped; a pure caret move only moves the caret.
     */
    applyHostEdit(edit: NativeTextEdit): void;
    /** Delete up to `count` characters immediately before the cursor on the current line.
     *  Used to "track back" the auto-repeat spaces that the space-hold push-to-talk gesture
     *  optimistically inserts before it recognizes the hold. Capped at the cursor column so it
     *  never crosses a line boundary or under-runs the line. */
    deleteBeforeCursor(count: number): void;
    /** Show or replace a volatile speech-to-text preview at the cursor. The text is
     *  inserted with undo suspended so a long live dictation never floods the undo
     *  stack; finalize it with {@link commitVolatileText} or drop it with
     *  {@link clearVolatileText}. Newlines are allowed. */
    setVolatileText(text: string): void;
    /** Remove the current volatile preview without committing it. */
    clearVolatileText(): void;
    /** Drop any volatile preview, then insert `text` as a single undoable edit. */
    commitVolatileText(text: string): void;
    /** Apply terminal paste semantics to text from non-bracketed paste transports. */
    pasteText(text: string, options?: PasteOptions): void;
    /** Insert `content` as a collapsed `[Paste #N]` marker (stored for expansion on submit via
     *  {@link getExpandedText}). Hosts that intercept large pastes through {@link onLargePaste} use
     *  this to re-insert a (possibly transformed) paste without re-triggering the interception hook. */
    insertPaste(content: string): void;
    /**
     * Whether an autocomplete popup is on screen. An `@` list narrowed to no match
     * while its refresh is pending stays open internally but is hidden, so it does
     * not claim keys (Escape, Vim mode switches) meant for the editor or app.
     */
    isShowingAutocomplete(): boolean;
}
