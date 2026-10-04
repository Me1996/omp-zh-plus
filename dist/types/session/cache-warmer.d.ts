/**
 * Keeps one prompt cache entry alive by replaying its request shortly before
 * the entry expires.
 *
 * Ported from upstream pi's cache warmer (earendil-works/pi): a refresh is
 * scheduled at 90% of the model's declared prompt-cache lifetime (at least
 * ten seconds before expiry) and only fires when the expected avoided
 * cache-miss cost minus the refresh cost clears a savings floor. Warming runs
 * in two phases — "streaming" while the agent run that sent the request is
 * still active, "idle" after it settles — and stops on context change, mode
 * change, a refresh that misses the cache, or fixed safety windows (60 min
 * streaming / 30 min idle). An entry whose lifetime outlasts the idle window
 * (Anthropic's 1h tier) is therefore only warmed while a run is active.
 *
 * A model is warmed only when its catalog entry (or a models.yml `promptCache`
 * override) declares a lifetime for the retention tier the request used, so
 * providers whose replay behavior is unvalidated are never touched.
 */
import { type Api, type AssistantMessage, type AssistantMessageEvent, type Context, type Model, type SimpleStreamOptions, type Usage } from "@oh-my-pi/pi-ai";
import type { CacheWarmingDecisionEvent, CacheWarmingDecisionEventResult } from "../extensibility/shared-events.js";
export type { CacheWarmingDecisionEvent, CacheWarmingDecisionEventResult };
/** Warming mode: "off" disables it, "streaming" protects active runs, "idle" also covers gaps between runs. */
export type CacheWarmingMode = "off" | "streaming" | "idle";
export declare const CACHE_WARMING_MODES: readonly ["off", "streaming", "idle"];
/** Identity of a refresh actually sent to the provider. */
export interface CacheWarmingRefreshStart {
    phase: "streaming" | "idle";
    provider: string;
    model: string;
}
/** Result of a refresh that {@link CacheWarmingRefreshStart} announced. */
export interface CacheWarmingRefreshEnd extends CacheWarmingRefreshStart {
    outcome: "hit" | "miss" | "error" | "aborted";
    /** Present only when onWarmed recorded this refresh, including an aborted one the provider had already accepted. */
    usage?: Usage;
    /** Why warming stopped; absent when warming continues (the refresh rescheduled, or a new request replaced the run). */
    warmingStopReason?: string;
}
/** Prompt-cache retention tier a request wrote its entry under. */
export type PromptCacheTier = "short" | "long";
/** Refresh at 90% of the TTL while preserving at least ten seconds of margin. */
export declare function getCacheWarmingDelayMs(ttlMs: number): number | undefined;
/**
 * Retention tier a request writes under, or undefined when caching is off.
 *
 * Mirrors the Anthropic provider's retention default (`getCacheControl`):
 * OAuth subscriber seats write 1h entries where the model supports them.
 * `resolveCacheRetention` keeps an explicit option or `PI_CACHE_RETENTION`
 * ahead of that fallback.
 */
export declare function resolvePromptCacheTier(model: Model<Api>, options: SimpleStreamOptions | undefined, isOAuthToken?: boolean): PromptCacheTier | undefined;
/**
 * Lifetime of the prompt cache entry a request writes, from the model's
 * `promptCache` tier for the retention the request used. Undefined when the
 * model has no lifetime for that tier or caching is off.
 */
export declare function getPromptCacheTtlMs(model: Model<Api>, options: SimpleStreamOptions | undefined, isOAuthToken?: boolean): number | undefined;
/**
 * Tier a completed response actually wrote, from the provider's per-TTL
 * cache-write breakdown (Anthropic `usage.cache_creation`). Undefined when the
 * response wrote nothing or the provider does not report the split.
 */
export declare function observedPromptCacheTier(usage: Usage): PromptCacheTier | undefined;
/**
 * Whether replaying the request leaves its cache entry untouched. Anthropic
 * Messages and Converse budget-based reasoning derive a wire budget from
 * `max_tokens`; lowering the cap can change that budget and the cache key.
 */
export declare function isReplayable(model: Model<Api>, options: SimpleStreamOptions | undefined): boolean;
export type CacheWarmingAction = "warm" | "stop";
/** Inputs and outcome of one warm-or-stop decision, as surfaced by the session status. */
export interface CacheWarmingDecision {
    /** "streaming" while the agent run that sent the request is still active. */
    phase: "streaming" | "idle";
    /** Price of this refresh: a cache read of the prompt plus one output token. */
    warmCost: number;
    /** Extra price of the next real request if the cache entry is lost. */
    missCost: number;
    /** Estimated chance that a real request arrives before the entry expires. */
    continuationProbability: number;
    /** `continuationProbability * missCost - warmCost`. */
    expectedSavings: number;
    /** False when the prompt size or the model's prices are unknown. */
    economicsAvailable: boolean;
    /** The warmer's decision: "warm" when `expectedSavings` is at least $0.05. */
    action: CacheWarmingAction;
}
export interface CacheWarmingStatus {
    /** "scheduled": a refresh timer is armed; "refreshing": a warm request is in flight. */
    state: "inactive" | "scheduled" | "refreshing";
    /** Why nothing is scheduled. */
    reason?: string;
    nextWarmAt?: number;
    /** The pending decision, or the decision that stopped warming. */
    decision?: CacheWarmingDecision;
    /** True when an extension changed `decision.action`. */
    extensionOverride?: boolean;
}
/** The request whose prompt cache entry should be kept warm, exactly as it was sent. */
export interface CacheWarmRequest {
    model: Model<Api>;
    context: Context;
    options: SimpleStreamOptions;
}
/** The slice of an assistant event stream the warmer consumes. */
export interface CacheWarmStream extends AsyncIterable<AssistantMessageEvent> {
    result(): Promise<AssistantMessage>;
}
/** Everything the warmer needs from its host; injected so the core stays session-agnostic. */
export interface CacheWarmerDeps {
    /**
     * Streams a warm request. Must apply the same settings/provider wrapper the
     * real turn used so the replay lands on the same cache key.
     */
    stream: (model: Model<Api>, context: Context, options: SimpleStreamOptions | undefined) => CacheWarmStream | Promise<CacheWarmStream>;
    /** Prompt size (input + cacheRead + cacheWrite) of the most recent real provider response. */
    getPromptTokens: () => number;
    /** Current warming mode, read live so setting changes apply without re-arming. */
    getMode: () => CacheWarmingMode;
    /** Extension override hook; failures fall back to the warmer's own decision. */
    decide?: (event: CacheWarmingDecisionEvent) => Promise<CacheWarmingAction>;
}
/**
 * Keeps one prompt cache entry alive by replaying its request before the entry
 * expires. `start` replaces any previous run; warm requests never extend the
 * fixed safety windows.
 */
export declare class CacheWarmer {
    #private;
    /** Called with every paid warm response, including one that missed the cache or was aborted after acceptance. */
    onWarmed?: (message: AssistantMessage, extensionOverride: boolean) => void;
    /** Called when a refresh is handed to the stream; stop decisions and extension vetoes send nothing and skip it. */
    onRefreshStart?: (refresh: CacheWarmingRefreshStart) => void;
    /** Called exactly once after each onRefreshStart, unless the host cleared it (dispose) while the refresh was in flight. */
    onRefreshEnd?: (refresh: CacheWarmingRefreshEnd) => void;
    constructor(deps: CacheWarmerDeps);
    get status(): CacheWarmingStatus;
    /** Keep the prompt cache entry written by `request` warm while `isCurrent` holds. */
    start(request: CacheWarmRequest, isCurrent: () => boolean): void;
    /**
     * Adopt the retention tier the armed request's response actually wrote, so
     * the schedule follows the provider's decision rather than a guess about
     * the credential.
     */
    onResponse(message: AssistantMessage): void;
    onAgentSettled(): void;
    /** Reconcile an active run after the effective warming mode changes. */
    onModeChanged(): void;
    cancel(): void;
}
/** One-line human-readable warming status for hosts that surface it. */
export declare function formatCacheWarmingStatus(status: CacheWarmingStatus, now?: number): string;
