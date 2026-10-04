import type { LoopConditionConfig, LoopLimitRuntime } from "@oh-my-pi/pi-tui-zh/status-line/loop";
export type LoopLimitConfig = {
    kind: "iterations";
    iterations: number;
} | {
    kind: "duration";
    durationMs: number;
};
export interface ParsedLoopArgs {
    /** Iteration/duration budget, when the user supplied a leading limit token. */
    limit?: LoopLimitConfig;
    /** Continue-condition from `--while` / `--until`, re-evaluated before each iteration. */
    condition?: LoopConditionConfig;
    /** Inline loop prompt: text after the limit and flags, or the whole argument when neither was given. */
    prompt?: string;
}
/**
 * Parse `/loop` arguments into an optional leading limit, an optional
 * continue-condition flag, and an optional inline prompt.
 *
 * A leading token that *looks* like a limit (starts with a digit or sign) or
 * like a flag (starts with `--`) but fails to parse is a hard error, so a typo
 * surfaces instead of silently becoming prompt text. Anything else is prompt
 * text, so plain prose after `/loop` keeps starting an unbounded loop (the
 * pre-arg-parsing behavior). Returns the error message string on failure.
 */
export declare function parseLoopArgs(args: string): ParsedLoopArgs | string;
export declare function createLoopLimitRuntime(config: LoopLimitConfig | undefined, nowMs?: number): LoopLimitRuntime | undefined;
export declare function consumeLoopLimitIteration(limit: LoopLimitRuntime | undefined, nowMs?: number): boolean;
export declare function isLoopDurationExpired(limit: LoopLimitRuntime | undefined, nowMs?: number): boolean;
/**
 * True when the loop's budget is already spent: a duration past its deadline,
 * or an iteration count with none remaining. Unlike {@link consumeLoopLimitIteration}
 * this never mutates the runtime, so callers can check it before deciding
 * whether to run anything (e.g. a `/loop --while`/`--until` condition command)
 * that would otherwise run once more for a loop that is already over.
 */
export declare function isLoopLimitExhausted(limit: LoopLimitRuntime | undefined, nowMs?: number): boolean;
export declare function describeLoopLimit(config: LoopLimitConfig): string;
export declare function describeLoopLimitRuntime(limit: LoopLimitRuntime): string;
