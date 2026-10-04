/**
 * HTTP discovery protocols for configured and implicit providers — ollama,
 * llama.cpp, lm-studio, openai-models-list, and new-api/one-api-style proxies.
 * `ModelRegistry` owns the orchestration (status, state, caching) and calls
 * `discoverModelsByProviderType` with a `DiscoveryContext`; built-in provider
 * discovery lives in pi-catalog's provider-models.
 */
import { type ApiKey } from "@oh-my-pi/pi-ai/auth-retry";
import type { Api, FetchImpl, Model, RemoteCompactionConfig } from "@oh-my-pi/pi-ai/types";
import type { ModelSpec } from "@oh-my-pi/pi-catalog/types";
import type { ProviderDiscovery } from "./models-config-schema.js";
export declare const DISCOVERY_DEFAULT_CONTEXT_WINDOW = 128000;
export declare const DISCOVERY_DEFAULT_MAX_TOKENS = 32768;
/**
 * A discovery HTTP failure carrying the response status as a structured field
 * so callers can classify auth rejections (401/403) without parsing messages.
 * The message format is load-bearing: the model hub matches
 * `HTTP <status> from <url>` for its 404 baseUrl hint, and auth-retry
 * classification matches on the same text.
 */
export declare class DiscoveryHttpError extends Error {
    readonly status: number;
    constructor(status: number, url: string);
}
/**
 * True when a discovery failure is an HTTP 401/403 auth rejection — the
 * endpoint answered (so it is reachable) but refused the request's credentials
 * (or lack of them). Callers surface these as an `unauthenticated` provider
 * discovery state instead of a generic `unavailable`, so a credential problem
 * never masquerades as a dead endpoint (issue #12281).
 */
export declare function isDiscoveryAuthRejection(error: unknown): boolean;
/**
 * Pick a discovery-probe timeout for a local-engine base URL.
 *
 * The implicit `127.0.0.1` default probe keeps a tight `loopbackMs` cap so a
 * busy or foreign service on the default port never stalls startup. But that
 * cap is far too short for a host reached over the network: a user who points
 * `LLAMA_CPP_BASE_URL` / `OLLAMA_BASE_URL` / `OLLAMA_HOST` at a remote or LAN
 * machine has real round-trip latency, and a 250ms cap made that server look
 * empty (issue #7087). Anything that is not strictly loopback therefore gets
 * {@link REMOTE_DISCOVERY_TIMEOUT_MS}.
 */
export declare function discoveryProbeTimeoutMs(baseUrl: string, loopbackMs: number, customTimeoutMs?: number): number;
export declare function getImplicitOllamaBaseUrl(): string;
export declare function getOllamaContextLengthOverride(): number | undefined;
/** Routes discovered-model `maxTokens` defaults around Anthropic's 3× output divisor. */
export declare function discoveryDefaultMaxTokens(api: Api | undefined): number;
export interface DiscoveryProviderConfig {
    provider: string;
    api: Api;
    baseUrl?: string;
    headers?: Record<string, string>;
    compat?: ModelSpec<Api>["compat"];
    remoteCompaction?: RemoteCompactionConfig<Api>;
    discovery: ProviderDiscovery;
    optional?: boolean;
}
/** Registry-provided capabilities the protocol probes need; never the registry itself. */
export interface DiscoveryContext {
    /** Injected fetch implementation (tests stub this). */
    fetch: FetchImpl;
    /**
     * Resolve a provider's bearer credential for `Authorization: Bearer …`.
     * Returns undefined when no key is stored or it is a local/no-auth
     * sentinel; otherwise an {@link ApiKey} whose resolver participates in the
     * central force-refresh/rotate auth-retry policy on 401/usage-limit.
     */
    getBearerApiKeyResolver(provider: string): Promise<ApiKey | undefined>;
}
type DiscoveredModelRuntimeMetadata = {
    contextWindow?: number;
    maxTokens?: number;
    input?: ("text" | "image")[];
};
export declare function discoverModelsByProviderType(providerConfig: DiscoveryProviderConfig, ctx: DiscoveryContext): Promise<Model<Api>[]>;
export declare function discoverOllamaModels(providerConfig: DiscoveryProviderConfig, ctx: DiscoveryContext): Promise<Model<Api>[]>;
export declare function discoverLlamaCppModels(providerConfig: DiscoveryProviderConfig, ctx: DiscoveryContext): Promise<Model<Api>[]>;
export declare function discoverLlamaCppModelRuntimeMetadata(model: Pick<Model<Api>, "provider" | "id" | "baseUrl" | "headers">, ctx: DiscoveryContext, customTimeoutMs?: number): Promise<DiscoveredModelRuntimeMetadata | undefined>;
/**
 * Re-probe LM Studio's native `/api/v0/models` for a single selected model so
 * its context window tracks the runtime lifecycle rather than the snapshot
 * captured at discovery time.
 *
 * A model discovered while unloaded is registered with `max_context_length`
 * (the architectural ceiling). When LM Studio JIT-loads it on first inference,
 * the running instance may serve a smaller `loaded_context_length` (user load
 * settings or context auto-fit). `getLmStudioNativeContextWindow` — invoked
 * inside `fetchLmStudioNativeModelMetadata` — prefers `loaded_context_length`
 * once `state === "loaded"`, so refreshing after selection swaps the stale
 * ceiling for the window the backend actually accepts (issue #9001). A later
 * unload re-probes back to `max_context_length`. This mirrors the llama.cpp
 * lazy-load refresh from #3310/#3311.
 *
 * `maxTokens` is carried through so the caller can re-cap output at the new
 * (possibly smaller) window; LM Studio native metadata reports no output cap
 * of its own.
 */
export declare function discoverLmStudioModelRuntimeMetadata(model: Pick<Model<Api>, "provider" | "id" | "baseUrl" | "headers" | "maxTokens">, ctx: DiscoveryContext, customTimeoutMs?: number): Promise<DiscoveredModelRuntimeMetadata | undefined>;
export declare function discoverOpenAIModelsList(providerConfig: DiscoveryProviderConfig, ctx: DiscoveryContext): Promise<Model<Api>[]>;
export declare function discoverLiteLLMModels(providerConfig: DiscoveryProviderConfig, ctx: DiscoveryContext): Promise<Model<Api>[]>;
/**
 * Discover models from an Anthropic+OpenAI-compatible reseller proxy that
 * exposes both `/v1/messages` and `/v1/chat/completions`, advertising each
 * model's wire capabilities through `supported_endpoint_types` on
 * `GET /v1/models` (new-api / one-api-style proxies).
 *
 * Routing per model:
 *   supported_endpoint_types: ["anthropic", ...] -> api: "anthropic-messages"
 *   supported_endpoint_types: ["openai"]         -> api: "openai-completions"
 *   missing / neither                            -> provider-level api fallback
 *
 * Anthropic models share the same baseUrl; the Anthropic SDK strips a
 * trailing `/v1` itself before appending `/v1/messages`, so the discovery
 * URL (which ends in `/v1`) round-trips correctly.
 */
export declare function discoverProxyModels(providerConfig: DiscoveryProviderConfig, ctx: DiscoveryContext): Promise<Model<Api>[]>;
export declare function normalizeLlamaCppBaseUrl(baseUrl?: string): string;
export declare function ensureLlamaCppV1BaseUrl(baseUrl: string): string;
export declare function normalizeLiteLLMDiscoveryBaseUrl(baseUrl?: string): string;
export declare function normalizeOpenAIModelsListBaseUrl(baseUrl?: string): string;
/**
 * Bare-shape discovery root: the configured base URL with trailing slashes
 * trimmed and any query/hash dropped. Unlike
 * {@link normalizeOpenAIModelsListBaseUrl} it never appends `/v1` — the
 * configured URL is the full OpenAI-compatible root (e.g.
 * `https://api.opper.ai/v3/compat`), and injecting `/v1` would point discovery
 * at a different endpoint than chat. Query strings are stripped exactly like
 * the default normalizer does: chat appends `/chat/completions` to the base
 * string, so a retained query would corrupt the inference URL.
 */
export declare function normalizeBareDiscoveryBaseUrl(baseUrl: string | undefined): string;
export {};
