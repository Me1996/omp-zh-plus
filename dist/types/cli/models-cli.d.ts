/**
 * `omp models` — list, search, and refresh available models.
 *
 * Subcommands:
 * - `ls` (default): list available chat models grouped by provider.
 * - `find <substring>`: list models of the selected kind whose provider, id, or name contains the substring.
 * - `refresh`: force an online catalog re-fetch (ignoring the model cache TTL),
 *   then list. This is the supported replacement for `rm -rf ~/.omp/models.db`
 *   when a provider ships a new model that the 24h cache has not picked up yet.
 *
 * `ls`/`find` use the cache when fresh (`online-if-uncached`); only `refresh`
 * forces the network (`online`).
 */
import type { Api, Model } from "@oh-my-pi/pi-ai";
import { type ModelKind } from "@oh-my-pi/pi-catalog/types";
import type { ConfigError } from "../config/config-file.js";
import { ModelRegistry } from "../config/model-registry.js";
export type ModelsAction = "ls" | "find" | "refresh";
export interface ModelsCommandArgs {
    action: ModelsAction;
    /** Search substring for `find`, or optional filter for `ls`. */
    pattern?: string;
    flags: {
        json?: boolean;
        /** Catalog kind to list; defaults to chat models. */
        kind?: ModelKind | "all";
        /** CLI `-e <path>` extension paths to load before listing (issue #905). */
        extensions?: string[];
        /** Skip extension discovery; only load explicit `extensions`. */
        noExtensions?: boolean;
        /** Extra `config.yml` overlays to apply for this invocation. */
        config?: string[];
    };
}
/** Resolve the two positional args into an action + filter (provider names fall through to `ls`). */
export declare function resolveModelsArgs(first: string | undefined, second: string | undefined): {
    action: ModelsAction;
    pattern: string | undefined;
};
/**
 * The two registry reads the listing performs. Structural so the renderer can be
 * exercised without booting a full {@link ModelRegistry}.
 */
export interface ModelsListingSource {
    /** Return models available for the selected catalog kind, or every kind for `all`. */
    getAvailable(kind?: ModelKind | "all"): Model<Api>[];
    getError(): ConfigError | undefined;
}
/**
 * Render `omp models ls`/`find` as one box table per provider, selecting chat
 * models by default or the caller-requested catalog kind.
 */
export declare function renderProviderModels(source: ModelsListingSource, action: ModelsAction, pattern: string | undefined, json: boolean, kind?: ModelKind | "all"): void;
/**
 * Options for {@link runModelsListing}: render the catalog from a caller-supplied
 * registry. Loads extensions (CLI `-e` paths and configured `settings.extensions`)
 * and discovers their providers before rendering so extension-contributed models
 * appear (issue #905). The caller is responsible for refreshing built-in providers.
 */
export interface RunModelsListingOptions {
    modelRegistry: ModelRegistry;
    cwd: string;
    action?: ModelsAction;
    pattern?: string;
    json?: boolean;
    /** Catalog kind to list; defaults to chat models. */
    kind?: ModelKind | "all";
    /** CLI-supplied extension paths (e.g. from `-e <path>`). */
    additionalExtensionPaths?: string[];
    /** Extension paths configured under `extensions:` in user settings. */
    settingsExtensions?: string[];
    /** Disabled extension ids from settings (`disabledExtensions`). */
    disabledExtensionIds?: string[];
    /** When true, exclude ambient factories and resolve only `additionalExtensionPaths`. */
    disableExtensionDiscovery?: boolean;
}
export declare function runModelsListing(options: RunModelsListingOptions): Promise<void>;
/**
 * Entry point for the standalone `omp models` command: bootstraps auth storage,
 * settings, and the model registry, force/cache-refreshes built-in providers per
 * the chosen action, then delegates to {@link runModelsListing}.
 */
export declare function runModelsCommand(command: ModelsCommandArgs): Promise<void>;
