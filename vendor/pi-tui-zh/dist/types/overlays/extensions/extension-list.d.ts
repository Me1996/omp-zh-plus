/**
 * ExtensionList - Inventory list with Master Switch and fuzzy search.
 *
 * When viewing a specific provider (not "ALL"), Row #0 is the Master Switch
 * that toggles the entire provider. All items below are dimmed when the
 * master switch is off.
 */
import type { TspPickerGroup, TspPickerItem, TspProps } from "@oh-my-pi/pi-wire";
import type { Component } from "../../tui.js";
import type { NativeNode } from "../../native/node.js";
import { type ToolRuntimeSource } from "./inspector-model.js";
import { type MCPRuntimeSource } from "./mcp-runtime.js";
import { type Extension, type ExtensionKind, type ExtensionProvider } from "./types.js";
export interface ExtensionListCallbacks {
    getProviders?: () => readonly ExtensionProvider[];
    onSelectionChange?: (extension: Extension | null) => void;
    onToggle?: (extensionId: string, enabled: boolean) => void;
    onMasterToggle?: (providerId: string) => void;
    onUserSourceToggle?: (providerId: string) => void;
    masterSwitchProvider?: string | null;
    mcpSource?: MCPRuntimeSource;
    toolSource?: ToolRuntimeSource;
}
/** The inventory as `picker` data: rows, display order with kind groups, the selection and search hits. */
export interface ExtensionListPickerView {
    readonly items: TspPickerItem[];
    /** Item ids in display order; kind headers become group entries. */
    readonly order: (string | TspPickerGroup)[];
    /** Selected item id; null when nothing or a kind header is selected. */
    readonly selected: string | null;
    readonly hits: Record<string, [number, number][]>;
    /** Whether kind headers group the rows (the unfiltered ALL view). */
    readonly grouped: boolean;
}
/** The selected row's switch: its state, and why it cannot flip when it can't. */
export interface ExtensionListSwitch {
    readonly on: boolean;
    readonly blocked?: string;
}
export declare class ExtensionList implements Component {
    #private;
    constructor(extensions: Extension[], callbacks?: ExtensionListCallbacks, maxVisible?: number);
    setMaxVisible(maxVisible: number): void;
    setExtensions(extensions: Extension[]): void;
    setFocused(focused: boolean): void;
    setMasterSwitchProvider(providerId: string | null): void;
    setMcpSource(source: MCPRuntimeSource | undefined): void;
    setToolSource(source: ToolRuntimeSource | undefined): void;
    getSearchQuery(): string;
    /** The search field's text and caret for a native `picker` head. */
    nativeQuery(): Pick<TspProps<"picker">, "query" | "cursor">;
    resetSelection(): void;
    getSelectedExtension(): Extension | null;
    /** Get the currently selected kind header (for preview purposes) */
    getSelectedKind(): ExtensionKind | null;
    /** Replace the search text (caret to end) and refilter. */
    setSearchQuery(query: string): void;
    clearSearch(): void;
    invalidate(): void;
    render(width: number): readonly string[];
    /** The visible rows as `picker` data, joined with live MCP health and tool runtime like {@link render}. */
    pickerView(): ExtensionListPickerView;
    /**
     * The visible rows as a native `list` (kind headers included, so the
     * selection matches the keyboard's), for terminals without `picker`.
     */
    describeList(key: string): NativeNode;
    /**
     * A pointer pick of the row with native id `id`: select it, then toggle it
     * when `activate` (the click-on-selected / double-click path). Returns
     * whether the id named a visible row.
     */
    pickNative(id: string, activate: boolean): boolean;
    /** The selected row's switch, or undefined on a kind header or an empty list. */
    selectedSwitch(): ExtensionListSwitch | undefined;
    /** Toggle the selected item, or flip the provider master switch when on it (Space/Enter). */
    activateSelected(): void;
    /** Highlight the row under the pointer (null clears). */
    setHoverIndex(index: number | null): void;
    /**
     * Map a 0-based line within this component's render to the absolute list-item
     * index, or null when the line is the search banner, a padding row, or outside
     * the visible window. The first two lines are the search banner and a blank
     * separator; item rows follow, windowed at the current scroll offset.
     */
    hitTest(line: number): number | null;
    /** Wheel notch: move the selection (and the inspector) one row. */
    handleWheel(delta: -1 | 1): void;
    /** Click: select the row under the pointer, or activate it when already selected. */
    handleClick(line: number): void;
    handleInput(data: string): void;
}
