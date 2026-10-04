/**
 * ExtensionDashboard - Fullscreen alternate-screen control center for extensions.
 *
 * Chrome mirrors the `/settings` overlay: a titled rounded box, a shared
 * {@link TabBar} for provider selection, and a two-column body (inventory list |
 * inspector). Both panes are mouse-aware — wheel scrolls, hover highlights, and
 * clicks select/activate — routed from a single SGR-mouse handler.
 *
 * Navigation:
 * - Tab/Shift+Tab or ←/→: switch provider tab
 * - Up/Down or wheel: move list selection
 * - Space/Enter or click: toggle selected item (or provider master switch)
 * - Wheel over the inspector, or PageUp/PageDown when the inspector overflows: scroll the detail pane
 * - Esc: clear search (if active) then close
 *
 * Natively (Tern) it is a `picker` sheet: provider scopes, the inventory as
 * rows grouped by kind, the inspector as the side preview, and Toggle /
 * Expand / Close actions; without `picker` it describes a page with the same
 * parts. Pointer events run the key paths above.
 */
import type { TspPickerScope } from "@oh-my-pi/pi-wire";
import type { Component } from "../../tui.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../../native/node.js";
import { type Tab } from "../../components/tab-bar.js";
import { type ToolRuntimeSource } from "./inspector-panel.js";
import type { ExtensionInspectorSource } from "./inspector-model.js";
import type { MCPRuntimeSource } from "./mcp-runtime.js";
import { type Extension, type ExtensionProvider, type ProviderTab } from "./types.js";
/** Runtime operations remain owned by the embedding application. */
export interface ExtensionDashboardRuntime {
    getDisabledExtensions(): string[];
    setDisabledExtensions(ids: string[]): void;
    getProviders(): readonly ExtensionProvider[];
    loadExtensions(disabledIds: string[]): Promise<Extension[]>;
    toggleProvider(providerId: string): boolean;
    toggleUserSource(providerId: string): boolean;
    persistMcpToggle(name: string, enabled: boolean, sourcePath?: string): Promise<void>;
    applyMcpToggle(name: string, enabled: boolean): Promise<void>;
    subscribeMcpChanges(onChange: () => void): Array<() => void>;
    mcpSource?: MCPRuntimeSource;
    inspectorSource?: ExtensionInspectorSource;
}
export interface ExtensionDashboardOptions {
    runtime: ExtensionDashboardRuntime;
    terminalHeight?: number;
    toolSource?: ToolRuntimeSource;
}
/**
 * Map dashboard provider tabs to {@link TabBar} tabs. Empty *enabled* providers
 * are muted — skipped by keyboard nav and unclickable; disabled providers stay
 * selectable (with a leading disabled glyph) so their master switch can be
 * re-enabled from the list. The "all" tab is never muted or marked.
 */
export declare function buildTabBarTabs(tabs: ProviderTab[]): Tab[];
/**
 * Picker scopes from the provider tabs: "all" first, then each provider with
 * its mark and count. Empty enabled providers are disabled (muted in the
 * {@link TabBar}); switched-off providers keep a muted dot and stay
 * selectable so their master switch can be turned back on.
 */
export declare function buildPickerScopes(tabs: ProviderTab[]): TspPickerScope[];
export declare class ExtensionDashboard implements Component {
    #private;
    onClose?: () => void;
    onRequestRender?: () => void;
    private constructor();
    static create(options: ExtensionDashboardOptions): Promise<ExtensionDashboard>;
    /**
     * Fullscreen frame: titled top border, the tab row(s), a divider, the
     * two-column body sized to fill the viewport, a divider, the footer hint, and
     * the bottom border.
     */
    render(width: number): readonly string[];
    invalidate(): void;
    handleInput(data: string): void;
    /** The dashboard is a `picker` sheet (scopes = providers, preview = inspector) wherever Tern draws pickers. */
    nativeSheet(cx: DescribeContext): boolean;
    /**
     * The picker sheet, or without `picker` a page: head, provider tabs,
     * search, the inventory list beside the inspector, and an action bar.
     * Rebuilt when state moves or the live tool set changes (MCP health
     * changes arrive as render requests, which bump the version).
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Pointer input, each on the path of the key it stands for: a row click
     * selects (click on the selected row or double click toggles, like
     * Space/Enter), a scope switches provider (←/→), `toggle`/`expand` run
     * Space and the expand key, `clear` empties the search (first Esc) and
     * `close` closes. Provider tabs in the page route to the {@link TabBar}.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    dispose(): void;
}
