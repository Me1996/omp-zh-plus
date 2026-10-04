/**
 * Google Gemini Web Search Provider
 *
 * Uses Gemini's Google Search grounding via Cloud Code Assist API.
 * Cloud Code Assist auth is resolved through `AuthStorage.oauth.access(...)`
 * for the selected catalog provider; developer API auth uses the selected
 * model's registry resolver. The broker is the sole refresh authority, so this module never opens a
 * sibling SQLite store and never POSTs the broker sentinel to a Google token
 * endpoint.
 */
import { type Api, type AuthStorage, type FetchImpl, type Model, type OAuthAccess } from "@oh-my-pi/pi-ai";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { SearchResponse } from "../types.js";
import type { ModelRegistry } from "../../../config/model-registry.js";
import { type StructuredQuery } from "../query.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
interface GeminiToolParams {
    google_search?: Record<string, unknown>;
    code_execution?: Record<string, unknown>;
    url_context?: Record<string, unknown>;
}
export interface GeminiSearchParams extends GeminiToolParams {
    query: string;
    /** Pre-parsed structured query; falls back to parsing `query` when omitted. */
    parsedQuery?: StructuredQuery;
    system_prompt?: string;
    num_results?: number;
    /** Maximum output tokens. */
    max_output_tokens?: number;
    /** Sampling temperature (0–1). Lower = more focused/factual. */
    temperature?: number;
    signal?: AbortSignal;
    timeoutMs?: number;
    authStorage: AuthStorage;
    model: Model<Api>;
    thinkingLevel?: ConfiguredThinkingLevel;
    modelRegistry: ModelRegistry;
    sessionId?: string;
    fetch?: FetchImpl;
}
export declare function buildGeminiRequestTools(params: GeminiToolParams): Array<Record<string, Record<string, unknown>>>;
/** First configured Gemini OAuth provider plus its pre-resolved access. */
interface GeminiAuthSeed {
    provider: string;
    access: OAuthAccess;
    projectId: string;
}
/** Resolve the selected Gemini provider's OAuth access and required project identity. */
export declare function findGeminiAuth(authStorage: AuthStorage, provider: string, sessionId: string | undefined, signal: AbortSignal | undefined): Promise<GeminiAuthSeed | null>;
/**
 * Executes a web search using Google Gemini with Google Search grounding.
 */
export declare function searchGemini(params: GeminiSearchParams): Promise<SearchResponse>;
/** Search provider for Google Gemini web search. */
export declare class GeminiProvider extends SearchProvider {
    readonly id = "gemini";
    readonly label = "Gemini";
    isAvailable(authStorage: AuthStorage, model?: Model<Api>): boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
export {};
