import type { KeysApi, Model } from "@oh-my-pi/pi-ai";
import type { Component, TUI } from "../tui.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { ModelBrowserSource, ModelBrowserRegistry } from "./model-browser.js";
import { type ConfiguredThinkingLevel } from "../thinking.js";
/** Live preferences and selector operations supplied by the host. */
export interface ModelHubSource extends ModelBrowserSource {
    readonly disabledProviders: readonly string[];
    readonly fallbackChains: Record<string, string[]>;
    readonly modelRoleStorage: "global" | "project";
    readonly cycleOrder: readonly string[];
    getProjectModelRole(role: string): string | undefined;
    getGlobalModelRole(role: string): string | undefined;
    getModelRoleSource(role: string): "global" | "project" | "default";
    /**
     * Saved model presets (in switch order) and the one the current role setup
     * matches, if any. Absent hosts have no presets to switch between.
     */
    getModelPresets?(): {
        names: readonly string[];
        active: string | undefined;
    };
}
/** Catalog capabilities required by the model hub. */
export interface ModelHubRegistry extends ModelBrowserRegistry {
    readonly authStorage: {
        readonly keys: Pick<KeysApi, "source">;
    };
    getDiscoverableProviders(): string[];
    getProviderDiscoveryState(provider: string): {
        optional: boolean;
        status: "idle" | "ok" | "empty" | "cached" | "unavailable" | "unauthenticated";
        fetchedAt?: number;
        error?: string;
    } | undefined;
    find(provider: string, id: string): Model | undefined;
    refresh(strategy: "online"): Promise<void>;
    refreshProvider(provider: string, strategy: "online", options?: {
        refreshCommandCredentials?: boolean;
    }): Promise<void>;
}
/** A `--models` scope entry (mirrors the session's scoped model list). */
export interface ScopedModelItem {
    model: Model;
    thinkingLevel?: string;
}
export type ModelRoleSelectionScope = "global" | "project";
export interface ModelHubCallbacks {
    /** Persist a role assignment. */
    onAssign: (model: Model, role: string, thinkingLevel: ConfiguredThinkingLevel | undefined, selector: string, scope?: ModelRoleSelectionScope) => void | boolean | Promise<void | boolean>;
    /** Clear a configured role back to auto-selection. */
    onUnassign: (role: string, scope?: ModelRoleSelectionScope) => void;
    /** Persist a `retry.fallbackChains` entry — keyed by a role, `provider/model-id`, or `provider/*`; an empty chain clears the key. */
    onFallbackChainChange?: (role: string, chain: string[]) => void;
    /** Locked provider activation: forward to the /login flow. */
    onLoginRequest?: (providerId: string) => void;
    /** Save the current role assignments and default thinking level as a named model preset. */
    onSavePreset?: (name: string) => void;
    /**
     * Apply a saved model preset (ctrl+←/→ or p/⇧P in the Roles view) and report
     * the outcome itself. A switch that writes nothing (a refused preset) still
     * advances the hub's preset cursor, so the next press moves past it.
     */
    onSwitchPreset?: (name: string) => void | Promise<void>;
    /** Persist a new quick-switch cycle order (the ctrl+p role cycle). */
    onCycleOrderChange?: (order: string[]) => void;
    onCancel: () => void;
}
export interface ModelHubOptions {
    /** Preselect this provider's sidebar entry (e.g. when reopening after /login). */
    initialProviderId?: string;
    /** `provider/id` of the session's model, marked current in the native picker. */
    currentSelector?: string;
}
/** Test hook: forget which providers were auto-refreshed this process. */
export declare function resetProviderAutoRefreshGuard(): void;
/**
 * The fullscreen model hub component. Hosted via `ui.showOverlay(..., { fullscreen: true })`;
 * the host must call {@link ModelHubComponent.dispose} when the overlay closes.
 */
export declare class ModelHubComponent implements Component {
    #private;
    constructor(tui: TUI, settings: ModelHubSource, registry: ModelHubRegistry, scopedModels: ReadonlyArray<ScopedModelItem>, callbacks: ModelHubCallbacks, options?: ModelHubOptions);
    /** Cancel pending provider refresh timers and the spinner. Host calls this on overlay close. */
    dispose(): void;
    invalidate(): void;
    /** Re-sync after an asynchronous callback finishes mutating settings. */
    refreshAfterExternalMutation(): void;
    handleInput(data: string): void;
    render(width: number): readonly string[];
    /** A `picker` is its own sheet: the backend mounts it in `layer` without an `overlay` wrapper. */
    nativeSheet(cx: DescribeContext): boolean;
    describe(cx: DescribeContext): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
}
