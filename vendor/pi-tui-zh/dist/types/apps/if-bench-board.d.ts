/**
 * Live board and scoreboard for `omp if-bench`.
 *
 * Interactive terminals get one repainted row per model — a turn ladder that
 * fills as turns pass, the in-flight turn as a spinner cell, and the live
 * position of the cat directive — plus a permanent verdict line per model as it
 * settles. Non-TTY output falls back to one plain line per turn so scripted
 * callers keep a parseable trace.
 */
import { type LiveBoardOutput } from "../chrome/live-board.js";
/** Failure category displayed in benchmark verdicts. */
export type IfBenchFailure = "result" | "cat" | "result+cat" | "format" | "provider";
/** Scored turn fields consumed by the live board and failure details. */
export interface IfBenchTurnRecord {
    turn: number;
    cumulativeActions: number;
    placement: string;
    durationMs: number;
    passed: boolean;
    failure?: IfBenchFailure;
    expected: string;
    response: string;
}
/** Per-model scoreboard and verdict fields. */
export interface IfBenchModelReport {
    label: string;
    turns: readonly IfBenchTurnRecord[];
    turnsPassed: number;
    actionsPassed: number;
    failure?: {
        turn: number;
        kind: IfBenchFailure;
    };
    durationMs: number;
    outputTokens: number;
    cost: number;
}
/** Benchmark results consumed by the ranked scoreboard. */
export interface IfBenchSummary {
    maxTurns: number;
    models: readonly IfBenchModelReport[];
}
/** Optional live-progress callbacks accepted by a benchmark runner. */
export interface IfBenchObserver<Turn extends IfBenchTurnRecord = IfBenchTurnRecord, Report extends IfBenchModelReport = IfBenchModelReport> {
    modelStarted?(label: string): void;
    turnStarted?(label: string, turn: number, actions: number): void;
    turnFinished?(label: string, record: Turn): void;
    modelFinished?(report: Report): void;
}
/** Rendering surface for one `omp if-bench` run. */
export interface IfBenchBoard extends IfBenchObserver {
    readonly interactive: boolean;
    /** Print a permanent line above the live rows (plain write when non-TTY). */
    log(text: string): void;
    /** Clear the live area and restore the cursor. Idempotent. */
    close(): void;
}
/** Static run parameters shown in the board header. */
export interface IfBenchBoardMeta {
    maxTurns: number;
    arrayLength: number;
    nyaMax: number;
}
/**
 * Create the if-bench board bound to `output`.
 *
 * `errors` receives non-TTY failure lines so a piped stdout stays a clean
 * turn-by-turn trace.
 */
export declare function createIfBenchBoard(meta: IfBenchBoardMeta, output?: LiveBoardOutput, errors?: LiveBoardOutput): IfBenchBoard;
/**
 * Ranked comparison table: depth first (turns, then actions), latency only as a
 * tie-break, because surviving one more turn always beats answering faster.
 */
export declare function formatIfBenchScoreboard(summary: IfBenchSummary): string;
