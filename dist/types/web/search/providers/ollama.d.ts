/**
 * Ollama Web Search Provider
 *
 * Calls Ollama's hosted web search REST API and maps results into the unified
 * SearchResponse shape used by the web search tool.
 * Endpoint: POST https://ollama.com/api/web_search
 */
import { type AuthStorage, type FetchImpl } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
type SearchParamsWithFetch = SearchParams & {
    fetch?: FetchImpl;
};
/** Execute Ollama web search. */
export declare function searchOllama(params: SearchParamsWithFetch): Promise<SearchResponse>;
/** Search provider for Ollama web search. */
export declare class OllamaProvider extends SearchProvider {
    readonly id: "ollama";
    readonly label = "Ollama";
    isAvailable(authStorage: AuthStorage): boolean;
    search(params: SearchParamsWithFetch): Promise<SearchResponse>;
}
export {};
