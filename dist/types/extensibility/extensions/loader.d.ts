import type { ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { ServiceTierByFamily } from "@oh-my-pi/pi-ai";
import { EventBus } from "../../utils/event-bus.js";
import type { Extension, ExtensionFactory, ExtensionRuntime as IExtensionRuntime, LoadExtensionsResult, PreparedExtension, ProviderConfig, SourceInfo, ToolDefinition, ToolInfo } from "./types.js";
/**
 * Upstream-shaped provenance for an extension-registered tool. Consumers that
 * read `sourceInfo` off `getAllRegisteredTools()` (e.g. pi-fabric) receive an
 * absolute on-disk path: the tool's own `sourcePath` when it is filesystem-
 * absolute, otherwise the extension's resolved entry (`fallbackPath`). A tool
 * with no absolute origin at all falls back to the synthetic `<extension:name>`.
 */
export declare function extensionToolSourceInfo(definition: Pick<ToolDefinition, "name" | "sourcePath">, fallbackPath: string): SourceInfo;
export declare class ExtensionRuntimeNotInitializedError extends Error {
    constructor();
}
/**
 * Extension runtime with throwing stubs for action methods.
 * These are replaced with real implementations during initialization.
 */
export declare class ExtensionRuntime implements IExtensionRuntime {
    flagValues: Map<string, string | boolean>;
    pendingProviderRegistrations: Array<{
        name: string;
        config: ProviderConfig;
        sourceId: string;
    }>;
    registerProvider(name: string, config: ProviderConfig, sourceId: string): void;
    unregisterProvider(name: string): void;
    sendMessage(): void;
    sendUserMessage(): void;
    appendEntry(): void;
    setLabel(): void;
    getActiveTools(): string[];
    getAllTools(): ToolInfo[];
    setActiveTools(): Promise<void>;
    getCommands(): never;
    setModel(): Promise<boolean>;
    getThinkingLevel(): ThinkingLevel;
    setThinkingLevel(): void;
    getServiceTiers(): ServiceTierByFamily;
    setServiceTier(): void;
    getSessionName(): string | undefined;
    setSessionName(): Promise<void>;
}
/**
 * Create an Extension from an inline factory function.
 */
export declare function loadExtensionFromFactory(factory: ExtensionFactory, cwd: string, eventBus: EventBus, runtime: IExtensionRuntime, name?: string): Promise<Extension>;
/**
 * Load extensions from paths.
 *
 * Module import (the dominant cold-start cost — file I/O plus module
 * evaluation) runs concurrently across extensions; factory binding then runs
 * sequentially in the original path order, so registration semantics
 * (last-wins collisions, shared runtime flag defaults) stay deterministic.
 */
export declare function loadExtensions(paths: string[], cwd: string, eventBus?: EventBus): Promise<LoadExtensionsResult>;
/** Bind previously imported extension factories to a fresh session runtime. */
export declare function bindPreparedExtensions(preparedExtensions: readonly PreparedExtension[], cwd: string, eventBus?: EventBus): Promise<LoadExtensionsResult>;
/**
 * Discover absolute paths of extensions to load, without importing or
 * binding factories. Hot path on session startup — the scan walks native
 * `.omp`/`.pi` extension capabilities, JS/TS hook factories, the
 * installed-plugin tree, and any configured paths.
 *
 * The root session imports these paths once and forwards prepared factories to
 * subagents. Each child rebinds fresh Extension instances to its OWN
 * ExtensionAPI (cwd, eventBus, runtime) without re-evaluating the module graph.
 */
export interface DiscoverExtensionPathOptions {
    /** Include ambient native extensions, hooks, and installed plugins. */
    ambient?: boolean;
    /** Include ambient hook factories. Disable for read-only catalog commands. */
    includeAmbientHooks?: boolean;
}
export declare function discoverExtensionPaths(configuredPaths: string[], cwd: string, disabledExtensionIds?: string[], options?: DiscoverExtensionPathOptions): Promise<string[]>;
/**
 * Discover and load extensions from standard locations. Composed of
 * {@link discoverExtensionPaths} (FS scan) + {@link loadExtensions}
 * (per-session binding).
 */
export declare function discoverAndLoadExtensions(configuredPaths: string[], cwd: string, eventBus?: EventBus, disabledExtensionIds?: string[], options?: DiscoverExtensionPathOptions): Promise<LoadExtensionsResult>;
