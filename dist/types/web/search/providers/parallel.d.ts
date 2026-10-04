import { type AuthStorage, type FetchImpl } from "@oh-my-pi/pi-ai";
import type { SearchResponse } from "../types.js";
import { type StructuredQuery } from "../query.js";
import type { SearchParams } from "./base.js";
import { SearchProvider } from "./base.js";
export declare function searchParallel(params: {
    query: string;
    num_results?: number;
    recency?: SearchParams["recency"];
    signal?: AbortSignal;
    timeoutMs?: number;
    fetch?: FetchImpl;
    parsedQuery?: StructuredQuery;
    modelName?: string;
}, authStorage: AuthStorage, sessionId?: string): Promise<SearchResponse>;
export declare class ParallelProvider extends SearchProvider {
    readonly id = "parallel";
    readonly label = "Parallel";
    /** Always available: without a credential, search runs through the keyless public MCP. */
    isAvailable(_authStorage: AuthStorage): boolean;
    search(params: SearchParams): Promise<SearchResponse>;
}
