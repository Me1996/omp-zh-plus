/**
 * Anthropic Web Search Provider
 *
 * Uses Claude's built-in web_search_20250305 tool to search the web.
 * Returns synthesized answers with citations and source metadata.
 */
import { type Api, type AuthStorage, type Model } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
/**
 * Executes a web search using Anthropic's Claude with built-in web search tool.
 * @param params - Search parameters including query and optional settings
 * @returns Search response with synthesized answer, sources, and citations
 * @throws {Error} If no Anthropic credentials are configured
 */
export declare function searchAnthropic(params: SearchParams): Promise<SearchResponse>;
/** Search provider for Anthropic Claude web search. */
export declare class AnthropicProvider extends SearchProvider {
    readonly id = "anthropic";
    readonly label = "Anthropic";
    isAvailable(authStorage: AuthStorage, model?: Model<Api>): Promise<boolean> | boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
