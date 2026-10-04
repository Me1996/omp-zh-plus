import { type AutocompleteProvider, type PasteOptions, type SlashCommand } from "@oh-my-pi/pi-tui-zh";
import type { InteractiveModeContext, SubmittedUserInput } from "../../modes/types.js";
import { readImageFromClipboard, readMacFileUrlsFromClipboard, readTextFromClipboard } from "../../utils/clipboard.js";
/**
 * Slash commands that may carry secrets in their arguments should never be
 * persisted to history.
 *
 * - /login accepts three callback forms (redirect URL, query string, raw auth
 *   code) — all can contain OAuth code=/state= params.
 * - /join <link> carries a 32-byte room key and optional write token.
 * - /mcp add --token <token> carries a bearer token.
 *
 * The command name is extracted the same way as parseSlashCommand() — splitting
 * on the earliest whitespace or colon — so /login:?code=... is correctly matched.
 */
export declare function shouldSkipHistory(slashText: string): boolean;
export declare class InputController {
    #private;
    private ctx;
    /** Injectable clipboard reads so tests can drive paste flows without a real clipboard. */
    private clipboard;
    constructor(ctx: InteractiveModeContext, 
    /** Injectable clipboard reads so tests can drive paste flows without a real clipboard. */
    clipboard?: {
        readImage: typeof readImageFromClipboard;
        readText: typeof readTextFromClipboard;
        readMacFileUrls?: typeof readMacFileUrlsFromClipboard;
    });
    /** Prewarm only the local worker selected by the current tiny role. */
    prewarmTinyTitleModel(): void;
    /** Return the last full editor snapshot delivered by its change contract. */
    getDraftText(): string;
    setupKeyHandlers(): void;
    /**
     * Forget the last hovered target without repainting. Disabling mouse
     * capture clears the composer's band, but with reporting off no motion
     * event will ever refresh this cache — so a re-enable plus motion over
     * the same card would look unchanged and skip restoring the band.
     */
    clearHoverHighlight(): void;
    setupEditorSubmitHandler(): void;
    handleCtrlC(): void;
    handleCtrlD(): void;
    handleCtrlZ(): void;
    handleDequeue(): void;
    handleRetry(): Promise<void>;
    /**
     * Queue `/queue` input behind an active turn, or start it immediately when idle.
     * `detached` is a submission whose draft already left the editor: its
     * attachments are queued and its text is restored if queueing fails. Without
     * it, the live editor draft is the submission.
     */
    handleQueueCommand(text: string, detached?: Pick<SubmittedUserInput, "text" | "images" | "imageLinks">): Promise<void>;
    /** Send editor text as a follow-up message (queued behind current stream). */
    handleFollowUp(): Promise<void>;
    restoreQueuedMessagesToEditor(options?: {
        abort?: boolean;
        currentText?: string;
    }): number;
    handleImagePathPaste(path: string): Promise<void>;
    handleImagePaste(): Promise<boolean>;
    handleClipboardTextRawPaste(): Promise<void>;
    /**
     * Editor `onLargePaste` hook: gate a marker-sized paste behind the large-paste menu. Returns
     * `true` to intercept (the editor skips its default `[Paste]` marker) once the paste reaches the
     * configured `paste.largeMenuThreshold` line count; otherwise `false` for default collapse-to-marker
     * behavior. The async menu is fired and forgotten — the editor only needs the synchronous verdict.
     * A paste whose input burst already carries the submit key skips the menu: nobody can answer it
     * before the submit lands, so the paste is staged the way cancelling the menu would.
     */
    handleLargePaste(text: string, lineCount: number, options?: PasteOptions): boolean;
    /**
     * Present the large-paste menu and apply the chosen action: wrap in `<attachment>` tags (collapsed
     * to a `[Paste]` marker that expands on submit), save the text to a file and reference its path so
     * the agent can `read` it on demand, or paste inline. Cancelling (Esc) falls back to the default
     * inline paste marker, so the pasted content is never lost.
     */
    presentLargePasteMenu(text: string, lineCount: number): Promise<void>;
    createAutocompleteProvider(commands: SlashCommand[], basePath: string): AutocompleteProvider;
    /** Copy the current editor line to the system clipboard. */
    handleCopyCurrentLine(): void;
    /** Copy current prompt text to system clipboard. */
    handleCopyPrompt(): void;
    cycleThinkingLevel(): void;
    cycleRoleModel(direction?: "forward" | "backward"): Promise<void>;
    toggleToolOutputExpansion(): void;
    toggleToolActivityVisibility(): void;
    setToolsExpanded(expanded: boolean): void;
    toggleThinkingBlockVisibility(): void;
    openExternalEditor(): Promise<void>;
    registerExtensionShortcuts(): void;
}
