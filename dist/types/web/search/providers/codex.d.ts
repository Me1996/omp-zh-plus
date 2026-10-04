/**
 * OpenAI Codex Web Search Provider
 *
 * Uses the configured Codex Responses transport for proxy/API-key setups and
 * the official ChatGPT backend for OAuth logins.
 */
import { type Api, type AuthStorage, type Model } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
/** Execute web search through the selected Codex model and transport. */
export declare function searchCodex(params: SearchParams): Promise<SearchResponse>;
/**
 * Checks whether Codex web search has an API key or OAuth credential.
 */
export declare function hasCodexSearch(authStorage: AuthStorage, model?: Model<Api>): Promise<boolean>;
/** Search provider for OpenAI Codex web search. */
export declare class CodexProvider extends SearchProvider {
    readonly id = "codex";
    readonly label = "OpenAI";
    isAvailable(authStorage: AuthStorage, model?: Model<Api>): Promise<boolean> | boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
