import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { Component } from "../tui.js";
/** Tab definition */
export interface Tab {
    /** Unique identifier for the tab */
    id: string;
    /** Display label shown in the tab bar */
    label: string;
    /** Compact form (e.g. just the icon) used when the bar must shrink to fit one line. */
    short?: string;
    /** Render with the muted style and skip during keyboard navigation. */
    muted?: boolean;
}
/** Theme for styling the tab bar */
export interface TabBarTheme {
    /** Style for the label prefix (e.g., "Settings:") */
    label: (text: string) => string;
    /** Style for the currently active tab */
    activeTab: (text: string) => string;
    /** Style for inactive tabs */
    inactiveTab: (text: string) => string;
    /** Style for the hint text (e.g., "(tab to cycle)") */
    hint: (text: string) => string;
    /** Style for muted tabs. Falls back to `inactiveTab` when omitted. */
    mutedTab?: (text: string) => string;
    /** Style for the tab under the mouse pointer. Falls back to `inactiveTab` when omitted. */
    hoverTab?: (text: string) => string;
}
/**
 * Horizontal tab bar component.
 *
 * @example
 * ```ts
 * const tabs = [
 *   { id: "config", label: "Config" },
 *   { id: "tools", label: "Tools" },
 * ];
 * const tabBar = new TabBar("Settings", tabs, theme);
 * tabBar.onTabChange = (tab) => console.log(`Switched to ${tab.id}`);
 * ```
 */
export declare class TabBar implements Component {
    #private;
    /** Callback fired when the active tab changes */
    onTabChange?: (tab: Tab, index: number) => void;
    /** Render the trailing "(tab to cycle)" hint. Disable when the host folds the hint into its own footer. */
    showHint: boolean;
    constructor(label: string, tabs: Tab[], theme: TabBarTheme, initialIndex?: number);
    /** Return tab identities and active-tab state for debug inspection. */
    debugState(): Record<string, unknown>;
    /** Get the currently active tab */
    getActiveTab(): Tab;
    /** Get the index of the currently active tab */
    getActiveIndex(): number;
    /** Set the active tab by index (clamped to valid range) */
    setActiveIndex(index: number): void;
    /**
     * Replace the tab set without firing onTabChange. The active tab is
     * preserved by id when it survives the swap (or forced via `activeId`);
     * otherwise the index is clamped.
     */
    setTabs(tabs: Tab[], activeId?: string): void;
    /** Set the active tab by id without firing onTabChange. Returns false when the id is unknown. */
    setActiveById(id: string): boolean;
    /** Activate the tab with `id`, firing onTabChange when it changes. Muted tabs are ignored. */
    selectTab(id: string): boolean;
    /** Move to the next non-muted tab (wraps to first tab after last) */
    nextTab(): void;
    /** Move to the previous non-muted tab (wraps to last tab before first) */
    prevTab(): void;
    invalidate(): void;
    /**
     * A native `tabs` strip (muted tabs keep the muted token), preceded by the
     * bar label and followed by the cycle hint when present. Shrinking to
     * `short` labels and wrapping are the terminal's.
     */
    describe(_cx: DescribeContext): NativeNode;
    /** A click on a tab activates it (muted tabs stay inert). */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * Handle keyboard input for tab navigation.
     * @returns true if the input was handled, false otherwise
     */
    handleInput(data: string): boolean;
    /**
     * Render the tab bar. When the full labels overflow the width, tabs are
     * collapsed to their `short` form one by one — starting with the tabs
     * farthest from the active one — until the bar fits on a single line.
     * Wrapping to multiple lines is the last resort.
     */
    render(width: number): readonly string[];
    /**
     * Resolve a pointer position against the last rendered frame. `line` is the
     * 0-based line index within this component's render output, `col` the
     * 0-based column.
     */
    tabAt(line: number, col: number): Tab | undefined;
    /** Highlight the tab under the pointer (null clears). */
    setHoverTab(id: string | null): void;
}
