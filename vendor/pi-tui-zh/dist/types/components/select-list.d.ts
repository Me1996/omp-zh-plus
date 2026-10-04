import { type MouseRoutable, type SgrMouseEvent } from "../mouse.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { SymbolTheme } from "../symbols.js";
import type { Component } from "../tui.js";
export interface SelectItem {
    value: string;
    label: string;
    description?: string;
    /** Optional type-indicator glyph rendered in an aligned column before the label */
    icon?: string;
    /** Named icon a TSP terminal draws from its own set (replaces the {@link icon} glyph natively). */
    iconName?: string;
    /** Native detail text when it differs from the ANSI {@link description} (which may embed {@link state}). */
    nativeDetail?: string;
    /** Live state drawn right-aligned natively ("demo/demo", "off"). */
    state?: string;
    /** Dim hint text shown inline after cursor when this item is selected */
    hint?: string;
    /** Disabled rows stay visible but are skipped by navigation and cannot activate. */
    disabled?: boolean;
    /** When set, activation requires a second Enter/click and this text becomes the status line. */
    confirmation?: string;
    /** Additional text included by the default fuzzy filter without being rendered. */
    searchText?: string;
}
export interface SelectListTheme {
    selectedPrefix: (text: string) => string;
    selectedText: (text: string) => string;
    description: (text: string) => string;
    scrollInfo: (text: string) => string;
    noMatch: (text: string) => string;
    symbols: SymbolTheme;
    /** Style for the type-icon column on unselected rows. Defaults to plain text. */
    icon?: (text: string) => string;
    /** Hover band applied to the full row under the mouse pointer. */
    hovered?: (text: string) => string;
}
export interface SelectListTruncatePrimaryContext {
    text: string;
    maxWidth: number;
    columnWidth: number;
    item: SelectItem;
    isSelected: boolean;
}
/** State supplied to a rich SelectList row renderer or measurer. */
export interface SelectListRenderItemContext {
    item: SelectItem;
    index: number;
    width: number;
    selected: boolean;
    hovered: boolean;
    pendingConfirmation: boolean;
    theme: SelectListTheme;
}
/** Current controlled menu state supplied to a custom status renderer. */
export interface SelectListStatusContext {
    query: string;
    selectedIndex: number;
    visibleCount: number;
    totalCount: number;
    pendingItem: SelectItem | undefined;
}
export interface SelectListLayoutOptions {
    minPrimaryColumnWidth?: number;
    maxPrimaryColumnWidth?: number;
    truncatePrimary?: (context: SelectListTruncatePrimaryContext) => string;
    /** Enable type-to-filter search when the item count exceeds maxVisible. Defaults to true. */
    overflowSearch?: boolean;
    /** Search activation policy. `overflowSearch` remains authoritative when this is omitted. */
    search?: "overflow" | "always" | "never";
    /** Domain-specific filtering/ranking. Selection is retained by item value when possible. */
    filterItems?: (items: readonly SelectItem[], query: string) => readonly SelectItem[];
    /** Custom rich-row renderer. Every returned line is mouse-hit-tested as the same item. */
    renderItem?: (context: SelectListRenderItemContext) => readonly string[];
    /** Cheap row measurement for custom renderers; defaults to calling renderItem and reading its length. */
    measureItem?: (context: SelectListRenderItemContext) => number;
    /** Empty-list message (before a query is entered). */
    emptyText?: string;
    /** No-match message (after filtering). */
    noMatchText?: string;
    /** Optional status renderer. Return undefined to omit the status row. */
    statusText?: (context: SelectListStatusContext) => string | undefined;
    /** Whether single-step keyboard navigation wraps at the edges. Defaults to true. */
    wrapNavigation?: boolean;
    /**
     * Wrap long descriptions onto continuation rows indented under the
     * description column instead of truncating. Defaults to false so existing
     * single-line consumers are unaffected. Navigation remains item-to-item;
     * the scrollbar tracks visual rows so the thumb stays correct when items
     * wrap unevenly.
     */
    wrapDescription?: boolean;
    /**
     * Cap wrapped descriptions at this many visual rows; the last kept row is
     * ellipsized. Only meaningful with `wrapDescription`.
     */
    maxDescriptionRows?: number;
}
export declare class SelectList implements Component, MouseRoutable {
    #private;
    private readonly theme;
    private readonly layout;
    onSelect?: (item: SelectItem) => void;
    onCancel?: () => void;
    onSelectionChange?: (item: SelectItem) => void;
    constructor(items: ReadonlyArray<SelectItem>, maxVisible: number, theme: SelectListTheme, layout?: SelectListLayoutOptions);
    /** Return item, selection, and filter state for debug inspection. */
    debugState(): Record<string, unknown>;
    /** Refit the visible row budget (hosts clamp the list to available height). */
    setMaxVisible(rows: number): void;
    /** Replace the filter text (caret to end) and refilter. */
    setFilter(filter: string): void;
    /** Replace controlled items while retaining the selected value when possible. */
    setItems(items: readonly SelectItem[]): void;
    setSelectedIndex(index: number): void;
    /** Select a visible item by its stable value. */
    setSelectedValue(value: string): void;
    getFilter(): string;
    /**
     * What a native `picker` shows: the filtered items in order, the selected
     * and pending values, the query and its caret (UTF-16 offset).
     */
    pickerView(): {
        readonly items: readonly SelectItem[];
        readonly selected: string | null;
        readonly pending: string | null;
        readonly query: string;
        readonly cursor: number;
    };
    /** Resolve a 0-based rendered-line index to a filtered-item index. */
    hitTest(line: number): number | undefined;
    /** Highlight the item under the pointer (null clears). */
    setHoverIndex(index: number | null): void;
    /** Move the selection one step for a wheel notch. */
    handleWheel(delta: -1 | 1): void;
    /** Mouse click: select the item under the pointer and request activation. */
    clickItem(index: number): void;
    routeMouse(event: SgrMouseEvent, line: number, _col: number): void;
    /**
     * A `list` of `item`s keyed by item value, with the selection, the search
     * query and the empty/no-match text, plus a status line (search query,
     * pending confirmation, host status) under it when one applies.
     */
    describe(_cx: DescribeContext): NativeNode;
    /**
     * Mark `typed` where it leads a native item label (`{s:"mark"}`), for lists
     * whose items were matched against text outside the list (autocomplete).
     * The list then sends no `filter`: the marks already say what matched.
     */
    setNativeMark(typed: string): void;
    /** Pointer select/activate on an item does what a click does today: select it and request activation. */
    handleNativeEvent(event: NativeUiEvent): void;
    invalidate(): void;
    render(width: number): readonly string[];
    handleInput(keyData: string): void;
    getSelectedItem(): SelectItem | null;
}
