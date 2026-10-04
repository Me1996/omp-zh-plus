import type { ImageContent } from "@oh-my-pi/pi-ai";
import { Editor, type EditorTextDecorationContext, type NativeEditorLayout } from "../components/editor.js";
import { type KeyId } from "../keys.js";
import { SpaceHoldGesture } from "../space-hold.js";
import { type Component, TUI } from "../tui.js";
import type { AppKeybinding } from "../app-keybindings.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { ComposerFactsSource } from "../status-line/types.js";
import { type MacOSSpellingFeatures } from "./macos-spelling.js";
import type { TspEditorDecoration } from "@oh-my-pi/pi-wire";
import { type WordCompletionMethod } from "./word-completion.js";
/** Live composer state the TSP layout shows; the interactive host wires {@link CustomEditor.composerState}. */
export interface ComposerNativeState {
    /** The draft runs as a shell command (`!`, `!!`) or Python (`$`, `$$`); `excluded` keeps it from the model. */
    readonly shell?: {
        readonly kind: "bash" | "python";
        readonly excluded: boolean;
    };
    /** Thinking effort word (`high`, `off`, `auto`); undefined when the model has no thinking. */
    readonly thinking?: string;
    /** A turn is running: the send keycap becomes a Stop button. */
    readonly running: boolean;
    /** The viewed subagent's lineage, outermost first and the viewed agent last; undefined on the main session. */
    readonly viewing?: readonly string[];
}
/** Independently switchable prose-assistance features of the composer. */
export interface SpellingFeatures extends MacOSSpellingFeatures {
    /** Word-completion engine; `off` disables ghost text. */
    autocomplete: WordCompletionMethod;
}
type ConfigurableEditorAction = Extract<AppKeybinding, "app.interrupt" | "app.clear" | "app.exit" | "app.suspend" | "app.display.reset" | "app.thinking.cycle" | "app.model.cycleForward" | "app.model.cycleBackward" | "app.model.select" | "app.model.selectTemporary" | "app.message.dequeue" | "app.retry" | "app.clipboard.pasteImage" | "app.clipboard.pasteTextRaw" | "app.clipboard.copyPrompt">;
/**
 * Extract image-or-other file paths from plain (un-bracketed) clipboard text.
 * Mirrors {@link extractBracketedPastePaths} for terminals/handlers that
 * already stripped the `\x1b[200~`…`\x1b[201~` markers (e.g. clipboard text
 * read directly via `pbpaste`/PowerShell).
 */
export declare function extractPastePathsFromText(text: string): string[] | undefined;
/**
 * Same shape as {@link extractBracketedImagePastePaths} but operates on a
 * payload that has already been stripped of the `\x1b[200~` / `\x1b[201~`
 * markers — used by the assembled-paste router in {@link CustomEditor.handleInput}
 * so split bracketed pastes get the same attachment-path detection as single-chunk ones.
 *
 * When the segment splitter fails (an unescaped space in a real path breaks
 * its every-segment-is-a-path invariant), falls back to
 * {@link extractWholeTextAttachmentPath}, so a dropped macOS screenshot
 * (`Screenshot 2026-06-25 at 1.23.45 PM.png`) attaches as an image instead of
 * degrading to literal text (#6578).
 */
export declare function extractImagePastePathsFromText(text: string): string[] | undefined;
export declare function extractBracketedPastePaths(data: string): string[] | undefined;
export declare function extractBracketedImagePastePaths(data: string): string[] | undefined;
export declare function extractBracketedImagePastePath(data: string): string | undefined;
/**
 * Return a single previewable file path when `text` is exactly one explicit
 * image (`.png`, `.jpg`/`.jpeg`, `.gif`, `.webp`) or video path. Used by the
 * keybind-driven clipboard image paste path so a
 * clipboard whose only payload is an image file (e.g. Finder `Cmd+C` on
 * macOS) attaches the image instead of pasting the path as literal text.
 *
 * Two-stage detection:
 *
 * 1. Splitter pass (shared with the bracketed-paste handler) — handles
 *    quoted paths, shell-escaped spaces, and unambiguous single tokens.
 *    Returns the single previewable path when it parses cleanly; explicitly
 *    returns `undefined` when the splitter found multiple segments (so
 *    ambiguous multi-path clipboard text like `/tmp/a.png /tmp/b.png`
 *    still falls through to the text fallback instead of being mis-loaded
 *    as one giant path).
 * 2. {@link extractWholeTextAttachmentPath} — only reached when the splitter
 *    failed (every segment must look like an explicit path; an unescaped
 *    space in a real path breaks that). This is what recovers macOS
 *    screenshot filenames like
 *    `/Users/me/Desktop/Screenshot 2026-06-25 at 1.23.45 PM.png`.
 */
export declare function extractImagePathFromText(text: string): string | undefined;
/** A large text paste staged as a composer chip. `content` feeds the band card's snippet and
 *  captions; the submit-time expansion (verbatim content or a wrapped block) lives in the
 *  editor's atom table under `label`. */
export interface TextAttachment {
    n: number;
    label: string;
    content: string;
    lineCount: number;
    charCount: number;
}
/** One visible composer attachment, in band order (vision attachments first, then text pastes). */
export type ComposerChipDescriptor = {
    kind: "image" | "video";
    n: number;
    image: ImageContent;
    link: string | undefined;
} | {
    kind: "paste";
    n: number;
    text: TextAttachment;
};
/**
 * Custom editor that handles configurable app-level shortcuts for coding-agent.
 */
export declare class CustomEditor extends Editor {
    #private;
    imageLinks?: readonly (string | undefined)[];
    /** Draft images pasted into the composer, consumed on submit. Co-located with
     *  {@link imageLinks} so every piece of draft-image state lives on the editor. */
    pendingImages: ImageContent[];
    /** Per-image source links (file:// targets) parallel to {@link pendingImages};
     *  `undefined` entries are images without a backing reference yet. */
    pendingImageLinks: (string | undefined)[];
    /** Large text pastes staged as compact chip tokens; expansion lives in the atom table.
     *  Numbered by a per-draft monotonic counter so a deleted chip never recycles its number
     *  (labels key the atom table). */
    pendingTexts: TextAttachment[];
    /** Host-wired producer of per-image `file://` links (session blob store); drives clickable
     *  chip tokens for restored drafts (esc-esc, `/tree`, branch). */
    draftImageLinkMaterializer?: (images: readonly ImageContent[]) => Promise<(string | undefined)[] | undefined>;
    /**
     * The host {@link TUI}, captured when a plugin constructs this editor through
     * the upstream-pi `(tui, theme, keybindings)` convention. Undefined for omp's
     * own `new CustomEditor(theme)` callers (they drive repaints through the
     * interactive-mode wiring instead). Plugins that call `this.tui.requestRender()`
     * in their overrides read it here (issue #4766).
     */
    tui?: TUI;
    /**
     * Accept both the omp constructor convention — `new CustomEditor(theme)` —
     * and the upstream-pi `Editor` convention — `new Editor(tui, theme, keybindings)`
     * — that {@link ExtensionUIContext.setEditorComponent}'s factory contract
     * advertises `(tui, theme, keybindings)`. Plugins written against upstream pi
     * subclass `CustomEditor`/`Editor` and forward `super(tui, theme, keybindings)`;
     * without this shim the `TUI` lands in the `theme` slot and every render throws
     * `undefined is not an object (evaluating 'this.#theme.symbols.boxRound')`
     * (issue #4766). We locate the real {@link EditorTheme} among the args by shape
     * (it carries `symbols`/`borderColor`) rather than by position, and capture a
     * leading {@link TUI} so plugin overrides calling `this.tui.requestRender()`
     * keep working.
     */
    constructor(...args: readonly unknown[]);
    /** Independently configure typo detection, the word-completion engine, and autocorrect. */
    setSpellingFeatures(features: SpellingFeatures): void;
    /** Clear the composer draft: optionally commit `historyText` to history, then
     *  reset the editor text and all pending draft-image state. The shared tail of
     *  every "message submitted" path; pass no argument for a plain discard. */
    clearDraft(historyText?: string): void;
    /** Preserve a canceled draft in local navigation, then clear the composer. */
    clearDraftForRecall(): void;
    restoreHistoryState(restore?: () => void): void;
    /** Replace the composer draft with a restored historical prompt: re-attaches the message's
     *  images, collapses stored `[Image #N, WxH]` markers back into compact chip tokens (so the
     *  chips band and atomic deletion return), and re-materializes `file://` links so the tokens
     *  are clickable again instead of degrading to dead text (esc-esc branch, `/tree`). */
    setDraft(text: string, images?: readonly ImageContent[]): void;
    /** Set restored text with image, skill, and model references collapsed into atomic chips.
     *  Leaves pending image/text state untouched — callers own that. */
    setCollapsedText(text: string): void;
    /**
     * Host-owned skill registry probe: the SKILL.md path for a registered skill, else
     * `undefined`. Only registered skills collapse into chips — an unknown `/skill:<name>`
     * stays literal text — and the path makes the chip a clickable link. Startup defaults
     * to "none known".
     */
    skillFilePath: (name: string) => string | undefined;
    /** Host-owned model probe: maps a mentionable selector to its display chip label. */
    modelMentionLabel: (selector: string) => string | undefined;
    /** Host-owned session probe: maps a persisted model pseudonym back to its selector. */
    modelMentionSelector: (agent: string) => string | undefined;
    /**
     * Late-bound OSC 8 file link renderer. Startup stays plain until the full
     * interactive graph supplies the settings-aware implementation.
     */
    fileHyperlink: (filePath: string, text: string) => string;
    /** Stage `content` as a text-attachment chip: inserts the compact token at the cursor and
     *  registers `expansion` (default: the content itself) in the atom table for submit. */
    insertTextAttachment(content: string, expansion?: string): void;
    /** Cached read-only attachments whose chip token remains in the buffer.
     * Deleting a token hides its chip and drops the attachment from submission. */
    composerChips(): readonly ComposerChipDescriptor[];
    /** Treat image/paste references — compact chip tokens and bracketed markers alike — as
     *  indivisible: a stray backspace deletes the whole token instead of corrupting it. */
    atomicTokenPattern: RegExp;
    /** Magic-keyword shimmer cadence — drives one editor repaint every 70 ms while
     *  a keyword is on screen and the prompt is focused. ~14 frames/s is smooth
     *  without flooding the renderer. */
    static readonly SHIMMER_FRAME_MS = 70;
    /** Time for the gradient to sweep one full cycle across each keyword. */
    static readonly SHIMMER_PERIOD_MS = 1800;
    /** Decorate magic keywords, attachments, and the queue-composer header/list markers.
     *  Queue shorthand reserves its first logical line as a dim `Queueing` label; sequential
     *  item markers use the accent color so separate follow-ups remain visible while composing. */
    decorateText: (text: string, context: EditorTextDecorationContext) => string;
    /**
     * TSP decorations: magic keywords shimmer (terminal-clocked) in the accent
     * color, chips and markers take their token colors, misspellings are marked,
     * and queue-composer markers are dimmed/accented, all as ranges over the raw
     * buffer instead of painted text. A shell-mode draft is code: only its sigil
     * is decorated, hidden behind the mode chip.
     */
    describeDecorations: (lines: readonly string[]) => readonly TspEditorDecoration[];
    /** Optional test override for the magic-keyword shimmer gate. */
    magicKeywordsEnabledOverride: boolean | undefined;
    /**
     * Host-owned setting reader. Startup defaults to enabled without loading the
     * settings graph; InteractiveMode replaces this with the live session setting.
     */
    magicKeywordsEnabled: () => boolean;
    /**
     * Late-bound OSC hyperlink renderer. Startup stays plain until the full
     * interactive graph supplies the settings-aware implementation.
     */
    imageReferenceHyperlink: (label: string, index: number, imageLinks: readonly (string | undefined)[] | undefined, renderLabel: (text: string) => string) => string;
    /** Bind the host's render request callback. Idempotent — the host wires this
     *  once after construction (and again after `setEditorComponent` swaps the
     *  editor). Passing `undefined` clears any pending frame. */
    setShimmerRepaintHandler(handler: (() => void) | undefined): void;
    /** Editing is available during bootstrap; atomic sends wait until submission is wired and enabled. */
    protected get nativeSendable(): boolean;
    /** Viewing a subagent, the draft goes to it: the placeholder names it. */
    describePlaceholder: () => string;
    /** A shell-mode draft highlights as its language. */
    describeLanguage: () => string | undefined;
    /** Host-owned live state for the TSP composer (shell mode, effort chip, send/stop). */
    composerState: () => ComposerNativeState;
    /** The attachment band, described inside the composer on a TSP terminal (ANSI renders it above). */
    attachmentChips: Component | undefined;
    /** The status line's facts the TSP composer carries (context, model, usage, the other segments). */
    composerFacts: ComposerFactsSource | undefined;
    /**
     * The TSP composer: role `omp.editor[.bash|.python]` (tone `pending` while
     * a turn runs) over the context hairline, the viewing header while a
     * subagent is focused, the attachment chips, a `line` row of the
     * shell-mode chip and the input, and the `bar`: model chip, effort chip,
     * the other status facts, usage, then send (Stop while a turn runs).
     * Clicks come back as `status.model`, `thinking.cycle`, `submit`,
     * `interrupt` and `focus:<id>` actions.
     */
    describeLayout: (input: NativeNode, cx: DescribeContext) => NativeEditorLayout;
    /**
     * Clicks on the composer's controls take the same paths as their keys: ⇧⇥,
     * ⏎ and Esc; the viewing header's links (`focus:<id>`) go to the host,
     * the status facts' clicks (`status.*`) to their source. Selection edits
     * go to the buffer; `send` submits its own prompt after saving the old draft
     * for recall and waiting for in-flight clipboard work.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    onEscape?: () => void;
    onClear?: () => void;
    onExit?: () => void;
    onDisplayReset?: () => void;
    onCycleThinkingLevel?: () => void;
    onCycleModelForward?: () => void;
    onCycleModelBackward?: () => void;
    onSelectModel?: () => void;
    onSuspend?: () => void;
    onSelectModelTemporary?: () => void;
    /** Called when the configured copy-prompt shortcut is pressed. */
    onCopyPrompt?: () => void;
    /** Called when the configured image-paste shortcut is pressed. */
    onPasteImage?: () => Promise<boolean>;
    /** Called when a bracketed paste contains one or more image or video file paths. */
    onPasteImagePath?: (path: string) => void | Promise<void>;
    /** Called when the configured raw text-paste shortcut is pressed. */
    onPasteTextRaw?: () => void;
    /** Called when the configured dequeue shortcut is pressed. */
    onDequeue?: () => void;
    /** Called when the configured retry shortcut is pressed. */
    onRetry?: () => void;
    /** Called when Caps Lock is pressed. */
    onCapsLock?: () => void;
    /** Called when left-arrow is pressed while the editor is empty (cursor necessarily at start). */
    onLeftAtStart?: () => void;
    /** Called when the viewing header asks to view agent `id` ({@link MAIN_AGENT_ID}: the main session). */
    onFocusAgent?: (id: string) => void;
    /** Space-bar push-to-talk; set its `handler` to enable it. It is a text-composition gesture, so it
     *  stays out of Vim's Normal/Visual modes (where the space bar is the `l` motion) and away from an
     *  open autocomplete menu. */
    readonly spaceHold: SpaceHoldGesture;
    setActionKeys(action: ConfigurableEditorAction, keys: KeyId[]): void;
    /**
     * Register a custom key handler. Extensions use this for shortcuts.
     */
    setCustomKeyHandler(key: KeyId, handler: () => void): void;
    /**
     * Remove a custom key handler.
     */
    removeCustomKeyHandler(key: KeyId): void;
    /**
     * Clear all custom key handlers.
     */
    clearCustomKeyHandlers(): void;
    handleInput(data: string): void;
    /**
     * Route a keystroke through the base text-editor pipeline only, skipping the
     * editor-scoped shortcut interception in {@link handleInput}. Used when the
     * editor is mounted for draft editing beneath another focused surface — e.g.
     * an Ask dialog opened over a non-empty prompt — so finishing or submitting
     * the draft cannot fire an editor-slot shortcut that clears
     * `editorContainer` and orphans the overlay. Only text editing, cursor
     * movement, submission, and the clear action reach the buffer.
     */
    handleDraftEdit(data: string): void;
}
export {};
