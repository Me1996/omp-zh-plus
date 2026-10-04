/**
 * Compact session-model picker (alt+p / `/switch`): a bottom-anchored
 * floating overlay hosting just a {@link ModelBrowser} — no provider sidebar.
 * Model entries switch the current session only; a search beginning with `@`
 * exposes the configured ctrl+p quick roles.
 */
import type { Model } from "@oh-my-pi/pi-ai";
import { type KeyId } from "../keys.js";
import type { Component, TUI } from "../tui.js";
import type { ModelBrowserRegistry, ModelBrowserSource } from "./model-browser.js";
import type { ConfiguredThinkingLevel } from "../thinking.js";
import type { ScopedModelItem } from "./model-hub.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/** Configured role resolved to a concrete model. */
export interface ResolvedRoleModel {
    role: string;
    model: Model;
    thinkingLevel?: ConfiguredThinkingLevel;
    explicitThinkingLevel: boolean;
}
/** Catalog refresh capability used by the session picker. */
export interface ModelPickerRegistry extends ModelBrowserRegistry {
    /** Bring the catalog up to date without rebuilding a current one; `true` when the picker must re-read it. */
    refreshIfStale(): Promise<boolean>;
}
export interface ModelPickerCallbacks {
    /**
     * A model was chosen for a session-only switch. `selector` is `provider/id`.
     * `overContext` is true when the session transcript exceeds the model's
     * context window — the host must compact before switching.
     */
    onPick: (model: Model, selector: string, meta: {
        overContext: boolean;
    }) => void;
    /** A configured ctrl+p quick role was chosen. */
    onPickRole?: (entry: ResolvedRoleModel) => void;
    /**
     * A model was chosen for Task subagents (task mode, toggled by pressing the
     * picker shortcut again). Session-only: the host applies a runtime override.
     */
    onPickTask?: (model: Model, selector: string) => void;
    /** The picker was dismissed. */
    onCancel: () => void;
}
export interface ModelPickerOptions {
    /** Session token count; models with smaller context windows are grayed and compact-first on pick. */
    currentContextTokens?: number;
    /** `provider/id` of the session's active model; highlighted and preselected. */
    currentSelector?: string;
    /** Resolved role models in the same order used by the ctrl+p quick-role cycle. */
    quickRoles?: ReadonlyArray<ResolvedRoleModel>;
    /** Complete ctrl+p order, including unavailable roles, to preserve segment colors. */
    quickRoleOrder?: ReadonlyArray<string>;
    /** Active quick role, highlighted when the search begins with `@`. */
    currentQuickRole?: string;
    /** Keys that toggle task-subagent mode while the picker is open; the first is shown in the footer. */
    taskModeKeys?: readonly KeyId[];
    /** `provider/id` highlighted and preselected in task mode (current Task subagent model). */
    taskSelector?: string;
}
/** Rows the browser renders around its list window (search + blank, blank + two detail rows). */
export declare const BROWSER_FRAME_ROWS = 5;
/**
 * The alt+p picker component. Hosted as a non-fullscreen bottom-anchored
 * overlay (`ui.showOverlay(..., { anchor: "bottom-center" })`); keyboard-only,
 * since mouse tracking is reserved for fullscreen overlays.
 */
export declare class ModelPickerComponent implements Component {
    #private;
    constructor(tui: TUI, settings: ModelBrowserSource, registry: ModelPickerRegistry, scopedModels: ReadonlyArray<ScopedModelItem>, callbacks: ModelPickerCallbacks, options?: ModelPickerOptions);
    invalidate(): void;
    handleInput(data: string): void;
    render(width: number): string[];
    /** A `picker` is its own sheet: the backend mounts it in `layer` without an `overlay` wrapper. */
    nativeSheet(cx: DescribeContext): boolean;
    /** Picker pointer events, each on the path of the key it stands for. */
    handleNativeEvent(event: NativeUiEvent): void;
    /** The `md` picker sheet, or the fallback card when the terminal lacks the kind. */
    describe(cx?: DescribeContext): NativeNode;
}
