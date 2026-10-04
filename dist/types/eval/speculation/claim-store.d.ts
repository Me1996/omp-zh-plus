export interface ShadowClaimKey {
    siteId: string;
    dynamicPath: string;
    name: string;
    fingerprint: string;
    occurrence: number;
}
export interface ShadowClaimOutcome<T> {
    kind: "result";
    value: T;
    virtualDurationMs: number;
}
/**
 * Per-cell one-shot outcome store. Candidates are visible only after their
 * speculative execution settles; normal bridge calls consume each outcome at
 * most once and retain baseline behavior on a miss.
 */
export declare class ShadowClaimStore<T> {
    #private;
    register(key: ShadowClaimKey, runtimeOccurrence: number): void;
    add(key: ShadowClaimKey, outcome: ShadowClaimOutcome<T>): void;
    miss(key: ShadowClaimKey): void;
    claim(key: ShadowClaimKey, remainingTimeoutMs: number): ShadowClaimOutcome<T> | undefined;
    claimRuntime(key: Pick<ShadowClaimKey, "siteId" | "name" | "fingerprint"> & {
        occurrence: number;
    }, remainingTimeoutMs: number): ShadowClaimOutcome<T> | undefined;
    claimRuntimeAsync(key: Pick<ShadowClaimKey, "siteId" | "name" | "fingerprint"> & {
        occurrence: number;
    }, remainingTimeoutMs: number, signal?: AbortSignal): Promise<ShadowClaimOutcome<T> | undefined>;
    discard(): void;
}
