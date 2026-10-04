import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Theme } from "../theme/theme.js";
import type { Component } from "../tui.js";
import { type ScrollViewTheme } from "./scroll-view.js";
/** Stable identity accepted by {@link TreeView}. Keys must be unique within one hierarchy. */
export type TreeKey = string | number;
/** One ancestor retained on a flattened hierarchy row. */
export interface TreeAncestor<K extends TreeKey> {
    key: K;
    depth: number;
    isLast: boolean;
    siblingCount: number;
}
/** Structural metadata for one item in depth-first display order. */
export interface TreeRow<T, K extends TreeKey> {
    item: T;
    key: K;
    parentKey: K | undefined;
    depth: number;
    index: number;
    siblingIndex: number;
    siblingCount: number;
    isLast: boolean;
    ancestors: readonly TreeAncestor<K>[];
}
/** Controls the iterative hierarchy projection shared by display and interactive trees. */
export interface FlattenTreeOptions<T, K extends TreeKey> {
    roots: readonly T[];
    getKey: (item: T) => K;
    getChildren: (item: T, row: TreeRow<T, K>) => readonly T[];
    /** False omits descendants while retaining the item itself. Defaults to true. */
    isExpanded?: (item: T, row: TreeRow<T, K>) => boolean;
    /** Display depth assigned to roots. Defaults to zero. */
    rootDepth?: number;
    /** Override the display depth inherited by direct children. */
    getChildDepth?: (item: T, row: TreeRow<T, K>, children: readonly T[]) => number;
    /** Stop projection after this many structural items. Omit for no traversal cap. */
    maxItems?: number;
}
/** First-line and continuation prefixes for a rendered tree item. */
export interface TreePrefix {
    first: string;
    continuation: string;
}
/** Optional symbol styling for {@link treeRowPrefix}. */
export interface TreePrefixStyle {
    connector?: (symbol: string) => string;
    vertical?: (symbol: string) => string;
}
/** Render the conventional three-cell tree gutter for a flattened row. */
export declare function treeRowPrefix<T, K extends TreeKey>(row: TreeRow<T, K>, theme: Theme, style?: TreePrefixStyle): TreePrefix;
/** Context supplied while laying out one visible tree row. */
export interface TreeViewRowContext<T, K extends TreeKey> {
    row: TreeRow<T, K>;
    selected: boolean;
    rowIndex: number;
    windowStart: number;
    windowEnd: number;
    windowRows: readonly TreeRow<T, K>[];
    width: number;
    contentWidth: number;
    prefix: TreePrefix;
}
/** Row bodies may be plain lines or an existing component rendered at the remaining width. */
export type TreeViewRowContent = string | readonly string[] | Component;
/** Rendering, filtering, selection, expansion, and budget policy for {@link TreeView}. */
export interface TreeViewOptions<T, K extends TreeKey> extends FlattenTreeOptions<T, K> {
    theme: Theme;
    renderRow: (item: T, context: TreeViewRowContext<T, K>) => TreeViewRowContent;
    filter?: (item: T, row: TreeRow<T, K>) => boolean;
    selectedKey?: K;
    /** Logical rows shown around the selection. Omit to render every filtered row. */
    maxRows?: number;
    /** Strict physical-line budget after multiline row expansion. */
    maxLines?: number;
    /** Defaults to true when `selectedKey` is provided. */
    centerSelection?: boolean;
    /** Custom indentation/gutter geometry. */
    renderPrefix?: (row: TreeRow<T, K>, context: Omit<TreeViewRowContext<T, K>, "prefix" | "contentWidth" | "selected">) => TreePrefix;
    /** Content before the tree gutter, such as an interactive selection cursor. */
    renderLeading?: (item: T, context: TreeViewRowContext<T, K>) => string;
    /** Applied to every physical line belonging to the selected logical row. */
    styleSelected?: (line: string) => string;
    /** Bound physical rows to `render(width)`. Defaults to true; disable only for formatting adapters. */
    truncateRows?: boolean;
    /** Add a viewport scrollbar when `maxRows` hides logical rows. */
    scrollbar?: boolean;
    scrollbarTheme?: ScrollViewTheme;
}
/** Result of a tree render, including whether a row or line budget omitted content. */
export interface TreeViewRenderResult {
    lines: readonly string[];
    truncated: boolean;
    windowStart: number;
    windowEnd: number;
    totalRows: number;
}
/**
 * Reusable keyed hierarchy component. It keeps flattened and rendered arrays
 * stable by reference until its inputs, selection, filter, or width change.
 */
export declare class TreeView<T, K extends TreeKey = string> implements Component {
    #private;
    constructor(options: TreeViewOptions<T, K>);
    /** Rebuild hierarchy state on the next access and discard rendered lines. */
    invalidate(): void;
    dispose(): void;
    /** Replace the visible-row predicate while retaining the nearest possible selection. */
    setFilter(filter: ((item: T, row: TreeRow<T, K>) => boolean) | undefined): void;
    /** Every structural row before filtering. The returned array is immutable and stable until invalidated. */
    get allRows(): readonly TreeRow<T, K>[];
    /** Filtered rows in navigation order. The returned array is immutable and stable until invalidated. */
    get rows(): readonly TreeRow<T, K>[];
    /** Currently selected key, or undefined for an empty tree. */
    get selectedKey(): K | undefined;
    /** Currently selected item, or undefined for an empty tree. */
    get selectedItem(): T | undefined;
    /** Index in filtered navigation order, or -1 when empty. */
    get selectionIndex(): number;
    /** Select a key, walking to its nearest visible ancestor when filtered. */
    setSelectedKey(key: K | undefined): void;
    /** Select a filtered-row index, clamped to the current range. */
    setSelectionIndex(index: number): void;
    /** Move by logical rows. Wrapping is opt-in for menu-style interaction. */
    moveSelection(delta: number, wrap?: boolean): void;
    /** Move to the next row in `direction` satisfying a domain predicate. */
    moveSelectionWhere(predicate: (item: T, row: TreeRow<T, K>) => boolean, direction: -1 | 1): void;
    render(width: number): readonly string[];
    /**
     * A native disclosure `tree` over the filtered rows, nested by hierarchy
     * (a filtered-out ancestor lifts its visible descendants to the nearest
     * visible one). Gutters, windowing and the scrollbar are the terminal's;
     * the selected row is marked with the `mark` token. Rows whose body is a
     * component can't be tree labels, so such a tree stays on `rows`.
     */
    describe(_cx: DescribeContext): NativeNode | null;
    /** Render lines plus budget/window metadata for adapters that append an ellipsis. */
    renderWithState(width: number): TreeViewRenderResult;
}
