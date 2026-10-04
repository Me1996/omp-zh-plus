import type { EditorTextAssistProvider } from "../components/editor.js";
import { ProseSource } from "./prose-gate.js";
/** Values of the `spelling.autocomplete` setting. */
export declare const WORD_COMPLETION_METHODS: readonly ["off", "auto", "ngram", "smollm", "apple"];
/** Configured word-completion engine; `off` disables ghost text. */
export type WordCompletionMethod = (typeof WORD_COMPLETION_METHODS)[number];
/** Whether `value` is a {@link WordCompletionMethod}. */
export declare function isWordCompletionMethod(value: unknown): value is WordCompletionMethod;
/** An enabled word-completion engine. */
export type WordCompletionEngine = Exclude<WordCompletionMethod, "off">;
/** Asynchronous engine behind ghost-text word completion (coding-agent: the text-prediction daemon). */
export interface WordPredictionBackend {
    /** Characters to paint after `prefix` typed after `before`, or `null` to show nothing. */
    complete(before: string, prefix: string): Promise<string | null>;
    /** Report a shown suggestion the user accepted (Tab/→) or typed past. Fire-and-forget. */
    feedback(before: string, prefix: string, suggestion: string, accepted: boolean): void;
}
/** Resolves the backend for an engine; `undefined` means none is available (no ghost text). */
export type WordPredictionBackendResolver = (method: WordCompletionEngine) => WordPredictionBackend | undefined;
/**
 * Install the host's backend resolver for every editor, including ones built
 * before the host finished starting. Pass `undefined` to detach.
 */
export declare function setWordPredictionHost(resolver: WordPredictionBackendResolver | undefined): void;
/** The prose word ending at the cursor and the editor text before it: what an engine is asked to complete. */
export interface WordCompletionQuery {
    before: string;
    prefix: string;
}
/**
 * The query for the prose word ending at the cursor, or `undefined` where no
 * ghost text applies (mid-word, no word, code, paths, commands). `prose`
 * memoizes the whole-buffer mask; pass one instance across keystrokes.
 */
export declare function wordCompletionQuery(lines: readonly string[], cursorLine: number, cursorCol: number, prose?: ProseSource): WordCompletionQuery | undefined;
/**
 * Ghost-text word completion for the prose word ending at the cursor, served
 * by an injected asynchronous {@link WordPredictionBackend}.
 *
 * Rendering is synchronous, so a cache miss schedules a single-flight backend
 * request (one active, the newest queued) and repaints through `onUpdate` when
 * the answer changes what is shown. The previous suggestion is projected: if
 * its full word still extends what was typed, the remainder shows immediately
 * and stays until the engine offers a different word.
 */
export declare class WordCompletionProvider implements EditorTextAssistProvider {
    #private;
    /** Invoked when an asynchronous answer changes the rendered ghost text. */
    onUpdate: (() => void) | undefined;
    /** `resolveBackend` defaults to the host installed with {@link setWordPredictionHost}. */
    constructor(resolveBackend?: WordPredictionBackendResolver);
    /** Select the engine (`off` disables completion) and drop answers from the previous one. */
    setMethod(method: WordCompletionMethod): void;
    /** Return the ghost-text suffix for the prose word ending at the cursor, or `null`. */
    getWordCompletion(lines: string[], cursorLine: number, cursorCol: number): string | null;
    /** Forward accept (Tab/→) or typed-past feedback for the suggestion shown at the cursor. */
    wordCompletionFeedback(lines: string[], cursorLine: number, cursorCol: number, suggestion: string, accepted: boolean): void;
}
