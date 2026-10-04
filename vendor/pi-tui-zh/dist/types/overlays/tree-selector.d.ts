import { type Component, Input } from "../index.js";
/** Available session-tree display filters. */
export declare const TREE_FILTER_MODES: readonly ["default", "no-tools", "user-only", "labeled-only", "all"];
/** Session-tree display filter. */
export type TreeFilterMode = (typeof TREE_FILTER_MODES)[number];
import { type TranscriptEntryLike } from "../chat/transcript-entry.js";
/** Fields consumed when displaying persisted entries in the session tree. */
export type SessionTreeEntry = {
    id: string;
    parentId: string | null;
} & (TranscriptEntryLike | {
    type: "compaction";
    tokensBefore: number;
} | {
    type: "branch_summary";
    summary: string;
} | {
    type: "model_change";
    model: string;
} | {
    type: "model_usage";
    purpose: string;
    role?: string;
    provider: string;
    model: string;
} | {
    type: "thinking_level_change";
    thinkingLevel?: string | null;
} | {
    type: "custom";
    customType: string;
} | {
    type: "label";
    label?: string;
} | {
    type: "service_tier_change";
    serviceTier: Partial<Record<string, string>> | null;
} | {
    type: "title_change";
    title: string;
} | {
    type: "mode_change";
    mode: string;
} | {
    type: "credential_pin";
    provider: string;
} | {
    type: "ttsr_injection";
    injectedRules: string[];
} | {
    type: "session_init" | "reset_boundary";
});
/** Session tree shape consumed by the selector. */
export interface TreeSelectorNode {
    entry: SessionTreeEntry;
    children: TreeSelectorNode[];
    label?: string;
}
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { TspPickerItem, TspText } from "@oh-my-pi/pi-wire";
import type { DescribeContext, NativeChild, NativeNode, NativeUiEvent } from "../native/node.js";
/** Filter mode for tree display */
type FilterMode = TreeFilterMode;
/** The session tree's `picker` data (see {@link TreeList.pickerView}). */
interface TreePickerView {
    items: readonly TspPickerItem[];
    order: readonly string[];
    selected: string | null;
    current: readonly string[];
    query: string;
    /** UTF-16 caret into `query`. */
    cursor: number;
    filterMode: FilterMode;
    total: number;
    empty: TspText;
}
declare class TreeList implements Component {
    #private;
    private readonly currentLeafId;
    private readonly maxVisibleLines;
    /** The search field; its value is the fuzzy query. */
    readonly searchInput: Input;
    onSelect?: (entryId: string, options: {
        summarize: boolean;
    }) => void;
    onCancel?: () => void;
    onLabelEdit?: (entryId: string, currentLabel: string | undefined) => void;
    constructor(tree: TreeSelectorNode[], currentLeafId: string | null, maxVisibleLines: number, initialFilterMode?: FilterMode, initialSelectedId?: string);
    invalidate(): void;
    dispose(): void;
    getSearchQuery(): string;
    getFilterMode(): FilterMode;
    /** Native filter tab: switch to that mode, like its alt+key shortcut. */
    setFilterMode(mode: string): void;
    /** Native click on an entry: highlight it, then the same outcome as Enter. */
    activateEntry(entryId: string): void;
    /** Native row click: highlight the entry without switching. */
    selectEntry(entryId: string): void;
    /**
     * The `tree` picker's data. `items` is every structural entry, rebuilt
     * only when the tree or a label changes; filter modes and typing change
     * only `order` (the visible entries) and the selection.
     */
    pickerView(): TreePickerView;
    /**
     * Preview of the selected entry: a title, its label, and its content as
     * the transcript shows it (markdown prose, commands and output as code).
     */
    pickerPreview(): readonly NativeChild[];
    /**
     * The visible entries as a native `list` keyed `"list"`, items keyed by
     * entry id. Selection stays omp's; the terminal scrolls and virtualizes.
     * Branch heads carry a `branch` icon and the active path an accent bullet
     * instead of drawn tree connectors.
     */
    describeList(): NativeNode;
    getSelectedNode(): TreeSelectorNode | undefined;
    updateNodeLabel(entryId: string, label: string | undefined): void;
    render(width: number): readonly string[];
    /** Enter (`summarize` false) / Shift+Enter: switch to the selected entry. */
    confirm(summarize: boolean): void;
    /** Esc: clear the search first, then close. */
    escape(): void;
    clearSearch(): void;
    /** Ctrl+O / Shift+Ctrl+O: default → no-tools → user-only → labeled-only → all → default. */
    cycleFilter(delta: 1 | -1): void;
    /** Shift+L: edit the selected entry's label. */
    editLabel(): void;
    handleInput(keyData: string): void;
}
/**
 * Component that renders a session tree selector for navigation
 */
export declare class TreeSelectorComponent extends OverlayPanel {
    #private;
    private readonly onLabelChangeCallback?;
    /** The picker's subtitle. */
    private readonly sessionName?;
    constructor(tree: TreeSelectorNode[], currentLeafId: string | null, terminalHeight: number, onSelect: (entryId: string, options: {
        summarize: boolean;
    }) => void, onCancel: () => void, onLabelChangeCallback?: ((entryId: string, label: string | undefined) => void) | undefined, initialFilterMode?: FilterMode, 
    /** The picker's subtitle. */
    sessionName?: string | undefined);
    describe(cx: DescribeContext): NativeNode;
    /** Filter tab → switch mode; entry click → highlight it and switch, exactly like Enter. */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(keyData: string): void;
    getTreeList(): TreeList;
}
export {};
