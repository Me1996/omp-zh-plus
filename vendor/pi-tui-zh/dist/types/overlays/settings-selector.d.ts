import type { ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { Effort } from "@oh-my-pi/pi-ai";
import { type Component, type ImageBudget } from "../index.js";
import type { ShapeTarget } from "@oh-my-pi/snapcompact";
import type { ContextLineMode, StatusLinePreset, StatusLineSegmentId, StatusLineSeparatorStyle } from "../status-line/schema.js";
import { type SettingsHost } from "./settings-defs.js";
import { type ComposerPreviewStatusSource } from "./composer-shape-preview.js";
import { type PluginSettingsHost } from "./plugin-settings.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/**
 * Dynamic context for settings that need runtime data.
 * Some settings (like thinking level) are managed by the session, not Settings.
 */
export interface SettingsRuntimeContext {
    settings: SettingsHost;
    plugins: PluginSettingsHost;
    /** Available thinking levels (from session) */
    availableThinkingLevels: Effort[];
    /** Current thinking level (from session) */
    thinkingLevel: ThinkingLevel | undefined;
    /** Available themes */
    availableThemes: string[];
    /** Provider/source ids shown in /model. */
    providers: string[];
    /** Active model (api + id); resolves what the snapcompact `auto` shape maps to. */
    model?: ShapeTarget;
    /** Shared TUI image budget (graphics ids + transmit-once) for image previews. */
    imageBudget?: ImageBudget;
    /** Schedules a re-render after async preview work completes. */
    requestRender?: () => void;
    /** Live status renderer for composer-shape previews (the session's status line). */
    composerPreviewStatus?: ComposerPreviewStatusSource;
}
/** Status line settings subset for preview */
export interface StatusLinePreviewSettings {
    preset?: StatusLinePreset;
    contextLine?: ContextLineMode;
    leftSegments?: StatusLineSegmentId[];
    rightSegments?: StatusLineSegmentId[];
    separator?: StatusLineSeparatorStyle;
    sessionAccent?: boolean;
    transparent?: boolean;
    compactThinkingLevel?: boolean;
}
export interface SettingsCallbacks {
    /** Called when any setting value changes */
    onChange: (path: string, newValue: unknown) => void;
    /** Called for theme preview while browsing */
    onThemePreview?: (theme: string) => void | Promise<void>;
    /** Called for status line preview while configuring */
    onStatusLinePreview?: (settings: StatusLinePreviewSettings) => void;
    /** Get current rendered status line for inline preview */
    getStatusLinePreview?: () => string;
    /** Native status bar for the inline preview (TSP terminals dock the bar; its ANSI border geometry doesn't apply) */
    describeStatusLinePreview?: () => NativeNode;
    /** Called when plugins change */
    onPluginsChanged?: () => void | Promise<void>;
    /** Called when settings panel is closed */
    onCancel: () => void;
}
/**
 * Main tabbed settings selector component.
 * Uses declarative settings definitions from settings-defs.ts.
 */
export declare class SettingsSelectorComponent implements Component {
    #private;
    constructor(context: SettingsRuntimeContext, callbacks: SettingsCallbacks);
    invalidate(): void;
    /**
     * Fullscreen frame: title border, tab row, divider, optional search banner,
     * the active content sized to fill the terminal, the appearance preview,
     * then a footer hint pinned above the bottom border.
     */
    render(width: number): readonly string[];
    /**
     * Over a live session the native page is its own sheet: the backend puts
     * it in `layer`, where a terminal with the `aside` feature docks it at the
     * pane's right edge with the transcript beside it. Without `aside` it
     * fills a screen surface instead.
     */
    nativeSheet(cx: DescribeContext): boolean;
    /**
     * The native settings page (`prefs`) when the terminal draws it, else the
     * root card of today's generic composition.
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Native page events (the root node, see {@link #handlePrefsEvent}); in the
     * generic composition a tab pick does what a tab click does: switch tabs (or
     * jump, while searching), unless an open submenu owns the pointer.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(data: string): void;
}
