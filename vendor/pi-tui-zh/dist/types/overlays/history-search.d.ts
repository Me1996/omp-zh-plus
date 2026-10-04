/** Prompt history fields displayed in search results. */
export interface HistorySearchEntry {
    prompt: string;
    created_at: number;
    /** Project folder the prompt was typed in. */
    cwd?: string;
}
/** Searchable prompt history supplied by the host. */
export interface HistorySource {
    search(query: string, limit: number): HistorySearchEntry[];
    getRecent(limit: number): HistorySearchEntry[];
}
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
export declare class HistorySearchComponent extends OverlayPanel {
    #private;
    constructor(historyStorage: HistorySource, onSelect: (prompt: string) => void, onCancel: () => void);
    handleInput(keyData: string): void;
    /**
     * With the `picker` kind: a `size:"md"` sheet of past prompts (first line
     * with hits, age, folder) as a keyed child the reconciler hoists into
     * `layer`, since the selector replaces the editor in the dock. Otherwise
     * the query field (the `Input`, which describes itself as `input`), the
     * results as a `list` keyed by entry (filter = query, age as the item
     * value), and the key hints.
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Picker: a row click highlights, a second click or `Insert` inserts it
     * (Enter), `Close` cancels (Esc), `Clear search` empties the query.
     * List: picking a result does what highlighting it and pressing Enter does.
     */
    handleNativeEvent(event: NativeUiEvent): void;
}
