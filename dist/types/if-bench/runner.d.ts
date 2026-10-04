import type { BenchRuntime, BenchTarget, StreamSimpleFn } from "../cli/bench-runtime.js";
import type { IfBenchFailure, IfBenchObserver } from "@oh-my-pi/pi-tui-zh/apps/if-bench-board";
import type { CatPlacement } from "./protocol.js";
/** Outcome of one turn: what was asked, what came back, and how it scored. */
export interface IfBenchTurnRecord {
    turn: number;
    /** Actions issued this turn (equal to the turn number). */
    actions: number;
    /** Actions issued across the whole thread up to and including this turn. */
    cumulativeActions: number;
    placement: CatPlacement;
    durationMs: number;
    outputTokens: number;
    cost: number;
    passed: boolean;
    failure?: IfBenchFailure;
    /** Locally computed array for this turn. */
    expected: string;
    /** Trimmed model reply, or the provider error text when the request failed. */
    response: string;
}
/** Per-model result: the surviving depth plus the turn that ended the run. */
export interface IfBenchModelReport {
    selector: string;
    model: string;
    label: string;
    turns: IfBenchTurnRecord[];
    /** Consecutive turns answered correctly. */
    turnsPassed: number;
    /** Actions applied correctly before the first failure. */
    actionsPassed: number;
    failure?: {
        turn: number;
        kind: IfBenchFailure;
        detail: string;
    };
    durationMs: number;
    outputTokens: number;
    cost: number;
}
export interface IfBenchSummary {
    maxTurns: number;
    arrayLength: number;
    nyaMax: number;
    maxTokens: number;
    models: IfBenchModelReport[];
    /** Models that broke before reaching `maxTurns`. */
    failures: number;
}
export interface IfBenchRunOptions {
    targets: readonly BenchTarget[];
    runtime: BenchRuntime;
    maxTurns: number;
    arrayLength: number;
    nyaMax: number;
    maxTokens: number;
    /** Models benchmarked concurrently; each model's own turns stay sequential. */
    par: number;
    stream: StreamSimpleFn;
    now: () => number;
    randomSessionId: () => string;
    observer?: IfBenchObserver<IfBenchTurnRecord, IfBenchModelReport>;
    /** Sleep between refusal-retry attempts; tests inject a no-op. Defaults to `Bun.sleep`. */
    sleep?: (ms: number) => Promise<void>;
}
/** Run every target and return the ranked-input summary (ranking is the caller's job). */
export declare function runIfBench(options: IfBenchRunOptions): Promise<IfBenchSummary>;
