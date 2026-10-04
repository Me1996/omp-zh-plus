/** Describes how a menu identifies, searches, disables, and confirms its items. */
export interface MenuSelectionAdapter<T> {
    /** Stable identity used to retain selection while data or filtering changes. */
    getKey: (item: T) => string;
    /** Searchable text used by the default fuzzy filter. */
    getSearchText: (item: T) => string;
    /** Disabled items remain visible but are skipped by navigation and cannot activate. */
    isDisabled?: (item: T) => boolean;
    /** Items returning true require two activation requests without an intervening state change. */
    requiresConfirmation?: (item: T) => boolean;
    /** Optional domain-specific filtering/ranking. */
    filter?: (items: readonly T[], query: string) => readonly T[];
}
/** Result of requesting activation of the current menu item. */
export type MenuActivation<T> = {
    kind: "empty";
} | {
    kind: "disabled";
    item: T;
} | {
    kind: "pending";
    item: T;
} | {
    kind: "confirmed";
    item: T;
};
/** A viewport over variable-height items. */
export interface MenuWindow {
    startIndex: number;
    endIndex: number;
    /** Number of visual rows before startIndex, for scrollbar positioning. */
    rowOffset: number;
    /** Total visual rows across every item. */
    totalRows: number;
}
/**
 * Pick a selection-centered, contiguous window whose visual rows fit `rowBudget`.
 * A selected item taller than the budget is retained and clipped by the renderer.
 */
export declare function getMenuWindow(rowCounts: readonly number[], selectedIndex: number, rowBudget: number): MenuWindow;
/**
 * Controlled menu data, filtering, selection, disabled-row navigation, and
 * confirmation state. Renderers remain domain-owned and consume `visibleItems`.
 */
export declare class MenuSelection<T> {
    #private;
    readonly adapter: MenuSelectionAdapter<T>;
    constructor(items: readonly T[], adapter: MenuSelectionAdapter<T>, initialKey?: string);
    get items(): readonly T[];
    get visibleItems(): readonly T[];
    get query(): string;
    get selectedIndex(): number;
    get selectedItem(): T | undefined;
    get selectedKey(): string | undefined;
    get pendingKey(): string | undefined;
    isDisabled(item: T): boolean;
    isPending(item: T): boolean;
    /** Replace controlled data, retaining the selected key when it remains visible. */
    setItems(items: readonly T[], selectedKey?: string | undefined): boolean;
    /** Set the query and retain the selected key when it survives filtering. */
    setQuery(query: string, retainSelection?: boolean): boolean;
    /** Select a visible row, coercing disabled rows to the nearest enabled row. */
    setSelectedIndex(index: number, direction?: -1 | 1): boolean;
    setSelectedKey(key: string): boolean;
    /** Move by item count, optionally wrapping at list edges. */
    move(delta: number, wrap?: boolean): boolean;
    moveToBoundary(boundary: "first" | "last"): boolean;
    /** Clear a pending confirmation. Returns true only when one was cleared. */
    cancelConfirmation(): boolean;
    requestActivation(index?: number): MenuActivation<T>;
}
