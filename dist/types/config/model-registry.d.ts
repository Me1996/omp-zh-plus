import type { ApiKeyResolver, FetchImpl, ResolvedApiKey, UsageProvider } from "@oh-my-pi/pi-ai";
import type { AuthApiKeyOptions } from "@oh-my-pi/pi-ai/auth-storage";
import type { OAuthCredentials, OAuthLoginCallbacks } from "@oh-my-pi/pi-ai/oauth/types";
import type { Api, Context, Model, ModelSpec, RemoteCompactionConfig, SimpleStreamOptions, ThinkingConfig } from "@oh-my-pi/pi-ai/types";
import type { AssistantMessageEventStream } from "@oh-my-pi/pi-ai/utils/event-stream";
import { type ModelRefreshStrategy } from "@oh-my-pi/pi-catalog/model-manager";
import { type ModelKind } from "@oh-my-pi/pi-catalog/types";
import type { AuthStorage } from "../session/auth-storage.js";
import { type ApiKeyResolverModel, type ApiKeyResolverOptions } from "./api-key-resolver.js";
import type { ConfigError } from "./config-file.js";
import { type ProviderDiscoveryState } from "./model-provider-discovery.js";
export { mergeDiscoveredModel } from "./model-patch.js";
export { isAuthenticated, kNoAuth, type ProviderDiscoveryState, type ProviderDiscoveryStatus, } from "./model-provider-discovery.js";
import { type Settings } from "./settings.js";
/**
 * Extra knobs for {@link ModelRegistry.refresh} / {@link ModelRegistry.refreshProvider}.
 * Online discovery (`strategy: "online"`) is independent of credential minting:
 * opening `/models` and hovering a provider fetch catalogs without re-running
 * `!command` helpers. Pass `refreshCommandCredentials` only for explicit user
 * refresh (`omp models refresh`, TUI F5).
 */
export interface ModelRegistryRefreshOptions {
    refreshCommandCredentials?: boolean;
}
/** Authentication material returned to legacy extensions for one model request. */
export type ResolvedRequestAuth = {
    ok: true;
    apiKey?: string;
    headers?: Record<string, string>;
    env?: Record<string, string>;
} | {
    ok: false;
    error: string;
};
/**
 * Model registry - loads and manages models, resolves API keys via AuthStorage.
 */
export declare class ModelRegistry {
    #private;
    readonly authStorage: AuthStorage;
    /**
     * @param authStorage - Auth storage for API key resolution
     *
     * Sync constructor — eagerly loads config (including migrations), cache
     * metadata, and custom models. Bundled providers are enriched selectively
     * when synchronous callers query them. Production boot paths SHOULD prefer
     * {@link ModelRegistry.create} so the YAML/JSONC migration step lands off the
     * event loop's hot path before the first `tryLoad()` runs.
     */
    constructor(authStorage: AuthStorage, modelsPath?: string, options?: {
        /**
         * Gateway mode: ignore local `models.yml` entirely (provider overrides,
         * config API keys, custom models, custom discovery). A broker-backed
         * gateway serves only bundled + broker-discovered catalog metadata and
         * must never apply client-side credential or routing overrides.
         */
        ignoreLocalModelConfig?: boolean;
        /** Settings source for availability and context-window policies. */
        settings?: Settings;
        /** Model discovery cache database. Defaults beside an explicit models config. */
        cacheDbPath?: string;
        fetch?: FetchImpl;
    });
    /**
     * Reload models from disk (built-in + custom config).
     */
    refresh(strategy?: ModelRefreshStrategy, options?: ModelRegistryRefreshOptions): Promise<void>;
    /**
     * Hydrate credential-scoped built-in catalogs from their exact cache rows.
     *
     * The synchronous constructor cannot resolve credentials, so session startup
     * awaits this local-only, best-effort pass before validating model selectors.
     */
    hydrateCredentialScopedModelCaches(): Promise<void>;
    /**
     * Rebuild the catalog after a policy-affecting setting change (e.g.
     * `extendedContext`). Forces the static reload past the models.yml mtime
     * gate, then restores runtime-discovered models from the SQLite cache —
     * offline, a settings flip must never hit the network. Concurrent calls
     * coalesce onto one rebuild.
     */
    reapplyModelPolicies(): Promise<void>;
    refreshInBackground(strategy?: ModelRefreshStrategy): void;
    /**
     * Wait for any in-flight background model discovery to settle.
     *
     * Background discovery started by {@link refreshInBackground} is
     * fire-and-forget; RPC consumers (e.g. `get_available_models`,
     * `set_model`) and deferred `--model` resolution that read the registry
     * immediately after session creation can otherwise observe a partial
     * catalog before discovery-backed providers have populated `#models`.
     * Awaiting the tracked promise ensures the response reflects every
     * configured provider once the initial background refresh resolves.
     *
     * No-op when no refresh is in flight (`#backgroundRefresh` cleared in the
     * `finally` of `refreshInBackground` on completion). Resolves immediately
     * in that case so already-warm sessions are unaffected. Discovery errors
     * remain swallowed by `refreshInBackground`'s existing `.catch`.
     */
    awaitBackgroundRefresh(): Promise<void>;
    /**
     * Catch the catalog up for a view that just read it, rebuilding only when it
     * is actually stale: waits out an in-flight background refresh, then runs an
     * offline {@link refresh} if models.yml changed on disk since the last load.
     * Resolves `true` when either may have changed the catalog (the view should
     * re-read it), `false` without any rebuild when the in-memory catalog is
     * already current. Rejects when the offline rebuild fails.
     */
    refreshIfStale(): Promise<boolean>;
    /**
     * Resolve once the initial background discovery has settled, arming a waiter
     * even when the refresh has not started yet. In the CLI path
     * {@link refreshInBackground} runs after the session is constructed
     * (`main.ts`; interactive mode waits for the first frame), so a consumer
     * created in the constructor cannot rely on an
     * in-flight snapshot — it must observe the settle whenever it happens.
     * Resolves immediately once any background refresh has completed; never
     * rejects (discovery errors are swallowed by `refreshInBackground`). Stays
     * pending when no background refresh is ever started (e.g. an embedder that
     * manages discovery itself), which leaves startup suppression in place.
     * An optional abort signal releases a waiter when its owning session is
     * disposed before an embedder starts discovery.
     */
    awaitInitialBackgroundRefresh(signal?: AbortSignal): Promise<void>;
    refreshProvider(providerId: string, strategy?: ModelRefreshStrategy, options?: ModelRegistryRefreshOptions): Promise<void>;
    /**
     * Refresh only named discovery providers (configured `models.yml` providers or
     * extension `fetchDynamicModels` managers). Unlike {@link refreshProvider},
     * this avoids a static reload and leaves unrelated runtime discovery alone.
     * Unknown ids have no effect.
     */
    refreshDiscoverableProviders(providerIds: Iterable<string>, strategy?: ModelRefreshStrategy): Promise<void>;
    /**
     * True when the provider's models expose context metadata that only appears
     * after a lazy load — llama.cpp's `meta.n_ctx` once a cold instance spins up
     * (#3310/#3311), LM Studio's `loaded_context_length` once it JIT-loads the
     * model on the first inference (#9001). Callers use this to decide whether a
     * post-first-response refresh is worth a native probe.
     */
    hasLazyRuntimeMetadata(provider: string): boolean;
    /**
     * Refresh dynamic metadata that can appear only after a local model loads.
     *
     * llama.cpp exposes `meta.n_ctx` once a lazy-loaded instance is up
     * (#3310/#3311); LM Studio exposes `loaded_context_length` once it JIT-loads
     * the model on first inference (#9001). Both are captured only as a snapshot
     * at discovery time, so re-probe the selected model's native runtime metadata
     * and patch its context window to what the backend actually serves.
     */
    refreshSelectedModelMetadata(model: Model<Api>): Promise<Model<Api>>;
    /**
     * Discover models for providers registered at runtime via `fetchDynamicModels`
     * (extension providers). Merges the discovered catalog into the existing model
     * set without reloading static models, so dynamically-discovered models from
     * other providers are preserved. No-op when no runtime providers are registered.
     *
     * Drives the same SQLite model cache as built-in providers, so the default
     * `online-if-uncached` strategy fetches at most once per cache TTL (24 h).
     */
    refreshRuntimeProviders(strategy?: ModelRefreshStrategy): Promise<void>;
    /**
     * Get any error from loading custom models config (undefined if no error).
     */
    getError(): ConfigError | undefined;
    /**
     * Get all models (built-in + custom) of one catalog kind.
     * If custom config had errors, returns only built-in models. The default
     * excludes role-specific runners so existing session callers remain chat-only.
     * Pass `"all"` to retrieve the complete catalog.
     */
    getAll(kind?: ModelKind | "all"): Model<Api>[];
    /**
     * Get available models for an explicit provider set without materializing
     * unrelated cached catalogs. Startup role resolution uses this before the
     * full model picker is needed. The default excludes role-specific runners;
     * pass `"all"` when the caller is intentionally selecting across kinds.
     */
    getAvailableForProviders(providers: ReadonlySet<string>, kind?: ModelKind | "all"): Model<Api>[];
    /**
     * Get available models of one catalog kind.
     * This is a fast auth check that doesn't refresh OAuth tokens. The default
     * is chat-only; pass `"all"` to include authenticated and keyless runners.
     */
    getAvailable(kind?: ModelKind | "all"): Model<Api>[];
    /**
     * Check whether auth is configured for a model's provider.
     *
     * Mirrors the upstream `@mariozechner/pi-coding-agent` API surface so that
     * external plugins/extensions and downstream wrappers (e.g. subagent launch
     * paths that pre-flight auth before model resolution) can probe a model
     * without resolving an API key. Returns true for keyless providers as well
     * as providers with stored credentials. See issue #993.
     *
     * Side-effect-free and synchronous: a command-backed key (`!cmd`) counts as
     * configured by its presence alone — the program is NOT executed — and OAuth
     * tokens are NOT refreshed (`authStorage.hasResolvableAuth`). This is what keeps the
     * model-switch pre-flight off the event loop's hot path; the real key
     * (command execution + OAuth refresh) is resolved lazily per request via
     * {@link ModelRegistry.resolver}.
     *
     * Cross-provider env aliases count here (`xai-oauth` can borrow `XAI_API_KEY`)
     * so an explicit `xai-oauth/…` selector does not fail with "No API key".
     * Default-model availability still uses {@link AuthStorage.keys.source}, which
     * ignores that alias so SuperGrok is not auto-selected from a paid key.
     */
    hasConfiguredAuth(model: Model<Api>): boolean;
    /**
     * Whether `provider` has a *concrete* credential — a stored login, a
     * command/config/runtime key, or a keyless local endpoint — as opposed to a
     * self-resolving AWS/Vertex sentinel that only signals an ambient credential
     * *source* exists. Default-model auto-selection prefers concretely-authed
     * providers so an ambiently-available Bedrock/Vertex provider never displaces
     * the provider the user actually signed into. See {@link AuthStorage.keys.source}
     * and issue #9967.
     */
    hasConcreteAuth(provider: string): boolean;
    /**
     * Whether the provider's configured API key is resolved from a command.
     *
     * Callers use this to distinguish the registry's command-first resolver
     * path from lower-priority credentials in {@link authStorage}.
     */
    hasCommandBackedApiKey(provider: string): boolean;
    getDiscoverableProviders(): string[];
    /** Canonical id of a configured or extension-backed discovery provider. */
    getDiscoveryProviderId(requestedId: string): string | undefined;
    /**
     * Whether `providerId` is known to the registry: it has at least one live
     * model, or it is configured for dynamic discovery (models.yml `discovery:`
     * or a runtime extension provider) and is not disabled. Discovery-only
     * providers can hold zero models at startup — cached rows never persist
     * live auth headers (#5780), so a provider whose discovered models all
     * carry config headers (`authHeader: true`) only materializes models after
     * the online refresh completes.
     */
    hasProvider(providerId: string): boolean;
    getProviderDiscoveryState(provider: string): ProviderDiscoveryState | undefined;
    /**
     * Whether a config-declared discovery provider has not yet produced a
     * catalog in this process. A cold discovery cache (e.g. after `omp update`
     * bumps the cache namespace) leaves the provider in its initial `idle`
     * state with no models, so a selector the provider will supply looks
     * unknown until background discovery lands (#10048).
     */
    isProviderDiscoveryPending(provider: string): boolean;
    /**
     * Find a model by provider and ID. A provider disabled in settings has no
     * models to find: every caller that falls back to a literal lookup when
     * availability-filtered resolution misses (retry fallback candidates,
     * advisors, restored and CLI models) would otherwise reach it anyway.
     */
    find(provider: string, modelId: string): Model<Api> | undefined;
    /**
     * One provider's full catalog (every kind, credentials ignored) without
     * materializing the whole bundled catalog. Startup validation of
     * provider-qualified selectors uses this: `getAll()` composes ~5k models
     * through the compat classifier, which costs ~80ms on the first paint path.
     */
    getProviderModels(provider: string): Model<Api>[];
    /**
     * Provider-level base URL: explicit runtime/config overrides first, then any
     * discovered model that defines one.
     *
     * The overrides lead because a model-derived answer is only available once
     * discovery has populated the registry. `omp usage` builds a `ModelRegistry`
     * and probes credentials immediately, and providers whose roster is
     * discovery-only (no bundled rows) have no model to read a URL from at that
     * point — so deriving solely from models returned `undefined` cache-cold and
     * let a usage probe send a proxy-scoped key to the provider's canonical host.
     */
    getProviderBaseUrl(provider: string): string | undefined;
    /**
     * Materialize provider-level config headers for one outbound request.
     * Catalog inspection never executes command-backed values.
     */
    getProviderHeaders(provider: string): Promise<Record<string, string> | undefined>;
    /** Materialize a model's complete configured header chain for one request. */
    resolveModelHeaders(model: Model<Api>, signal?: AbortSignal): Promise<Record<string, string> | undefined>;
    /** Resolve a model's request credential or the no-auth sentinel. */
    getApiKey(model: Model<Api>, sessionId?: string, options?: {
        signal?: AbortSignal;
    }): Promise<string | undefined>;
    /** Resolve request authentication through the historical Pi extension facade. */
    getApiKeyAndHeaders(model: Model<Api>): Promise<ResolvedRequestAuth>;
    /**
     * Resolve a provider's request credential or the no-auth sentinel.
     *
     * `options.forceRefresh` powers step (b) of the auth-retry policy — it
     * re-mints the session-sticky OAuth token even when the cached copy still
     * looks valid. `options.signal` is threaded into any broker-bound refresh.
     */
    getApiKeyForProvider(provider: string, sessionId?: string, options?: AuthApiKeyOptions): Promise<string | undefined>;
    getApiKeyWithCredentialForProvider(provider: string, sessionId?: string, options?: AuthApiKeyOptions): Promise<ResolvedApiKey | undefined>;
    /**
     * Build an {@link ApiKeyResolver} implementing the central a/b/c auth-retry
     * policy. Accepts a provider id with options, or a model with an optional
     * session id (`resolver(model, sessionId)`) which derives `baseUrl`/`modelId`
     * from the model. Callers that need the initial key for a guard can call
     * `resolveApiKeyOnce(resolver)`.
     */
    resolver(provider: string, options?: ApiKeyResolverOptions): ApiKeyResolver;
    resolver(model: ApiKeyResolverModel, sessionId?: string): ApiKeyResolver;
    /**
     * Check if a model is using OAuth credentials (subscription).
     */
    isUsingOAuth(model: Model<Api>): boolean;
    /**
     * Remove custom API/OAuth registrations for a specific extension source.
     */
    clearSourceRegistrations(sourceId: string): void;
    /**
     * Remove one extension-registered provider and restore its static models.
     */
    unregisterProvider(providerName: string): void;
    /**
     * Remove registrations for extension sources that are no longer active.
     */
    syncExtensionSources(activeSourceIds: string[]): void;
    /**
     * Register a provider dynamically (from extensions).
     *
     * If provider has models: replaces all existing models for this provider.
     * If provider has only baseUrl/headers: overrides existing models' URLs.
     * If provider has streamSimple: registers a custom API streaming function.
     * If provider has oauth: registers OAuth provider for /login support.
     */
    registerProvider(providerName: string, config: ProviderConfigInput, sourceId?: string): void;
    /**
     * Suppress a specific model selector (e.g., "provider/id") until a specific timestamp.
     */
    suppressSelector(selector: string, untilMs: number): void;
    /**
     * Check if a model selector is currently suppressed due to rate limits.
     */
    isSelectorSuppressed(selector: string): boolean;
    /**
     * Clear the cooldown suppression for one selector after an explicit user selection.
     */
    clearSuppressedSelector(selector: string): void;
    /**
     * Clear all cooldown suppressions recorded via {@link suppressSelector}.
     * Used to reset retry-fallback cooldown state without a full {@link refresh}.
     */
    clearSuppressedSelectors(): void;
}
/**
 * Input type for registerProvider API (from extensions).
 */
export interface ProviderConfigInput {
    baseUrl?: string;
    apiKey?: string;
    api?: Api;
    streamSimple?: (model: Model<Api>, context: Context, options?: SimpleStreamOptions) => AssistantMessageEventStream;
    headers?: Record<string, string>;
    compat?: ModelSpec<Api>["compat"];
    remoteCompaction?: RemoteCompactionConfig<Api>;
    authHeader?: boolean;
    /** Streaming transport override — see {@link Model.transport}. */
    transport?: Model<Api>["transport"];
    /** Optional normalized usage fetcher; takes precedence over built-in usage providers. */
    usage?: UsageProvider;
    oauth?: {
        name: string;
        login(callbacks: OAuthLoginCallbacks): Promise<OAuthCredentials | string>;
        refreshToken?(credentials: OAuthCredentials): Promise<OAuthCredentials>;
        getApiKey?(credentials: OAuthCredentials): string;
        modifyModels?(models: Model<Api>[], credentials: OAuthCredentials): Model<Api>[];
    };
    /**
     * Async factory that fetches the live model list from the provider endpoint.
     * When present, the result is run through the same SQLite model-cache as
     * built-in providers (keyed by provider name, default 24 h TTL).
     * The factory receives the resolved API key (undefined when unauthenticated).
     */
    fetchDynamicModels?: (apiKey: string | undefined) => Promise<readonly NonNullable<ProviderConfigInput["models"]>[number][]>;
    models?: Array<{
        id: string;
        name: string;
        api?: Api;
        baseUrl?: string;
        reasoning: boolean;
        thinking?: ThinkingConfig;
        input: ("text" | "image")[];
        supportsTools?: boolean;
        cost: {
            input: number;
            output: number;
            cacheRead: number;
            cacheWrite: number;
        };
        contextWindow: number;
        maxTokens: number;
        promptCache?: Model<Api>["promptCache"];
        /** Whether Codex requests should prefer WebSocket transport. */
        preferWebsockets?: boolean;
        headers?: Record<string, string>;
        compat?: ModelSpec<Api>["compat"];
        contextPromotionTarget?: string;
        compactionModel?: string;
        remoteCompaction?: RemoteCompactionConfig<Api>;
        premiumMultiplier?: number;
    }>;
}
