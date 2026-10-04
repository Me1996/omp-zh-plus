/**
 * Perplexity Web Search Provider
 *
 * Supports four auth modes:
 * - Cookies (`PERPLEXITY_COOKIES`) via `www.perplexity.ai/rest/sse/perplexity_ask`
 * - OAuth/session bearer via `AuthStorage` and `www.perplexity.ai/rest/sse/perplexity_ask`
 * - API key (`PERPLEXITY_API_KEY`) via `api.perplexity.ai/chat/completions`
 * - Anonymous via `www.perplexity.ai/rest/sse/perplexity_ask`
 */
import { type AuthStorage, type FetchImpl } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import { type StructuredQuery } from "../query.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
export interface PerplexitySearchParams {
    signal?: AbortSignal;
    timeoutMs?: number;
    query: string;
    system_prompt?: string;
    /** Pre-parsed view of `query` from the search pipeline; parsed locally when absent. */
    parsedQuery?: StructuredQuery;
    /** Direct API model. Defaults to `PI_PERPLEXITY_API_MODEL`, then `sonar-pro`. */
    api_model?: string;
    search_recency_filter?: "hour" | "day" | "week" | "month" | "year";
    /** Consumer subscription model preference. Defaults to `PI_PERPLEXITY_MODEL`, then Sonar (`experimental`). */
    subscription_model?: string;
    num_results?: number;
    /** Maximum output tokens. Defaults to 8192. */
    max_tokens?: number;
    /** Sampling temperature (0–1). Lower = more focused/factual. Defaults to 0.2. */
    temperature?: number;
    /** Number of search results to retrieve. Defaults to 20. */
    num_search_results?: number;
    authStorage: AuthStorage;
    sessionId?: string;
    /** Anonymous consumer transport is only admitted for an explicit model candidate. */
    explicit?: boolean;
    fetch?: FetchImpl;
}
/** Execute Perplexity web search */
export declare function searchPerplexity(params: PerplexitySearchParams): Promise<SearchResponse>;
/** Search provider for Perplexity. */
export declare class PerplexityProvider extends SearchProvider {
    readonly id = "perplexity";
    readonly label = "Perplexity";
    /**
     * Auto-chain admission. Requires a direct Perplexity credential
     * (`PERPLEXITY_COOKIES`, OAuth session, or `PERPLEXITY_API_KEY`).
     *
     * OpenRouter keys are never borrowed: silently billing OpenRouter's
     * `perplexity/sonar-pro` surprises users. That path runs only through an
     * explicit `openrouter/perplexity/…` selector, via OpenRouter grounding.
     */
    isAvailable(authStorage: AuthStorage): boolean;
    /**
     * Perplexity accepts anonymous browser-style ask requests, so explicit
     * selection always runs. Auto-chain admission stays credential-gated so a
     * configured provider keeps priority over the anonymous fallback.
     */
    isExplicitlyAvailable(_authStorage: AuthStorage): boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
