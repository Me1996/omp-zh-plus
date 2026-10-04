import { type DashboardState, type DisabledReason, type Extension, type ExtensionState, type FlatTreeItem, type ProviderTab, type ExtensionProvider, type TreeNode } from "./types.js";
export declare function resolveExtensionState(source: {
    provider: string;
    level: string;
}, isDisabled: boolean, isShadowed: boolean | undefined, providers: readonly ExtensionProvider[]): {
    state: ExtensionState;
    disabledReason?: DisabledReason;
};
/**
 * Build sidebar tree from extensions.
 * Groups by provider → kind.
 */
export declare function buildSidebarTree(extensions: Extension[], providers: readonly ExtensionProvider[]): TreeNode[];
/**
 * Flatten tree for keyboard navigation.
 */
export declare function flattenTree(tree: TreeNode[]): FlatTreeItem[];
/**
 * Apply fuzzy filter to extensions.
 */
export declare function applyFilter(extensions: Extension[], query: string): Extension[];
/**
 * Build provider tabs from extensions.
 */
export declare function buildProviderTabs(extensions: Extension[], providers: readonly ExtensionProvider[]): ProviderTab[];
/**
 * Filter extensions by provider tab.
 */
export declare function filterByProvider(extensions: Extension[], providerId: string): Extension[];
/**
 * Apply setting-backed item disable overrides to an existing dashboard state.
 * This gives the UI immediate feedback while the full capability refresh runs.
 */
export declare function applyDisabledExtensionsToState(state: DashboardState, disabledIds: string[], providers?: readonly ExtensionProvider[]): DashboardState;
/**
 * Create initial dashboard state.
 */
export declare function createInitialState(extensions: Extension[], providers: readonly ExtensionProvider[]): DashboardState;
/**
 * Refresh state after toggle.
 */
export declare function refreshState(state: DashboardState, extensions: Extension[], providers: readonly ExtensionProvider[]): DashboardState;
