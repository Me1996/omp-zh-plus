import type { Answer, JudgmentRequest, JudgmentResult, Questions } from "@oh-my-pi/pi-ai";
/** Cached answers for one request, plus the state identity {@link JudgmentCache.record} reuses. */
export interface CachedAnswers {
    /** `sha256` of the canonical state JSON. */
    stateId: string;
    /** Canonical state JSON, stored once per distinct state. */
    state: string;
    /** Answers already known for the request's questions, keyed by question id. */
    answers: Record<string, Answer>;
}
/**
 * Process-wide cache at {@link getJudgmentCacheDbPath}, opened on first use
 * and closed at exit. `undefined` when the database cannot be opened (the
 * failure is logged once and judgments proceed uncached) and under the test
 * runner, where mocked answers must never persist into or be served from the
 * user's cache; tests inject {@link JudgmentCache.open} explicitly.
 */
export declare function sharedJudgmentCache(): JudgmentCache | undefined;
/** SQLite store of native judgment answers and the billed requests that produced them. */
export declare class JudgmentCache {
    #private;
    private constructor();
    /**
     * Open (creating if needed) the cache at `dbPath`, quarantining a corrupt store once.
     * @throws when the directory or database cannot be created.
     */
    static open(dbPath?: string): JudgmentCache;
    /**
     * Answers already recorded for `request`'s questions under `model`. Best-effort:
     * a database failure is logged and reported as no cached answers.
     */
    lookup(model: string, request: JudgmentRequest): CachedAnswers;
    /**
     * Record one billed request: its state, one oracle row per question it
     * answered, and a usage row linking them to the price paid. Best-effort:
     * failures are logged and never surface to the judgment.
     */
    record(model: string, cached: CachedAnswers, questions: Questions, result: JudgmentResult): void;
    /** Checkpoint and close the database; the cache must not be used afterwards. */
    close(): void;
}
