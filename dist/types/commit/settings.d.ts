/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { type SettingValueOf } from "../config/registry.js";
export declare const cfgCommitMapReduceEnabled: import("../config/registry.js").Setting<boolean, "commit.mapReduceEnabled">;
export declare const cfgCommitMapReduceThreshold: import("../config/registry.js").Setting<number, "commit.mapReduceThreshold">;
export declare const cfgCommitMapBatchTokenBudget: import("../config/registry.js").Setting<number, "commit.mapBatchTokenBudget">;
export declare const cfgCommitCacheEnabled: import("../config/registry.js").Setting<boolean, "commit.cacheEnabled">;
export declare const cfgCommitCacheTtlDays: import("../config/registry.js").Setting<number, "commit.cacheTtlDays">;
export declare const cfgCommitChangelogMaxDiffChars: import("../config/registry.js").Setting<number, "commit.changelogMaxDiffChars">;
/** Conventional commit generation and changelog limits (`commit.*`). */
export declare const cfgCommit: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
    mapReduceEnabled: import("../config/registry.js").Setting<boolean, "commit.mapReduceEnabled">;
    mapReduceThreshold: import("../config/registry.js").Setting<number, "commit.mapReduceThreshold">;
    mapBatchTokenBudget: import("../config/registry.js").Setting<number, "commit.mapBatchTokenBudget">;
    cacheEnabled: import("../config/registry.js").Setting<boolean, "commit.cacheEnabled">;
    cacheTtlDays: import("../config/registry.js").Setting<number, "commit.cacheTtlDays">;
    changelogMaxDiffChars: import("../config/registry.js").Setting<number, "commit.changelogMaxDiffChars">;
}>>;
/** Conventional commit generation and changelog limits ({@link cfgCommit}). */
export type CommitSettings = SettingValueOf<typeof cfgCommit>;
