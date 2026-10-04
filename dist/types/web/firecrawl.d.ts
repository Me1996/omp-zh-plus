/**
 * Firecrawl API Client
 *
 * Shared Firecrawl REST helpers: endpoint resolution (honouring the
 * `FIRECRAWL_BASE_URL` / `FIRECRAWL_API_URL` self-hosting overrides) and the
 * `/scrape` reader backend used by the fetch/read URL tool. The web search
 * provider builds its `/search` request on the same endpoint resolver.
 *
 * See https://docs.firecrawl.dev/api-reference/endpoint/scrape.
 */
import { type FetchImpl } from "@oh-my-pi/pi-ai";
import type { AgentStorage } from "../session/agent-storage.js";
/**
 * Resolve a Firecrawl endpoint URL, applying the `FIRECRAWL_BASE_URL` (or its
 * `FIRECRAWL_API_URL` alias) self-hosting override when set. A configured base
 * keeps an explicit `/v1` or `/v2` suffix and is otherwise defaulted to `/v2`.
 */
export declare function resolveFirecrawlUrl(endpoint: "/search" | "/scrape"): string;
export declare class FirecrawlApiError extends Error {
    readonly statusCode?: number;
    constructor(message: string, statusCode?: number);
}
export interface FirecrawlScrapeOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    fetch?: FetchImpl;
}
export declare function findFirecrawlApiKey(storage: AgentStorage | null | undefined): string | null;
/**
 * Scrape a single URL through Firecrawl and return its markdown rendering, or
 * `null` when the response carries no markdown. Unlike the local renderers,
 * Firecrawl fetches the page itself, so it also reaches JS-gated pages that the
 * already-loaded HTML cannot render.
 */
export declare function scrapeWithFirecrawl(url: string, options: FirecrawlScrapeOptions, storage: AgentStorage | null | undefined): Promise<string | null>;
