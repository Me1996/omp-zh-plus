/**
 * Multi-line editor component for hooks and ask custom input.
 * Supports Ctrl+G for external editor.
 *
 * Two modes:
 * - Default (hook): Enter inserts newline, the `app.message.followUp` chord
 *   (Ctrl+Q / Ctrl+Enter) submits, bordered popup
 * - Prompt-style (ask): Enter submits, Shift+Enter inserts newline, legacy ask chrome
 */
import type { ImageContent } from "@oh-my-pi/pi-ai";
import { type Focusable, type TUI } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
/**
 * `prefix` and `question` flattened onto one line, wrapped to the terminal's width and cut to
 * {@link MAX_PROMPT_TITLE_ROWS} rows (the last ends in `…` when cut). For terminal rendering only:
 * native hosts get the question whole ({@link HookEditorOptions.question}).
 */
export declare function boundPromptTitle(prefix: string, question: string): string;
export interface HookEditorOptions {
    /** Edit text with the host's configured external editor. */
    externalEditor?: (text: string) => Promise<string | null>;
    /** When true, use prompt-style keybindings with the legacy ask prompt chrome. */
    promptStyle?: boolean;
    /**
     * The question the text answers (the ask tool's custom answers and notes). The terminal
     * shows it after `<title>: `, wrapped and cut to three rows; native hosts put it whole,
     * as markdown, under the title.
     */
    question?: string;
    /** Allow clipboard images to be attached to this prompt. */
    acceptImages?: boolean;
    /** Images already represented by markers in the prefilled text. */
    images?: readonly ImageContent[];
    /**
     * With `acceptImages`, called for an empty bracketed paste, which is how terminals that own
     * the paste key send an image-only clipboard (#3601). Same signature as
     * `CustomEditor.onPasteImage`; the host calls `beginPaste` before its first await.
     */
    onPasteImage?: () => Promise<boolean>;
    /**
     * With `acceptImages`, called for each path of a bracketed paste made only of image paths.
     * Same signature as `CustomEditor.onPasteImagePath`; calls are not awaited in turn, so images
     * attach as they finish loading and are renumbered in text order on submit.
     */
    onPasteImagePath?: (path: string) => void | Promise<void>;
    /**
     * Max rows the inner Editor may occupy. When omitted, the editor is
     * bounded to the current terminal height minus the component's chrome
     * (≈10 rows) so long content scrolls instead of pushing the submit
     * hint out of view.
     */
    maxHeight?: number;
}
/** Interactive multiline dialog used by hooks and the ask tool's Other response. */
export declare class HookEditorComponent extends OverlayPanel implements Focusable {
    #private;
    /** Focus state mirrored to the nested editor during rendering. */
    focused: boolean;
    constructor(tui: TUI, title: string, prefill: string | undefined, onSubmit: (value: string, images?: ImageContent[]) => void, onCancel: () => void, options?: HookEditorOptions);
    /** The editor (which describes itself) under the title and detail lines, with the key hints below. */
    describe(_cx: DescribeContext): NativeNode;
    /** Keep the nested editor's software/hardware cursor mode aligned with the dialog focus target. */
    setUseTerminalCursor(useTerminalCursor: boolean): void;
    /** Render the dialog after forwarding its focus state to the nested editor. */
    render(width: number): readonly string[];
    handleInput(keyData: string): void;
    /** Whether this prompt opted into clipboard image attachments. */
    get acceptsImages(): boolean;
    /** Attach an image; returns its `[Image #N, WxH]` marker for the caller to deliver. */
    attachImage(image: ImageContent, dims?: {
        width: number;
        height: number;
    }): string | undefined;
    /** Reserve ordered clipboard delivery. Completion accepts nonempty text once, or releases on undefined. */
    beginPaste(): (text: string | undefined) => boolean;
    dispose(): void;
    /** Route non-bracketed paste transports (e.g. kitty's OSC 5522 enhanced clipboard)
     *  into the inner editor, mirroring bracketed-paste semantics. Without this hook,
     *  enhanced-paste routing falls back to the main prompt editor hidden behind the
     *  dialog (#2127 routing contract). */
    pasteText(text: string): void;
}
