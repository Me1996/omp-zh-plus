import { type Api, type AuthStorage, type Model } from "@oh-my-pi/pi-ai";
import { type SearchResponse } from "../types.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
/** Execute API-billed web search through the selected OpenAI Responses model. */
export declare function searchOpenAIResponses(params: SearchParams): Promise<SearchResponse>;
/** Search provider for OpenAI's API-billed Responses web_search tool. */
export declare class OpenAIProvider extends SearchProvider {
    readonly id = "openai";
    readonly label = "OpenAI API";
    isAvailable(authStorage: AuthStorage, model?: Model<Api>): boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
