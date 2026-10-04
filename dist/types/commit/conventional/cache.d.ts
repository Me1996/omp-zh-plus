import { Database } from "bun:sqlite";
import type { Usage } from "@oh-my-pi/pi-ai";
/** Material that uniquely identifies one conventional commit inference call. */
export interface CommitCacheMaterial {
    operation: string;
    model: string;
    apiMode: string;
    toolName: string;
    systemPrompt: string;
    userPrompt: string;
    reasoningEffort?: string;
}
/** Cached raw model response used by the same operation parser as a live response. */
export interface CachedCommitResponse {
    text: string;
    stopReason: string;
    costUsd?: number;
}
/** SQLite-backed best-effort cache for conventional commit inference. */
export declare class CommitInferenceCache {
    #private;
    constructor(db: Database, ttlDays: number);
    /** Open the cache, returning `null` when its directory or database is unavailable. */
    static open(dbPath: string, ttlDays: number): Promise<CommitInferenceCache | null>;
    /** Read a non-expired response and update its access timestamp. */
    get(key: string): CachedCommitResponse | null;
    /** Insert or replace one successfully parsed response. */
    put(input: {
        key: string;
        model: string;
        operation: string;
        request: string;
        response: CachedCommitResponse;
    }): void;
    /** Retain a failed response for diagnosis without serving it as a cache hit. */
    putFailure(input: {
        key: string;
        model: string;
        operation: string;
        request: string;
        response: string;
        error: string;
    }): void;
    /** Append token and cost accounting for a real provider response. */
    recordUsage(model: string, operation: string, usage: Usage): void;
    /** Close the SQLite handle. */
    close(): void;
}
/** Compute a stable cache key from all behavior-affecting request material. */
export declare function computeCommitCacheKey(material: CommitCacheMaterial): string;
