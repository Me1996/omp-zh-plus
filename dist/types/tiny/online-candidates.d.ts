import type { Api, Model } from "@oh-my-pi/pi-ai";
import type { Settings } from "../config/settings.js";
/** Role-resolved model used by online tiny tasks (auto-thinking, titles). */
export interface OnlineTinyCandidate {
    role: string;
    model: Model<Api>;
}
/**
 * Collect unique online models for lightweight background tasks.
 *
 * Order: each requested role's primary, then canonical retry fallback chains
 * traversed transitively (so a hop onto B also consults B's own chain).
 * Disabling model fallback restricts attempts to the first resolvable primary,
 * unless `tryAllRoles` asks for the explicit role chain without configured
 * retry-chain expansion.
 */
export declare function collectOnlineTinyCandidates(roles: readonly string[], settings: Settings, availableModels: Model<Api>[], options?: {
    tryAllRoles?: boolean;
}): OnlineTinyCandidate[];
/**
 * Expand one model's own `retry.fallbackChains` transitively.
 *
 * Does not merge role/`default` chains into the seed via
 * `expandDefaultRetryFallbackChains` — title generation appends the active
 * session model separately from tiny/commit/smol role collection, so its
 * recovery path must consult only the configured model-keyed / wildcard /
 * matching-role keys that `resolveRetryFallbackChainKey` already selects.
 */
export declare function expandOnlineTinyModelFallbacks(model: Model<Api>, settings: Settings, availableModels: Model<Api>[]): Model<Api>[];
