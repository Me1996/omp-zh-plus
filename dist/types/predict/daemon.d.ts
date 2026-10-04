/**
 * Trailing debounce capped by a maximum dirty age: each change pushes the
 * flush to `debounceMs` after it, but never past `maxDirtyMs` after the first
 * unflushed change. Consecutive flushes are therefore at least `debounceMs`
 * apart, and a steady stream of changes still flushes every `maxDirtyMs`.
 */
export declare class PersistCadence {
    #private;
    constructor(debounceMs: number, maxDirtyMs: number, flush: () => void);
    /** Record a change and (re)arm the flush. */
    touch(): void;
    /** Drop a pending flush (the caller persists on stop instead). */
    cancel(): void;
}
/** Worker entry: serve the endpoint and agent directory named by the broker spec environment. */
export declare function startTextPredictDaemonFromEnvironment(): Promise<void>;
