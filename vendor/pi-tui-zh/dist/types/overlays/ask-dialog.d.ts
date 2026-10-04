import type { ImageContent } from "@oh-my-pi/pi-ai";
import { type Component, type TUI } from "../index.js";
/** One selectable answer in an ask dialog. */
export interface ExtensionAskDialogOption {
    label: string;
    description?: string;
    preview?: string;
}
/** Question and answer choices displayed by the ask dialog. */
export interface ExtensionAskDialogQuestion {
    id: string;
    question: string;
    header?: string;
    options: ExtensionAskDialogOption[];
    multi?: boolean;
    recommended?: number;
}
/** Prompt text and the images pasted into it (custom answers and notes). */
export interface AskDialogPromptValue {
    text: string;
    images?: ImageContent[];
}
/** Submitted answer to one dialog question. */
export interface ExtensionAskDialogResultItem {
    id: string;
    question: string;
    options: string[];
    multi: boolean;
    selectedOptions: string[];
    customInput?: string;
    customInputImages?: ImageContent[];
    note?: string;
    noteImages?: ImageContent[];
    timedOut?: boolean;
}
/** Answers submitted from the dialog. */
export interface ExtensionAskDialogSubmitResult {
    kind: "submit";
    results: ExtensionAskDialogResultItem[];
}
/** Request to discuss the question instead of answering it. */
export interface ExtensionAskDialogChatResult {
    kind: "chat";
}
/** Completed dialog action, distinct from cancellation. */
export type ExtensionAskDialogResult = ExtensionAskDialogSubmitResult | ExtensionAskDialogChatResult;
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
/** What a custom-answer or note prompt asks: the host shows `title` over `question` (`HookEditorOptions.question`). */
export interface AskDialogPrompt {
    /** `Custom answer`, `Note for <option>`. */
    title: string;
    /** The question being answered, verbatim. */
    question: string;
}
interface AskDialogCallbacks {
    onSubmit(result: ExtensionAskDialogSubmitResult): void;
    onCancel(): void;
    onPrompt(prompt: AskDialogPrompt, prefill?: string): Promise<string | undefined>;
    /** Prompt that accepts pasted images; without it, prompts use `onPrompt`. */
    onImagePrompt?(prompt: AskDialogPrompt, prefill: AskDialogPromptValue | undefined): Promise<AskDialogPromptValue | undefined>;
}
interface AskDialogInputGuard {
    isBlocked(): boolean;
    handleInput(keyData: string): void;
    hint: string;
    /** Mirror the guard's blocked state onto the proxied draft surface each
     *  render, so a draft that owns input shows a visible insertion cursor even
     *  though this dialog holds TUI focus. */
    syncPresentation?(): void;
}
interface AskDialogOptions {
    timeout?: number;
    onTimeout?: () => void;
    tui?: TUI;
    inputGuard?: AskDialogInputGuard;
}
/**
 * Coerce untrusted dialog questions into a render-safe shape. The live ask
 * dialog is reached from the public `askDialog` extension surface and from
 * streamed tool args, where a question entry can arrive with a missing or
 * non-string `question` field. The render helpers (`replaceTabs`,
 * `renderQuestionTitle`, `questionTabLabel`) assume strings, so a malformed
 * entry throws and takes down the whole TUI render loop. Mirrors
 * `normalizeRenderQuestions` on the transcript path.
 */
export declare function normalizeDialogQuestions(questions: ExtensionAskDialogQuestion[]): ExtensionAskDialogQuestion[];
export declare class AskDialogComponent implements Component {
    #private;
    private readonly callbacks;
    private readonly options;
    readonly retireDisplacedTranscript = true;
    constructor(questions: ExtensionAskDialogQuestion[], callbacks: AskDialogCallbacks, options?: AskDialogOptions);
    invalidate(): void;
    dispose(): void;
    /**
     * Toggle truncated question headers and option descriptions. Returns false
     * when there is nothing to expand so the global Ctrl+O listener can still
     * expand transcript tools.
     */
    toggleQuestionExpansion(): boolean;
    handleInput(keyData: string): void;
    render(width: number): readonly string[];
    /**
     * A bottom-anchored glass sheet over the composer (the `overlay` hoists into
     * the terminal's layer; the dialog's own slot in the dock stays empty).
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Pointer actions: a tab click switches to it; a click on an answer row is
     * Enter on it (Space for a multi-select option, so it toggles; its
     * double-click `activate` is Enter); the action bar's Submit, Note and Skip
     * run exactly what Enter, `n` and Esc run on the highlighted row.
     */
    handleNativeEvent(event: NativeUiEvent): void;
}
export {};
