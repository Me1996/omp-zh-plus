/**
 * Interactive marketplace plugin selector.
 *
 * Shows available plugins from all configured marketplaces in a SelectList.
 * Selecting a plugin triggers installation. Esc cancels.
 */
import { SelectList, type SgrMouseEvent } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
export interface PluginSelectorCallbacks {
    onSelect: (pluginName: string, marketplace: string, scope?: "user" | "project") => void;
    onCancel: () => void;
}
export interface PluginItem {
    plugin: {
        name: string;
        version?: string;
        description?: string;
    };
    marketplace: string;
    /** Scope of this entry. When set, appended to the label and forwarded to onSelect. */
    scope?: "user" | "project";
}
export declare class PluginSelectorComponent extends OverlayPanel {
    #private;
    constructor(marketplaceCount: number, plugins: PluginItem[], installedIds: Set<string>, callbacks: PluginSelectorCallbacks);
    describe(cx: DescribeContext): NativeNode | null;
    /** Picker pointer events drive the list exactly as its keys do. */
    handleNativeEvent(event: NativeUiEvent): void;
    getSelectList(): SelectList;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
}
