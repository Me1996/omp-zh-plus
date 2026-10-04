import type { Model } from "@oh-my-pi/pi-ai";
import type { AutocompleteItem } from "../index.js";
import type { ModelBrowserRegistry, ModelBrowserSource } from "../overlays/model-browser.js";
import type { ModelBrowserItem } from "../overlays/model-browser.js";
/** Supplies picker-ranked model candidates for the query after `^`. */
export type ModelMentionCandidateSource = (query: string) => ReadonlyArray<ModelBrowserItem>;
/** Whether an autocomplete prefix belongs to a model mention. */
export declare function isModelMentionPrefix(prefix: string): boolean;
/** Build model mention choices for the whitespace-delimited token at the cursor. */
export declare function getModelMentionSuggestions(textBeforeCursor: string, candidates: ModelMentionCandidateSource | undefined): {
    items: AutocompleteItem[];
    prefix: string;
} | null;
/** Replace the live mention token with the selected canonical selector and a trailing space. */
export declare function applyModelMentionCompletion(lines: string[], cursorLine: number, cursorCol: number, item: AutocompleteItem, prefix: string): {
    lines: string[];
    cursorLine: number;
    cursorCol: number;
};
/**
 * Create a session-scoped model candidate lookup using picker ordering. The
 * scope and search affinity are reused across queries until their inputs change.
 */
export declare function createModelMentionSource(host: {
    source: ModelBrowserSource;
    registry: ModelBrowserRegistry;
    scopedModels: () => ReadonlyArray<Model>;
}): ModelMentionCandidateSource;
