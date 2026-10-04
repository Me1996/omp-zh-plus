import { Database } from "bun:sqlite";
export interface MemoryThread {
    id: string;
    updatedAt: number;
    rolloutPath: string;
    cwd: string;
    sourceKind: string;
}
export interface Stage1OutputRow {
    threadId: string;
    sourceUpdatedAt: number;
    rawMemory: string;
    rolloutSummary: string;
    rolloutSlug: string | null;
    generatedAt: number;
    cwd: string;
}
export interface Stage1Claim {
    threadId: string;
    ownershipToken: string;
    inputWatermark: number;
    sourceUpdatedAt: number;
    rolloutPath: string;
    cwd: string;
}
export interface GlobalClaim {
    ownershipToken: string;
    inputWatermark: number;
}
/**
 * Case-fold a project cwd into a stable memory scope key on case-insensitive
 * filesystems.
 *
 * Windows reports the same directory with drifting casing across launches
 * (`C:\Users\me\Documents\proj` vs `...\documents\proj`). The on-disk memory
 * root (`getMemoryRoot`) collapses both into one directory because NTFS is
 * case-insensitive, but the scope keys derived from cwd — `global:${cwd}` job
 * keys, `threads.cwd`, and the `t.cwd = ?` output filter — compare with
 * SQLite's default BINARY collation. Without folding, one project's memories
 * split across two scopes that share a single directory: Phase 2 for one casing
 * sees zero outputs, wipes the shared `MEMORY.md`/`memory_summary.md`/`skills/`,
 * and advances its watermark, permanently stranding the other casing's outputs
 * (#12596). Fold to lower case on win32 so one physical directory maps to one
 * scope key, matching the filesystem's own case-insensitivity.
 */
export declare function normalizeScopeCwd(cwd: string, platform?: NodeJS.Platform): string;
export declare function openMemoryDb(dbPath: string): Database;
export declare function closeMemoryDb(db: Database): void;
export declare function clearMemoryData(db: Database): void;
export declare function upsertThreads(db: Database, threads: MemoryThread[]): void;
export declare function claimStage1Jobs(db: Database, params: {
    nowSec: number;
    threadScanLimit: number;
    maxRolloutsPerStartup: number;
    maxRolloutAgeDays: number;
    minRolloutIdleHours: number;
    leaseSeconds: number;
    runningConcurrencyCap: number;
    workerId: string;
    excludeThreadIds?: string[];
}): Stage1Claim[];
export declare function enqueueGlobalWatermark(db: Database, sourceUpdatedAt: number, cwd: string, params?: {
    forceDirtyWhenNotAdvanced?: boolean;
}): void;
export declare function markStage1SucceededWithOutput(db: Database, params: {
    threadId: string;
    ownershipToken: string;
    sourceUpdatedAt: number;
    rawMemory: string;
    rolloutSummary: string;
    rolloutSlug: string | null;
    nowSec: number;
    cwd: string;
}): boolean;
export declare function markStage1SucceededNoOutput(db: Database, params: {
    threadId: string;
    ownershipToken: string;
    sourceUpdatedAt: number;
    nowSec: number;
    cwd: string;
}): boolean;
export declare function markStage1Failed(db: Database, params: {
    threadId: string;
    ownershipToken: string;
    retryDelaySeconds: number;
    reason: string;
    nowSec: number;
}): boolean;
export declare function tryClaimGlobalPhase2Job(db: Database, params: {
    workerId: string;
    leaseSeconds: number;
    nowSec: number;
    cwd: string;
}): {
    kind: "claimed";
    claim: GlobalClaim;
} | {
    kind: "skipped_not_dirty";
} | {
    kind: "skipped_running";
};
export declare function heartbeatGlobalJob(db: Database, params: {
    ownershipToken: string;
    leaseSeconds: number;
    nowSec: number;
    cwd: string;
}): boolean;
export declare function listStage1OutputsForGlobal(db: Database, limit: number, cwd: string): Stage1OutputRow[];
export declare function markGlobalPhase2Succeeded(db: Database, params: {
    ownershipToken: string;
    newWatermark: number;
    nowSec: number;
    cwd: string;
}): boolean;
export declare function markGlobalPhase2Failed(db: Database, params: {
    ownershipToken: string;
    retryDelaySeconds: number;
    reason: string;
    nowSec: number;
    cwd: string;
}): boolean;
export declare function markGlobalPhase2FailedUnowned(db: Database, params: {
    retryDelaySeconds: number;
    reason: string;
    nowSec: number;
    cwd: string;
}): boolean;
