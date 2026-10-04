/**
 * Unified Web Search Tool
 *
 * Single tool supporting Anthropic, Perplexity, Exa, Brave, Jina, Kimi, Gemini, Codex, Tavily, Kagi, Z.AI, SearXNG, and Synthetic
 * providers with provider-specific parameters exposed conditionally.
 */
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { Api, AuthStorage, Model } from "@oh-my-pi/pi-ai";
import { ModelRegistry } from "../../config/model-registry.js";
import type { CustomTool } from "../../extensibility/custom-tools/types.js";
import type { ToolSession } from "../../tools/index.js";
import { type SearchResultDetails } from "./types.js";
/** Web search tool parameters schema */
export declare const webSearchSchema: import("@oh-my-pi/omptype").FluentType<{
    limit?: number | undefined;
    max_tokens?: number | undefined;
    num_search_results?: number | undefined;
    query: string;
    recency?: "day" | "month" | "week" | "year" | undefined;
    temperature?: number | undefined;
}, {
    limit?: number | undefined;
    max_tokens?: number | undefined;
    num_search_results?: number | undefined;
    query: string;
    recency?: "day" | "month" | "week" | "year" | undefined;
    temperature?: number | undefined;
}>;
export type SearchToolParams = typeof webSearchSchema.infer;
export interface SearchQueryParams extends SearchToolParams {
    model?: string;
}
/**
 * Execute a web search query for CLI/testing workflows.
 *
 * `authStorage` may be omitted; in that case we discover one via the standard
 * factory (`discoverAuthStorage`), which honours `OMP_AUTH_BROKER_URL` and
 * otherwise opens the local SQLite credential store.
 */
export declare function runSearchQuery(params: SearchQueryParams, options?: {
    authStorage?: AuthStorage;
    modelRegistry?: ModelRegistry;
    sessionId?: string;
    sessionModel?: Model<Api>;
    signal?: AbortSignal;
}): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
    details: SearchResultDetails;
}>;
/**
 * Web search tool implementation.
 *
 * Supports the configured web model role chain with automatic fallback.
 */
export declare class WebSearchTool implements AgentTool<typeof webSearchSchema, SearchResultDetails> {
    #private;
    readonly name = "web_search";
    readonly approval: "read";
    readonly label = "Web Search";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        limit?: number | undefined;
        max_tokens?: number | undefined;
        num_search_results?: number | undefined;
        query: string;
        recency?: "day" | "month" | "week" | "year" | undefined;
        temperature?: number | undefined;
    }, {
        limit?: number | undefined;
        max_tokens?: number | undefined;
        num_search_results?: number | undefined;
        query: string;
        recency?: "day" | "month" | "week" | "year" | undefined;
        temperature?: number | undefined;
    }>;
    readonly strict = true;
    readonly loadMode = "discoverable";
    readonly summary = "Search the web for up-to-date information";
    constructor(session: ToolSession);
    execute(_toolCallId: string, params: SearchToolParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<SearchResultDetails>, _context?: AgentToolContext): Promise<AgentToolResult<SearchResultDetails>>;
}
/** Web search tool as CustomTool for consumers embedding the custom-tool API. */
export declare const webSearchCustomTool: CustomTool<typeof webSearchSchema, SearchResultDetails>;
export declare function getSearchTools(): CustomTool<typeof webSearchSchema, SearchResultDetails>[];
export { getSearchProvider } from "./provider.js";
export type { SearchProviderId as SearchProvider, SearchResponse } from "./types.js";
