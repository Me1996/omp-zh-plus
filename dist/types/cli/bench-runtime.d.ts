/**
 * Shared plumbing for the benchmark-style CLI commands (`omp bench`, `omp if-bench`).
 *
 * Owns the three pieces every benchmark command needs before it can talk to a
 * provider: the auth/settings/model-registry runtime, selector → model
 * resolution (including the credential fallback that keeps a bare fuzzy id from
 * landing on an unauthenticated provider), and the injectable `streamSimple`
 * signature tests substitute for a synthetic stream.
 */
import type { ResolvedThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { Api, ApiKeyResolver, AssistantMessageEventStream, Context, Model, SimpleStreamOptions } from "@oh-my-pi/pi-ai";
import type { ApiKeyResolverModel } from "../config/api-key-resolver.js";
import { Settings } from "../config/settings.js";
/** Injection point for the provider call; tests pass a synthetic event stream. */
export type StreamSimpleFn = (model: Model<Api>, context: Context, options?: SimpleStreamOptions) => AssistantMessageEventStream;
/** Model catalog + credential surface a benchmark command depends on. */
export interface BenchModelRegistry {
    getAll(): Model<Api>[];
    getAvailable(): Model<Api>[];
    getApiKey(model: Model<Api>, sessionId?: string): Promise<string | undefined>;
    resolver(model: ApiKeyResolverModel, sessionId?: string): ApiKeyResolver;
    hasConfiguredAuth?(model: Model<Api>): boolean;
    /**
     * Discovery-backed providers the catalog may still need to fetch
     * (models.yml discovery, ollama, llama.cpp, lm-studio). Absent on
     * hand-rolled test registries, which opt out of the fallback pass.
     */
    getDiscoverableProviders?(): string[];
    /** Cache-aware discovery pass; absent when the registry cannot fetch. */
    refresh?(): Promise<void>;
}
/** Live registry plus the settings and teardown hook backing it. */
export interface BenchRuntime {
    modelRegistry: BenchModelRegistry;
    settings?: Settings;
    close?: () => void;
}
/** One resolved benchmark subject: the selector the user typed and what it became. */
export interface BenchTarget {
    selector: string;
    model: Model<Api>;
    thinking: ResolvedThinkingLevel | undefined;
}
/** Open the auth vault, settings, and model registry for a benchmark run. */
export declare function createDefaultBenchRuntime(): Promise<BenchRuntime>;
/**
 * Resolve every selector to a concrete model + thinking level, warning on
 * stderr when a selector was redirected to an authenticated provider. When any
 * selector misses the hydrated catalog, awaits one cache-aware discovery pass
 * and re-resolves every selector from the refreshed catalog before failing:
 * discovery-backed providers (models.yml discovery, ollama, llama.cpp,
 * lm-studio) ship no static models, and cached rows whose `Authorization`
 * header cannot be re-derived from config (#5780) drop every model of that
 * provider until a live probe runs. A refresh replaces the rows of every
 * touched discovery provider, so only a full re-resolve keeps all targets on
 * the same snapshot. Same lazy fallback the session boot path applies (issues
 * #6114, #6162) — the common path, where every selector resolves, never pays
 * for a fetch.
 *
 * @throws when any selector cannot be resolved; the message lists all failures.
 */
export declare function resolveBenchTargets(selectors: string[], modelRegistry: BenchModelRegistry, settings: Settings | undefined, writeStderr: (text: string) => void): Promise<BenchTarget[]>;
