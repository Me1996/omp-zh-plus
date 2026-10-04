/**
 * Plugin settings UI components.
 *
 * Provides a hierarchical settings interface:
 * - Plugin list (npm plugins + marketplace plugins)
 *   - Plugin details (enablement, manifest settings, and marketplace metadata)
 */
import { Container } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import { type PrefsEditing } from "../components/settings-list.js";
import type { DescribeContext, NativeChild, NativeNode, NativeUiEvent } from "../native/node.js";
import type { TspPrefsSection } from "@oh-my-pi/pi-wire";
/** The plugins tab as a native settings page draws it (the settings selector puts it in its `prefs` node). */
export interface PluginPrefsPage {
    lead: string;
    sections: TspPrefsSection[];
    focus: string | null;
    editing: PrefsEditing | null;
    /** An open value editor without a native control, shown over the page. */
    editor?: NativeChild;
}
/** Setting metadata consumed by the plugin settings UI. */
export type PluginSettingSchema = {
    description?: string;
    secret?: boolean;
} & ({
    type: "string";
    default?: string;
} | {
    type: "number";
    default?: number;
    min?: number;
    max?: number;
} | {
    type: "boolean";
    default?: boolean;
} | {
    type: "enum";
    default?: string;
    values: string[];
});
/** Installed runtime plugin fields consumed by the settings UI. */
export interface InstalledPlugin {
    name: string;
    version: string;
    enabled: boolean;
    enabledFeatures: string[] | null;
    manifest: {
        description?: string;
        features?: Record<string, {
            description?: string;
            default?: boolean;
        }>;
        settings?: Record<string, PluginSettingSchema>;
    };
}
/** Installed marketplace metadata consumed by the settings UI. */
export interface InstalledPluginSummary {
    id: string;
    scope: "user" | "project";
    shadowedBy?: "project";
    entries: {
        installPath: string;
        version: string;
        installedAt: string;
        lastUpdated: string;
        gitCommitSha?: string;
        enabled?: boolean;
    }[];
}
/** Runtime plugin manager capabilities required by the settings UI. */
export interface PluginSettingsManager {
    list(): Promise<InstalledPlugin[]>;
    getPlugin(name: string, options?: {
        path?: string;
    }): Promise<InstalledPlugin | undefined>;
    getPluginSettings(name: string): Promise<Record<string, unknown>>;
    setEnabled(name: string, enabled: boolean): Promise<void>;
    getEnabledFeatures(name: string): Promise<string[] | null>;
    setEnabledFeatures(name: string, features: string[] | null): Promise<void>;
    setPluginSetting(name: string, key: string, value: unknown): Promise<void>;
}
/** Marketplace manager capabilities required by the settings UI. */
export interface PluginSettingsMarketplaceManager {
    listInstalledPlugins(): Promise<InstalledPluginSummary[]>;
    setPluginEnabled(pluginId: string, enabled: boolean, scope?: "user" | "project"): Promise<void>;
}
/** Host-owned managers and plugin identifier parsing. */
export interface PluginSettingsHost {
    manager: PluginSettingsManager;
    createMarketplaceManager(): Promise<PluginSettingsMarketplaceManager>;
    parsePluginId(id: string): {
        name: string;
    } | null;
}
/**
 * Forwards a keystroke to `input`, but cancels via `onCancel` when the user presses Escape.
 *
 * Escape is decoded via `matchesKey` rather than a raw `\x1b` compare: inside the
 * fullscreen settings overlay the kitty keyboard protocol is active (ghostty/kitty),
 * where the Escape key arrives as the CSI-u sequence `\x1b[27u`, not a bare `\x1b`.
 * The literal fallbacks preserve legacy single/double-escape on terminals without it.
 */
export declare function handleInputOrEscape(data: string, input: {
    handleInput(data: string): void;
}, onCancel: () => void): void;
/**
 * One row in the unified plugin list. npm and marketplace plugins live in
 * separate registries with different shapes, so a tagged union keeps both
 * paths type-safe end-to-end (list rendering, value lookup, detail callback).
 */
export type PluginListEntry = {
    kind: "npm";
    plugin: InstalledPlugin;
} | {
    kind: "marketplace";
    plugin: InstalledPluginSummary;
};
export interface PluginListCallbacks {
    onNpmSelect: (plugin: InstalledPlugin) => void;
    onMarketplaceSelect: (plugin: InstalledPluginSummary) => void;
    onCancel: () => void;
}
/**
 * Shows installed plugins from both registries (npm + marketplace) with
 * enable/disable status, scope tag, and shadow indicator. Selecting an entry
 * fans out to the kind-specific detail callback.
 */
export declare class PluginListComponent extends OverlayPanel {
    #private;
    private readonly entries;
    constructor(entries: ReadonlyArray<PluginListEntry>, callbacks: PluginListCallbacks);
    /** The installed plugins as one native page section: a row per plugin with its status and a Configure button. */
    prefsPage(): PluginPrefsPage;
    /** A native page event: a row click moves the selection, Configure (or a double click) opens the plugin. */
    handlePrefsEvent(event: NativeUiEvent): void;
    /** The plugin list (the select list describes itself) and its hints, or install guidance when empty. */
    describe(_cx: DescribeContext): NativeNode;
    handleInput(data: string): void;
}
export interface PluginDetailCallbacks {
    onEnabledChange: (enabled: boolean) => void;
    onFeatureChange: (feature: string, enabled: boolean) => void;
    onConfigChange: (key: string, value: unknown) => void | Promise<void>;
    /** Schedules a frame after an asynchronous config submission settles. */
    requestRender?: () => void;
    onBack: () => void;
}
/**
 * Shows detail settings for a single plugin:
 * - Enable/disable toggle
 * - Feature toggles
 * - Config settings
 */
export declare class PluginDetailComponent extends OverlayPanel {
    #private;
    private plugin;
    private readonly manager;
    private readonly callbacks;
    constructor(plugin: InstalledPlugin, manager: PluginSettingsManager, callbacks: PluginDetailCallbacks);
    handleInput(data: string): void;
    /** This plugin's settings as a native page section. */
    prefsPage(): PluginPrefsPage;
    /** A native page event on this plugin's settings. */
    handlePrefsEvent(event: NativeUiEvent): void;
}
export interface MarketplacePluginDetailCallbacks {
    parsePluginId: PluginSettingsHost["parsePluginId"];
    onEnabledChange: (enabled: boolean) => void;
    onConfigChange: (pluginName: string, key: string, value: unknown) => void;
    /** Schedules a TUI frame after asynchronous manifest settings load. */
    requestRender?: () => void;
    onBack: () => void;
}
/**
 * Detail view for a marketplace plugin, including settings declared by its
 * runtime package and metadata from the installed-plugins registry.
 */
export declare class MarketplacePluginDetailComponent extends OverlayPanel {
    #private;
    private plugin;
    private readonly manager;
    private readonly callbacks;
    constructor(plugin: InstalledPluginSummary, manager: PluginSettingsManager, callbacks: MarketplacePluginDetailCallbacks);
    handleInput(data: string): void;
    /** This plugin's settings as a native page section, with its install facts as the lead. */
    prefsPage(): PluginPrefsPage;
    /** A native page event on this plugin's settings. */
    handlePrefsEvent(event: NativeUiEvent): void;
}
export interface PluginSettingsCallbacks {
    onClose: () => void;
    onPluginChanged: () => void | Promise<void>;
    /** Schedules a TUI frame after asynchronous plugin data loads. */
    requestRender?: () => void;
}
/**
 * Top-level plugin settings component.
 * Manages navigation between plugin list and plugin detail views.
 */
export declare class PluginSettingsComponent extends Container {
    #private;
    private readonly callbacks;
    constructor(host: PluginSettingsHost, callbacks: PluginSettingsCallbacks);
    /** The current view (list or a plugin's settings) as a native settings page. */
    prefsPage(): PluginPrefsPage;
    /** Routes a native page event to the current view. */
    handlePrefsEvent(event: NativeUiEvent): void;
    handleInput(data: string): void;
}
