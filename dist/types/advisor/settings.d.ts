export declare const cfgAdvisorEnabled: import("../config/registry.js").Setting<boolean, "advisor.enabled">;
export declare const cfgAdvisorSyncBacklog: import("../config/registry.js").Setting<"1" | "3" | "5" | "off" | "strict", "advisor.syncBacklog">;
export declare const cfgAdvisorImmuneTurns: import("../config/registry.js").Setting<number, "advisor.immuneTurns">;
export declare const cfgAdvisorReviewMode: import("../config/registry.js").Setting<"agent-end" | "turn", "advisor.reviewMode">;
export declare const cfgAdvisorReviewInterval: import("../config/registry.js").Setting<number, "advisor.reviewInterval">;
export declare const cfgAdvisorMaxNotesPerUpdate: import("../config/registry.js").Setting<number, "advisor.maxNotesPerUpdate">;
export declare const cfgAdvisorEvictStaleResults: import("../config/registry.js").Setting<boolean, "advisor.evictStaleResults">;
