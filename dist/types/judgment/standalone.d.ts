import { type ChainJudge } from "./index.js";
export interface StandaloneJudge {
    judge: ChainJudge;
    /** Release the auth store; the judge must not be used afterwards. */
    close(): void;
}
/**
 * Resolve the `judge` role chain for `cwd`'s project settings and extensions.
 * No session ledger exists here, so `purpose` only labels telemetry; native
 * answers still go through the shared answer cache.
 */
export declare function openStandaloneJudge(cwd: string, purpose: string): Promise<StandaloneJudge>;
