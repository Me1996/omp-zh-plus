import { type Api, type AuthStorage, type Model } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
/** Execute OpenRouter chat-completions grounding with the web plugin. */
export declare function searchOpenRouterGrounded(params: SearchParams): Promise<SearchResponse>;
/** Search provider for OpenRouter's web plugin grounding. */
export declare class OpenRouterGroundedProvider extends SearchProvider {
    readonly id = "openrouter";
    readonly label = "OpenRouter";
    isAvailable(authStorage: AuthStorage, model?: Model<Api>): boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
