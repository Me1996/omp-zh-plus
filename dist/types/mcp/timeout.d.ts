export declare function resolveMCPTimeoutMs(configTimeout?: number): number;
/** Resolve the non-blocking discovery window; zero waits for initial connections to settle. */
export declare function resolveMCPStartupTimeoutMs(configTimeout?: number): number;
export declare function isMCPTimeoutEnabled(timeoutMs: number): boolean;
export declare function describeMCPTimeout(timeoutMs: number): string;
export declare function getNeverAbortSignal(): AbortSignal;
/** Tracks a request deadline separately from caller and transport cancellation. */
export interface MCPTimeoutOperation {
    signal?: AbortSignal;
    /** Clear the deadline while preserving cancellation of any still-open response stream. */
    clear: () => void;
    isTimeoutAbort: (error: unknown) => boolean;
    /** True when this operation's own timer fired (regardless of what error a consumer saw). */
    timedOut: () => boolean;
}
/** Apply a deadline without allowing a later abort source to overwrite the first one. */
export declare function createMCPTimeout(timeoutMs: number, signal?: AbortSignal): MCPTimeoutOperation;
