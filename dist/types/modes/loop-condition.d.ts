/**
 * Deterministic continue-condition for `/loop`: a user-supplied shell command
 * whose exit status decides whether the next iteration runs.
 *
 * Exit status is authoritative and stdout is ignored. `echo false` exits 0, so
 * "boolean-ish output" and the exit code actively disagree on the same command,
 * and every predicate a user already reaches for (`test`, `grep -q`, `git diff
 * --quiet`, `&&`) speaks exit codes. This also matches the `!command`
 * config-value resolver, which already gates on `exitCode !== 0`.
 *
 * Exit 1 is the only "condition is false" status. Anything higher (127 command
 * not found, 126 not executable, 2 syntax error) means the *condition itself*
 * is broken and is surfaced as an error instead of being read as "false" —
 * otherwise a typo'd condition halts the loop looking exactly like finished
 * work, which is the failure mode this whole feature exists to avoid.
 */
import type { LoopConditionConfig } from "@oh-my-pi/pi-tui-zh/status-line/loop";
export type LoopConditionVerdict = 
/** The condition says run another iteration. */
{
    kind: "continue";
}
/** The condition resolved cleanly and says stop. */
 | {
    kind: "halt";
    message: string;
}
/** The condition command itself is broken or timed out; stop and say why. */
 | {
    kind: "error";
    message: string;
}
/** The user aborted mid-evaluation (Esc); the caller already owns that UX. */
 | {
    kind: "aborted";
};
export interface LoopConditionOptions {
    cwd?: string;
    /** Deadline for one evaluation; `0` disables it (`loop.conditionTimeoutMs`). */
    timeoutMs: number;
    signal?: AbortSignal;
    /** Owning session id, so the condition's shell session cannot leak state into (or from) another session's. */
    sessionId: string;
}
/** Human-readable form of the condition, for enable/status messages. */
export declare function describeLoopCondition(condition: LoopConditionConfig): string;
/**
 * Run one condition evaluation and map its exit status onto a loop verdict.
 *
 * Never throws: a spawn failure is reported as an `error` verdict so the caller
 * halts with an explanation instead of leaving the loop wedged.
 */
export declare function evaluateLoopCondition(condition: LoopConditionConfig, options: LoopConditionOptions): Promise<LoopConditionVerdict>;
