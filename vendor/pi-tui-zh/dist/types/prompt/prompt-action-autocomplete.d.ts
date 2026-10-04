import { type AutocompleteItem, type AutocompleteProvider, type SlashCommand } from "../index.js";
import { type KeybindingsManager } from "../app-keybindings.js";
import { type InternalUrlCallerContext } from "./internal-url-autocomplete.js";
import { type ModelMentionCandidateSource } from "./model-mention-autocomplete.js";
/** Set the process-wide emoji completion preference. */
export declare function setEmojiAutocompleteEnabled(enabled: boolean): void;
interface PromptActionDefinition {
    id: string;
    label: string;
    description: string;
    keywords: string[];
    execute: (prefix: string) => void;
}
interface PromptActionAutocompleteOptions {
    commands: SlashCommand[];
    basePath: string;
    /** Usage count per command name for frequency-ranked slash completions. */
    commandUsage?: (name: string) => number;
    /** Read the receiving session at lookup time, following focus and session replacement. */
    internalUrlCaller?: () => InternalUrlCallerContext;
    /** Session-scoped models available for `^` mentions. */
    modelMentions?: ModelMentionCandidateSource;
    keybindings: KeybindingsManager;
    copyCurrentLine: () => void;
    copyPrompt: () => void;
    undo: (prefix: string) => void;
    moveCursorToMessageEnd: () => void;
    moveCursorToMessageStart: () => void;
    moveCursorToLineStart: () => void;
    moveCursorToLineEnd: () => void;
}
export declare class PromptActionAutocompleteProvider implements AutocompleteProvider {
    #private;
    constructor(commands: SlashCommand[], basePath: string, actions: PromptActionDefinition[], commandUsage?: (name: string) => number, internalUrlCaller?: () => InternalUrlCallerContext, modelMentions?: ModelMentionCandidateSource);
    getSuggestions(lines: string[], cursorLine: number, cursorCol: number, signal?: AbortSignal, onPartial?: (suggestions: {
        items: AutocompleteItem[];
        prefix: string;
    }) => void): Promise<{
        items: AutocompleteItem[];
        prefix: string;
    } | null>;
    applyCompletion(lines: string[], cursorLine: number, cursorCol: number, item: AutocompleteItem, prefix: string): {
        lines: string[];
        cursorLine: number;
        cursorCol: number;
        onApplied?: () => void;
    };
    getInlineHint(lines: string[], cursorLine: number, cursorCol: number): string | null;
    trySyncSlashCompletion(textBeforeCursor: string): {
        items: AutocompleteItem[];
        prefix: string;
    } | null;
    trySyncInlineReplace(textBeforeCursor: string): {
        replaceLen: number;
        insert: string;
    } | null;
}
export declare function createPromptActionAutocompleteProvider(options: PromptActionAutocompleteOptions): PromptActionAutocompleteProvider;
export {};
