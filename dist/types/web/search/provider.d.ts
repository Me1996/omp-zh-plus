import type { WebSearchGrounding } from "@oh-my-pi/pi-catalog/types";
import type { SearchProvider } from "./providers/base.js";
import { type SearchEngineId } from "./types.js";
export type { SearchParams } from "./providers/base.js";
export { SearchProvider } from "./providers/base.js";
/** Format one provider failure for the user-facing fallback summary. */
export declare function formatSearchProviderFailure(error: unknown, provider: {
    id: string;
    label: string;
}): string;
/** Format the ordered provider fallback failures for terminal/tool output. */
export declare function formatSearchProviderFailures(failures: readonly {
    provider: {
        id: string;
        label: string;
    };
    error: unknown;
}[]): string;
/** Whether `id` names a pure search engine exposed as a `web/<id>` catalog model. */
export declare function isRegisteredSearchEngine(id: string): id is SearchEngineId;
/** Resolve a pure search engine after validating its catalog model id. */
export declare function getSearchProvider(id: string): Promise<SearchProvider>;
/** Resolve the grounding backend declared by a selected chat model. */
export declare function getGroundedSearchProvider(grounding: WebSearchGrounding): Promise<SearchProvider>;
