import { type Api, type AuthStorage, type Model } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
/** Execute xAI Responses API web search. */
export declare function searchXAI(params: SearchParams): Promise<SearchResponse>;
/** Search provider for xAI web search. */
export declare class XAIProvider extends SearchProvider {
    readonly id = "xai";
    readonly label = "xAI";
    isAvailable(authStorage: AuthStorage, model?: Model<Api>): boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
